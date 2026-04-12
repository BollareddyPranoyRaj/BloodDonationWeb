const Eventschema = require("../models/EventSchema");

// Create a new Blood Donation Event
const createEvent = async (req, res) => {
  try {
    const { EventName, Date, Colleges } = req.body;
    
    // Check if an image was uploaded via Multer
    const filename = req.file ? req.file.filename : null;
    const imgPath = req.file ? req.file.path : null;

    // Parse Colleges if it comes as a string from FormData
    const parsedColleges = typeof Colleges === 'string' ? JSON.parse(Colleges) : Colleges;

    const newEvent = new Eventschema({
      EventName,
      Date,
      Colleges: parsedColleges,
      filename,
      imgPath,
    });

    await newEvent.save();
    
    // Real-time update for the frontend to show the new event
    const io = req.app.get("io");
    io.emit("newEvent", newEvent);

    res.status(201).json({ message: "Event created successfully", data: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error while creating event" });
  }
};

// Get all upcoming events
const getEvents = async (req, res) => {
  try {
    const events = await Eventschema.find().sort({ Date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
    try {
        await Eventschema.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Event deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting event" });
    }
};

module.exports = { createEvent, getEvents, deleteEvent };