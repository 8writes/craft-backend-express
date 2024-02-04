/** @format */

const express = require('express')
const router = express.Router()
const { Pool } = require('pg')
require('dotenv').config()

const { createClient } = require('../../lib/supabase')

// Initialize PostgreSQL pool
const pool = new Pool({
  user: 'postgres.hymcbwrcksuwhtfstztz',
  host: 'aws-0-eu-west-2.pooler.supabase.com',
  database: 'postgres',
  password: 'Ozoemena12@',
  port: 5432,
})

const handleErrorResponse = (res, errorMessage) => {
  console.error(errorMessage)
  return res.status(500).json({ error: errorMessage })
}

const createBucketPolicy = async ({ storeName }) => {
  // Create Row-Level Security (RLS) policy
  const rlsQueryResult = await pool.query(`
    CREATE POLICY select_${storeName}_bucket_partition
    ON storage.objects
    FOR SELECT
    TO anon 
    USING (
      bucket_id = '${storeName}_bucket_partition'
    );

     CREATE POLICY update_${storeName}_bucket_partition
    ON storage.objects
    FOR UPDATE
    TO anon 
    USING (
      bucket_id = '${storeName}_bucket_partition'
    );

    CREATE POLICY delete_${storeName}_bucket_partition
    ON storage.objects
    FOR DELETE
    TO anon 
    USING (
      bucket_id = '${storeName}_bucket_partition'
    );

    CREATE POLICY insert_${storeName}_bucket_partition
    ON storage.objects
    FOR INSERT
    TO anon 
    WITH CHECK (
      bucket_id = '${storeName}_bucket_partition'
    );
  `)

  return { rlsQueryResult }
}

const createProductTable = async ({ storeName }) => {
  const productTableName = `${storeName}_product_partition`
  const productQueryResult = await pool.query(`
    CREATE TABLE IF NOT EXISTS ${productTableName} (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id UUID DEFAULT auth.uid(),
      name TEXT NULL,
      description TEXT,
      price NUMERIC,
      size TEXT[],
      tag TEXT,
      email TEXT,
      stock TEXT,
      date DATE,
      uploaded_image_urls TEXT[]
    );
  `)

  return productQueryResult
}

const createProductPolicy = async ({ storeName }) => {
  // Create Row-Level Security (RLS) policy
  const rlsQueryResult = await pool.query(`
    CREATE POLICY select_from_${storeName}_product_partition
    ON public.${storeName}_product_partition
    AS PERMISSIVE FOR SELECT
    TO anon 
    USING (true);

   ALTER TABLE ${storeName}_product_partition ENABLE ROW LEVEL SECURITY;

   CREATE POLICY update_to_${storeName}_product_partition
    ON public.${storeName}_product_partition
    AS PERMISSIVE FOR UPDATE
    TO anon
    USING ((user_id = user_id))
    WITH CHECK ((user_id = user_id));

    CREATE POLICY delete_from_${storeName}_product_partition
    ON public.${storeName}_product_partition
    AS PERMISSIVE FOR DELETE
     TO anon 
    USING (user_id = user_id);

    CREATE POLICY insert_to_${storeName}_product_partition
    ON public.${storeName}_product_partition
    AS PERMISSIVE FOR INSERT
    TO anon 
    WITH CHECK (true);
  `)

  return { rlsQueryResult }
}

const createOrderTable = async ({ storeName }) => {
  const orderTableName = `${storeName}_order_partition`
  const orderQueryResult = await pool.query(`
    CREATE TABLE IF NOT EXISTS ${orderTableName} (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      full_name TEXT,
      email TEXT,
      address TEXT,
      phone_number TEXT,
      note TEXT,
      price TEXT,
      status TEXT,
      order_info TEXT[],
      order_date DATE,
      reference TEXT
    );
  `)

  return orderQueryResult
}

