/** @format */

const express = require('express')
const router = express.Router()
require('dotenv').config()

const { createClient } = require('../../lib/supabase')

const handleErrorResponse = (res, message) => {
  console.error(message)
  return res.status(500).json({ error: 'Internal Server Error' })
}

const handleUser = async (req, res) => {
  const supabase = createClient({ req, res })
  const id = req.query.id; 
  
    try {
      // Get user data using the user_id
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', id)

      if (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message })
      }

      // Return user data in the response
      return res.status(200).json({ message: 'Fetch successful', data })
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during user fetch: ${error.message}`
    )
  }
}

// Define a route for the Get user data API
router.get('/', handleUser)

module.exports = router
