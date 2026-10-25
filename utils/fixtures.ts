import { test as base } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CartPreviewComponent } from '../pages/CartPreviewComponent';
import { HeaderComponent } from '../pages/HeaderComponent';
import { CountrySelectPage } from '../pages/CountrySelectPage';
import { HomePage } from '../pages/HomePage';
import { createLogger, Logger } from './logger';

interface Fixtures {
  logger: Logger;
  home: HomePage;
  header: HeaderComponent;
  cartPreview: CartPreviewComponent;
  cartPage: CartPage;
  countryPage: CountrySelectPage;
}

export const test = base.extend<Fixtures>({
  context: async ({ context }, use) => {
    await context.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());
    await use(context);
  },
  logger: async ({}, use, testInfo) => {
    const logger = createLogger(testInfo.title);
    logger.info('Test started');
    await use(logger);
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.error(`Test ${testInfo.status}: ${testInfo.error?.message?.split('\n')[0] ?? 'unknown error'}`);
    } else {
      logger.info('Test finished');
    }
  },
  home: async ({ page }, use) => use(new HomePage(page)),
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  cartPreview: async ({ page, header }, use) => use(new CartPreviewComponent(page, header)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  countryPage: async ({ page }, use) => use(new CountrySelectPage(page)),
});

export { expect } from '@playwright/test';
