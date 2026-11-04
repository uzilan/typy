/**
 * Makes literature text typeable on a Swedish keyboard: typographic quotes,
 * dashes and ellipses become their plain equivalents, whitespace collapses
 * to single spaces, and the result is NFC.
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[”“„«»]/g, '"')
    .replace(/[’‘‚]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim()
}
