const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/users', require('./routers/userRouter'));

const startServer = async () => {
	try {
		await mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.ldgod.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`);
        app.listen(PORT, () => console.log(`Server listens on http://localhost:${PORT}`))
	} catch (error) {
		console.error(error);
	}
}

startServer();