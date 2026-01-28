# Locatorblick

Web-Applikation für Maidenhead-Locator-Berechnungen, Distanz-/Richtungsberechnung zwischen Stationen und Grid-Square-Visualisierung für Funkamateure.

## Features

- **Locator-Konvertierung**: Umrechnung zwischen Maidenhead-Locator und Koordinaten (4/6/8/10-stellig)
- **QRB-Berechnung**: Entfernung zwischen zwei Stationen (km, Meilen, Seemeilen)
- **QTF-Berechnung**: Peilung/Richtung zwischen Stationen mit Short/Long Path
- **Karten-Visualisierung**: Interaktive Karte mit OpenStreetMap
- **Grid-Overlay**: Maidenhead-Gitter auf der Karte
- **Favoriten**: Speichern und Verwalten von Standorten (Home-QTH, Portabel, Relais, etc.)
- **GPS-Unterstützung**: Eigener Standort per GPS
- **Sonnenzeiten**: Sonnenauf-/untergang und Twilight-Zeiten
- **Batch-Konvertierung**: Mehrere Locatoren gleichzeitig umrechnen
- **Export**: CSV, JSON, Clipboard
- **PWA**: Offline-fähig, installierbar auf Mobilgeräten

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Leaflet.js (react-leaflet)
- Turf.js (Geodäsie)
- SunCalc (Sonnenzeiten)
- vite-plugin-pwa (Service Worker)

## Entwicklung

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Preview des Builds
npm run preview
```

## Deployment

```bash
# Docker-Build und Deployment
./deploy-production.sh

# Mit --rebuild für Cache-Invalidierung
./deploy-production.sh --rebuild
```

## Konfiguration

Erstelle `.env.production` basierend auf den Werten in `deploy-production.sh`:

```
SERVER_HOST=user@server
REMOTE_DIR=/path/to/deployment
CONTAINER_NAME=locatorblick
IMAGE_NAME=locatorblick:latest
CONTAINER_PORT=3414:80
SITE_URL=https://your-domain.com/
```

## Lizenz

MIT License - siehe [LICENSE](LICENSE)

## Links

- Live: https://locatorblick.oeradio.at
- Teil der [OERadio Tools](https://oeradio.at)
