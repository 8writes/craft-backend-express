/** @format */

const express = require('express')
const router = express.Router()
require('dotenv').config()

const { createClient } = require('../../lib/supabase')

const handleErrorResponse = (res, message) => {
  console.error(message)
  return res.status(500).json({ error: 'Internal Server Error' })
}

const handleFetchData = async (req, res) => {
    const supabase = createClient({ req, res })

  const store_name_id = req.query.store_name_id; 
  const store_order_id = req.query.store_order_id; 
  

  try {
    // Fetch data from table
    
      const { data, error } = await supabase
        .from(store_name_id || store_order_id)
      .select()

      if (error) {
        return res.status(400).json({ error: error.message })
    }
        
         return res.status(200).json({ message: 'Fetch successful', data })
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during fetch: ${error.message}`
    )
  }
}

// Define a route for the Fetch API
router.get('/', handleFetchData)

module.exports = router
