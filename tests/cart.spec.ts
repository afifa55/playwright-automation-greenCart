import { env } from '../utils/env';
import { expect, test } from '../utils/fixtures';
import { addProducts, addProductWithQuantity } from '../utils/flows';
import { messages } from '../utils/messages';
import { formatAmount } from '../utils/price';
import { productNamePattern, quantityLabel } from '../utils/text';

const products = [env.PRODUCT_1, env.PRODUCT_2, env.PRODUCT_3];

test.describe('Cart', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test(
    'TC_CART_01 - Add a single product updates the button and header',
    { tag: ['@smoke', '@regression', '@cart'] },
    async ({ home, header, logger }) => {
      const card = home.product(env.PRODUCT_1);
      const price = await card.getPrice();

      await test.step(`Add ${env.PRODUCT_1} to cart`, async () => {
        await card.addToCart();
        await expect(card.addToCartButton).toHaveText(messages.added);
      });

      await test.step('Verify header items and price', async () => {
        await expect(header.itemsCount).toHaveText('1');
        await expect(header.totalPrice).toHaveText(formatAmount(price));
        logger.info(`Added ${env.PRODUCT_1}, header shows 1 item, price ${price}`);
      });
    },
  );

  test(
    'TC_CART_02 - Add multiple products updates the header count and price',
    { tag: ['@regression', '@cart'] },
    async ({ home, header, logger }) => {
      const total = await test.step('Add three products', () => addProducts(home, products));

      await test.step('Verify header items and price', async () => {
        await expect(header.itemsCount).toHaveText(String(products.length));
        await expect(header.totalPrice).toHaveText(formatAmount(total));
        logger.info(`Added ${products.length} products, header price ${total}`);
      });
    },
  );

  test(
    'TC_CART_03 - Add a product with a custom quantity',
    { tag: ['@regression', '@cart'] },
    async ({ home, header, cartPreview, logger }) => {
      const quantity = env.CUSTOM_QUANTITY;
      const amount = await test.step(`Add ${env.PRODUCT_1} with quantity ${quantity}`, () =>
        addProductWithQuantity(home, env.PRODUCT_1, quantity),
      );

      await test.step('Verify header items and price', async () => {
        await expect(header.itemsCount).toHaveText('1');
        await expect(header.totalPrice).toHaveText(formatAmount(amount));
      });

      await test.step('Verify cart preview quantity and amount', async () => {
        await cartPreview.open();
        await expect(cartPreview.itemQuantity(env.PRODUCT_1)).toHaveText(quantityLabel(quantity));
        await expect(cartPreview.itemAmount(env.PRODUCT_1)).toHaveText(formatAmount(amount));
        logger.info(`Added ${env.PRODUCT_1} x${quantity}, amount ${amount}`);
      });
    },
  );

  test(
    'TC_CART_04 - Cart preview shows correct items, quantities and amounts',
    { tag: ['@smoke', '@regression', '@cart'] },
    async ({ home, header, cartPreview, logger }) => {
      const lastQuantity = env.CUSTOM_QUANTITY;
      const firstTwoTotal = await test.step('Add two products with default quantity', () =>
        addProducts(home, [env.PRODUCT_1, env.PRODUCT_2]),
      );
      const lastAmount = await test.step(`Add ${env.PRODUCT_3} with quantity ${lastQuantity}`, () =>
        addProductWithQuantity(home, env.PRODUCT_3, lastQuantity),
      );
      const total = firstTwoTotal + lastAmount;

      await test.step('Open the cart preview', async () => {
        await cartPreview.open();
        await expect(cartPreview.items).toHaveCount(products.length);
      });

      await test.step('Verify each cart preview row', async () => {
        for (const [name, quantity] of [
          [env.PRODUCT_1, 1],
          [env.PRODUCT_2, 1],
          [env.PRODUCT_3, lastQuantity],
        ] as const) {
          const price = await home.product(name).getPrice();
          await expect(cartPreview.itemName(name)).toHaveText(productNamePattern(name));
          await expect(cartPreview.itemPrice(name)).toHaveText(formatAmount(price));
          await expect(cartPreview.itemQuantity(name)).toHaveText(quantityLabel(quantity));
          await expect(cartPreview.itemAmount(name)).toHaveText(formatAmount(price * quantity));
        }
      });

      await test.step('Verify header totals', async () => {
        await expect(header.itemsCount).toHaveText(String(products.length));
        await expect(header.totalPrice).toHaveText(formatAmount(total));
        logger.info(`Cart preview verified for ${products.length} products, header price ${total}`);
      });
    },
  );

  test(
    'TC_CART_05 - Remove an item from the cart preview',
    { tag: ['@regression', '@cart'] },
    async ({ home, header, cartPreview, logger }) => {
      await test.step('Add two products', () => addProducts(home, [env.PRODUCT_1, env.PRODUCT_2]));
      const remainingPrice = await home.product(env.PRODUCT_2).getPrice();

      await test.step('Open the cart preview', async () => {
        await cartPreview.open();
        await expect(cartPreview.items).toHaveCount(2);
      });

      await test.step(`Remove ${env.PRODUCT_1}`, async () => {
        await cartPreview.remove(env.PRODUCT_1);
        await expect(cartPreview.item(env.PRODUCT_1)).toHaveCount(0);
        await expect(cartPreview.items).toHaveCount(1);
      });

      await test.step('Verify header reflects the removal', async () => {
        await expect(header.itemsCount).toHaveText('1');
        await expect(header.totalPrice).toHaveText(formatAmount(remainingPrice));
        logger.info(`Removed ${env.PRODUCT_1}, remaining price ${remainingPrice}`);
      });
    },
  );

  test(
    'TC_CART_06 - Removing the last item shows the empty cart message',
    { tag: ['@regression', '@cart'] },
    async ({ home, header, cartPreview, logger }) => {
      await test.step(`Add ${env.PRODUCT_1}`, () => addProducts(home, [env.PRODUCT_1]));

      await test.step('Remove it from the cart preview', async () => {
        await cartPreview.open();
        await cartPreview.remove(env.PRODUCT_1);
      });

      await test.step('Verify empty cart state', async () => {
        await expect(cartPreview.emptyMessage).toHaveText(messages.emptyCart);
        await expect(header.itemsCount).toHaveText('0');
        await expect(header.totalPrice).toHaveText('0');
        logger.info(`Cart emptied, message "${messages.emptyCart}" shown`);
      });
    },
  );

  test(
    'TC_CART_07 - Empty cart shows the empty message and disabled checkout',
    { tag: ['@regression', '@negative', '@cart'] },
    async ({ header, cartPreview, logger }) => {
      await test.step('Open the cart preview without adding products', async () => {
        await cartPreview.open();
      });

      await test.step('Verify empty cart state', async () => {
        await expect(cartPreview.emptyMessage).toHaveText(messages.emptyCart);
        await expect(cartPreview.proceedButton).toHaveClass(/disabled/);
        await expect(header.itemsCount).toHaveText('0');
        await expect(header.totalPrice).toHaveText('0');
        logger.info(`Empty cart verified: "${messages.emptyCart}"`);
      });
    },
  );
});
