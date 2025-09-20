# Workout Builder – Piano di refactoring UI

## 1. Visione generale
- Allineare tutti i componenti a una palette duale (light/dark) basata su token CSS condivisi.
- Rafforzare la gerarchia visiva per le aree cruciali (output sintetico, segmenti, grafico) con card modulari e spaziature coerenti.
- Aggiornare i controlli interattivi (bottoni, menu, slider) adottando i pattern shadcn/ui e garantendo contrasto AA minimo 4.5:1.
- Prevedere un rollout incrementale: prima infrastruttura temi, poi componenti core, infine superfici secondarie.

## 2. Palette, tipografia e token
### 2.1 Architettura dei token
I token sono esposti come CSS custom properties (`--color-*`, `--space-*`, `--font-*`) applicati a `:root[data-theme="light"|"dark"]`. La palette è neutrale + accenti freddi per il focus e caldi per i gradienti di sforzo.

| Token | Descrizione | Light | Dark |
| --- | --- | --- | --- |
| `--color-bg` | sfondo app principale | `#F6F7FB` | `#05070F` |
| `--color-surface` | superfici base (card) | `#FFFFFF` | `#0B1020` |
| `--color-surface-muted` | blocchi secondari / riempimenti | `#EEF1F8` | `#151B2E` |
| `--color-surface-raised` | overlay / tooltip | `#FFFFFF` | `#11182B` |
| `--color-border` | bordi standard | `#D5DAE1` | `#202B3D` |
| `--color-border-strong` | separatori enfatizzati | `#B8C0CC` | `#2E3B54` |
| `--color-text-primary` | testo principale | `#0F172A` | `#F8FAFC` |
| `--color-text-secondary` | testo secondario | `#334155` | `#A9B4D0` |
| `--color-text-tertiary` | testo meta/didascalie | `#64748B` | `#7C8AA5` |
| `--color-accent` | azioni primarie | `#2563EB` | `#60A5FA` |
| `--color-accent-hover` | hover primario | `#1D4ED8` | `#3B82F6` |
| `--color-accent-pressed` | stato attivo/pressed | `#1E40AF` | `#2563EB` |
| `--color-accent-soft` | riempimenti soft / pill | `#DBEAFE` | `#1E3A8A` |
| `--shadow-card` | ombre per card | `0 18px 40px rgba(15, 23, 42, 0.08)` | `0 20px 48px rgba(8, 15, 31, 0.45)` |

Colori funzione allenamento:

| Token | Light | Dark | Uso |
| --- | --- | --- | --- |
| `--phase-warmup` | `#38BDF8` | `#0EA5E9` | etichette + grafico warm-up |
| `--phase-work` | `#22C55E` | `#10B981` | set principale |
| `--phase-recovery` | `#F97316` | `#FB923C` | recupero |
| `--phase-cooldown` | `#A855F7` | `#C084FC` | cool-down |
| `--z1` … `--z6` | `#BAE6FD`, `#7DD3FC`, `#34D399`, `#FACC15`, `#F97316`, `#F43F5E` | `#1D4ED8`, `#0EA5E9`, `#22C55E`, `#FACC15`, `#FB923C`, `#F97316` | bande FTP nel grafico |

Spaziature e raggi:

| Token | Valore |
| --- | --- |
| `--space-2` | `0.5rem`
| `--space-3` | `0.75rem`
| `--space-4` | `1rem`
| `--space-6` | `1.5rem`
| `--space-8` | `2rem`
| `--radius-sm` | `0.5rem`
| `--radius-md` | `0.75rem`
| `--radius-lg` | `1.25rem`

### 2.2 Tipografia
Font primario: `Inter`, di fallback `"Segoe UI", system-ui`. Scala modulare 1.125× con peso 500/600 per titoli e 400 per testo base.

