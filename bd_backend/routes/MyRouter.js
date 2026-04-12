const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Import all controllers we created in Phase 2
const {
  createRegistration,
  getRegistrations,
  findRegistration,
  confirmDonation,
} = require("../controllers/RegistrationController");
const { createEvent, getEvents, deleteEvent } = require("../controllers/EventController");
const {
  addVolunteer,
  getVolunteers,
  addStaff,
  getStaff,
  addGuestManagement,
  getGuestManagement
} = require("../controllers/VolunteerStaffController");
const { uploadToGallery, getGallery, submitContactForm, getMessages } = require("../controllers/GalleryContactController");
const { sendOTP, verifyOTP } = require("../controllers/OTPController");
const { adminLogin } = require("../controllers/LoginController");

// Configure Multer for Image Uploads (Events & Gallery)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder based on fieldname
    const folder = file.fieldname === "eventImage" ? "Events" : "Gallery";
    cb(null, path.join(__dirname, `../${folder}`));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. Authentication
router.post("/login", adminLogin);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// 2. Donor Registration
router.post("/register", createRegistration);
router.get("/registrations", getRegistrations);
router.get("/registrations/search", findRegistration);
router.post("/registrations/confirm-donation", confirmDonation);

// 3. Events (with Image Upload)
router.post("/create-event", upload.single("eventImage"), createEvent);
router.get("/events", getEvents);
router.delete("/event/:id", deleteEvent);

// 4. Volunteers & Staff
router.post("/add-volunteer", addVolunteer);
router.get("/volunteers", getVolunteers);
router.post("/add-staff", addStaff);
router.get("/staff", getStaff);
router.post("/add-guest-management", addGuestManagement);
router.get("/guest-management", getGuestManagement);

// 5. Gallery (with Image Upload)
router.post("/upload-gallery", upload.single("galleryImage"), uploadToGallery);
router.get("/gallery", getGallery);

// 6. Contact Form
router.post("/contact", submitContactForm);
router.get("/messages", getMessages);

module.exports = router;
