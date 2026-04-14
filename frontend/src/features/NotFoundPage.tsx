import { Compass, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <PageWrapper title="404 - Page Not Found">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-fade-in">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
          <Compass className="w-20 h-20 text-primary relative z-10 animate-bounce" />
        </div>
        
        <h1 className="font-display text-3xl font-bold text-text-h mb-3 tracking-tight">Lost in spacetime?</h1>
        <p className="text-text-muted mb-8 max-w-md text-sm leading-relaxed">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <Link to="/dashboard" className="group">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl border-t border-border-default pt-6 opacity-50">
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-h">Status</h4>
            <p className="text-[11px] text-text-muted">404 Error: Not Found</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-h">Location</h4>
            <p className="text-[11px] text-text-muted">{window.location.pathname}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-h">Support</h4>
            <p className="text-[11px] text-text-muted">ERR-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
