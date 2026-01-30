import { useState } from 'react'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Footer, LegalModal } from '@/components/legal'
import { useAppContext } from '@/store'

interface MainLayoutProps {
  children: (activeTab: string) => React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { state, setActiveTab } = useAppContext()
  const activeTab = state.activeTab
  const [legalModal, setLegalModal] = useState<'imprint' | 'privacy' | null>(null)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6 w-full flex-1">
        {children(activeTab)}
      </main>
      <Footer
        onImprintClick={() => setLegalModal('imprint')}
        onPrivacyClick={() => setLegalModal('privacy')}
      />
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Legal Modals */}
      {legalModal && (
        <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </div>
  )
}
