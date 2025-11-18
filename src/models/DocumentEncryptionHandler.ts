import { Document } from 'mongoose';
import { FieldHandler } from './FieldHandler';
import { EncryptionAlgorithmEnum } from '../types/algorithms';

export class DocumentEncryptionHandler {
  private fieldHandler: FieldHandler;
  private fields: string[];

  constructor(
    collectionName: string,
    fields: string[],
    key: string,
    algorithm: EncryptionAlgorithmEnum
  ) {
    this.fields = fields;
    this.fieldHandler = new FieldHandler(collectionName, key, algorithm);
  }

  async encryptSavedDocumentFields(document: Document) {
    await Promise.all(
      this.fields.map(async (field) => {
        if (document.isModified(field)) {
          await this.fieldHandler.encrypt(document, field);
        }
      })
    );
  }

  async encryptFields(document: any, recordId: string) {
    await Promise.all(
      this.fields.map(async (field) => {
        await this.fieldHandler.encrypt(document, field, recordId);
      })
    );
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
