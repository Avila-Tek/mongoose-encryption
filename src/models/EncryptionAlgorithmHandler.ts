import { EncryptionAlgorithmEnum } from '../../src/types/algorithms';
import { AES128GCM } from './encryptions/AES128GCM';
import { AES256GCM } from './encryptions/AES256GCM';
import { ChaCha20Poly1305 } from './encryptions/ChaCha20Poly1305';
import { EncryptionAlgorithm } from './encryptions/EncryptionAlgorithm';

interface AADContext {
  collection: string;
  fieldName: string;
  recordId: string;
}

export class EncryptionAlgorithmHandler {
  private algorithm: EncryptionAlgorithm;

  constructor(algorithm: EncryptionAlgorithmEnum = 'aes-256-gcm') {
    if (algorithm === 'aes-256-gcm') {
      this.algorithm = new AES256GCM();
    } else if (algorithm === 'aes-128-gcm') {
      this.algorithm = new AES128GCM();
    } else if (algorithm === 'chacha20-poly1305') {
      this.algorithm = new ChaCha20Poly1305(); // Placeholder for ChaCha20-Poly1305 implementation
    } else {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }

  /**
   * Encrypts plaintext based on the selected algorithm.
   * @param plaintext - The plaintext string to encrypt.
   * @param base64Key - The base64-encoded key.
   * @returns A promise that resolves to a base64-encoded string.
   */
  public async encrypt(
    plaintext: string,
    base64Key: string,
    context: AADContext
  ) {
    const result = await this.algorithm.encrypt(plaintext, base64Key, context);
    return result;
  }

  /**
   * Decrypts a base64-encoded string with the selected algorithm.
   * @param base64Payload - The base64-encoded string containing the IV and ciphertext.
   * @param base64Key - The base64-encoded key.
   * @returns A promise that resolves to the decrypted plaintext string.
   */
  public async decrypt(
    base64Payload: string,
    base64Key: string,
    context: AADContext
  ) {
    const result = await this.algorithm.decrypt(
      base64Payload,
      base64Key,
      context
    );
    return result;
  }
}
