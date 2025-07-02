const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const AdtAdmission = require('../models/ADTAdmissionReport'); // 👈 your schema

const router = express.Router();

// Setup multer
const upload = multer({ dest: 'uploads/' });

// Route: POST /api/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = path.resolve(req.file.path);
  const results = [];

  // Step 1: Read & parse CSV
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Optional: Clean or map fields here if needed
      results.push(row);
    })
    .on('end', async () => {
      try {
        // Step 2: Insert into DB
        await AdtAdmission.insertMany(results);

        // Step 3: Delete temp file
        fs.unlinkSync(filePath);

        return res.status(200).json({
          message: 'CSV uploaded and saved to DB',
          data: results,
        });
      } catch (err) {
        console.error('❌ Error saving to DB:', err);
        return res.status(500).json({
          message: 'Failed to save data to DB',
          error: err.message,
        });
      }
    });
});

module.exports = router;
