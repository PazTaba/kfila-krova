import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    latitude: Number,
    longitude: Number,
  },
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  responses: [{
    responderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
});
helpRequestSchema.post('save', async function (doc) {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.userId, {
      $addToSet: { helpRequests: doc._id }
    });
  });
  

export const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);
