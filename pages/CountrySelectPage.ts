import { Locator, Page } from '@playwright/test';
import { messages } from '../utils/messages';

export class CountrySelectPage {
  readonly countrySelect: Locator;
  readonly termsCheckbox: Locator;
  readonly termsError: Locator;
  readonly proceedButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.countrySelect = page.getByRole('combobox');
    this.termsCheckbox = page.getByRole('checkbox');
    this.termsError = page.locator('.errorAlert');
    this.proceedButton = page.getByRole('button', { name: 'Proceed' });
    this.successMessage = page.getByText(messages.orderPlaced);
  }

  async selectCountry(country: string): Promise<void> {
    await this.countrySelect.selectOption(country);
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.check();
  }

  async proceed(): Promise<void> {
    await this.proceedButton.click();
  }
}
