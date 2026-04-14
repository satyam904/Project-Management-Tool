import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskForm } from '../TaskForm'
import { describe, it, expect, beforeEach, vi } from 'vitest'
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

describe('TaskForm', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  it('renders all fields', () => {
    renderWithProviders(<TaskForm isOpen={true} onClose={() => {}} projectId="1" members={members} />)
    expect(screen.getByLabelText('Task title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
    expect(screen.getByLabelText('Due date')).toBeInTheDocument()
    expect(screen.getByLabelText('Assign to')).toBeInTheDocument()
  })

  it('shows error when title too short', async () => {
    renderWithProviders(<TaskForm isOpen={true} onClose={() => {}} projectId="1" members={members} />)
    fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Task' }))
    
    expect(await screen.findByText('Title is too short')).toBeInTheDocument()
  })

  it('assignee dropdown lists project members', () => {
    renderWithProviders(<TaskForm isOpen={true} onClose={() => {}} projectId="1" members={members} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('submits with correct payload', async () => {
    const onClose = vi.fn()
    renderWithProviders(<TaskForm isOpen={true} onClose={onClose} projectId="1" members={members} />)
    
    fireEvent.change(screen.getByLabelText('Task title'), { target: { value: 'New Test Task' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Task' }))
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })
})
