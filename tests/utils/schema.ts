import mongoose from 'mongoose';
import { EncryptionAlgorithmEnum } from '../../src/types/algorithms';
import { encryptionPlugin } from '../../src/index';
import { getKeyByAlgorithm } from './key';

interface IUser {
  name: string;
  secretData: string;
  dni?: Dni;
  phones?: IPhone[];
  bankAccounts?: BankAccount[];
}

interface Dni {
  number: string;
}

interface IPhone {
  number: string;
}

interface BankAccount {
  accountNumber: string;
  privateNumbers: string[];
}

export function createUserModel(
  modelName: string,
  algorithm: EncryptionAlgorithmEnum
): mongoose.Model<IUser> {
  const phoneSchema = new mongoose.Schema<IPhone>({
    number: { type: String, required: true },
  });
  const dniSchema = new mongoose.Schema<Dni>({
    number: { type: String, required: true },
  });
  const bankAccountSchema = new mongoose.Schema<BankAccount>({
    accountNumber: { type: String, required: true },
    privateNumbers: [{ type: String }],
  });

  const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    secretData: { type: String, required: true },
    dni: { type: dniSchema, required: false },
    phones: [{ type: phoneSchema }],
    bankAccounts: [{ type: bankAccountSchema, required: false }],
  });

  const key = getKeyByAlgorithm(algorithm);

  userSchema.plugin(encryptionPlugin, {
    key,
    algorithm,
    fields: ['secretData'],
    collectionName: 'users',
  });

  return mongoose.model(modelName, userSchema);
}
