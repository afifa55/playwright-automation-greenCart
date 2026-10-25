import { env } from '../utils/env';
import { expect, test } from '../utils/fixtures';
import { addProducts, openCheckout } from '../utils/flows';
import { messages } from '../utils/messages';
import { discountedTotal, formatAmount } from '../utils/price';

test.describe('Promo code', () => {
  let expectedTotal: number;

  test.beforeEach(async ({ home, cartPreview, cartPage }) => {
    await home.goto();
    expectedTotal = await addProducts(home, [env.PRODUCT_1, env.PRODUCT_2]);
    await openCheckout(cartPreview);
    await expect(cartPage.rows).toHaveCount(2);
    await expect(cartPage.totalAmount).toHaveText(formatAmount(expectedTotal));
  });

  test(
    'TC_PROMO_01 - Valid promo code applies the discount and shows the discounted total',
    { tag: ['@smoke', '@regression', '@promo'] },
    async ({ cartPage, logger }) => {
      await test.step(`Apply promo code "${env.VALID_PROMO_CODE}"`, async () => {
        await cartPage.applyPromo(env.VALID_PROMO_CODE);
        await expect(cartPage.promoMessage).toHaveText(messages.promoApplied);
      });

      await test.step('Verify discount and discounted total', async () => {
        await expect(cartPage.discountPercent).not.toHaveText('0%');
        const percent = await cartPage.readNumber(cartPage.discountPercent);
        const total = await cartPage.readNumber(cartPage.totalAmount);
        const discounted = await cartPage.readNumber(cartPage.discountedAmount);

        expect(percent).toBeGreaterThan(0);
        expect(total).toBeCloseTo(expectedTotal, 2);
        expect(discounted).toBeCloseTo(discountedTotal(total, percent), 2);
        logger.info(`Promo applied: total ${total}, discount ${percent}%, total after discount: ${discounted}`);
      });
    },
  );

  test(
    'TC_PROMO_02 - Invalid promo code shows an error and no discount',
    { tag: ['@regression', '@negative', '@promo'] },
    async ({ cartPage, logger }) => {
      await test.step(`Apply invalid promo code "${env.INVALID_PROMO_CODE}"`, async () => {
        await cartPage.applyPromo(env.INVALID_PROMO_CODE);
        await expect(cartPage.promoMessage).toHaveText(messages.promoInvalid);
      });

      await test.step('Verify no discount is applied', async () => {
        await expect(cartPage.discountPercent).toHaveText('0%');
        await expect(cartPage.discountedAmount).toHaveText(formatAmount(expectedTotal));
        logger.info(`Invalid code rejected with "${messages.promoInvalid}", total unchanged: ${expectedTotal}`);
      });
    },
  );

  test(
    'TC_PROMO_03 - Empty promo code shows an error and no discount',
    { tag: ['@regression', '@negative', '@promo'] },
    async ({ cartPage, logger }) => {
      await test.step('Apply an empty promo code', async () => {
        await cartPage.applyPromo('');
        await expect(cartPage.promoMessage).toHaveText(messages.promoEmpty);
      });

      await test.step('Verify no discount is applied', async () => {
        await expect(cartPage.discountPercent).toHaveText('0%');
        await expect(cartPage.discountedAmount).toHaveText(formatAmount(expectedTotal));
        logger.info(`Empty code rejected with "${messages.promoEmpty}", total unchanged: ${expectedTotal}`);
      });
    },
  );
});
