// model.js
const mongoose = require('mongoose');

// Create a schema for the photo model
const photoSchema = new mongoose.Schema({
  name: String,
  price: String,
  description: String,
  image: String,
});

// Create a Photo model using the schema
const Photo1 = mongoose.model('Photo1', photoSchema);

// Export the Photo model
module.exports = Photo1;

