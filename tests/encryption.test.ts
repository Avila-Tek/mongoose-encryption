import { DocumentEncryptionHandler } from '../src/models/DocumentEncryptionHandler';
import { EncryptionAlgorithmEnum } from '../src/types/algorithms';
import { createUserModel } from './utils/schema';
import { getKeyByAlgorithm } from './utils/key';

function testEncryption(modelName: string, algorithm: EncryptionAlgorithmEnum) {
  const User = createUserModel(modelName, algorithm);
  let encryptedUser: any;
  const encryptionHandler = new DocumentEncryptionHandler(
    'users',
    ['secretData', 'dni.number'],
    getKeyByAlgorithm(algorithm),
    algorithm
  );

  const user = new User({
    name: 'Alice',
    secretData: 'Something secret',
    dni: {
      number: '123456789',
    },
  });
  const originalUser = { ...user.toObject() };

  it('Encryption selected fields', async () => {
    await encryptionHandler.encryptFields(user, user._id.toString());

    expect(user).toBeDefined();
    expect(user!.name).toBe(user.name);
    expect(user!.secretData).not.toBe(originalUser.secretData);
    expect(user!.dni.number).not.toBe(originalUser.dni.number);
  });

  it('Decryption of selected fields', async () => {
    await encryptionHandler.decryptDocumentsFields(user);

    expect(user).toBeDefined();
    expect(user!.name).toBe(originalUser.name);
    expect(user!.secretData).toBe(originalUser.secretData);
    expect(user!.dni.number).toBe(originalUser.dni.number);
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
