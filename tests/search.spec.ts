import { env } from '../utils/env';
import { expect, test } from '../utils/fixtures';
import { messages } from '../utils/messages';

test.describe('Search', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test(
    'TC_SEARCH_01 - Search with valid keyword shows matching products',
    { tag: ['@smoke', '@regression', '@search'] },
    async ({ home, header, logger }) => {
      const keyword = env.SEARCH_KEYWORD;
      const expected = await home.getExpectedMatches(keyword);

      await test.step(`Search for "${keyword}"`, async () => {
        await header.search(keyword);
        await expect(home.productNames).toHaveCount(expected.length);
      });

      await test.step('Verify every visible product matches the keyword', async () => {
        await expect(home.productNames).toHaveText(expected);
        for (const name of await home.productNames.all()) {
          await expect(name).toContainText(keyword, { ignoreCase: true });
        }
        logger.info(`Search "${keyword}" returned ${expected.length} product(s): ${expected.join(', ')}`);
      });
    },
  );

  test(
    'TC_SEARCH_02 - Search with partial keyword shows multiple matching products',
    { tag: ['@regression', '@search'] },
    async ({ home, header, logger }) => {
      const keyword = env.PARTIAL_SEARCH_KEYWORD;
      const expected = await home.getExpectedMatches(keyword);

      await test.step('Confirm the keyword matches more than one product', async () => {
        expect(expected.length).toBeGreaterThan(1);
      });

      await test.step(`Search for "${keyword}"`, async () => {
        await header.search(keyword);
        await expect(home.productNames).toHaveCount(expected.length);
      });

      await test.step('Verify every visible product matches the keyword', async () => {
        await expect(home.productNames).toHaveText(expected);
        for (const name of await home.productNames.all()) {
          await expect(name).toContainText(keyword, { ignoreCase: true });
        }
        logger.info(`Partial search "${keyword}" returned ${expected.length} products: ${expected.join(', ')}`);
      });
    },
  );

  test(
    'TC_SEARCH_03 - Search is case-insensitive',
    { tag: ['@regression', '@search'] },
    async ({ home, header, logger }) => {
      const keyword = env.SEARCH_KEYWORD.toUpperCase();
      const expected = await home.getExpectedMatches(keyword);

      await test.step(`Search for upper-case "${keyword}"`, async () => {
        await header.search(keyword);
        await expect(home.productNames).toHaveCount(expected.length);
      });

      await test.step('Verify matching products are shown', async () => {
        expect(expected.length).toBeGreaterThan(0);
        await expect(home.productNames).toHaveText(expected);
        logger.info(`Case-insensitive search "${keyword}" returned ${expected.length} product(s): ${expected.join(', ')}`);
      });
    },
  );

  test(
    'TC_SEARCH_04 - Search with no-result keyword shows no products',
    { tag: ['@regression', '@negative', '@search'] },
    async ({ home, header, logger }) => {
      await test.step(`Search for "${env.NO_RESULT_KEYWORD}"`, async () => {
        await header.search(env.NO_RESULT_KEYWORD);
      });

      await test.step('Verify no products are listed and the empty message is shown', async () => {
        await expect(home.productNames).toHaveCount(0);
        await expect(home.noResultsMessage).toHaveText(messages.noResults);
        logger.info(`Search "${env.NO_RESULT_KEYWORD}" returned 0 products with message "${messages.noResults}"`);
      });
    },
  );

  test(
    'TC_SEARCH_05 - Clearing the search shows all products again',
    { tag: ['@regression', '@search'] },
    async ({ home, header, logger }) => {
      const allNames = await home.getAllProductNames();

      await test.step(`Search for "${env.SEARCH_KEYWORD}" to narrow the list`, async () => {
        await header.search(env.SEARCH_KEYWORD);
        await expect(home.productNames).toHaveCount(1);
      });

      await test.step('Clear the search', async () => {
        await header.search('');
      });

      await test.step('Verify all products are listed again', async () => {
        await expect(home.productNames).toHaveCount(allNames.length);
        await expect(home.productNames).toHaveText(allNames);
        logger.info(`Search cleared, all ${allNames.length} products are visible again`);
      });
    },
  );
});
