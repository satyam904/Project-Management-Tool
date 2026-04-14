import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Layers, ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { registerSchema } from '../../utils/validators'
import { useRegister } from './useAuth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import type { RegisterPayload } from '../../types/auth'

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterPayload>({
    resolver: yupResolver(registerSchema)
  })
  
  const { mutate, isPending } = useRegister()

  const onSubmit = (data: RegisterPayload) => {
    mutate(data)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-[480px] space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary p-2.5 rounded-premium shadow-premium mb-2">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-h tracking-tight">Create an account</h1>
          <p className="text-text-muted">Join 10,000+ teams managing projects efficiently</p>
        </div>
        
        <div className="bg-surface border border-border-default rounded-premium-lg p-8 shadow-premium shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="First Name" 
                placeholder="Jane"
                {...register('first_name')}
                error={errors.first_name?.message}
              />
              <Input 
                label="Last Name" 
                placeholder="Doe"
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>
            
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="jane@company.com"
              {...register('email')}
              error={errors.email?.message}
            />
            
            <div className="space-y-2">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
              {!errors.password && (
                <div className="flex items-center gap-1.5 ml-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-text-muted/60" />
                  <p className="text-[11px] font-medium text-text-muted/60">Min 8 chars with uppercase & number</p>
                </div>
              )}
            </div>
            
            <Button type="submit" variant="primary" className="w-full mt-4 gap-2 shadow-premium" loading={isPending}>
              Get Started for Free <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-surface px-4 text-text-muted/50">Already have an account?</span>
            </div>
          </div>
          
          <Link to="/login" className="block text-center">
            <span className="text-sm font-semibold text-text-muted hover:text-primary transition-colors">
              Sign in to your existing account
            </span>
          </Link>
        </div>
        
        <p className="text-center text-xs text-text-muted opacity-60">
          By registering, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
