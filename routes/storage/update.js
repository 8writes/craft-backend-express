/** @format */

const express = require('express')
const router = express.Router()
require('dotenv').config()

const { createClient } = require('../../lib/supabase')

const handleErrorResponse = (res, message) => {
  console.error(message)
  return res.status(500).json({ error: 'Internal Server Error' })
}

const handleUpdateStorage = async (req, res) => {
    const supabase = createClient({ req, res })
    
 const store_bucket_id = req.query.store_bucket_id;

  try {
      const { data, error } = await supabase.storage
          .from(store_bucket_id)
          .update({
              
          })
          .eq('id', id)
      
      if (error) {
          console.log(error.message)
      return res.status(500).json({ error: error.message })
      }
      
    // Return user data in the response
    return res.status(200).json({ message: 'Update successful', data })
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during user update: ${error.message}`
    )
  }
}

// Define a route for the user updating data API
router.post('/', handleUpdateStorage)

module.exports = router
