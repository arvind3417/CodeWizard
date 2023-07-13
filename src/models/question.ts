import mongoose from 'mongoose';

 
 
const questionSchema = new mongoose.Schema({
    name: String, 
    body: String,
    ID:Number,
    testCases: [{
        number:Number,
        input: String,
        expectedOutput: String,
      }],
    
  });
  export const Question = mongoose.model('Question', questionSchema);
