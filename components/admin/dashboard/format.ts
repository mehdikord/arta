export function formatToman(value: number): string {
  return `${Math.round(value).toLocaleString("fa-IR")} تومان`;
}

/** Compact Persian money: ۱۱٫۱ میلیون، ۲٫۳ میلیارد، ۸۵۰ هزار */
export function formatCompactToman(value: number, withUnit = true): string {
  const abs = Math.abs(value);
  const fmt = (n: number) =>
    n.toLocaleString("fa-IR", { maximumFractionDigits: n >= 100 ? 0 : 1 });
  let text: string;
  if (abs >= 1e9) text = `${fmt(value / 1e9)} میلیارد`;
  else if (abs >= 1e6) text = `${fmt(value / 1e6)} میلیون`;
  else if (abs >= 1e3) text = `${fmt(value / 1e3)} هزار`;
  else text = value.toLocaleString("fa-IR");
  return withUnit ? `${text} تومان` : text;
}

export function formatCount(value: number): string {
  return value.toLocaleString("fa-IR");
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `٪${Math.abs(value).toLocaleString("fa-IR", { maximumFractionDigits: fractionDigits })}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${formatCount(days)} روز و ${formatCount(hours)} ساعت`;
  if (hours > 0) return `${formatCount(hours)} ساعت و ${formatCount(minutes)} دقیقه`;
  return `${formatCount(Math.max(1, minutes))} دقیقه`;
}
