import { Document } from 'mongoose';
import { EncryptionAlgorithm } from './EncryptionAlgorithm';
import { FieldHandler } from './FieldHandler';

export class DocumentEncryptionHandler {
  private collectionName: string;
  private encryptionAlgorithm: EncryptionAlgorithm;
  private fieldHandler: FieldHandler;
  private fields: string[];
  private key: string;

  constructor(collectionName: string, fields: string[], key: string) {
    this.collectionName = collectionName;
    this.fields = fields;
    this.key = key;
    this.encryptionAlgorithm = new EncryptionAlgorithm();
    this.fieldHandler = new FieldHandler();
  }

  async encryptSavedDocumentFields(document: Document) {
    for (const field of this.fields) {
      if (document.isModified(field)) {
        const value = this.fieldHandler.get(document, field);

        const encryptedValue = await this.encryptionAlgorithm.encrypt(
          value,
          this.key,
          {
            collection: this.collectionName,
            fieldName: field,
            recordId: document._id.toString(),
          }
        );

        this.fieldHandler.update(document, field, encryptedValue);
      }
    }
  }

  async encryptFields(doc: any, recordId: string) {
    const encryptedMappedFields = await Promise.all(
      this.fields.map(async (field) => {
        const value = this.fieldHandler.get(doc, field);
        if (!value) return;

        const encryptedValue = await this.encryptOneField({
          value,
          fieldName: field,
          recordId: recordId,
        });

        return { [field]: encryptedValue };
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
          const v = this.fieldHandler.get(doc, field);
          if (!v) return;

          const plain = await this.decryptOneField({
            value: String(v),
            fieldName: field,
            recordId: doc._id.toString(),
          });

          this.fieldHandler.update(doc, field, plain);
        }
      })
    );
  }

  private async decryptOneField(record: {
    value: string;
    fieldName: string;
    recordId: string;
  }) {
    const decryptedValue = await this.encryptionAlgorithm.decrypt(
      record.value,
      this.key,
      {
        collection: this.collectionName,
        fieldName: record.fieldName,
        recordId: record.recordId,
      }
    );

    return decryptedValue;
  }
}
