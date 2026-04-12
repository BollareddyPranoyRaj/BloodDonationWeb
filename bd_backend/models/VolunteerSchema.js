const mongoose = require('mongoose');

const VolunteerSchema = mongoose.Schema({
    Name: {
      type: String,
      required: true
    },
    TypeOfVolunteer: {
        type: String,
        required: true
    },
    Id: {
        type: String,
        required: true
    },
    PhoneNumber: {
        type: Number,
        required: true
    },
    Branch: {
        type: String,
        required: true
    },
    LinkedInProfile: {
        type: String,
        required: true
    }   
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);