const createOrderPolicy = async ({ storeName }) => {
  // Create Row-Level Security (RLS) policy
  const rlsQueryResult = await pool.query(`
    CREATE POLICY select_from_${storeName}_order_partition
    ON public.${storeName}_order_partition
    AS PERMISSIVE FOR SELECT
    TO anon 
    USING (true);

    ALTER TABLE ${storeName}_order_partition ENABLE ROW LEVEL SECURITY;

    CREATE POLICY update_to_${storeName}_order_partition
    ON public.${storeName}_order_partition
    AS PERMISSIVE FOR UPDATE
    TO anon
    USING (id = id)
    WITH CHECK (id = id);

    CREATE POLICY delete_from_${storeName}_order_partition
    ON public.${storeName}_order_partition
    AS PERMISSIVE FOR DELETE
     TO anon 
    USING (id = id);

    CREATE POLICY insert_to_${storeName}_order_partition
    ON public.${storeName}_order_partition
    AS PERMISSIVE FOR INSERT
    TO anon 
    WITH CHECK (true);
  `)

  return { rlsQueryResult }
}

const handleSignup = async (req, res) => {
  const supabase = createClient({ req, res })

  const { email, password, firstName, lastName, storeName, tel } = req.body

  // store user

  try {
    // Signup user
    const signUp = await supabase.auth.signUp({
      email,
      password,
      phone: tel,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (signUp.error) {
      console.error(signUp.error)
      return res.status(400).json({ error: signUp.error.message })
    }

    const userId = signUp.data.user.id

    const storeUserResult = await supabase.from('users').insert({
      id: userId,
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      tel,
      trial: true,
      subscription: 'Trial',
      plan_amount: '0',
      product_count: '26',
      plan_validity: 'Lifetime',
      store_name_id: `${storeName}_product_partition`,
      store_order_id: `${storeName}_order_partition`,
      store_bucket_id: `${storeName}_bucket_partition`,
      store_url: `${storeName}.craaft.shop`,
    })

    if (storeUserResult.error) {
      return res.status(400).json({ error: storeUserResult.error.message })
    }

    // Create a storage bucket
    const bucketResult = await supabase.storage.createBucket(
      `${storeName}_bucket_partition`,
      {
        public: true,
        email,
        fileSizeLimit: 1024 * 1024,
      }
    )

    if (bucketResult.error) {
      console.error(
        'Error creating storage bucket:',
        bucketResult.error.message
      )
      return res.status(500).json({ error: 'Error creating storage bucket' })
    }

    const bucketPolicyResult = await createBucketPolicy({ storeName })

    if (bucketPolicyResult.error) {
      console.error(
        'Error creating storage bucket:',
        bucketPolicyResult.error.message
      )
      return res.status(500).json({ error: 'Error creating storage bucket' })
    }

    // Create product table
    const productQueryResult = await createProductTable({ storeName })

    if (productQueryResult.rowCount === 0) {
      return handleErrorResponse(res, 'Error creating product table')
    }

    //create product policy
    const productPolicyResult = await createProductPolicy({ storeName })

    if (productPolicyResult.error) {
      console.error(
        'Error creating product policy:',
        productPolicyResult.error.message
      )
      return res.status(500).json({ error: 'Error creating product policy' })
    }

    // Create order table
    const orderQueryResult = await createOrderTable({ storeName })

    if (orderQueryResult.rowCount === 0) {
      return handleErrorResponse(res, 'Error creating order table')
    }

    //create order policy
    const orderResult = await createOrderPolicy({ storeName })

    if (orderResult.error) {
      console.error('Error creating order policy:', orderResult.error.message)
      return res.status(500).json({ error: 'Error creating order policy' })
    }

    return res.status(200).json({ message: 'Account created successfully!' })
  } catch (error) {
    return handleErrorResponse(
      res,
      `Unexpected error during signup: ${error.message}`
    )
  }
}

router.post('/', handleSignup)

module.exports = router
