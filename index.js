const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const signupRoutes = require('./routes/auth/signup');
const signinRoutes = require('./routes/auth/signin');
const signoutRoutes = require('./routes/auth/signout');
const userRoutes = require('./routes/auth/fetchuser');
const updateUserRoutes = require('./routes/auth/updateuser');
const fetchRoutes = require('./routes/database/fetch');
const insertRoutes = require('./routes/database/insert');
const deleteRoutes = require('./routes/database/delete');
const updateRoutes = require('./routes/database/update');
const uploadFileRoutes = require('./routes/storage/upload');
const removeRoutes = require('./routes/storage/remove');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const app = express();

// Use middleware to enable CORS
app.use(
  cors({
    origin: ['https://craaft.shop', 'https://craaft.com.ng', 'https://app.craaft.com.ng', 'http://localhost:3001', /\.craaft\.shop$/,],
    methods: 'GET,HEAD,PUT,PATCH,POST,UPDATE,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Use middleware to parse JSON requests
app.use(bodyParser.json());

// Mount the other routes
app.use('/v1/api/signup', signupRoutes);
app.use('/v1/api/login', signinRoutes); 
app.use('/v1/api/signout', signoutRoutes);
app.use('/v1/api/fetchuser', userRoutes);
app.use('/v1/api/fetch', fetchRoutes);
app.use('/v1/api/insert', insertRoutes);
app.use('/v1/api/delete', deleteRoutes);
app.use('/v1/api/update', updateRoutes);
app.use('/v1/api/updateuser', updateUserRoutes);
app.use('/v1/api/uploadfile',  upload.single('file'), uploadFileRoutes);
app.use('/v1/api/remove', removeRoutes);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running`);
});
