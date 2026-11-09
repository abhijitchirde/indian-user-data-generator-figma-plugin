//finding a number in range (incl low and high)
export function numBetween(low: number, high: number) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}
