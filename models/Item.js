import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  itemStatus: {  // to differentiate between lost and found item
    type: String,
    enum: ['lost', 'found'],
    required: true,
    default: 'lost',
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['electronics', 'accessories', 'bags', 'clothing', 'documents', 'other'],
  },
  location: {
    type: String,
    required: [true, 'Please specify the location'],
  },
  dateLost: {
    type: Date,
    required: [true, 'Please specify the date'],
  },
  color: {
    type: String,
    trim: true,
  },
  contactPhone: {
    type: String,
    required: [true, 'Please add your contact phone'],
  },
  images: [{
    type: String, // URL of uploaded image
  }],
  // The 'user' field links this item to the specific student who posted it
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  isResolved: { // default value is false and when the item is resolved it is set to true and all the resolved items are later removed
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);