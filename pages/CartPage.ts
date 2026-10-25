import { expect, Locator, Page } from '@playwright/test';
import { parsePrice } from '../utils/price';
import { productNamePattern } from '../utils/text';

export interface CartRow {
  name: string;
  quantity: number;
  price: number;
  amount: number;
}

export class CartPage {
  readonly table: Locator;
  readonly rows: Locator;
  readonly promoInput: Locator;
  readonly promoButton: Locator;
  readonly promoLoader: Locator;
  readonly promoMessage: Locator;
  readonly totalAmount: Locator;
  readonly discountPercent: Locator;
  readonly discountedAmount: Locator;
  readonly placeOrderButton: Locator;

  constructor(private readonly page: Page) {
    this.table = page.locator('#productCartTables');
    this.rows = this.table.locator('tbody tr');
    this.promoInput = page.getByPlaceholder('Enter promo code');
    this.promoButton = page.getByRole('button', { name: /Apply|Applying/ });
    this.promoLoader = page.locator('.promo-btn-loader');
    this.promoMessage = page.locator('.promoInfo');
    this.totalAmount = page.locator('.totAmt');
    this.discountPercent = page.locator('.discountPerc');
    this.discountedAmount = page.locator('.discountAmt');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
  }

  row(productName: string): Locator {
    return this.rows.filter({ has: this.page.locator('.product-name', { hasText: productNamePattern(productName) }) });
  }

  async readRows(): Promise<CartRow[]> {
    await expect(this.rows.first()).toBeVisible();
    const rows = await this.rows.all();
    const result: CartRow[] = [];
    for (const row of rows) {
      await expect(row).toBeVisible();
      const amounts = row.locator('.amount');
      result.push({
        name: (await row.locator('.product-name').innerText()).trim(),
        quantity: parsePrice(await row.locator('.quantity').innerText()),
        price: parsePrice(await amounts.first().innerText()),
        amount: parsePrice(await amounts.last().innerText()),
      });
    }
    return result;
  }

  async readNumber(locator: Locator): Promise<number> {
    await expect(locator).toBeVisible();
    return parsePrice(await locator.innerText());
  }

  async applyPromo(code: string): Promise<void> {
    await this.promoInput.fill(code);
    await this.promoButton.click();
    await expect(this.promoLoader).toHaveCount(0, { timeout: 30_000 });
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }
}
