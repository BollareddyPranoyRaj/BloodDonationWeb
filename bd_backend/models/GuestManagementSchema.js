const mongoose = require('mongoose');

const GuestManagementSchema = mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    TypeOfDonor: {
        type: String,
        enum: ['Guest', 'Management'],
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

module.exports = mongoose.model('GuestManagement', GuestManagementSchema);
