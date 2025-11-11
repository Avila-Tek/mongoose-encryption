import { Document } from 'mongoose';
import { EncryptionAlgorithmHandler } from './EncryptionAlgorithmHandler';
import { FieldHandler } from './FieldHandler';
import { EncryptionAlgorithmEnum } from '../types/algorithms';

export class DocumentEncryptionHandler {
  private collectionName: string;
  private encryptionAlgorithm: EncryptionAlgorithmHandler;
  private fieldHandler: FieldHandler;
  private fields: string[];
  private key: string;

  constructor(
    collectionName: string,
    fields: string[],
    key: string,
    algorithm: EncryptionAlgorithmEnum
  ) {
    this.collectionName = collectionName;
    this.fields = fields;
    this.key = key;
    this.encryptionAlgorithm = new EncryptionAlgorithmHandler(algorithm);
    this.fieldHandler = new FieldHandler(collectionName, key, algorithm);
  }

  async encryptSavedDocumentFields(document: Document) {
    for (const field of this.fields) {
      if (document.isModified(field)) {
        await this.fieldHandler.encrypt(document, field);
      }
    }
  }

  async encryptFields(doc: any, recordId: string) {
    const encryptedMappedFields = await Promise.all(
      this.fields.map(async (field) => {
        await this.fieldHandler.encrypt(doc, field, recordId);

        return { [field]: this.fieldHandler.get(doc, field) };
      })
    );

    const encryptedFields = encryptedMappedFields.reduce((acc, curr) => {
      if (curr) return { ...acc, ...curr };
      return acc;
    }, {});

    return encryptedFields;
  }

  async encryptOneField(record: {
    value: string;
    fieldName: string;
    recordId: string;
  }) {
    const encryptedValue = await this.encryptionAlgorithm.encrypt(
      record.value,
      this.key,
      {
        collection: this.collectionName,
        fieldName: record.fieldName,
        recordId: record.recordId,
      }
    );

    return encryptedValue;
  }

  async decryptDocumentsFields(input: Document | Document[]) {
    const docs = Array.isArray(input) ? input : [input].filter(Boolean);

    await Promise.all(
      docs.map(async (doc: Document) => {
        for (const field of this.fields) {
          await this.fieldHandler.decrypt(doc, field);
        }
      })
    );
  }
}
