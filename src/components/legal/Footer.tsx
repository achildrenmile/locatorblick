import { de } from '@/i18n/de'
import { useConfig } from '@/hooks/useConfig'

interface FooterProps {
  onImprintClick: () => void
  onPrivacyClick: () => void
}

export function Footer({ onImprintClick, onPrivacyClick }: FooterProps) {
  const { config } = useConfig()

  return (
    <footer className="py-4 pb-20 md:pb-4 border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
          <span>{de.legal.footerText}</span>

          {/* Parent Site Link - only show if configured */}
          {config.parentSiteName && config.parentSiteUrl && (
            <>
              <span className="hidden sm:inline">•</span>
              <a
                href={config.parentSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Teil der {config.parentSiteName} Tools
              </a>
            </>
          )}

          <span className="hidden sm:inline">•</span>
          <button
            onClick={onImprintClick}
            className="text-primary-600 hover:underline"
          >
            {de.legal.imprint}
          </button>
          <span className="hidden sm:inline">|</span>
          <button
            onClick={onPrivacyClick}
            className="text-primary-600 hover:underline"
          >
            {de.legal.privacy}
          </button>
          <span className="hidden sm:inline">|</span>
          <a
            href="https://github.com/achildrenmile/locatorblick"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
