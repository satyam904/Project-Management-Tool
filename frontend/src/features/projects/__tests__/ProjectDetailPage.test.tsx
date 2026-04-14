import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectDetailPage } from '../ProjectDetailPage'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/projects/1']}>
        <Routes>
           <Route path="/projects/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  it('renders project header with title and status', async () => {
    renderWithProviders(<ProjectDetailPage />)
    const elements = await screen.findAllByText('Project one')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders tasks grouped by status columns', async () => {
    renderWithProviders(<ProjectDetailPage />)
    expect(await screen.findByText('Task Todo')).toBeInTheDocument()
    expect(screen.getByText('Task In Prog')).toBeInTheDocument()
    expect(screen.getByText('Task Done')).toBeInTheDocument()
  })
})
