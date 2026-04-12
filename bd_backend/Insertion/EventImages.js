const multer = require('multer');
const path = require('path');
const imageData = require('../../models/EventSchema');

// Multer storage setup
const storage = multer.diskStorage({
    destination: './Events/',
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, file.originalname);
    }
});

// Multer configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
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

// Upload Image Controller
const uploadImage = (req, res) => {
    console.log("getting")
    console.log(req.body);
    console.log(req.file);

    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        // Check if file is uploaded (make it optional)
        let filename = null;
        let imgPath = null;
        
        if (req.file) {
            filename = req.file.originalname;
            imgPath = req.file.path;
        }

        // Save image and form data to the database
        const newEvent = new imageData({
            filename: filename,  // Image filename (can be null)
            imgPath: imgPath,    // Image path (can be null)
            Colleges: JSON.parse(req.body.Colleges),
            EventName: req.body.EventName, 
            Date: req.body.Date,
        });

        // console.log(typeof JSON.parse(req.body.venues));

        newEvent.save()
            .then(() => res.status(200).json({ message: 'Event uploaded and saved to DB', file: req.file }))
            .catch(err => res.status(500).json({ message: 'Error saving event to DB', error: err.message }));
    });
};

module.exports = { uploadImage };