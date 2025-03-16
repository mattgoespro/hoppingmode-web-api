/*
 *  Given an array of floating-point decimal numbers, return a
 *  new array of integers that sum to the same total as the
 *  original array.
 *
 *  Credit: https://stackoverflow.com/a/792476/6265995
 */
export function roundClone(arr: number[]) {
  const total = arr.reduce((a, b) => a + b, 0);
  const rounded = arr.map((n) => Math.round(n));
  const sum = rounded.reduce((a, b) => a + b, 0);

  if (sum === total) {
    return rounded;
  }

  const diff = total - sum;
  const sorted = arr.slice().sort((a, b) => b - a);
  const min = sorted[sorted.length - 1];

  const index = arr.findIndex((n) => n === min);
  const copy = rounded.slice();
  copy[index] = rounded[index] + diff;

  return copy;
}
