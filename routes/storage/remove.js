/** @format */

const express = require('express')
const router = express.Router()
require('dotenv').config()

const { createClient } = require('../../lib/supabase')

const handleErrorResponse = (res, message) => {
  console.error(message)
  return res.status(500).json({ error: 'Internal Server Error' })
}

const handleRemove = async (req, res) => {
  const supabase = createClient({ req, res })

    const store_bucket_id = req.query.store_bucket_id
  
const modified_urls = req.query.modified_urls.split(',').map(url => url.replace(/https:\/\/hymcbwrcksuwhtfstztz\.supabase\.co\/storage\/v1\/object\/public\/[^/]+\//, ''));

  try {
   
    const { error } = await supabase
      .storage
      .from(store_bucket_id)
      .remove(modified_urls)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Delete successful' })
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during Delete: ${error.message}`
    )
  }
}

// Define a route for the Delete API
router.post('/', handleRemove)

module.exports = router
