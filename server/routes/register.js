const express = require("express");
const crypto = require("crypto");
const Student = require("../models/Student");

const router = express.Router();

// Short, human-readable code shown on the confirmation "pass" and used by
// the door volunteer as a quick lookup alongside the name.
function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[crypto.randomInt(alphabet.length)];
  }
  return code;
}

router.post("/", async (req, res) => {
  try {
    const { name, className, phone, photo } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (!photo || typeof photo !== "string" || !photo.startsWith("data:image")) {
      return res.status(400).json({ error: "A photo is required." });
    }
    // Rough safety cap on payload size (client already resizes images before
    // sending, this just guards against something unexpected slipping through).
    if (photo.length > 3_000_000) {
      return res.status(413).json({ error: "Photo is too large. Please try again." });
    }

    let code = generateCode();
    // Extremely unlikely collision, but guard against it anyway.
    for (let attempts = 0; attempts < 5; attempts++) {
      const exists = await Student.findOne({ code });
      if (!exists) break;
      code = generateCode();
    }

    const student = await Student.create({
      name: name.trim(),
      className: (className || "").trim(),
      phone: (phone || "").trim(),
      photo,
      code,
    });

    res.status(201).json({
      code: student.code,
      name: student.name,
      className: student.className,
      photo: student.photo,
      registeredAt: student.registeredAt,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
