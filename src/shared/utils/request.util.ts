export const addQueryParams = (
  pathOrUrl: string,
  params: { [key: string]: any } = {},
): string => {
  let urlObj: URL;
  const domain = 'https://example.com';

  try {
    urlObj = new URL(pathOrUrl);
  } catch {
    urlObj = new URL(`${domain}${pathOrUrl}`);
  }

  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (
      value !== undefined &&
      value !== null &&
      !Number.isNaN(value) &&
      String(value).trim() !== ''
    ) {
      urlObj.searchParams.append(key, String(value).trim());
    }
  });
  return urlObj.toString().replace(domain, '');
};
