import { EncryptionAlgorithmEnum } from '../../src/types/algorithms';
import { AES_256_SECRET, AES_128_SECRET } from '../config/envs';

export function getKeyByAlgorithm(algorithm: EncryptionAlgorithmEnum): string {
  switch (algorithm) {
    case 'aes-256-gcm':
      return AES_256_SECRET;
    case 'aes-128-gcm':
      return AES_128_SECRET;
    case 'chacha20-poly1305':
      return AES_256_SECRET;
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}
