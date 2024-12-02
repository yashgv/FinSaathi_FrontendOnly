import { Schema, model, models } from 'mongoose';


const postSchema = new Schema({ // schema for the collection
    msg: { 
        type: String,
        required: true
    }
}, { timestamps: true });

// models.user is the collection name that checks whether the collection is already present or not
// collection banate hai
const TestModel = models.test || model('test', postSchema);  // collection name is 'none' and  

export default TestModel;