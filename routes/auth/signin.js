const express = require('express')
const router = express.Router()
require('dotenv').config()

const { createClient } = require("../../lib/supabase")

const handleErrorResponse = (res, message) => {
  console.error(message)
  return res.status(500).json({ error: 'Internal Server Error' })
}

const handleSignIn = async (req, res) => {
  const supabase = createClient({ req, res })

  const { email, password } = req.body

  try {
    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    const userSession = {
      id: data.user.id,
      access_token: data.session.access_token,
      token_type: data.session.token_type,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      refresh_token: data.session.refresh_token,
    }

    return res.status(200).json({
      message: 'Account login successfully!',
      session: userSession,
    })
    
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during sign in: ${error.message}`
    )
  }
}

// Define a route for the Login API
router.post('/', handleSignIn)

module.exports = router
