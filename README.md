# GreenKart – Playwright Test Automation

End-to-end UI tests for the [GreenKart practice app](https://rahulshettyacademy.com/seleniumPractise/#/) built with Playwright and TypeScript, using the Page Object Model. Tests run locally on Google Chrome.

## Tech stack

- [Playwright Test](https://playwright.dev) (TypeScript)
- dotenv for environment-driven test data
- Page Object Model with custom fixtures
- HTML report, screenshots and traces on failure, file + console logger

## Folder structure

```
.
├── pages/                  Page objects (all locators and page actions)
│   ├── HomePage.ts         Product listing, product cards
│   ├── HeaderComponent.ts  Search, cart summary, Top Deals link
│   ├── CartPreviewComponent.ts  Mini cart dropdown
│   ├── CartPage.ts         Cart table, promo code, place order
│   ├── CountrySelectPage.ts     Country, terms, order confirmation
│   └── TopDealsPage.ts     Top Deals table (opens in a new tab)
├── tests/                  Spec files, one per feature
├── utils/
│   ├── env.ts              Loads .env and exports typed values (fails fast if a key is missing)
│   ├── logger.ts           Logger (console + logs/test-run.log) with timestamp and test name
│   ├── price.ts            Price parsing and total/discount helpers
│   ├── fixtures.ts         Custom Playwright fixtures (page objects + logger)
│   ├── flows.ts            Small shared flows (add products, open checkout)
│   ├── messages.ts         Expected UI messages
│   └── text.ts             Text/regex helpers
├── .env.example            Template for test data
└── playwright.config.ts
```

## Setup

```bash
npm install
npx playwright install
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
```

Edit `.env` and fill in the values (see `.env.example` for the keys). Values containing `#` must be quoted, e.g. `BASE_URL="https://…/#/"`.

## Running tests locally

| Command | What it runs |
| --- | --- |
| `npm test` | All tests on Google Chrome |
| `npm run test:smoke` | `@smoke` tests |
| `npm run test:regression` | `@regression` tests |
| `npm run test:negative` | `@negative` tests |
| `npm run test:headed` | All tests in headed mode |
| `npm run report` | Open the HTML report |

Run by any other tag, file or title:

```bash
npx playwright test --grep @cart
npx playwright test --grep "@promo|@checkout"
npx playwright test --grep "TC_CART_01"
npx playwright test tests/search.spec.ts
```

Logs are written to `logs/test-run.log`.

## Tags

| Tag | Meaning |
| --- | --- |
| `@smoke` | Critical happy paths |
| `@regression` | All tests |
| `@negative` | Validation and error cases |
| `@e2e` | Full end-to-end flows |
| `@products` `@search` `@quantity` `@cart` `@promo` `@checkout` `@deals` | Feature tags |

## Test coverage

| Spec | Coverage |
| --- | --- |
| `products.spec.ts` | Product card content: name, price, image, quantity input, +/− buttons, add to cart button |
| `search.spec.ts` | Exact, partial and case-insensitive search; no-result keyword; clearing the search |
| `quantity.spec.ts` | Default value, increment, decrement, lower bound of 1, typed quantity |
| `cart.spec.ts` | Add single/multiple/custom-quantity items, header count and price, cart preview rows, remove item, empty cart |
| `promo.spec.ts` | Valid code discount maths, invalid code, empty code |
| `checkout.spec.ts` | Full order flow to the success message and redirect, terms-not-accepted error, cart table vs header totals |
| `top-deals.spec.ts` | New tab, search, no-data search, name sorting asc/desc, page size, pagination, disabled Previous |

## Notes on the application

- The cart keeps a single shared quantity that is reset about 1.5 seconds after an item is added. Adding several products back to back can therefore carry over a custom quantity; the shared flow that adds a custom quantity first waits until no card shows `✔ ADDED`.
- Promo validation takes several seconds; tests wait for the loading spinner to disappear before asserting the message.
- No `waitForTimeout`, `force: true` or retries are used; all waiting is done through web-first assertions.
