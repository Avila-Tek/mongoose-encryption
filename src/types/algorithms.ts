export const ALGORITHMS = [
  'aes-256-gcm',
  'aes-128-gcm',
  'chacha20-poly1305',
] as const;

export type EncryptionAlgorithmEnum = (typeof ALGORITHMS)[number];
