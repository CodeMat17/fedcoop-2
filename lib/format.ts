const WAT = "Africa/Lagos";

/** Render-time clock for ISR pages; the page revalidates hourly, so upcoming/past stays current. */
export const currentTime = () => Date.now();

export const fmtDate = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: WAT }).format(ms);

export const fmtDateShort = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: WAT }).format(ms);

export const fmtTime = (ms: number) =>
  `${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: WAT }).format(ms)} WAT`;

export const fmtNumber = (n: number) => new Intl.NumberFormat("en-NG").format(n);

export const fmtBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export const readingTime = (html: string) => {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
};
