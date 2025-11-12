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
    const arraysInvolved = this.detectArrayInvolvement(object, field);

    if (arraysInvolved) {
      const fields = field.split('.');
      return this.updateArrayFields(
        object,
        fields,
        object._id.toString(),
        'encrypt'
      );
    }

    const value = this.get(object, field);
    const encryptedValue = await this.encryptOneField(
      value,
      field,
      recordId || object._id.toString()
    );

    this.update(object, field, encryptedValue);
  }

  async decrypt(object: any, field: string) {
    const arraysInvolved = this.detectArrayInvolvement(object, field);

    if (arraysInvolved) {
      const fields = field.split('.');
      return this.updateArrayFields(
        object,
        fields,
        object._id.toString(),
        'decrypt'
      );
    }

    const value = this.get(object, field);
    if (!value) return;

    const decryptedValue = await this.decryptOneField(
      value,
      field,
      object?._id?.toString()
    );

    this.update(object, field, decryptedValue);
  }

  private detectArrayInvolvement(object: any, field: string): boolean {
    const fields = field.split('.');

    let currentObject = object;
    fields.pop();

    for (const f of fields) {
      const subObject = currentObject[f];
      if (Array.isArray(subObject)) return true;
      currentObject = subObject;
    }

    return false;
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

  private async updateArrayFields(
    object: any,
    fields: string[],
    objectId: string,
    func: 'encrypt' | 'decrypt'
  ) {
    const field = fields[0];

    if (typeof object === 'string') {
      if (func === 'encrypt') {
        return this.encryptOneField(object, field, objectId);
      }

      return this.decryptOneField(object, field, objectId);
    }

    const value = object[field];

    if (typeof value === 'string') {
      if (func === 'encrypt') {
        object[field] = await this.encryptOneField(value, field, objectId);
      } else {
        object[field] = await this.decryptOneField(value, field, objectId);
      }

      return object;
    }

    const nextFields = fields.slice(1);

    if (Array.isArray(value)) {
      const primitiveArray = typeof value[0] === 'string';
      for (let i = 0; i < value.length; i++) {
        object[field][i] = await this.updateArrayFields(
          value[i],
          primitiveArray ? fields : nextFields,
          objectId,
          func
        );
      }

      return object;
    }

    object[field] = this.updateArrayFields(value, nextFields, objectId, func);

    return object;
  }

  private encryptOneField(value: any, field: string, recordId: string) {
    return this.encryptionAlgorithm.encrypt(value, this.key, {
      collection: this.collectionName,
      fieldName: field,
      recordId,
    });
  }

  private decryptOneField(value: any, field: string, recordId: string) {
    return this.encryptionAlgorithm.decrypt(value, this.key, {
      collection: this.collectionName,
      fieldName: field,
      recordId,
    });
  }
}
