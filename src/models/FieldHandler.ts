export class FieldHandler {
  constructor() {}

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
