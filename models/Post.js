const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String
    },
    desc: {
      type: String
    },
    img: {
      type: String
    },
    likes: {
      type: Array,
      default: []
    },
    tags: {
      type: Array,
      default: []
    },
    isPublished: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);