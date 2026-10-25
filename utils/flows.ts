import { expect } from '@playwright/test';
import { CartPreviewComponent } from '../pages/CartPreviewComponent';
import { HomePage } from '../pages/HomePage';
import { messages } from './messages';

const ADDED_RESET_TIMEOUT = 30_000;

export async function addProducts(home: HomePage, names: string[]): Promise<number> {
  let total = 0;
  for (const name of names) {
    const card = home.product(name);
    total += await card.getPrice();
    await card.addToCart();
    await expect(card.addToCartButton).toHaveText(messages.added);
  }
  return total;
}

export async function addProductWithQuantity(home: HomePage, name: string, quantity: number): Promise<number> {
  const card = home.product(name);
  const price = await card.getPrice();
  await expect(home.addedButtons).toHaveCount(0, { timeout: ADDED_RESET_TIMEOUT });
  await card.setQuantity(quantity);
  await expect(card.quantityInput).toHaveValue(String(quantity));
  await card.addToCart();
  await expect(card.addToCartButton).toHaveText(messages.added);
  return price * quantity;
}

export async function openCheckout(cartPreview: CartPreviewComponent): Promise<void> {
  await cartPreview.open();
  await cartPreview.proceedToCheckout();
}
