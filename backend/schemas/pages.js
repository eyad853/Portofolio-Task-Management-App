import mongoose from "mongoose";

const Pages = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ["todo", "calendar", "kanban", "notes"],
        required: true
      },
      content: {
        type: mongoose.Schema.Types.Mixed, // <-- Can be anything based on type
        default: {}
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
})

const PagesModel = mongoose.model("Pages" , Pages)
export default PagesModel