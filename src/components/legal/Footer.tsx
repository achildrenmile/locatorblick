import { de } from '@/i18n/de'

interface FooterProps {
  onImprintClick: () => void
  onPrivacyClick: () => void
}

export function Footer({ onImprintClick, onPrivacyClick }: FooterProps) {
  return (
    <footer className="py-4 pb-20 md:pb-4 border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
          <span>{de.legal.footerText}</span>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://oeradio.at"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            Teil der OERadio Tools
          </a>
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
