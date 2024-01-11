/** @format */

const express = require('express')
const router = express.Router()
require('dotenv').config()

const { createClient } = require('../../lib/supabase')

const handleErrorResponse = (res, message) => {
  console.error(message)
  return res.status(500).json({ error: 'Internal Server Error' })
}

const handleSignOut = async (req, res) => {
  const supabase = createClient({ req, res })

  try {
    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(200).json({ message: 'Account sign out successfully!' })
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during sign out: ${error.message}`
    )
  }
} 

// Define a route for the Sign out API
router.post('/', handleSignOut)

module.exports = router
