import { useState, useCallback, useEffect } from 'react'
import { Modal, Button, Input } from '@/components/common'
import { de } from '@/i18n/de'
import type { Location, CalculationResult } from '@/types'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  location?: Location | null
  result?: CalculationResult | null
}

export function ShareDialog({ isOpen, onClose, location, result }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const params = new URLSearchParams()

    if (result) {
      params.set('from', result.from.locator)
      params.set('to', result.to.locator)
    } else if (location) {
      params.set('loc', location.locator)
    }

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    setShareUrl(url)
  }, [isOpen, location, result])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }, [shareUrl])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Locatorblick',
          text: result
            ? `QRB/QTF zwischen ${result.from.locator} und ${result.to.locator}`
            : `Maidenhead Locator: ${location?.locator}`,
          url: shareUrl
        })
      } catch {
        // User cancelled or error
      }
    }
  }, [shareUrl, result, location])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={de.export.shareUrl}
    >
      <div className="space-y-4">
        <Input
          value={shareUrl}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />

        <div className="flex gap-2">
          <Button onClick={handleCopy} className="flex-1">
            {copied ? de.export.urlCopied : de.export.copyToClipboard}
          </Button>
          {'share' in navigator && (
            <Button variant="secondary" onClick={handleShare}>
              Teilen
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
