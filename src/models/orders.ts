import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType' },
    itemType: { type: String, enum: ['Product', 'Service'] },
    quantity: { type: Number, default: 1 },
    print:{type: Number},
    tax:{type:Number}
  }],
  totalAmount: { type: Number },
  createdAt: { type: Date, default: Date.now },
});




export const Order = mongoose.model('Order', orderSchema);
