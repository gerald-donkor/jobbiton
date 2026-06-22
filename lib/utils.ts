export const MATCH_THRESHOLD = 70;

type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassValue = string | false | null | undefined | ClassDictionary;

export function cn(...values: ClassValue[]): string {
  return values
    .flatMap((value) => {
      if (!value) {
        return [];
      }

      if (typeof value === "string") {
        return value;
      }

      return Object.entries(value)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([className]) => className);
    })
    .join(" ");
}

export function clampNumber(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(Math.max(value, minimum), maximum);
}
