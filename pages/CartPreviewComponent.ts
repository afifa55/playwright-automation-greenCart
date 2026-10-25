import { Locator, Page } from '@playwright/test';
import { productNamePattern } from '../utils/text';
import { HeaderComponent } from './HeaderComponent';

export class CartPreviewComponent {
  readonly root: Locator;
  readonly items: Locator;
  readonly emptyMessage: Locator;
  readonly proceedButton: Locator;

  constructor(private readonly page: Page, private readonly header: HeaderComponent) {
    this.root = page.locator('.cart-preview.active');
    this.items = this.root.locator('.cart-item');
    this.emptyMessage = this.root.getByRole('heading', { level: 2 });
    this.proceedButton = this.root.getByRole('button', { name: 'PROCEED TO CHECKOUT' });
  }

  async open(): Promise<void> {
    await this.header.cartIcon.click();
    await this.root.waitFor({ state: 'visible' });
  }

  item(productName: string): Locator {
    return this.items.filter({ has: this.page.locator('.product-name', { hasText: productNamePattern(productName) }) });
  }

  itemName(productName: string): Locator {
    return this.item(productName).locator('.product-name');
  }

  itemPrice(productName: string): Locator {
    return this.item(productName).locator('.product-price');
  }

  itemQuantity(productName: string): Locator {
    return this.item(productName).locator('.quantity');
  }

  itemAmount(productName: string): Locator {
    return this.item(productName).locator('.amount');
  }

  async remove(productName: string): Promise<void> {
    await this.item(productName).locator('.product-remove').click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedButton.click();
  }
}
