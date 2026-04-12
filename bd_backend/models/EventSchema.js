const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
  EventName: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
  },
  Colleges: {
    type: [String],
    required: true,
  },
  filename: {
    type: String,
  },
  imgPath: {
    type: String,
  },
});

module.exports = mongoose.model('Eventschema', EventSchema);
