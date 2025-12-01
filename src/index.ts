import { Schema } from 'mongoose';
import { DocumentEncryptionHandler } from './models/DocumentEncryptionHandler';
import { EncryptionAlgorithmEnum } from './types/algorithms';

export function encryptionPlugin(
  schema: Schema,
  options: {
    fields: string[];
    key: string;
    collectionName: string;
    algorithm: EncryptionAlgorithmEnum;
  }
) {
  const handler = new DocumentEncryptionHandler(
    options.collectionName,
    options.fields,
    options.key,
    options.algorithm
  );

  schema.pre('save', async function (next) {
    await handler.encryptSavedDocumentFields(this);
    next();
  });

  schema.pre('findOneAndUpdate', async function (next) {
    // Encrypt fields in the update query
    const update = this.getUpdate();
    if (!update) next();

    const recordId = this.getQuery()._id;
    await handler.encryptFields(update, recordId);

    this.setUpdate({ ...update });

    next();
  });

  schema.post(
    ['find', 'findOne', 'findOneAndUpdate', 'save'],
    async function (res) {
      await handler.decryptDocumentsFields(res);
    }
  );
}
