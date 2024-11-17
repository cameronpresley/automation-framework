export function getEnvValueOrThrow(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Couldn't find environment variable for ${key}`);
  }
  return value;
}

// Fisher-Yates algorithm
export function shuffle<T>(ts: T[]): T[] {
  const copy = [...ts];
  for (let i = 0; i < copy.length; i++) {
    const j = Math.floor(Math.random() * i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type Pairing<T> = {
  a: T;
  b: T;
  c?: T;
};
export function createPairs<T>(ts: T[]): Pairing<T>[] {
  const pairs: Pairing<T>[] = [];
  for (let i = 0; i < ts.length - 1; i += 2) {
    pairs.push({
      a: ts[i],
      b: ts[i + 1],
    });
  }
  if (ts.length % 2 !== 0) {
    pairs[pairs.length - 1].c = ts[ts.length - 1];
  }
  return pairs;
}

export function createShuffledPairs<T>(items:T[]): Pairing<T>[] {
  return createPairs(shuffle(items));
}

