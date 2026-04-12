const mongoose = require('mongoose');

const StaffSchema = mongoose.Schema({
    StaffName: {
        type: String,
        required: true
    },
    StaffId: {
        type: String,
        required: true
    },
    CollegeName: {
        type: String,
        required: true
    },
    MobileNumber: {
        type: Number,
        required: true
    },
    EventDate: {
        type: Date,
        required: true
    },
    Venue: {
        type: String,
        required: true
    },
    BloodGroup: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Staff', StaffSchema);
