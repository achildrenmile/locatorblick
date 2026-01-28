import { useState } from 'react'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

interface MainLayoutProps {
  children: (activeTab: string) => React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState('converter')

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children(activeTab)}
      </main>
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
