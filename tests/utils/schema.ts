import mongoose from 'mongoose';
import { EncryptionAlgorithmEnum } from '../../src/types/algorithms';
import { encryptionPlugin } from '../../src/index';
import { getKeyByAlgorithm } from './key';

interface IUser {
  name: string;
  secretData: string;
  dni?: {
    number: string;
  };
}

export function createUserModel(
  modelName: string,
  algorithm: EncryptionAlgorithmEnum
): mongoose.Model<IUser> {
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    secretData: { type: String, required: true },
    dni: {
      number: { type: String, required: true },
    },
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
