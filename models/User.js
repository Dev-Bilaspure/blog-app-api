const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 21
  },
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true
  },
  password: {
    type: String,
    required: true,
    min: 8
  },
  profilePicture: {
    type: String,
    default: ""
  },
  followers: {
    type: Array,
    default: []
  },
  followings: {
    type: Array,
    default: []
  },
  shortBio: {
    type: String,
    max: 150,
    default: "",
  },
  drafts: {
    type: Array,
    default: []
  },
  bookmarks: {
    type: Array,
    default: []
  },
},
  {timestamps: true}
)

module.exports = mongoose.model("User", UserSchema);