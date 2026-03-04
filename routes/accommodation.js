const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");
const {
  getAllAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require("../controllers/accommodationController");

// Public
router.get("/", getAllAccommodations);
router.get("/:id", getAccommodationById);

// Any logged-in user (NOT admin only)
router.post("/", protect, upload.array("photos", 5), createAccommodation);
router.put("/:id", protect, upload.array("photos", 5), updateAccommodation);
router.delete("/:id", protect, deleteAccommodation);

module.exports = router;