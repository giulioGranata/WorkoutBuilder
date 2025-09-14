# Workout Generator

Generatore di workout indoor strutturati, in stile Zwift.  
Input: FTP, durata, tipologia di workout.  
Output: steps dettagliati, chart interattivo, esportazione nei principali formati.

## ✨ Features
- Generazione workout basata su FTP e durata.
- Bias dinamico (75–125%).
- Pattern statici randomizzati per ogni tipologia:
  recovery, endurance, tempo, threshold, vo2max, anaerobic.
- Step `steady` e `ramp` (warm-up/cool-down ramp).
- Esportazione in **JSON**, **TXT**, **ZWO (Zwift)**.
- Visualizzazione grafica a zone (colori stile Zwift).
- Responsive, mobile-first.
- Test automatizzati con Vitest e Playwright.

## 🚀 Tech Stack
- Vite + React + TypeScript
- TailwindCSS + shadcn/ui
- Vitest + Playwright
- Vercel (hosting)

## 📦 Installazione
```bash
npm install
npm run dev
```

