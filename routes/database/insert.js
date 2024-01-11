/** @format */

const express = require('express');
const router = express.Router();
require('dotenv').config();

const { createClient } = require('../../lib/supabase');

const handleErrorResponse = (res, message) => {
  console.error(message);
  return res.status(500).json({ error: 'Internal Server Error' });
};

const handleInsert = async (req, res) => {
  const supabase = createClient({ req, res });

  
  const store_name_id = req.query.store_name_id;
  const store_order_id = req.query.store_order_id;
  const { formData, payload } = req.body;


  try {
    // Insert data into the table
    
      const { error } = await supabase
        .from(store_name_id || store_order_id )
        .insert(formData || payload)

      if (error) {
        return res.status(400).json({ error: error.message });
      }

    return res.status(200).json({ message: 'Insert successful' });
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during Insert: ${error.message}`
    );
  }
};

// Define a route for the Insert API
router.post('/', handleInsert);

module.exports = router;
