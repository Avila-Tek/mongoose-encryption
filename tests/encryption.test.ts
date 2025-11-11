import { DocumentEncryptionHandler } from '../src/models/DocumentEncryptionHandler';
import { EncryptionAlgorithmEnum } from '../src/types/algorithms';
import { createUserModel } from './utils/schema';
import { getKeyByAlgorithm } from './utils/key';

function testEncryption(modelName: string, algorithm: EncryptionAlgorithmEnum) {
  const User = createUserModel(modelName, algorithm);
  let encryptedUser: any;
  const encryptionHandler = new DocumentEncryptionHandler(
    'users',
    ['secretData'],
    getKeyByAlgorithm(algorithm),
    algorithm
  );

  const user = new User({ name: 'Alice', secretData: 'Something secret' });

  it('Encryption selected fields', async () => {
    const encryptedValues = await encryptionHandler.encryptFields(
      user,
      user._id.toString()
    );

    encryptedUser = { ...user.toObject(), ...encryptedValues };

    expect(encryptedUser).toBeDefined();
    expect(encryptedUser!.name).toBe(user.name);
    expect(encryptedUser!.secretData).not.toBe(user.secretData);
  });

  it('Decryption of selected fields', async () => {
    await encryptionHandler.decryptDocumentsFields(encryptedUser);

    expect(encryptedUser).toBeDefined();
    expect(encryptedUser!.name).toBe(user.name);
    expect(encryptedUser!.secretData).toBe(user.secretData);
  });
}

describe('AES 256 Encryption', () => {
  testEncryption('UserAES256', 'aes-256-gcm');
});

describe('AES 128 Encryption', () => {
  testEncryption('UserAES128', 'aes-128-gcm');
});

describe('ChaCha20-Poly1305 Encryption', () => {
  testEncryption('UserChaCha20', 'chacha20-poly1305');
});
