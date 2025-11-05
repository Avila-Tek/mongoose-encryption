import mongoose from 'mongoose';
import { encryptionPlugin } from '../../src/index';
import { AES_SECRET } from '../config/envs';

interface IUser {
  name: string;
  secretData: string;
}

export function createUserModel(): mongoose.Model<IUser> {
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    secretData: { type: String, required: true },
  });

  userSchema.plugin(encryptionPlugin, {
    key: AES_SECRET,
    fields: ['secretData'],
    collectionName: 'users',
  });

  return mongoose.model('User', userSchema);
}
