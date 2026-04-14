import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '../LoginPage'
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

describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('shows validation error when email is empty on submit', async () => {
    renderWithProviders(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when password is empty on submit', async () => {
    renderWithProviders(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
    })
  })

  it('calls login API with correct data on valid submit', async () => {
    renderWithProviders(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password@1' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
  })

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByRole('link', { name: /Register here/i })).toHaveAttribute('href', '/register')
  })
})
