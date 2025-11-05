import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { AES_SECRET } from './config/envs';
import { DocumentEncryptionHandler } from '../src/models/DocumentEncryptionHandler';
import { createUserModel } from './utils/schema';

const User = createUserModel();

describe('AES Encryption', () => {
  let encryptedUser: any;
  const encryptionHandler = new DocumentEncryptionHandler(
    'users',
    ['secretData'],
    AES_SECRET
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
});
