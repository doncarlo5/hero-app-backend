const { Schema, model } = require("mongoose");

const trophySchema = new Schema(
  {
    name: { type: String, required: true },
    exerciseType: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseType",
    },
    exerciseUser: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseUser",
    },
    trophyType: { type: String, required: true },
    repsGoal: { type: Number },
    weightMultiplier: { type: Number },
    achieved: { type: Boolean, default: false },
    description: { type: String, required: true },
    level: { type: Number },
    repsUser: { type: Number },
    weightUser: { type: Number },
    awardedAt: { type: Date },
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

const Trophy = model("Trophy", trophySchema);

module.exports = Trophy;
