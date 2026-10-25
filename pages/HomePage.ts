import { expect, Locator, Page } from '@playwright/test';
import { env } from '../utils/env';
import { parsePrice } from '../utils/price';
import { productNamePattern } from '../utils/text';

const INITIAL_LOAD_TIMEOUT = 30_000;

export class ProductCard {
  readonly root: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly quantityInput: Locator;
  readonly incrementButton: Locator;
  readonly decrementButton: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page, productName: string) {
    this.root = page
      .locator('.products .product')
      .filter({ has: page.locator('.product-name', { hasText: productNamePattern(productName) }) });
    this.name = this.root.locator('.product-name');
    this.price = this.root.locator('.product-price');
    this.image = this.root.getByRole('img');
    this.quantityInput = this.root.getByRole('spinbutton');
    this.incrementButton = this.root.locator('.increment');
    this.decrementButton = this.root.locator('.decrement');
    this.addToCartButton = this.root.getByRole('button');
  }

  async getPrice(): Promise<number> {
    await expect(this.price).toBeVisible();
    return parsePrice(await this.price.innerText());
  }

  async increment(): Promise<void> {
    await this.incrementButton.click();
  }

  async decrement(): Promise<void> {
    await this.decrementButton.click();
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}

export class HomePage {
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly addToCartButtons: Locator;
  readonly addedButtons: Locator;
  readonly noResultsMessage: Locator;

  constructor(private readonly page: Page) {
    this.productCards = page.locator('.products .product');
    this.productNames = this.productCards.locator('.product-name');
    this.addToCartButtons = this.productCards.getByRole('button');
    this.addedButtons = this.productCards.getByRole('button', { name: '✔ ADDED' });
    this.noResultsMessage = page.locator('.no-results').getByRole('heading');
  }

  async goto(): Promise<void> {
    await this.page.goto(env.BASE_URL, { waitUntil: 'networkidle' });
    await expect(this.productNames.first()).toBeVisible({ timeout: INITIAL_LOAD_TIMEOUT });
  }

  product(name: string): ProductCard {
    return new ProductCard(this.page, name);
  }

  async getAllProductNames(): Promise<string[]> {
    await expect(this.productNames.first()).toBeVisible();
    const names = await this.productNames.allInnerTexts();
    return names.map((name) => name.trim());
  }

  async getExpectedMatches(keyword: string): Promise<string[]> {
    const names = await this.getAllProductNames();
    return names.filter((name) => name.toLowerCase().includes(keyword.toLowerCase()));
  }
}
