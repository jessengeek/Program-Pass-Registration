const express = require("express");
const Student = require("../models/Student");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.use(adminAuth);

// GET /api/admin/students?search=jesse
router.get("/students", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = search.trim()
      ? {
          $or: [
            { name: { $regex: search.trim(), $options: "i" } },
            { code: { $regex: search.trim(), $options: "i" } },
          ],
        }
      : {};

    const students = await Student.find(query).sort({ name: 1 }).limit(300);
    res.json(students);
  } catch (err) {
    console.error("Admin list error:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const checkedIn = await Student.countDocuments({ checkedIn: true });
    res.json({ total, checkedIn });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PATCH /api/admin/students/:id/checkin
router.patch("/students/:id/checkin", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found." });

    student.checkedIn = !student.checkedIn;
    student.checkedInAt = student.checkedIn ? new Date() : null;
    await student.save();

    res.json(student);
  } catch (err) {
    console.error("Checkin error:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;
