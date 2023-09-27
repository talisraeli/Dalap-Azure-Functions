/**
 * Parses raw cookies string value into key-value pairs of cookies.
 * @param rawCookiesString The raw cookies string header.
 * @returns Key-value pairs of the existing cookies.
 */
export function parseCookies(rawCookiesString: string): Record<string, string> {
  /**
   * Decodes and trims a string.
   * @param value The raw string.
   * @returns The decoded and trimmed string value.
   */
  const decodeAndTrim = (value: string) => decodeURIComponent(value.trim());

  return rawCookiesString
    .split(";")
    .map((rawCookie) => rawCookie.split("="))
    .reduce((acc, [key, value]) => {
      acc[decodeAndTrim(key)] = decodeAndTrim(value);
      return acc;
    }, {});
}
