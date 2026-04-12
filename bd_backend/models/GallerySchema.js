const mongoose = require('mongoose');

const GallerySchema = mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    imgPath: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gallery', GallerySchema);