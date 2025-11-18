## Security ASAP (Security As Simple As Possible)

Security is a main brach in all of our projects, but it can be painfully difficult to implement some times. There are so many things to consider, and so many things that can go wrong in every step. Sometimes this can lead to avoidance and unnecessary problems.

This library is our way of contributing to this problem in the mongoose ecosystem, facilitating field encryption through schema definitions and easy setups.

## Getting started

### Installation

You can add our library to your project by doing any of this commands:

**NPM**

```bash
npm install @avila-tek/mongoose-encryption
```

**Yarn**

```bash
yarn add @avila-tek/mongoose-encryption
```

### Integration

Let's assume you have `User` model, and you just found out some fields are recommended to be encrypted as the PIIs they happen to be. With our library, the problem is solved in just a couple of lines!

```ts
import mongoose from 'mongoose';
import encryptionPlugin from '@avila-tek/mongoose-encryption';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dni: {
    number: String,
  },
  phones: [
    {
      number: String,
      label: String,
    },
  ],
  secretValues: [String],
});

userSchema.plugin(encryptionPlugin, {
  key: '<secret key>',
  algorithm: 'aes-256-gcm',
  fields: [
    'firstName',
    'lastName',
    'dni.number',
    'phones.number',
    'secretValues',
  ],
  collectionName: 'users',
});

const User = mongoose.model('User', userSchema);
```

#### Fields

Fields input allows many use cases:

- Simple fields (`firstName`)
- Nested fields (`dni.number`)
- Array nested fields (`phones.number`)
- Array fields (`secretValues`)

#### Algorithms

These are the accepted algorithms at the moment, but we will continue to expand this list further:

- AES-256-GCM: `aes-256-gcm`
- AES-128-GCM: `aes-128-gcm`
- ChaCha20-Poly1305: `chacha20-poly1305`

#### Collection Name

Non-deterministic algorithms help us keep our data even more encrypted. By adding extra fields to the process, we can ensure different results even when the input value is the same. We selected this few extra fields:

- Record ID: The MongoID of the document being handled.
- Field Name: The field being encrypted.
- Collection Name: The collection where the document is located.

The latter is the one you will be providing in the setup. As soon as the first document is encrypted with this value, it cannot be changed. We know this is not great, so we are working on it.

#### The key

Last but not least, the secret key must be in **Base64** and it has to match the intended algorithm:

- AES-256-GCM: 256 bit key (32 bytes)
- AES-128-GCM: 128 bit key (16 bytes)
- ChaCha20-Poly1305: 256 bit key (32 bytes)

You can easily create these fields by running one OpenSSL command:

**256 bit key (32 bytes)**

```bash
openssl base64 rand 32
```

**128 bit key (16 bytes)**

```bash
openssl base64 rand 16
```

### Legacy collections

For preexisting collections with unencrypted data, the process of adding this library can seem like a big problem, specially for production environments. That's why we added a CLI tool to help developers process their data in a secure way.

By running the next command, you can interact with your database, collections and specifications very easily:

```bash
npx encrypt init
```

You can add some flags to the command so things are even faster, but the tool will ask you for any missing information.

| Flag           | Type   | Description                                                                          |
| -------------- | ------ | ------------------------------------------------------------------------------------ |
| `--uri`        | string | MongoDB connection URI to the target database.                                       |
| `--collection` | string | Collection name where documents should be encrypted.                                 |
| `--fields`     | string | Comma-separated list of fields to encrypt (supports nested paths like `dni.number`). |
| `--key`        | string | Encryption key used to encrypt/decrypt data. Keep this value secure.                 |
| `--algorithm`  | string | Encryption algorithm to use (`aes-256-gcm`, `aes-128-gcm`, or `chacha20-poly1305`).  |

The CLI will take care of the rest and your data will be encrypted right away. Improvements for this feature will be added on to make it more secure, so please use this with caution for now.
