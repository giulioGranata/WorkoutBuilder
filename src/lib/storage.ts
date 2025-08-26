const KEY = "wg:ftp";

export const readFtp = (): number | null => {
  if (typeof window === "undefined") return null;
  const v = Number(localStorage.getItem(KEY) ?? "");
  return Number.isFinite(v) ? v : null;
};

export const writeFtp = (v: number) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, String(v));
  }
};
