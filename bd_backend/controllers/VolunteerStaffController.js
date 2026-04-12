const Volunteer = require("../models/VolunteerSchema");
const Staff = require("../models/StaffSchema");
const GuestManagement = require("../models/GuestManagementSchema");

const emitDashboardRefresh = (req, payload) => {
  const io = req.app.get("io");
  if (!io) {
    return;
  }

  io.emit("newRegistration", payload);
  io.emit("donationConfirmed", payload);
};

const getEventDateRange = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

// VOLUNTEER LOGIC
const addVolunteer = async (req, res) => {
  try {
    const newVolunteer = new Volunteer(req.body);
    await newVolunteer.save();
    res.status(201).json({ message: "Volunteer added successfully", data: newVolunteer });
  } catch (error) {
    res.status(500).json({ message: "Error adding volunteer" });
  }
};

const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteers" });
  }
};

// STAFF LOGIC
const addStaff = async (req, res) => {
  try {
    const eventDateRange = getEventDateRange(req.body.EventDate);

    if (!eventDateRange) {
      return res.status(400).json({ message: "Valid event date is required." });
    }

    const existingStaff = await Staff.findOne({
      StaffId: req.body.StaffId,
      EventDate: {
        $gte: eventDateRange.start,
        $lt: eventDateRange.end,
      },
    });

    if (existingStaff) {
      return res.status(409).json({
        message: "This staff donor is already added for the selected event.",
      });
    }

    const newStaff = new Staff(req.body);
    await newStaff.save();
    emitDashboardRefresh(req, { type: "staff", eventDate: req.body.EventDate });
    res.status(201).json({ message: "Staff member added successfully", data: newStaff });
  } catch (error) {
    res.status(500).json({ message: "Error adding staff" });
  }
};

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff" });
  }
};

const addGuestManagement = async (req, res) => {
  try {
    const eventDateRange = getEventDateRange(req.body.EventDate);

    if (!eventDateRange) {
      return res.status(400).json({ message: "Valid event date is required." });
    }

    const existingGuestManagement = await GuestManagement.findOne({
      Name: req.body.Name,
      TypeOfDonor: req.body.TypeOfDonor,
      EventDate: {
        $gte: eventDateRange.start,
        $lt: eventDateRange.end,
      },
    });

    if (existingGuestManagement) {
      return res.status(409).json({
        message: "This guest/management donor is already added for the selected event.",
      });
    }

    const newGuestManagement = new GuestManagement(req.body);
    await newGuestManagement.save();
    emitDashboardRefresh(req, { type: "guest-management", eventDate: req.body.EventDate });
    res.status(201).json({
      message: "Guest/Management donor added successfully",
      data: newGuestManagement
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding guest/management donor" });
  }
};

const getGuestManagement = async (req, res) => {
  try {
    const guestManagement = await GuestManagement.find();
    res.status(200).json(guestManagement);
  } catch (error) {
    res.status(500).json({ message: "Error fetching guest/management donors" });
  }
};

module.exports = {
  addVolunteer,
  getVolunteers,
  addStaff,
  getStaff,
  addGuestManagement,
  getGuestManagement
};
