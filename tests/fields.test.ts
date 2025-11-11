import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { FieldHandler } from '../src/models/FieldHandler';

describe('Field Handling', () => {
  const fieldHandler = new FieldHandler();

  const sampleObject = {
    name: 'Bob',
    secret: 'Top Secret Data',
    dni: {
      value: '12345678',
      country: {
        name: 'Atlantis',
      },
    },
  };

  // Simple Field
  it('Get simple field value', () => {
    const name = fieldHandler.get(sampleObject, 'name');
    expect(name).toBe(sampleObject.name);
  });

  it('Update simple field value', () => {
    const newSecret = 'New Secret Data';
    fieldHandler.update(sampleObject, 'secret', newSecret);
    fieldHandler.get(sampleObject, 'secret');
    expect(sampleObject.secret).toBe(newSecret);
  });

  // Nested Field
  it('Get nested field value', () => {
    const nestedValue = fieldHandler.get(sampleObject, 'dni.value');
    expect(nestedValue).toBe(sampleObject.dni.value);
  });

  it('Update nested field value', () => {
    const newDniValue = '1234567';
    fieldHandler.update(sampleObject, 'dni.value', newDniValue);
    fieldHandler.get(sampleObject, 'dni.value');
    expect(sampleObject.dni.value).toBe(newDniValue);
  });

  // 2nd Level Nested Field
  it('Get 2nd level nested field value', () => {
    const level3Value = fieldHandler.get(sampleObject, 'dni.country.name');
    expect(level3Value).toBe(sampleObject.dni.country.name);
  });

  it('Update 2nd level nested field value', () => {
    const newCountryName = 'Narnia';
    fieldHandler.update(sampleObject, 'dni.country.name', newCountryName);
    const updatedValue = fieldHandler.get(sampleObject, 'dni.country.name');
    expect(updatedValue).toBe(newCountryName);
  });
});
