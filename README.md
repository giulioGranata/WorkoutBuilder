# Workout Builder

Un'applicazione per la generazione di workout personalizzati per ciclisti, costruita con React, TypeScript e Tailwind CSS.

## 🚀 Avvio Rapido

### Prerequisiti

- Node.js 18+
- npm o yarn

### Installazione

```bash
# Clona il repository
git clone <your-repo-url>
cd WorkoutBuilder

# Installa le dipendenze
npm install

# Avvia l'app di sviluppo
npm run dev
```

L'applicazione si aprirà automaticamente su `http://localhost:3000`

## 📝 Script Disponibili

- `npm run dev` - Avvia l'app di sviluppo con hot reload
- `npm run build` - Build per produzione
- `npm run preview` - Anteprima della build di produzione
- `npm run check` - Controlla i tipi TypeScript
- `npm run clean` - Pulisce le cartelle di build

## 🧪 E2E/Visual Testing (Playwright)

È inclusa una suite Playwright separata dai test Vitest. Viene avviato automaticamente un dev server Vite su `http://localhost:5173` durante i test.

- `npm run test:e2e` – Esegue i test E2E/visual e genera i baseline al primo run.
- `npm run test:e2e:update` – Aggiorna i baseline visuali dopo modifiche intenzionali allo stile.
- `npm run test:e2e:ui` – Avvia il runner UI di Playwright.

Note:
- I baseline sono committati sotto `tests/e2e/__screenshots__/` e sono per-progetto (desktop/mobile).
- I risultati temporanei sono ignorati (`test-results/`, `playwright-report/`).
- Le animazioni sono disattivate durante i test per stabilità degli snapshot.

## 🏗️ Struttura del Progetto

```
WorkoutBuilder/
├── src/             # Codice sorgente React
│   ├── components/  # Componenti React
│   ├── lib/         # Utility e logica
│   ├── hooks/       # Custom hooks
│   ├── pages/       # Pagine dell'app
│   ├── App.tsx      # Componente principale
│   ├── main.tsx     # Entry point React
│   └── index.css    # Stili globali
├── index.html       # Entry point HTML
└── dist/            # Build di produzione
```

## 🛠️ Tecnologie

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **Build**: Vite
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query
- **Styling**: Tailwind CSS con animazioni

## 📱 Funzionalità

- Generazione di workout personalizzati per ciclismo
- 6 tipi di workout (Recovery, Endurance, Tempo, Threshold, VO2max, Anaerobic)
- 3 livelli di difficoltà (Easy, Standard, Hard)
- Calcolo automatico basato su FTP e durata
- Interfaccia moderna e responsive
- Hot reload per sviluppo veloce
