const { Schema, model } = require("mongoose");

const feedbackSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    subject: { type: String, required: true },
    message: { type: String },
  },
  {
    timestamps: true,
  }
);

const feedback = model("Feedback", feedbackSchema);

module.exports = feedback;
