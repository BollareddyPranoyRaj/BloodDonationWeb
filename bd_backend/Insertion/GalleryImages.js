const multer = require('multer');
const path = require('path');

const imageData = require('../../models/GallerySchema');

const storage = multer.diskStorage({
    destination: './Gallery/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 10 * 1024 * 1024 },
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
const uploadGalleryImage = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message }); // Response sent if multer throws an error
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' }); // Response sent if no file is uploaded
        }

        // Save file data to the database
        const newImage = new imageData({
            filename: req.file.filename,
            imgPath: req.file.path,
        });

        newImage.save()
            .then(() => {
                // Success response sent after saving to DB
                return res.status(200).json({ 
                    message: 'File uploaded and saved to DB', 
                    file: req.file 
                });
            })
            .catch(err => {
                console.log(err);
                // Error response sent if saving to DB fails
                return res.status(500).json({ 
                    message: 'Error saving file to DB', 
                    error: err.message 
                });
            });
    });
};



exports.uploadGalleryImage = uploadGalleryImage;