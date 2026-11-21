# Puttantour 2026/2027 — Official Membership Portal

Sito statico pubblicato su GitHub Pages: https://onlyg4bb0.github.io/puttantour-2026-2027/

Tutto gira nel browser: nessun server, la tessera resta nel `localStorage` del dispositivo.

## Struttura

- `index.html` — markup
- `assets/css/app.css` — Tailwind compilato (da `src/input.css`)
- `assets/js/app.js` — logica (modulo, tessera, PNG, condivisione)
- `assets/js/qrcode.js` — generatore QR (qrcode-generator, MIT)
- `assets/img/` — favicon, icona iOS, anteprima social

## Modificare gli stili

```bash
npm install
npm run build:css
```
