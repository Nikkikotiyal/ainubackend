const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
   Moduleid: Number,
  "MODLE NAME ": String, // ✅ Space included before comma
  "REPORT NAME": String
}, {
  collection: 'module' // Replace this with the exact collection name in MongoDB
});

module.exports = mongoose.model('module', moduleSchema);