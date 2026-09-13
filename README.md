# Are there peanuts?

Webapp für Familien mit Erdnussallergie: Barcode eines Lebensmittels scannen (oder die Nummer eintippen) und sofort sehen, ob das Produkt laut [Open Food Facts](https://world.openfoodfacts.org) Erdnüsse enthält, Spuren enthalten kann, keine Erdnüsse angibt oder ob zu wenig Daten vorliegen.

Angular 22 (standalone, zoneless, Signals, Signal Forms), installierbar als PWA, Oberfläche auf Deutsch und Englisch.

> Die App liest nur, was bei Open Food Facts eingetragen ist. Sie ersetzt keine ärztliche Beratung, und im Zweifel zählt die Packung.

## So entscheidet die App

Das stärkste Signal gewinnt:

1. `allergens_tags` enthält `en:peanuts` → **Enthält Erdnüsse**
2. `traces_tags` enthält `en:peanuts` → **Kann Spuren enthalten**
3. Die Zutatenlisten (de, en und die Hauptsprache) werden nach Erdnuss-Wörtern durchsucht (Erdnuss, peanut, groundnut, arachide, cacahuète, pinda …). Steht der Treffer in einem Satz mit Spurenhinweis („kann Spuren … enthalten“, „may contain“), zählt er als Spur, sonst als Zutat. Verneinungen wie „ohne Erdnüsse“ oder „peanut-free“ werden ignoriert.
4. Es gibt Daten, aber keinen Treffer → **Keine Erdnüsse angegeben**
5. Es gibt weder Zutaten noch Allergene → **Zu wenig Daten**

Die Logik steckt in [src/app/core/peanut-analyzer.ts](src/app/core/peanut-analyzer.ts) und ist durch Unit-Tests abgedeckt.

## Entwicklung

Node 24.15 oder neuer (im Projekt per Volta auf 24.21 gepinnt).

```bash
npm install
```

```bash
npm start
```

Der Dev-Server läuft per HTTPS auf `https://localhost:4200` und leitet `/api/off` über [proxy.conf.json](proxy.conf.json) an Open Food Facts weiter. Das Zertifikat ist selbst signiert, der Browser warnt also beim ersten Aufruf.

### Auf dem Handy testen

Der Dev-Server lauscht auf allen Netzwerkschnittstellen (`host: 0.0.0.0` in [angular.json](angular.json)) und ist dadurch im lokalen Netz erreichbar. HTTPS ist nötig, weil Browser die Kamera nur auf sicheren Seiten freigeben.

1. Handy und Rechner ins selbe WLAN bringen.
2. Die IP-Adresse des Rechners herausfinden, unter macOS zum Beispiel mit:

   ```bash
   ipconfig getifaddr en0
   ```

3. `npm start` ausführen und auf dem Handy `https://<ip-adresse>:4200` öffnen.
4. Die Zertifikatswarnung bestätigen: In Safari (iOS) über „Details einblenden“ und „Diese Website besuchen“, in Chrome (Android) über „Erweitert“ und „Weiter zu …“.
5. Fragt macOS, ob `node` eingehende Verbindungen annehmen darf, das erlauben.

Der Service Worker ist im Dev-Modus abgeschaltet. Für PWA-Tests also besser den Docker-Build hinter dem Reverse Proxy nehmen.

```bash
npm test
```

```bash
npm run build
```

## Deployment mit Docker Compose

Der Container liefert die App über nginx per HTTP aus und leitet Produktabfragen an Open Food Facts weiter. Dabei setzt er den User-Agent, den Open Food Facts verlangt (`AppName/Version (Kontakt)`), cacht Antworten 24 Stunden und hält das Limit von 15 Abfragen pro Minute ein.

1. `.env` anlegen und ausfüllen:

   ```bash
   cp .env.example .env
   ```

2. Starten:

   ```bash
   docker compose up -d --build
   ```

3. Den vorhandenen Reverse Proxy auf `http://<homeserver>:8080` zeigen lassen (Port über `PORT` in `.env` änderbar).

**HTTPS ist Pflicht für den Kamera-Scan.** Browser geben die Kamera nur auf sicheren Seiten frei. Ohne HTTPS bleibt nur die manuelle Eingabe.

| Variable | Pflicht | Bedeutung |
| --- | --- | --- |
| `OFF_USER_AGENT` | ja | Kennung für Open Food Facts, z. B. `AreTherePeanuts/1.0 (du@example.com)` |
| `PORT` | nein | Host-Port, Standard `8080` |
| `NGINX_RESOLVER` | nein | DNS-Server für nginx, Standard `127.0.0.11` (Docker-DNS) |

Healthcheck: `GET /healthz`. Ob eine Antwort aus dem Cache kam, zeigt der Header `X-Cache-Status`.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `src/app/core/` | Barcode-Prüfung, Erdnuss-Analyse, Open-Food-Facts-Abfrage, Verlauf, Übersetzungen |
| `src/app/scanner/` | Kamera und Barcode-Erkennung (natives `BarcodeDetector`, sonst zxing-WebAssembly aus `/wasm/`) |
| `src/app/pages/` | Startseite (Scanner, Eingabe, Verlauf) und Ergebnisseite |
| `tokens.css` | Design-Tokens (Farben, Schrift, Abstände, Bewegung) |
| `docker/` | nginx-Konfiguration und Security-Header |

Produktdaten: © Open Food Facts contributors, lizenziert unter der [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/).
