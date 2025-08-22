# Workout Generator 2.0

A React + TypeScript + TailwindCSS application for generating personalized cycling workouts based on FTP (Functional Threshold Power) training zones.

## Features

- **Science-based Training Zones**: Generate workouts across 6 different types (Recovery, Endurance, Tempo, Threshold, VO2max, Anaerobic)
- **Difficulty Levels**: Choose between Easy (-5% FTP), Standard, or Hard (+5% FTP) difficulty
- **Smart Duration Management**: Automatic warm-up and cool-down calculation with intelligent time allocation
- **Step-by-Step Instructions**: Detailed workout breakdown with duration, intensity percentage, and descriptions
- **Export Functionality**: Download workouts as JSON or copy to clipboard as text
- **Dark Theme**: Mobile-first responsive design optimized for all devices

## How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: Navigate to `http://localhost:5000`

## How to Build

```bash
npm run build
```

The built files will be generated in the `dist` directory.

## Vercel Deployment

### Option 1: GitHub Integration

1. **Push to GitHub**: Commit and push your code to a GitHub repository

2. **Import on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `./` (default)

4. **Deploy**: Click "Deploy" and Vercel will automatically deploy your app

### Option 2: CLI Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts** to configure and deploy

## Important Files

- **`vercel.json`**: SPA fallback configuration for client-side routing
- **`src/lib/generator.ts`**: Core workout generation algorithm
- **`src/lib/types.ts`**: TypeScript type definitions
- **`src/components/`**: React components for form and output display

## Training Zone Guidelines

- **Recovery (50-60% FTP)**: Active recovery and easy-paced riding
- **Endurance (65-75% FTP)**: Aerobic base building with steady efforts  
- **Tempo (76-90% FTP)**: Moderately hard sustainable pace
- **Threshold (95-105% FTP)**: Sustainable but challenging efforts
- **VO2max (110-120% FTP)**: High-intensity intervals for maximum oxygen uptake
- **Anaerobic (125-150% FTP)**: Very high-intensity efforts for neuromuscular power

## Technology Stack

- **React 18** with TypeScript for component-based architecture
- **Vite** for fast development and optimized production builds
- **TailwindCSS** for utility-first styling and responsive design
- **Modern ES modules** with full type safety throughout