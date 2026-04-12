const express = require("express");
const router = express.Router();

// Mock data for colleges - In a real app, this could come from a Database
const colleges = [
  { id: "ACET", name: "Aditya College of Engineering & Technology", branches: ["CSE", "ECE", "EEE", "ME", "CE", "IT"] },
  { id: "AEC", name: "Aditya Engineering College", branches: ["CSE", "ECE", "EEE", "ME", "CE", "AGRI"] },
  { id: "ACOE", name: "Aditya College of Engineering", branches: ["CSE", "ECE", "EEE", "ME", "CE"] }
];

// Route to get all colleges
router.get("/colleges", (req, res) => {
  try {
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Error fetching colleges" });
  }
});

// Route to get branches by college ID
router.get("/colleges/:id/branches", (req, res) => {
  try {
    const college = colleges.find(c => c.id === req.params.id);
    if (college) {
      res.status(200).json(college.branches);
    } else {
      res.status(404).json({ message: "College not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching branches" });
  }
});

module.exports = router;