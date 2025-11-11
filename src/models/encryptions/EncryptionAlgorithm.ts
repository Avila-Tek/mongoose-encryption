export interface EncryptionAlgorithm {
  /**
   * Encrypts plaintext using the specified encryption algorithm.
   * @param plaintext - The plaintext string to encrypt.
   * @param base64Key - The base64-encoded key.
   * @returns A promise that resolves to a base64-encoded string.
   */
  encrypt(
    plaintext: string,
    base64Key: string,
    context: { collection: string; fieldName: string; recordId: string }
  ): Promise<string>;

  /**
   * Decrypts a base64-encoded string.
   * @param base64Payload - The base64-encoded string containing the ciphertext.
   * @param base64Key - The base64-encoded key.
   * @returns A promise that resolves to the decrypted plaintext string.
   */
  decrypt(
    base64Payload: string,
    base64Key: string,
    context: { collection: string; fieldName: string; recordId: string }
  ): Promise<string>;
}
