const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    content: {
      type: {},
      required: true,
    },
    postedBy: {
      type: Schema.ObjectId,
      ref: "User",
    },
    image: {
      url: String,
      public_id: String,
    },
    likes: [
      {
        type: Schema.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: String,
        created: { type: Date, default: Date.now },
        postedBy: { type: Schema.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);
module.exports = model("posts", postSchema);
