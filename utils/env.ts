import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable "${key}". Copy .env.example to .env and set a value.`);
  }
  return value;
}

function requiredNumber(key: string): number {
  const value = Number(required(key));
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Environment variable "${key}" must be a positive integer.`);
  }
  return value;
}

export const env = {
  BASE_URL: required('BASE_URL'),
  SEARCH_KEYWORD: required('SEARCH_KEYWORD'),
  PARTIAL_SEARCH_KEYWORD: required('PARTIAL_SEARCH_KEYWORD'),
  NO_RESULT_KEYWORD: required('NO_RESULT_KEYWORD'),
  PRODUCT_1: required('PRODUCT_1'),
  PRODUCT_2: required('PRODUCT_2'),
  PRODUCT_3: required('PRODUCT_3'),
  VALID_PROMO_CODE: required('VALID_PROMO_CODE'),
  INVALID_PROMO_CODE: required('INVALID_PROMO_CODE'),
  COUNTRY: required('COUNTRY'),
  DEALS_SEARCH_KEYWORD: required('DEALS_SEARCH_KEYWORD'),
  DEALS_PAGE_SIZE: required('DEALS_PAGE_SIZE'),
  CUSTOM_QUANTITY: requiredNumber('CUSTOM_QUANTITY'),
} as const;
