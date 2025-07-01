const express = require('express');
// const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/users', require('./routers/userRouter'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


