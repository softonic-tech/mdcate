import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    board: {
      type: String,
      enum: ["KPK", "Punjab", "Federal"],
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

subjectSchema.pre("save", function () {
  if (this.isModified("name") || this.isModified("board")) {
    this.slug = `${this.name}-${this.board}`
      .toLowerCase()
      .replace(/\s+/g, "-");
  }
});

subjectSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update.name || update.board) {
    const name = update.name || this._update.name;
    const board = update.board || this._update.board;
    this.setUpdate({
      ...update,
      slug: `${name}-${board}`.toLowerCase().replace(/\s+/g, "-"),
    });
  }
});

subjectSchema.index({ name: 1, board: 1 }, { unique: true });

export default mongoose.model("Subject", subjectSchema);
