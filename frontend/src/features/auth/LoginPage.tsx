import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Layers, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { loginSchema } from '../../utils/validators'
import { useLogin } from './useAuth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import type { LoginPayload } from '../../types/auth'

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>({
    resolver: yupResolver(loginSchema)
  })
  
  const { mutate, isPending } = useLogin()

  const onSubmit = (data: LoginPayload) => {
    mutate(data)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary p-2.5 rounded-premium shadow-premium mb-2">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-h tracking-tight">Welcome back</h1>
          <p className="text-text-muted">Enter your credentials to access your workspace</p>
        </div>
        
        <div className="bg-surface border border-border-default rounded-premium-lg p-8 shadow-premium shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@company.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-muted ml-0.5">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>
            
            <Button type="submit" variant="primary" className="w-full mt-2 gap-2 shadow-premium" loading={isPending}>
              Sign in to FlowTask <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-surface px-4 text-text-muted/50">New to FlowTask?</span>
            </div>
          </div>
          
          <Link to="/register" className="block">
            <Button variant="outline" className="w-full">
              Create an account
            </Button>
          </Link>
        </div>
        
        <p className="text-center text-xs text-text-muted opacity-60">
          By signing in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
