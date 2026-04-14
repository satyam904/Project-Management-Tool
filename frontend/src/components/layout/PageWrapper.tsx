import React from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

interface PageWrapperProps {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function PageWrapper({ title, actions, children }: PageWrapperProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-text-main">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar title={title} actions={actions} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-10 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
