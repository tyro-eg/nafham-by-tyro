/**
 * Money as the apps show it: the ISO code, Latin digits whatever the UI
 * language (as dates do), two decimals only when the amount has them.
 *
 *   formatMoney(1675, 'AED', 'ar') -> "AED 1,675"
 *   formatMoney(1758.75, 'AED', 'en') -> "AED 1,758.75"
 */
export const formatMoney = (
  amount: number | string | null | undefined,
  currency: string,
  lang = 'en',
): string => {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return `${currency} 0`;
  const whole = Number.isInteger(value);
  try {
    return new Intl.NumberFormat(`${lang}-u-nu-latn`, {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace(/ /g, ' ')
      .trim();
  } catch {
    return `${currency} ${whole ? value : value.toFixed(2)}`;
  }
};
