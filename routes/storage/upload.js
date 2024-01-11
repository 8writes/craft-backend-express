const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const { createClient } = require('../../lib/supabase');
const sizeOf = require('image-size');

const handleErrorResponse = (res, message) => {
  console.error(message);
  return res.status(500).json({ error: 'Internal Server Error' });
};

const handleStorageUpload = async (req, res) => {
  const supabase = createClient({ req, res });

  const user_id = req.query.id;
  const store_bucket_id = req.query.store_bucket_id;

  try {
    // Check if the 'file' field is present in the request
    if (!req.file) {
      return res.status(400).json({ error: 'File not provided' });
    }

    // Access the uploaded file from req.file.buffer
    const file = req.file;

    // Use image-size library to detect the image dimensions
    const detectedImageSize = sizeOf(file.buffer);

    if (!detectedImageSize) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Determine content type based on detectedImageSize.type
    let contentType;
    if (detectedImageSize.type === 'PNG') {
      contentType = 'image/png';
    } else {
      contentType = 'image/jpeg';
    }

    const { data, error } = await supabase.storage
      .from(store_bucket_id)
      .upload(`${user_id}/public/${uuidv4()}`, file.buffer, {
        contentType,
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    
      const fixUrl = `https://hymcbwrcksuwhtfstztz.supabase.co/storage/v1/object/public/`
      const url = fixUrl + data.fullPath

    return res.status(200).json({ message: 'Upload successful', url });
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during fetch: ${error.message}`
    );
  }
};

// Define a route for the Fetch API
router.post('/', handleStorageUpload);

module.exports = router;
