export const MATCH_THRESHOLD = 70;

export function clampNumber(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(Math.max(value, minimum), maximum);
}
