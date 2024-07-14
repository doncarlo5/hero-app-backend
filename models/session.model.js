const { Schema, model } = require("mongoose");

const sessionSchema = new Schema(
  {
    date_session: { type: Date, required: true },
    type_session: {
      type: String,
      enum: ["Upper A", "Lower", "Upper B", "Other"],
      required: true,
    },
    body_weight: {
      type: Number,
      required: true,
    },
    exercise_user_list: [
      {
        type: Schema.Types.ObjectId,
        ref: "ExerciseUser",
      },
    ],
    is_done: { type: Boolean, default: false },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: { type: String, maxLength: 200 },
  },
  {
    timestamps: true,
  }
);

const session = model("Session", sessionSchema);

module.exports = session;
