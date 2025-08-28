export const getParamInt = (u: URL, key: string): number | null => {
  const v = u.searchParams.get(key);
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

export const setParam = (u: URL, key: string, val: string | number) => {
  u.searchParams.set(key, String(val));
  history.replaceState(null, "", u.toString());
};
