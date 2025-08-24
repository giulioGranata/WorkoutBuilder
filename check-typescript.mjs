#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔍 Running TypeScript check...');

try {
  // Ignora tutti i parametri e usa solo il tsconfig
  execSync('npx tsc --noEmit', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ TypeScript check passed!');
  process.exit(0);
} catch (error) {
  console.error('❌ TypeScript check failed!');
  process.exit(1);
}
