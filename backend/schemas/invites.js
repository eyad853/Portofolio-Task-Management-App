import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pages', // If you have projects
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending'
  },
}, {
  timestamps: true
});

inviteSchema.index({ senderId: 1, receiverId: 1 ,pageId: 1, status: 1 });

const inviteModel = mongoose.model('invite' , inviteSchema)

export default inviteModel