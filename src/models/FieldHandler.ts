import { EncryptionAlgorithmEnum } from '../types/algorithms';
import { EncryptionAlgorithmHandler } from './EncryptionAlgorithmHandler';

export class FieldHandler {
  private collectionName: string;
  private encryptionAlgorithm: EncryptionAlgorithmHandler;
  private key: string;

  constructor(
    collectionName: string,
    key: string,
    algorithm: EncryptionAlgorithmEnum
  ) {
    this.collectionName = collectionName;
    this.key = key;
    this.encryptionAlgorithm = new EncryptionAlgorithmHandler(algorithm);
  }

  async encrypt(object: any, field: string, recordId?: string) {
    const value = this.get(object, field);

    const encryptedValue = await this.encryptionAlgorithm.encrypt(
      value,
      this.key,
      {
        collection: this.collectionName,
        fieldName: field,
        recordId: recordId || object._id.toString(),
      }
    );

    this.update(object, field, encryptedValue);
  }

  async decrypt(object: any, field: string) {
    const value = this.get(object, field);
    if (!value) return;

    const decryptedValue = await this.encryptionAlgorithm.decrypt(
      value,
      this.key,
      {
        collection: this.collectionName,
        fieldName: field,
        recordId: object?._id?.toString(),
      }
    );

    this.update(object, field, decryptedValue);
  }

  get(object: any, field: string) {
    const fields = field.split('.');
    return fields.reduce((acc, curr) => acc?.[curr], object);
  }

  update(object: any, field: string, value: any) {
    const fields = field.split('.');
    const lastField = fields.pop();
    const targetObject = fields.reduce((acc, curr) => acc?.[curr], object);

    if (targetObject && lastField) {
      targetObject[lastField] = value;
    }
  }
}
