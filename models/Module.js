const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  Moduleid: Number,
  MODLE_NAME: String,
  REPORT_NAME: String
}, {
  collection: 'module' // Replace this with the exact collection name in MongoDB
});

module.exports = mongoose.model('module', moduleSchema);