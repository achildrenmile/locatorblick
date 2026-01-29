import { useState, useEffect } from 'react'

export interface SiteConfig {
  parentSiteUrl: string
  parentSiteLogo: string
  parentSiteName: string
}

const defaultConfig: SiteConfig = {
  parentSiteUrl: '',
  parentSiteLogo: '',
  parentSiteName: ''
}

let cachedConfig: SiteConfig | null = null
let configPromise: Promise<SiteConfig> | null = null

async function loadConfig(): Promise<SiteConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  if (configPromise) {
    return configPromise
  }

  configPromise = fetch('/config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Config not found')
      }
      return response.json()
    })
    .then((data: Partial<SiteConfig>) => {
      cachedConfig = {
        parentSiteUrl: data.parentSiteUrl || '',
        parentSiteLogo: data.parentSiteLogo || '',
        parentSiteName: data.parentSiteName || ''
      }
      return cachedConfig
    })
    .catch(() => {
      cachedConfig = defaultConfig
      return cachedConfig
    })

  return configPromise
}

export function useConfig() {
  const [config, setConfig] = useState<SiteConfig>(cachedConfig || defaultConfig)
  const [loading, setLoading] = useState(!cachedConfig)

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig)
      setLoading(false)
      return
    }

    loadConfig().then(loadedConfig => {
      setConfig(loadedConfig)
      setLoading(false)
    })
  }, [])

  return { config, loading }
}
