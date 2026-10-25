import { Locator, Page } from '@playwright/test';
import { TopDealsPage } from './TopDealsPage';

export class HeaderComponent {
  readonly searchInput: Locator;
  readonly itemsCount: Locator;
  readonly totalPrice: Locator;
  readonly cartIcon: Locator;
  readonly topDealsLink: Locator;

  constructor(private readonly page: Page) {
    const cartInfo = page.locator('.cart-info');
    this.searchInput = page.getByPlaceholder('Search for Vegetables and Fruits');
    this.itemsCount = cartInfo.getByRole('row', { name: /^Items/ }).locator('strong');
    this.totalPrice = cartInfo.getByRole('row', { name: /^Price/ }).locator('strong');
    this.cartIcon = page.getByRole('link', { name: 'Cart' });
    this.topDealsLink = page.getByRole('link', { name: 'Top Deals' });
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }

  async openTopDeals(): Promise<TopDealsPage> {
    const [dealsPage] = await Promise.all([this.page.context().waitForEvent('page'), this.topDealsLink.click()]);
    await dealsPage.waitForLoadState();
    return new TopDealsPage(dealsPage);
  }
}
