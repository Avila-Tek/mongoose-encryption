#!/usr/bin/env node

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Command } from 'commander';
import { getInputs } from './utils/inputs';
import { DocumentEncryptionHandler } from '../models/DocumentEncryptionHandler';

const program = new Command();

program
  .name('encrypt')
  .description('Your awesome encrypt CLI')
  .version('0.1.0');

program
  .command('init')
  .option('-c, --collection <name>', 'Specify collection to handle')
  .option('-f, --fields <name>', 'Specify collection fields to encrypt')
  .option('-k, --key <key>', 'Encryption key to use')
  .option('-d, --database <uri>', 'Database connection URI')
  .option('-a, --algorithm <name>', 'Encryption algorithm to use')
  .description('Start the encryption process')
  .action(async (options) => {
    const { collection, fields, key, algorithm, databaseUri } = await getInputs(
      options
    );

    console.log('\nYou can use this command for next collections:');
    console.log(
      '=============================================================='
    );
    console.log(
      `npx encrypt init -k "${key}" -d "${databaseUri}" -a ${algorithm}`
    );
    console.log(
      '==============================================================\n'
    );

    // Load environment variables
    dotenv.config();

    await mongoose.connect(databaseUri);
    console.log('✔ Connected to database.');
    console.log('🔐 Starting encryption process ...');
    const documentEncryptionHandler = new DocumentEncryptionHandler(
      collection,
      fields,
      key,
      algorithm
    );

    const coll = mongoose.connection.collection(collection);
    const totalDocs = await coll.countDocuments();
    console.log(`🔢 Found ${totalDocs} documents to encrypt.`);
    // await documentEncryptionHandler.encryptFields();

    let encryptedDocs = 0;
    for (let i = 0; i < fields.length; i++) {
      const docs = await coll
        .find(
          {},
          {
            skip: i * 100,
            limit: 100,
          }
        )
        .toArray();

      await Promise.all(
        docs.map(async (doc: any) => {
          await documentEncryptionHandler.encryptFields(doc, doc._id);
        })
      );

      await coll.bulkWrite(
        docs.map((doc) => ({
          updateOne: { filter: { _id: doc._id }, update: { $set: doc } },
        }))
      );

      encryptedDocs += docs.length;
    }

    await mongoose.disconnect();
    console.log('✔ Encryption process completed.');
    console.log('✔ Connection to database successfully closed.');
    console.log('🎉 Happy coding!');
  });

program.parseAsync();
