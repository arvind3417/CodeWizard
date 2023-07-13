import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String },
  name: { type: String },
  password: { type: String },
  email: { type: String },
  isAdmin: { type: Boolean, default: false },
  cart: [{
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'cartType' },
    cartType: { type: String, enum: ['Product', 'Service'] },
    quantity: { type: Number, default: 1 },
  }],
 
});

export const User = mongoose.model('User', userSchema);
