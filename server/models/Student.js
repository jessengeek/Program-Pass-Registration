const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  className: { type: String, trim: true, default: "" },
  phone: { type: String, trim: true, default: "" },
  photo: { type: String, required: true }, // base64 data URI, resized client-side before upload
  registeredAt: { type: Date, default: Date.now },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null },
});

// Supports the admin search box (search by name or code)
StudentSchema.index({ name: "text" });

module.exports = mongoose.model("Student", StudentSchema);
