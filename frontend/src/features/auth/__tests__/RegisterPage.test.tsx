import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RegisterPage } from '../RegisterPage'
import { describe, it, expect } from 'vitest'
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

describe('RegisterPage', () => {
  it('renders all fields', () => {
    renderWithProviders(<RegisterPage />)
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('shows error when password too short', async () => {
    renderWithProviders(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('shows error when missing uppercase', async () => {
    renderWithProviders(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/At least one uppercase letter/i)).toBeInTheDocument()
    })
  })
})
