import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login, register, logout } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  return useMutation({
    mutationFn: login,
    onSuccess: ({ data }) => {
      setAuth(data.user, { access: data.access, refresh: data.refresh })
      navigate('/dashboard')
    },
    onError: () => toast.error('Invalid email or password'),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  return useMutation({
    mutationFn: register,
    onSuccess: ({ data }) => {
      setAuth(data.user, { access: data.access, refresh: data.refresh })
      navigate('/dashboard')
    },
    onError: () => toast.error('Registration failed'),
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  return () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) logout(refresh).catch(() => null)
    clearAuth()
    navigate('/login')
  }
}
