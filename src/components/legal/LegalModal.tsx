import { useEffect } from 'react'
import { Button } from '@/components/common'
import { de } from '@/i18n/de'

interface LegalModalProps {
  type: 'imprint' | 'privacy'
  onClose: () => void
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {type === 'imprint' ? de.legal.imprintTitle : de.legal.privacyTitle}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Schließen">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {type === 'imprint' ? <ImprintContent /> : <PrivacyContent />}
        </div>
      </div>
    </div>
  )
}

function ImprintContent() {
  return (
    <div className="space-y-6 text-slate-700">
      <p className="text-sm text-slate-500">{de.legal.imprintInfo}</p>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.imprintOperator}
        </h3>
        <div className="space-y-1">
          <p className="font-medium">{de.legal.imprintOperatorName}</p>
          <p>{de.legal.imprintOperatorCallsign}</p>
          <p>{de.legal.imprintOperatorAddress}</p>
          <p>{de.legal.imprintOperatorCountry}</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.imprintContact}
        </h3>
        <a
          href={`mailto:${de.legal.imprintContactEmail}`}
          className="text-primary-600 hover:underline"
        >
          {de.legal.imprintContactEmail}
        </a>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.imprintLiabilityTitle}
        </h3>
        <p>{de.legal.imprintLiabilityText}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.imprintCopyrightTitle}
        </h3>
        <p>{de.legal.imprintCopyrightText}</p>
      </section>
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-slate-700">
      <p>{de.legal.privacyIntro}</p>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.privacyNoDataTitle}
        </h3>
        <p className="mb-2">{de.legal.privacyNoDataText}</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>{de.legal.privacyNoDataForms}</li>
          <li>{de.legal.privacyNoDataCookies}</li>
          <li>{de.legal.privacyNoDataTracking}</li>
          <li>{de.legal.privacyNoDataServer}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.privacyLocalStorageTitle}
        </h3>
        <p>{de.legal.privacyLocalStorageText}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.privacyCloudflareTitle}
        </h3>
        <p>{de.legal.privacyCloudflareText}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.privacyRightsTitle}
        </h3>
        <p>{de.legal.privacyRightsText}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {de.legal.privacyContactTitle}
        </h3>
        <p className="mb-2">{de.legal.privacyContactText}</p>
        <a
          href={`mailto:${de.legal.imprintContactEmail}`}
          className="text-primary-600 hover:underline"
        >
          {de.legal.imprintContactEmail}
        </a>
      </section>
    </div>
  )
}
