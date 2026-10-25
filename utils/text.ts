export const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const productNamePattern = (name: string): RegExp => new RegExp(`^${escapeRegExp(name)}( - |$)`);

export const exactUrl = (url: string): RegExp => new RegExp(`^${escapeRegExp(url)}$`);

export const quantityLabel = (quantity: number): string => `${quantity} ${quantity === 1 ? 'No.' : 'Nos.'}`;
