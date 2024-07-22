import { Schema, model } from "mongoose";

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  caption: String,
  like: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  comments: {
    type: Array,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  shares: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  picture: String,
});

const Post = model("post", postSchema);

export default Post;
