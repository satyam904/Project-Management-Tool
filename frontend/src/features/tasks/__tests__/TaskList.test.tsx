import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskList } from '../TaskList'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const members = [
  { id: 'm1', user: { id: 'u1', email: 'u1@test.com', first_name: 'John', last_name: 'Doe', full_name: 'John Doe', is_verified: true, created_at: '' }, role: 'owner' as const, joined_at: '' }
]

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('TaskList', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  it('renders three status columns', async () => {
    renderWithProviders(<TaskList projectId="1" members={members} />)
    expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument()
  })

  it('renders tasks in correct columns', async () => {
    renderWithProviders(<TaskList projectId="1" members={members} />)
    expect(await screen.findByText('Task Todo')).toBeInTheDocument()
    expect(await screen.findByText('Task In Prog')).toBeInTheDocument()
    expect(await screen.findByText('Task Done')).toBeInTheDocument()
  })

  it('Add task button opens modal', async () => {
    renderWithProviders(<TaskList projectId="1" members={members} />)
    const addButtons = await screen.findAllByText('Add task')
    fireEvent.click(addButtons[0]) // click Add task in Todo col
    expect(await screen.findByText('New Task')).toBeInTheDocument()
  })

  it('task card click opens detail panel', async () => {
    renderWithProviders(<TaskList projectId="1" members={members} />)
    const taskCard = await screen.findByText('Task Todo')
    fireEvent.click(taskCard)
    expect(await screen.findByText('Task Detail')).toBeInTheDocument()
  })
})
