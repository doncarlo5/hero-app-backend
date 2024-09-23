const { Schema, model } = require("mongoose");

const programSchema = new Schema(
  {
    sessionType: {
      type: String,
      enum: ["Upper A", "Lower", "Upper B", "Other", "Séance A", "Séance B"],
      required: true,
    },
    exercises: [
      {
        exerciseType: {
          type: Schema.Types.ObjectId,
          ref: "ExerciseType",
          required: true,
        },
        order: { type: Number, required: true },
        alternatives: [{ type: Schema.Types.ObjectId, ref: "ExerciseType" }], // For exercises at the same order
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Program = model("Program", programSchema);

module.exports = Program;
