import 'dotenv/config';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const AES_256_SECRET = requireEnv('AES_256_SECRET');
export const AES_128_SECRET = requireEnv('AES_128_SECRET');
