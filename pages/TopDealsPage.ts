import { expect, Locator, Page } from '@playwright/test';

export type SortDirection = 'ascending' | 'descending';

export class TopDealsPage {
  readonly pageSizeSelect: Locator;
  readonly searchInput: Locator;
  readonly rows: Locator;
  readonly nameCells: Locator;
  readonly noDataCell: Locator;
  readonly nameHeader: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly currentPageItem: Locator;

  constructor(readonly page: Page) {
    this.pageSizeSelect = page.getByLabel('Page size:');
    this.searchInput = page.getByLabel('Search:');
    this.rows = page.locator('tbody').getByRole('row');
    this.nameCells = this.rows.locator('td:first-child');
    this.noDataCell = page.getByRole('cell', { name: 'No data' });
    this.nameHeader = page.getByRole('columnheader', { name: /Veg\/fruit name/ });
    this.nextButton = page.getByRole('button', { name: 'Next', exact: true });
    this.previousButton = page.getByRole('button', { name: 'Previous', exact: true });
    this.currentPageItem = page.locator('.pagination .active');
  }

  async readNames(): Promise<string[]> {
    await expect(this.nameCells.first()).toBeVisible();
    const names = await this.nameCells.allInnerTexts();
    return names.map((name) => name.trim());
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }

  async setPageSize(size: string): Promise<void> {
    await this.pageSizeSelect.selectOption(size);
  }

  async showAllRows(): Promise<void> {
    const sizes = await this.pageSizeSelect.locator('option').evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
    await this.setPageSize(sizes[sizes.length - 1]);
  }

  async sortByName(direction: SortDirection): Promise<void> {
    await expect(this.nameHeader).toBeVisible();
    if ((await this.nameHeader.getAttribute('aria-sort')) !== direction) {
      await this.nameHeader.click();
    }
    await expect(this.nameHeader).toHaveAttribute('aria-sort', direction);
  }

  async goNext(): Promise<void> {
    await this.nextButton.click();
  }

  async goPrevious(): Promise<void> {
    await this.previousButton.click();
  }
}
