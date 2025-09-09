import { test, expect } from '@playwright/test';

// Disable animations globally for visual stability
test.beforeEach(async ({ page }) => {
  // Seed Math.random for deterministic workout selection
  await page.addInitScript(() => {
    // Mulberry32 PRNG
    function mulberry32(a: number) {
      return function () {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    // @ts-ignore
    const rand = mulberry32(1);
    // @ts-ignore
    Math.random = rand;
  });

  await page.addStyleTag({
    content: `
      *, *::before, *::after { 
        transition: none !important; 
        animation: none !important; 
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });
});

test.describe('Workout Output - visual', () => {
  test('generate default workout → snapshot card', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('button-generate').click();
    const card = page.getByTestId('workout-display');
    await expect(card).toBeVisible();

    await expect(card).toHaveScreenshot('workout-output.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('bias 125% → snapshot chart', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('button-generate').click();
    await expect(page.getByTestId('workout-display')).toBeVisible();

    // Set slider to 125 and dispatch input/change events
    const slider = page.getByTestId('bias-range');
    await slider.evaluate((el, value) => {
      const input = el as HTMLInputElement;
      input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, 125);

    const chart = page.locator('svg[aria-label="Workout chart"]');
    await expect(chart).toBeVisible();

    await expect(chart).toHaveScreenshot('workout-chart-bias-125.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
