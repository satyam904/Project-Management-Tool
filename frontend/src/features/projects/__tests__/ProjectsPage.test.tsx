import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectsPage } from '../ProjectsPage'
import { describe, it, expect, beforeEach } from 'vitest'
import { server } from '../../../test/setup'
import { http, HttpResponse } from 'msw'
import React from 'react'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('ProjectsPage', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  it('renders project list', async () => {
    renderWithProviders(<ProjectsPage />)
    expect(await screen.findByText('Project one')).toBeInTheDocument()
    expect(screen.getByText('Project two')).toBeInTheDocument()
    expect(screen.getByText('Project three')).toBeInTheDocument()
  })

  it('shows empty state when no projects', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/projects/', () => {
        return HttpResponse.json({ data: { results: [] } })
      })
    )
    renderWithProviders(<ProjectsPage />)
    expect(await screen.findByText('No projects yet')).toBeInTheDocument()
  })

  it('opens create modal on New Project click', async () => {
    renderWithProviders(<ProjectsPage />)
    // Wait for load
    await screen.findByText('Project one')
    
    const newBtns = screen.getAllByRole('button', { name: /New Project/i })
    fireEvent.click(newBtns[0])
    
    expect(screen.getByText('Project title')).toBeInTheDocument()
  })
  
  it('delete confirmation modal appears on trash click', async () => {
    renderWithProviders(<ProjectsPage />)
    await screen.findByText('Project one')
    
    fireEvent.click(screen.getByTestId('delete-project-1'))
    
    expect(screen.getByText(/This will permanently delete/i)).toBeInTheDocument()
  })
})
