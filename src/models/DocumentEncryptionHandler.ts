import { Document } from 'mongoose';
import { EncryptionAlgorithm } from './EncryptionAlgorithm';

export class DocumentEncryptionHandler {
  private collectionName: string;
  private encryptionAlgorithm: EncryptionAlgorithm;
  private fields: string[];
  private key: string;

  constructor(collectionName: string, fields: string[], key: string) {
    this.collectionName = collectionName;
    this.fields = fields;
    this.key = key;
    this.encryptionAlgorithm = new EncryptionAlgorithm();
  }

  async encryptSavedDocumentFields(document: Document) {
    for (const field of this.fields) {
      if (document.isModified(field)) {
        const value = document[field];
        const encryptedValue = await this.encryptionAlgorithm.encrypt(
          value,
          this.key,
          {
            collection: this.collectionName,
            fieldName: field,
            recordId: document._id.toString(),
          }
        );
        document[field] = encryptedValue;
      }
    }
  }

  async encryptFields(doc: any, recordId: string) {
    const encryptedMappedFields = await Promise.all(
      this.fields.map(async (field) => {
        const value = doc[field];
        if (!value) return;

        const encryptedValue = await this.encryptionAlgorithm.encrypt(
          value,
          this.key,
          {
            collection: this.collectionName,
            fieldName: field,
            recordId: recordId,
          }
        );

        return { [field]: encryptedValue };
      })
    );

    const encryptedFields = encryptedMappedFields.reduce((acc, curr) => {
      if (curr) return { ...acc, ...curr };
      return acc;
    }, {});

    return encryptedFields;
  }

  async decryptDocumentsFields(input: Document | Document[]) {
    const docs = Array.isArray(input) ? input : [input].filter(Boolean);

    await Promise.all(
      docs.map(async (doc: Document) => {
        for (const field of this.fields) {
          const v = doc[field];
          if (v) {
            const plain = await this.encryptionAlgorithm.decrypt(
              String(v),
              this.key,
              {
                collection: this.collectionName,
                fieldName: field,
                recordId: doc._id.toString(),
              }
            );
            doc[field] = plain;
          }
        }
      })
    );
  }
}
