import { input } from '@inquirer/prompts';
import { ALGORITHMS } from '../../types/algorithms';

export async function getInputs(options: any) {
  let collection = options.collection;
  let fields = options.fields;
  let key = options.key;
  let algorithm = options.algorithm;
  let databaseUri = options.database;

  if (!collection) {
    collection = await getCollectionInput();
  }

  if (!fields) {
    fields = await getCollectionFields();
  } else {
    fields = fields.split(',').map((attr: string) => attr.trim());
  }

  if (!key) {
    key = await getEncryptionKey();
  }

  if (!databaseUri) {
    databaseUri = await getDatabaseURI();
  }

  if (!algorithm) {
    algorithm = await getEncryptionAlgorithm();
  }

  return { collection, fields, key, algorithm, databaseUri };
}

async function getCollectionInput() {
  const collection = await input({
    message: 'Which collection do you want to migrate?',
    validate: (value) => (value ? true : 'Collection is required'),
  });

  return collection;
}

async function getCollectionFields() {
  const fields = await input({
    message: 'Please specify the desired collection fields (comma-separated):',
    validate: (value) => (value ? true : 'Collection fields are required'),
  });

  return fields.split(',').map((attr: string) => attr.trim());
}

async function getEncryptionKey() {
  const key = await input({
    message: 'Please specify the encryption key:',
    validate: (value) => (value ? true : 'Encryption key is required'),
  });

  return key;
}

async function getEncryptionAlgorithm() {
  const algorithm = await input({
    message: 'Please specify the encryption algorithm:',
    validate: (value) => {
      if (!value) return 'Encryption algorithm is required';
      if (!ALGORITHMS.includes(value as any)) {
        return 'Invalid encryption algorithm';
      }
      return true;
    },
  });

  return algorithm;
}

async function getDatabaseURI() {
  const database = await input({
    message: 'Please specify the database connection URI:',
    validate: (value) => (value ? true : 'Database URI is required'),
  });

  return database;
}
