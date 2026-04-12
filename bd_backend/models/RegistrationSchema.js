const mongoose = require('mongoose');

const RegistrationSchema = mongoose.Schema({
    studentname: {
      type: String,
      required: true
    },
    rollno: {
      type: String,
      required: true
    },
    mobilenumber: {
      type: Number,
      required: true
    },
    emailid: {
      type: String, 
      required: true
    },
    college: {
      type: String,
      required: true
    },
    collegeCode: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    EventDate: {
      type: Date,
      required: true
    },
    SelectedEventId: {
      type: String,
      default: '',
    },
    SelectedEventName: {
      type: String,
      default: '',
    },
    donated: {
      type: Boolean,
      required: true,
      default: false
    },
    donatedAt: {
      type: Date,
      default: null,
    }
});

module.exports = mongoose.model('Register', RegistrationSchema);
