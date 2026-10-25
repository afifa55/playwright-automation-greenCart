import { env } from '../utils/env';
import { expect, test } from '../utils/fixtures';

test.describe('Quantity', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test(
    'TC_QTY_01 - Default quantity is 1',
    { tag: ['@regression', '@quantity'] },
    async ({ home, logger }) => {
      const card = home.product(env.PRODUCT_1);

      await test.step('Verify default quantity', async () => {
        await expect(card.quantityInput).toHaveValue('1');
        logger.info(`Default quantity of ${env.PRODUCT_1}: 1`);
      });
    },
  );

  test(
    'TC_QTY_02 - Increment increases the quantity by 1',
    { tag: ['@smoke', '@regression', '@quantity'] },
    async ({ home, logger }) => {
      const card = home.product(env.PRODUCT_1);

      await test.step('Click + once', async () => {
        await card.increment();
        await expect(card.quantityInput).toHaveValue('2');
      });

      await test.step('Click + again', async () => {
        await card.increment();
        await expect(card.quantityInput).toHaveValue('3');
        logger.info(`Quantity after two increments: 3`);
      });
    },
  );

  test(
    'TC_QTY_03 - Decrement decreases the quantity by 1',
    { tag: ['@regression', '@quantity'] },
    async ({ home, logger }) => {
      const card = home.product(env.PRODUCT_1);

      await test.step('Increment twice to reach 3', async () => {
        await card.increment();
        await card.increment();
        await expect(card.quantityInput).toHaveValue('3');
      });

      await test.step('Click − once', async () => {
        await card.decrement();
        await expect(card.quantityInput).toHaveValue('2');
        logger.info(`Quantity after decrement from 3: 2`);
      });
    },
  );

  test(
    'TC_QTY_04 - Decrement does not go below 1',
    { tag: ['@regression', '@negative', '@quantity'] },
    async ({ home, logger }) => {
      const card = home.product(env.PRODUCT_1);

      await test.step('Click − at the default quantity', async () => {
        await card.decrement();
        await expect(card.quantityInput).toHaveValue('1');
      });

      await test.step('Click − again', async () => {
        await card.decrement();
        await expect(card.quantityInput).toHaveValue('1');
        logger.info('Quantity stayed at 1 after repeated decrements');
      });
    },
  );

  test(
    'TC_QTY_05 - Typing a custom quantity updates the input',
    { tag: ['@regression', '@quantity'] },
    async ({ home, logger }) => {
      const card = home.product(env.PRODUCT_1);

      await test.step(`Type quantity ${env.CUSTOM_QUANTITY}`, async () => {
        await card.setQuantity(env.CUSTOM_QUANTITY);
        await expect(card.quantityInput).toHaveValue(String(env.CUSTOM_QUANTITY));
        logger.info(`Custom quantity set: ${env.CUSTOM_QUANTITY}`);
      });
    },
  );
});
