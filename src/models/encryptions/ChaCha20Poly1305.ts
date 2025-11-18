import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { EncryptionAlgorithm } from './EncryptionAlgorithm';

interface AADContext {
  collection: string;
  fieldName: string;
  recordId: string;
}

const IV_BYTE_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export class ChaCha20Poly1305 implements EncryptionAlgorithm {
  /**
   * Encrypts plaintext using ChaCha20-Poly1305 with a random IV and returns a base64-encoded string containing both the IV and ciphertext.
   * @param plaintext - The plaintext string to encrypt.
   * @param base64Key - The base64-encoded 32-byte key for ChaCha20-Poly1305 encryption.
   * @returns A promise that resolves to the base64-encoded string containing the IV and ciphertext.
   */
  public async encrypt(
    plaintext: string,
    base64Key: string,
    context: AADContext
  ) {
    const key = Buffer.from(base64Key, 'base64');

    const iv = randomBytes(IV_BYTE_LENGTH);
    const cipher = createCipheriv('chacha20-poly1305', key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const aad = this.buildAdditionalAuthenticatedData(context);

    cipher.setAAD(aad, {
      plaintextLength: Buffer.byteLength(plaintext),
    });

    const pt = Buffer.from(plaintext, 'utf8');
    const ciphertext = Buffer.concat([cipher.update(pt), cipher.final()]);
    const tag = cipher.getAuthTag();

    const combined = Buffer.concat([
      Buffer.from(iv),
      Buffer.from(tag),
      Buffer.from(ciphertext),
    ]);

    return combined.toString('base64');
  }

  /**
   * Decrypts a base64-encoded string containing the IV and ciphertext encrypted with ChaCha20-Poly1305.
   * @param base64Payload - The base64-encoded string containing the IV and ciphertext.
   * @param base64Key - The base64-encoded 32-byte key for ChaCha20-Poly1305 encryption.
   * @returns A promise that resolves to the decrypted plaintext string.
   */
  public async decrypt(
    base64Payload: string,
    base64Key: string,
    context: AADContext
  ) {
    const key = Buffer.from(base64Key, 'base64');
    const data = Buffer.from(base64Payload, 'base64');

    const iv = new Uint8Array(data.subarray(0, IV_BYTE_LENGTH));
    const tag = new Uint8Array(
      data.subarray(IV_BYTE_LENGTH, IV_BYTE_LENGTH + AUTH_TAG_LENGTH)
    );
    const cipher = data.subarray(IV_BYTE_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv('chacha20-poly1305', key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    const aad = this.buildAdditionalAuthenticatedData(context);
    decipher.setAAD(aad, { plaintextLength: cipher.length });
    decipher.setAuthTag(tag);

    const plaintextBuf = Buffer.concat([
      decipher.update(cipher),
      decipher.final(),
    ]);

    return new TextDecoder().decode(plaintextBuf);
  }

  /**
   * Builds the Additional Authenticated Data (AAD) for the encryption context.
   * @param context - The context containing metadata about the encrypted data.
   * @returns A Buffer containing the AAD.
   */
  private buildAdditionalAuthenticatedData(context: AADContext): Buffer {
    return Buffer.concat([
      Buffer.from('ctx1'),
      this.lengthPrefixEncoding(context.collection),
      this.lengthPrefixEncoding(context.fieldName),
      this.lengthPrefixEncoding(context.recordId),
    ]);
  }

  /**
   * Length-prefixed encoding of a string.
   * @param s - The input string.
   * @returns A Buffer containing the length-prefixed encoded string.
   */
  private lengthPrefixEncoding(s: string): Buffer {
    const data = Buffer.from(s, 'utf8');
    return Buffer.concat([this.parseBigEndian32(data.length), data]);
  }

  /**
   * Writes a 32-bit big-endian integer to a Buffer.
   * @param input - The integer to be encoded.
   * @returns A Buffer containing the 32-bit big-endian encoded integer.
   */
  private parseBigEndian32(input: number): Buffer {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(input, 0);
    return b;
  }
}
