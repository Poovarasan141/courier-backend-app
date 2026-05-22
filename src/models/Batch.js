const mongoose = require("mongoose");

const bulkOrderSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["processing", "completed"], default: "processing" },
    results: [
      {
        order_id: String,
        success: Boolean,
        error: String,
        courier_partner: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", bulkOrderSchema);