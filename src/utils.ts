export function getEnvValueOrThrow(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Couldn't find environment variable for ${key}`);
  }
  return value;
}


