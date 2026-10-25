import { env } from '../utils/env';
import { expect, test } from '../utils/fixtures';
import { exactUrl } from '../utils/text';

const OFFERS_URL = /#\/offers$/;
const compareNames = (a: string, b: string) => a.localeCompare(b);

test.describe('Top Deals', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test(
    'TC_DEALS_01 - Top Deals opens in a new tab',
    { tag: ['@smoke', '@regression', '@deals'] },
    async ({ page, header, logger }) => {
      const deals = await test.step('Click Top Deals', () => header.openTopDeals());

      await test.step('Verify the new tab shows the offers page', async () => {
        await expect(deals.page).toHaveURL(OFFERS_URL);
        await expect(deals.searchInput).toBeVisible();
        await expect(deals.nameCells.first()).toBeVisible();
      });

      await test.step('Verify the original tab is unchanged', async () => {
        await expect(page).toHaveURL(exactUrl(env.BASE_URL));
        logger.info(`Top Deals opened in a new tab: ${deals.page.url()}`);
      });
    },
  );

  test(
    'TC_DEALS_02 - Search filters the deals table',
    { tag: ['@regression', '@deals'] },
    async ({ header, logger }) => {
      const deals = await header.openTopDeals();
      const keyword = env.DEALS_SEARCH_KEYWORD;

      await test.step('Collect all deals and compute the expected matches', async () => {
        await deals.showAllRows();
      });
      const allNames = await deals.readNames();
      const expected = allNames.filter((name) => name.toLowerCase().includes(keyword.toLowerCase()));

      await test.step(`Search for "${keyword}"`, async () => {
        expect(expected.length).toBeGreaterThan(0);
        await deals.search(keyword);
        await expect(deals.rows).toHaveCount(expected.length);
      });

      await test.step('Verify every row matches the keyword', async () => {
        await expect(deals.nameCells).toHaveText(expected);
        for (const row of await deals.rows.all()) {
          await expect(row).toContainText(keyword, { ignoreCase: true });
        }
        logger.info(`Deals search "${keyword}" returned ${expected.length} row(s): ${expected.join(', ')}`);
      });
    },
  );

  test(
    'TC_DEALS_03 - Search with no-result keyword shows no rows',
    { tag: ['@regression', '@negative', '@deals'] },
    async ({ header, logger }) => {
      const deals = await header.openTopDeals();

      await test.step(`Search for "${env.NO_RESULT_KEYWORD}"`, async () => {
        await expect(deals.nameCells.first()).toBeVisible();
        await deals.search(env.NO_RESULT_KEYWORD);
      });

      await test.step('Verify no rows are shown', async () => {
        await expect(deals.noDataCell).toBeVisible();
        await expect(deals.noDataCell).toHaveText('No data');
        logger.info(`Deals search "${env.NO_RESULT_KEYWORD}" returned 0 rows`);
      });
    },
  );

  test(
    'TC_DEALS_04 - Sort by name ascending',
    { tag: ['@regression', '@deals'] },
    async ({ header, logger }) => {
      const deals = await header.openTopDeals();

      await test.step('Show all rows', async () => {
        await deals.showAllRows();
      });
      const names = await deals.readNames();
      const expected = [...names].sort(compareNames);

      await test.step('Sort by name ascending', async () => {
        await deals.sortByName('ascending');
      });

      await test.step('Verify names match the sorted copy', async () => {
        await expect(deals.nameCells).toHaveText(expected);
        logger.info(`Sorted ascending, first: ${expected[0]}, last: ${expected[expected.length - 1]}`);
      });
    },
  );

  test(
    'TC_DEALS_05 - Sort by name descending',
    { tag: ['@regression', '@deals'] },
    async ({ header, logger }) => {
      const deals = await header.openTopDeals();

      await test.step('Show all rows', async () => {
        await deals.showAllRows();
      });
      const names = await deals.readNames();
      const expected = [...names].sort(compareNames).reverse();

      await test.step('Sort by name descending', async () => {
        await deals.sortByName('descending');
      });

      await test.step('Verify names match the reverse-sorted copy', async () => {
        await expect(deals.nameCells).toHaveText(expected);
        logger.info(`Sorted descending, first: ${expected[0]}, last: ${expected[expected.length - 1]}`);
      });
    },
  );

  test(
    'TC_DEALS_06 - Changing the page size changes the number of rows',
    { tag: ['@regression', '@deals'] },
    async ({ header, logger }) => {
      const deals = await header.openTopDeals();
      const size = Number(env.DEALS_PAGE_SIZE);

      await test.step(`Select page size ${size}`, async () => {
        await expect(deals.nameCells.first()).toBeVisible();
        await deals.setPageSize(env.DEALS_PAGE_SIZE);
        await expect(deals.pageSizeSelect).toHaveValue(env.DEALS_PAGE_SIZE);
      });

      await test.step('Verify the row count', async () => {
        await expect(deals.rows).toHaveCount(size);
        logger.info(`Page size ${size} shows ${size} rows`);
      });
    },
  );

  test(
    'TC_DEALS_07 - Pagination next and previous navigate between pages',
    { tag: ['@regression', '@deals'] },
    async ({ header, logger }) => {
      const deals = await header.openTopDeals();
      const firstPage = await deals.readNames();

      await test.step('Go to the next page', async () => {
        await deals.goNext();
        await expect(deals.currentPageItem).toContainText('2');
        await expect(deals.nameCells.first()).not.toHaveText(firstPage[0]);
      });

      const secondPage = await deals.readNames();
      expect(secondPage).not.toEqual(firstPage);

      await test.step('Go back to the previous page', async () => {
        await deals.goPrevious();
        await expect(deals.currentPageItem).toContainText('1');
        await expect(deals.nameCells).toHaveText(firstPage);
        logger.info(`Pagination verified: page 1 [${firstPage.join(', ')}], page 2 [${secondPage.join(', ')}]`);
      });
    },
  );

  test(
    'TC_DEALS_08 - Previous is disabled on the first page',
    { tag: ['@regression', '@negative', '@deals'] },
    async ({ header, logger }) => {
      const deals = await header.openTopDeals();

      await test.step('Verify Previous is disabled on page 1', async () => {
        await expect(deals.currentPageItem).toContainText('1');
        await expect(deals.previousButton).toHaveAttribute('aria-disabled', 'true');
        logger.info('Previous button is disabled on the first page');
      });
    },
  );
});
