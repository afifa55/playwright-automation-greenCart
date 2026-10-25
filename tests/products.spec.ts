import { env } from '../utils/env';
import { expect, test } from '../utils/fixtures';
import { messages } from '../utils/messages';
import { productNamePattern } from '../utils/text';

const products = [env.PRODUCT_1, env.PRODUCT_2, env.PRODUCT_3];

test.describe('Products', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test(
    'TC_PRODUCTS_01 - Each product card shows name, price, image, quantity controls and add to cart button',
    { tag: ['@smoke', '@regression', '@products'] },
    async ({ home, logger }) => {
      for (const name of products) {
        await test.step(`Verify product card for ${name}`, async () => {
          const card = home.product(name);
          await expect(card.name).toHaveText(productNamePattern(name));
          await expect(card.price).toHaveText(/^\d+(\.\d+)?$/);
          await expect(card.image).toBeVisible();
          await expect(card.image).toHaveAttribute('alt', productNamePattern(name));
          await expect(card.quantityInput).toHaveValue('1');
          await expect(card.incrementButton).toBeVisible();
          await expect(card.decrementButton).toBeVisible();
          await expect(card.addToCartButton).toHaveText(messages.addToCart);
          logger.info(`Product card verified: ${name}, price ${await card.getPrice()}`);
        });
      }
    },
  );

  test(
    'TC_PRODUCTS_02 - Every listed product has an add to cart button',
    { tag: ['@regression', '@products'] },
    async ({ home, logger }) => {
      await test.step('Compare product count with add to cart button count', async () => {
        const names = await home.getAllProductNames();
        await expect(home.addToCartButtons).toHaveCount(names.length);
        logger.info(`Products listed: ${names.length}, each with an add to cart button`);
      });
    },
  );
});
