const EventSchema = require('../models/EventSchema');
const GallerySchema = require('../models/GallerySchema');
const VolunteerSchema = require('../models/VolunteerSchema');

const multer = require('multer');
const path = require('path');


const DeleteEventHandler = async (req, res) => {
    try {
        const { EventId } = req.body;
        await EventSchema.findOneAndDelete({ _id: EventId });

        return res.status(200).json({ message: 'Event deleted successfully...'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
};


const DeleteGalleryHandler = async (req, res) => {
    try {
        const { GalleryId } = req.body;
        await GallerySchema.findOneAndDelete({ _id: GalleryId });

        return res.status(200).json({ message: 'Gallery deleted successfully...'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
};



const DeleteVolunteerHandler = async (req, res) => {
    try {
        const { VolunteerId } = req.body;
        await VolunteerSchema.findOneAndDelete({ _id: VolunteerId });

        return res.status(200).json({ message: 'Volunteer deleted successfully...'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
};


// Multer storage setup
const storage = multer.diskStorage({
    destination: './Events/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

const UpdateEventHandler = async (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const updatedData = req.body;
            console.log(updatedData);

            if (updatedData && updatedData.Colleges) {
                updatedData.Colleges = JSON.parse(updatedData.Colleges);
            }
 
            // Add file path if a new image is uploaded
            if (req.file) {
                updatedData.filename = req.file.originalname;
                updatedData.imgPath = req.file.path;
            }

            // Use EventId field name to match AddEventForm
            const eventId = updatedData.EventId;
            if (!eventId) {
                return res.status(400).json({ message: 'EventId is required for updating' });
            }

            // Remove EventId from updatedData since it's not a field to update
            delete updatedData.EventId;

            const updatedEvent = await EventSchema.findOneAndUpdate(
                { _id: eventId },
                { $set: updatedData },
                { new: true }
            );

            if (!updatedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }

            return res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server Error' });
        }
    });
};



const UpdateVolunteerHandler = async (req, res) => {
    try {
        const updatedData  = req.body;
        console.log(req.body);

        const updatedVolunteer = await VolunteerSchema.findOneAndUpdate(
            { _id: updatedData.VolunteerId },
            { $set: updatedData },
            { new: true }
        );

        return res.status(200).json({ message: 'Volunteer updated successfully...' });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    DeleteEventHandler,
    DeleteGalleryHandler,
    DeleteVolunteerHandler,
    UpdateEventHandler,
    UpdateVolunteerHandler,
}   