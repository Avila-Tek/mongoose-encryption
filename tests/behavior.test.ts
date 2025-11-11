import mongoose from 'mongoose';
import { createUserModel } from './utils/schema';

const User = createUserModel('User256', 'aes-256-gcm');

describe('Behavior testing', () => {
  let aliceId: mongoose.Types.ObjectId;
  let bobId: mongoose.Types.ObjectId;

  const secretData = 'Private data. Alice would kill anyone who knew this';
  const newAliceSecret = 'New secret data for Alice. She loves Bob';
  const newBobSecret = 'New secret data for Bob. He loves turtles';

  it('Behavior check: New document', () => {
    const user = new User({ name: 'Alice', secretData });
    expect(user?.secretData).toBe(secretData);
  });

  it('Behavior check: Save new document', async () => {
    const user = new User({ name: 'Alice', secretData });
    await user.save();
    aliceId = user._id;

    expect(user?.secretData).toBe(secretData);
  });

  it('Behavior check: Create document', async () => {
    const user = await User.create({ name: 'Bob', secretData });
    bobId = user._id;

    expect(user?.secretData).toBe(secretData);
  });

  it('Behavior check: Find documents', async () => {
    const users = await User.find().exec();

    expect(users).toHaveLength(2);
    expect(users[0]?.secretData).toBe(secretData);
    expect(users[1]?.secretData).toBe(secretData);
  });

  it('Behavior check: FindById document', async () => {
    const user = await User.findById(aliceId).exec();
    expect(user?.secretData).toBe(secretData);
  });

  it('Behavior check: FindOne document', async () => {
    const user = await User.findOne({ _id: bobId }).exec();
    expect(user?.secretData).toBe(secretData);
  });

  it('Behavior check: FindOneAndUpdate document', async () => {
    const user = await User.findOneAndUpdate(
      { _id: bobId },
      { secretData: newBobSecret },
      { new: true }
    ).exec();

    expect(user?.secretData).toBe(newBobSecret);
  });

  it('Behavior check: Find documents post update', async () => {
    const users = await User.find().exec();

    expect(users).toHaveLength(2);
    expect(users[0]?.secretData).toBe(secretData);
    expect(users[1]?.secretData).toBe(newBobSecret);
  });

  it('Behavior check: FindById document post update', async () => {
    const user = await User.findById(bobId).exec();
    expect(user?.secretData).toBe(newBobSecret);
  });

  it('Behavior check: FindOne document post update', async () => {
    const user = await User.findOne({ _id: bobId }).exec();
    expect(user?.secretData).toBe(newBobSecret);
  });

  it('Behavior check: Save fetched document', async () => {
    const user = await User.findById(aliceId).exec();
    user!.secretData = newAliceSecret;
    await user!.save();

    expect(user?.secretData).toBe(newAliceSecret);
  });

  it('Behavior check: Find documents post save', async () => {
    const users = await User.find().exec();

    expect(users).toHaveLength(2);
    expect(users[0]?.secretData).toBe(newAliceSecret);
    expect(users[1]?.secretData).toBe(newBobSecret);
  });

  it('Behavior check: FindById document post save', async () => {
    const user = await User.findById(aliceId).exec();
    expect(user?.secretData).toBe(newAliceSecret);
  });

  it('Behavior check: FindOne document post save', async () => {
    const user = await User.findOne({ _id: aliceId }).exec();
    expect(user?.secretData).toBe(newAliceSecret);
  });
});
