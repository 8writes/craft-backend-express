/** @format */

const express = require('express');
const router = express.Router();
require('dotenv').config();

const { createClient } = require('../../lib/supabase');

const handleErrorResponse = (res, message) => {
  console.error(message);
  return res.status(500).json({ error: 'Internal Server Error' });
};

const handleUpdateUser = async (req, res) => {
  const supabase = createClient({ req, res });

  const { plan_validity, subscription, plan_amount, product_count, trial } =
    req.body;

  const id = req.query.id;

  try {
    const { error, data } = await supabase
      .from('users')
      .update({
        subscription: subscription,
        trial: trial,
        plan_validity: plan_validity,
        product_count: product_count,
        plan_amount: plan_amount,
      })
      .eq('id', id);

    if (error) {
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }

    // Return user data in the response
    return res.status(200).json({ message: 'Update successful', data });
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during user update: ${error.message}`
    );
  }
};

// Define a route for the user updating data API
router.post('/', handleUpdateUser);

module.exports = router;
