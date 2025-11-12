import { DocumentEncryptionHandler } from '../src/models/DocumentEncryptionHandler';
import { EncryptionAlgorithmEnum } from '../src/types/algorithms';
import { createUserModel } from './utils/schema';
import { getKeyByAlgorithm } from './utils/key';

function testEncryption(modelName: string, algorithm: EncryptionAlgorithmEnum) {
  const User = createUserModel(modelName, algorithm);
  const key = getKeyByAlgorithm(algorithm);

  const encryptionHandler = new DocumentEncryptionHandler(
    'users',
    [
      'secretData',
      'dni.number',
      'phones.number',
      'bankAccounts.accountNumber',
      'bankAccounts.privateNumbers',
    ],
    key,
    algorithm
  );

  const user = new User({
    name: 'Alice',
    secretData: 'Something secret',
    dni: {
      number: '123456789',
    },
    phones: [{ number: '555-1234' }, { number: '555-5678' }],
    bankAccounts: [
      {
        accountNumber: '987654321',
      },
      {
        accountNumber: '123456789',
        privateNumbers: ['3333', '4444'],
      },
    ],
  });

  const originalUser = { ...user.toObject() };

  it('Encryption selected fields', async () => {
    await encryptionHandler.encryptFields(user, user._id.toString());

    expect(user).toBeDefined();
    expect(user!.name).toBe(user.name);
    expect(user!.secretData).not.toBe(originalUser.secretData);
    expect(user!.dni.number).not.toBe(originalUser.dni.number);
    expect(user!.phones[0].number).not.toBe(originalUser.phones[0].number);
    expect(user!.phones[1].number).not.toBe(originalUser.phones[1].number);
    expect(user!.bankAccounts[0].accountNumber).not.toBe(
      originalUser.bankAccounts[0].accountNumber
    );
    expect(user!.bankAccounts[1].accountNumber).not.toBe(
      originalUser.bankAccounts[1].accountNumber
    );
    expect(user!.bankAccounts[1].privateNumbers[0]).not.toBe(
      originalUser.bankAccounts[1].privateNumbers[0]
    );
    expect(user!.bankAccounts[1].privateNumbers[1]).not.toBe(
      originalUser.bankAccounts[1].privateNumbers[1]
    );
  });

  it('Decryption of selected fields', async () => {
    await encryptionHandler.decryptDocumentsFields(user);

    expect(user).toBeDefined();
    expect(user!.name).toBe(originalUser.name);
    expect(user!.secretData).toBe(originalUser.secretData);
    expect(user!.dni.number).toBe(originalUser.dni.number);
    expect(user!.phones[0].number).toBe(originalUser.phones[0].number);
    expect(user!.phones[1].number).toBe(originalUser.phones[1].number);
    expect(user!.bankAccounts[0].accountNumber).toBe(
      originalUser.bankAccounts[0].accountNumber
    );
    expect(user!.bankAccounts[1].accountNumber).toBe(
      originalUser.bankAccounts[1].accountNumber
    );
    expect(user!.bankAccounts[1].privateNumbers[0]).toBe(
      originalUser.bankAccounts[1].privateNumbers[0]
    );
    expect(user!.bankAccounts[1].privateNumbers[1]).toBe(
      originalUser.bankAccounts[1].privateNumbers[1]
    );
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
