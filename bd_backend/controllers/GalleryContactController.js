const Gallery = require("../models/GallerySchema");
const Contact = require("../models/ContactSchema");

// GALLERY LOGIC
const uploadToGallery = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const newImage = new Gallery({
      filename: req.file.filename,
      imgPath: req.file.path,
    });

    await newImage.save();
    res.status(201).json({ message: "Image uploaded to gallery", data: newImage });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image" });
  }
};

const getGallery = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ date: -1 });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: "Error fetching gallery" });
  }
};

// CONTACT LOGIC
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, phone, notes } = req.body;
    const newContact = new Contact({ name, email, subject, phone, notes });
    
    await newContact.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving contact message" });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

module.exports = { uploadToGallery, getGallery, submitContactForm, getMessages };