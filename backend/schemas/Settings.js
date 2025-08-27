import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  darkMode: {
    type: Boolean,
    default: false
  }
});

const settingsModel = mongoose.model("setting", settingsSchema);
export default settingsModel