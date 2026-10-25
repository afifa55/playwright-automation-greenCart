import { env } from '../utils/env';
import { expect, test } from '../utils/fixtures';
import { addProducts, addProductWithQuantity, openCheckout } from '../utils/flows';
import { messages } from '../utils/messages';
import { exactUrl } from '../utils/text';
import { discountedTotal, formatAmount, lineAmount, sumAmounts } from '../utils/price';

const CART_URL = /#\/cart$/;
const COUNTRY_URL = /#\/country$/;
const REDIRECT_TIMEOUT = 20_000;

test.describe('Checkout', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test(
    'TC_CHECKOUT_01 - Full checkout flow places an order and redirects to home',
    { tag: ['@smoke', '@regression', '@e2e', '@checkout'] },
    async ({ page, home, header, cartPreview, cartPage, countryPage, logger }) => {
      let expectedTotal = 0;

      await test.step('Add products to the cart', async () => {
        expectedTotal = await addProducts(home, [env.PRODUCT_1, env.PRODUCT_2]);
        expectedTotal += await addProductWithQuantity(home, env.PRODUCT_3, env.CUSTOM_QUANTITY);
        await expect(header.itemsCount).toHaveText('3');
        await expect(header.totalPrice).toHaveText(formatAmount(expectedTotal));
      });

      await test.step('Proceed to checkout', async () => {
        await openCheckout(cartPreview);
        await expect(page).toHaveURL(CART_URL);
        await expect(cartPage.rows).toHaveCount(3);
      });

      await test.step('Verify the cart table', async () => {
        const rows = await cartPage.readRows();
        for (const row of rows) {
          expect(row.amount).toBeCloseTo(lineAmount(row.price, row.quantity), 2);
        }
        const sum = sumAmounts(rows.map((row) => row.amount));
        expect(sum).toBeCloseTo(expectedTotal, 2);
        expect(await cartPage.readNumber(cartPage.totalAmount)).toBeCloseTo(sum, 2);
      });

      let discounted = 0;
      await test.step('Apply the promo code', async () => {
        await cartPage.applyPromo(env.VALID_PROMO_CODE);
        await expect(cartPage.promoMessage).toHaveText(messages.promoApplied);
        await expect(cartPage.discountPercent).not.toHaveText('0%');
        const percent = await cartPage.readNumber(cartPage.discountPercent);
        const total = await cartPage.readNumber(cartPage.totalAmount);
        discounted = await cartPage.readNumber(cartPage.discountedAmount);
        expect(discounted).toBeCloseTo(discountedTotal(total, percent), 2);
      });

      await test.step('Place the order and select a country', async () => {
        await cartPage.placeOrder();
        await expect(page).toHaveURL(COUNTRY_URL);
        await countryPage.selectCountry(env.COUNTRY);
        await expect(countryPage.countrySelect).toHaveValue(env.COUNTRY);
      });

      await test.step('Accept the terms and proceed', async () => {
        await countryPage.acceptTerms();
        await expect(countryPage.termsCheckbox).toBeChecked();
        await countryPage.proceed();
      });

      await test.step('Verify the success message and redirect to home', async () => {
        await expect(countryPage.successMessage).toBeVisible();
        await expect(page).toHaveURL(exactUrl(env.BASE_URL), { timeout: REDIRECT_TIMEOUT });
        await expect(home.productNames.first()).toBeVisible();
        logger.info(`Order placed for ${env.COUNTRY}, total after discount: ${discounted}`);
      });
    },
  );

  test(
    'TC_CHECKOUT_02 - Proceed without accepting terms shows an error',
    { tag: ['@regression', '@negative', '@checkout'] },
    async ({ page, home, cartPreview, cartPage, countryPage, logger }) => {
      await test.step('Add a product and reach the country page', async () => {
        await addProducts(home, [env.PRODUCT_1]);
        await openCheckout(cartPreview);
        await cartPage.placeOrder();
        await expect(page).toHaveURL(COUNTRY_URL);
      });

      await test.step('Select a country but leave the terms unchecked', async () => {
        await countryPage.selectCountry(env.COUNTRY);
        await expect(countryPage.termsCheckbox).not.toBeChecked();
      });

      await test.step('Proceed and verify the terms error', async () => {
        await countryPage.proceed();
        await expect(countryPage.termsError).toBeVisible();
        await expect(countryPage.termsError).toHaveText(messages.termsRequired);
        await expect(countryPage.successMessage).toBeHidden();
        await expect(page).toHaveURL(COUNTRY_URL);
        logger.info(`Terms error shown: "${messages.termsRequired}"`);
      });
    },
  );

  test(
    'TC_CHECKOUT_03 - Cart table totals match the header price',
    { tag: ['@regression', '@checkout'] },
    async ({ page, home, header, cartPreview, cartPage, logger }) => {
      let headerTotal = 0;

      await test.step('Add products and capture the header price', async () => {
        headerTotal = await addProducts(home, [env.PRODUCT_1, env.PRODUCT_2, env.PRODUCT_3]);
        await expect(header.totalPrice).toHaveText(formatAmount(headerTotal));
      });

      await test.step('Proceed to checkout', async () => {
        await openCheckout(cartPreview);
        await expect(page).toHaveURL(CART_URL);
        await expect(cartPage.rows).toHaveCount(3);
      });

      await test.step('Verify the cart table totals against the header price', async () => {
        const rows = await cartPage.readRows();
        for (const row of rows) {
          expect(row.amount).toBeCloseTo(lineAmount(row.price, row.quantity), 2);
        }
        const sum = sumAmounts(rows.map((row) => row.amount));
        expect(sum).toBeCloseTo(headerTotal, 2);
        expect(await cartPage.readNumber(cartPage.totalAmount)).toBeCloseTo(headerTotal, 2);
        expect(await cartPage.readNumber(cartPage.discountedAmount)).toBeCloseTo(headerTotal, 2);
        logger.info(`Cart table total ${sum} matches header price ${headerTotal}`);
      });
    },
  );
});
