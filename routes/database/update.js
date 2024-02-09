/** @format */

const express = require('express')
const router = express.Router()
require('dotenv').config()

const { createClient } = require('../../lib/supabase')

const handleErrorResponse = (res, message) => {
  console.error(message)
  return res.status(500).json({ error: 'Internal Server Error' })
}

const handleUpdate = async (req, res) => {
  const supabase = createClient({ req, res })

    const store_name_id = req.query.store_name_id
    const store_order_id = req.query.store_order_id

    const { editOrderStatus, editPrice, editStock, editColor, editSize, editName, editProductId, editOrderId } = req.body

  try {

    const { data, error } = await supabase
      .from(store_name_id || store_order_id)
      .update({
        price: editPrice,
        stock: editStock,
        name: editName,
        size: editSize,
        color: editColor,
        status: editOrderStatus,
      })
      .eq('id', editProductId || editOrderId)

    if (error) {
      return res.status(401).json({ error: error.message })
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
router.post('/', handleUpdate)

module.exports = router
