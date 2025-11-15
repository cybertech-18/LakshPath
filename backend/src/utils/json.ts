export const safeStringify = (data: unknown) => {
  try {
    return JSON.stringify(data ?? {});
  } catch (error) {
    console.warn('Failed to stringify JSON payload', error);
    return '{}';
  }
};

export const safeParse = <T>(value?: string | null, fallback: T = [] as unknown as T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse JSON column', error);
    return fallback;
  }
};
