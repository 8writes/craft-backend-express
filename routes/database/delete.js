/** @format */

const express = require('express')
const router = express.Router()
require('dotenv').config()

const { createClient } = require('../../lib/supabase')

const handleErrorResponse = (res, message) => {
  console.error(message)
  return res.status(500).json({ error: 'Internal Server Error' })
}

const handleDelete = async (req, res) => {
  const supabase = createClient({ req, res })

  const id = req.query.id
  const store_name_id = req.query.store_name_id
  const store_order_id = req.query.store_order_id

  try {
    // Delete data from table

    const { error } = await supabase
      .from(store_name_id || store_order_id)
      .delete()
      .eq('id', id)

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
router.post('/', handleDelete)

module.exports = router
