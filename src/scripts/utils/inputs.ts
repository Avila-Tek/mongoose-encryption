import inquirer from 'inquirer';
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

  console.log(fields);

  return { collection, fields, key, algorithm, databaseUri };
}

async function getCollectionInput() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'collection',
      message: 'Which collection do you want to migrate?',
      validate: (value) => (value ? true : 'Collection is required'),
    },
  ]);

  return answers.collection;
}

async function getCollectionFields() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'fields',
      message:
        'Please specify the desired collection fields (comma-separated):',
      validate: (value) => (value ? true : 'Collection fields are required'),
    },
  ]);

  return answers.fields.split(',').map((attr: string) => attr.trim());
}

async function getEncryptionKey() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'encryptionKey',
      message: 'Please specify the encryption key:',
      validate: (value) => (value ? true : 'Encryption key is required'),
    },
  ]);

  return answers.encryptionKey;
}

async function getEncryptionAlgorithm() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'algorithm',
      message: 'Please specify the encryption algorithm:',
      validate: (value) => {
        if (!value) return 'Encryption algorithm is required';
        if (!ALGORITHMS.includes(value as any)) {
          return 'Invalid encryption algorithm';
        }
        return true;
      },
    },
  ]);

  return answers.algorithm;
}

async function getDatabaseURI() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'database',
      message: 'Please specify the database connection URI:',
      validate: (value) => (value ? true : 'Database URI is required'),
    },
  ]);

  return answers.database;
}
