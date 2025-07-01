export function applyDeclension(count: number, singular: string, plural: string, genitive: string) {
  if (count === 1) {
    return singular;
  } else if (count === 0 || (count >= 10 && count < 20) || (count % 10 >= 5 && count % 10 <= 9)) {
    return genitive;
  } else {
    return plural;
  }
}
