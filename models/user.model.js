const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    supabaseId: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const User = model('User', userSchema);

module.exports = User;
