import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    name: String,
    price: Number,
  });

  export const Service = mongoose.model('Service', ServiceSchema);