| Token | Font size (rem/px) | Line height | Peso | Uso |
| --- | --- | --- | --- | --- |
| `--font-display` | `2.25rem / 36px` | `1.2` | 600 | headline pagina |
| `--font-h1` | `1.75rem / 28px` | `1.25` | 600 | card hero (WorkoutOutput) |
| `--font-h2` | `1.5rem / 24px` | `1.3` | 600 | sezioni (Segments, chart) |
| `--font-h3` | `1.25rem / 20px` | `1.35` | 500 | sotto-titoli/metriche |
| `--font-body` | `1rem / 16px` | `1.5` | 400 | testo base |
| `--font-body-sm` | `0.875rem / 14px` | `1.45` | 400 | meta informazioni |
| `--font-mono` | `0.875rem / 14px` | `1.45` | 500 | valori tabulari (watt/minuti) |

### 2.3 Commutazione temi
Utilizzare un attributo `data-theme` sul tag `<html>` o `<body>` con fallback automatico via `prefers-color-scheme`. Esempio:

```css
:root {
  color-scheme: light dark;
}
:root[data-theme="light"], :root:not([data-theme]) {
  --color-bg: #F6F7FB;
  /* ...altri token */
}
:root[data-theme="dark"] {
  --color-bg: #05070F;
  /* ... */
}
```

Logica React suggerita (pseudo-code):
```tsx
useEffect(() => {
  const userPref = localStorage.getItem("theme");
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = (userPref as "light" | "dark") ?? system;
});
```

## 3. Gerarchie visive e spaziature chiave
### 3.1 WorkoutOutput
- **Card principale**: usare `Card` con `padding: var(--space-6)` e gap verticale `var(--space-6)` tra blocchi.
- **Header**: titolo (`--font-h1`) e pill info (FTP, durata) in `flex` con `gap: var(--space-3)`; testo meta in `--font-body-sm`.
- **Metriche (NP/TSS/intensità)**: griglia `grid-cols-3` su desktop (`gap: var(--space-4)`), blocchi con `background: var(--color-surface-muted)` e `border-radius: var(--radius-sm)`.
- **Bias controls**: allineare slider e pulsanti in `flex` wrap; pulsanti `ghost` con icona, slider full-width su mobile. Etichetta valore in `--font-mono`.
- **CTA row**: bottoni primaria/secondaria con `justify-end`, spaziatura orizzontale `var(--space-3)`.

### 3.2 WorkoutSegments
- Inserire in card secondaria con titolo `--font-h2`.
- Lista `<ul>` con `gap: var(--space-3)` e `padding-y: var(--space-2)` su item, sostituendo `divide` con bordo soft `border-bottom: 1px solid var(--color-border)`.
- Bullet sinistro: `8px` dot con shadow `0 0 0 2px rgba(255,255,255,0.25)` in dark, `rgba(15,23,42,0.08)` in light.
- Minuti allineati destra in `--font-mono`, colore `--color-text-secondary`.

### 3.3 WorkoutChart
- Cornice con `padding: var(--space-4)`; titolo + legenda in `flex` `justify-between`.
- Sfondo grafico `linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-muted) 100%)`.
- Riga FTP (`showFtpLine`) con tratteggio `stroke-dasharray="6 6"` e label `--font-body-sm` su badge flottante.
- Tooltip: card con `background: var(--color-surface-raised)`, `border: 1px solid var(--color-border)`, `box-shadow: var(--shadow-card)` e testo monospaziato per i watt.

## 4. Controlli interattivi (shadcn/ui)
- **Button**: mantenere `buttonVariants` ma aggiornare mapping → `default` usa `--color-accent` (foreground `--color-surface`), `secondary` su `--color-surface-muted`, `outline` con `border-color: var(--color-border)`, `ghost` con `background-color: transparent` e hover `rgba(var(--color-text-primary),0.08)` via classe generata.
- **Icon button**: assicurare `size="icon"` abbia `border-radius: 9999px` e `aria-label` obbligatorio.
- **Select/Menu**: usare componenti radix, background `--color-surface`, bordi `--color-border`, highlight `--color-accent-soft` con testo `--color-accent`.
- **Focus states**: `ring` definito da `--color-accent` (`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.35)` light, `rgba(96, 165, 250, 0.45)` dark), contrasto minimo 3:1 anche per `hover`.

## 5. Mockup low-fi
```
Light theme (wireframe)
┌───────────────────────────────────────────────┐
│ Header  (Workout Builder)  [Theme toggle ○]   │
├───────────────────────────────────────────────┤
│ [Card] Workout summary                        │
│  Title + meta pills                           │
│  ┌─Metrics grid────────────────────────────┐   │
│  │ NP │ Intensity │ TSS                   │   │
│  └─────────────────────────────────────────┘   │
│  Bias slider  [-] [──────●──────] [+]  100%    │
│  Action buttons: [Generate again] [Download]   │
│  Segments + Chart stacked (lg: side-by-side)   │
└───────────────────────────────────────────────┘
```

```
Dark theme (wireframe)
┌───────────────────────────────────────────────┐
│ Header (Workout Builder) [Theme toggle ●]     │
├───────────────────────────────────────────────┤
│ [Card] Workout summary                        │
│  Title/meta contrast alto                     │
│  Metrics grid con superfici scure             │
│  Slider su superficie muted + pulsanti ghost  │
│  CTA barra inferiore con outline/primary      │
│  Segments: lista pill accent color            │
│  Chart: fondo gradient notte + legenda        │
└───────────────────────────────────────────────┘
```

## 6. Roadmap tecnica (CSS/JSX `src/components/**`)
1. **Infrastruttura temi**
   - Aggiornare `index.css` per introdurre i token e il selector `[data-theme]`.
   - Creare helper React (es. `useTheme`) oppure integrare toggle esistente in `WorkoutOutput` se previsto.
2. **UI base shadcn**
   - `src/components/ui/button.tsx`: mappare classi su nuovi token, aggiungere stato focus/disabled coerenti.
   - `src/components/ui/select.tsx`, `tooltip.tsx`, `card.tsx`: aggiornare background/border e `shadow`.
3. **WorkoutOutput.tsx**
   - Ristrutturare layout in blocchi `Card` + `Grid`.
   - Spostare metriche in sottocomponente (`<OutputMetric />`) per riuso con tipografia `--font-h3` e `--font-mono`.
   - Rendere slider bias full-width su mobile (`w-full mt-space-3`).
   - Introdurre wrapper CTA con `justify-end` e `gap-space-3`.
4. **WorkoutSegments.tsx**
   - Sostituire `divide-y` con `gap` e `border-bottom` manuale.
   - Applicare dot personalizzato e tipografia tabellare.
   - Aggiungere titolo sezione e descrizioni di default per segmenti vuoti.
5. **WorkoutChart.tsx**
   - Applicare padding e gradient di sfondo via wrapper `<div className="chart-card">`.
   - Aggiornare colori delle barre ai token `--z*` e rework tooltip (uso `Card`).
   - Etichetta FTP line con badge posizionato top-right.
6. **Accessibilità e toggle**
   - Inserire switch tema (es. in header) con stato memorizzato (`localStorage`).
   - Aggiornare `aria-live` per toast se necessario, garantire `aria-label` sui pulsanti icona (bias +/-).
7. **QA**
   - Verifica contrasto (Lighthouse, axe) in entrambi i temi.
   - Aggiornare test visivi / snapshot se presenti (`WorkoutOutput.bias.test.tsx`).

## 7. Motivazioni progettuali
- Palette fredda con accenti caldi facilita la lettura dei carichi (colore = intensità) riducendo la fatica cognitiva.
- Tipografia con line-height ampio migliora la leggibilità di dati numerici in card compatte.
- Le griglie modulari (metrics + segments + chart) permettono una disposizione responsive (stacked su mobile, split su desktop) mantenendo spaziatura coerente.
- L’allineamento con shadcn/ui assicura consistenza fra controlli e sfrutta varianti già tipizzate.
- Tooltips e badge seguono la stessa semantica cromatica, migliorando la memorizzazione dei pattern.
