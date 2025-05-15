require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { default: mongoose } = require('mongoose')
const errorMiddlewares = require('./middlewares/error.middlewares')

const app = express()

// Middleware
app.use(express.json())
app.use(cors({ origin: process.env.CLIENT_URL, methods: ["GET", "POST", "PUT", "DELETE"] }))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Salom, Vercel!');
});
app.use('/api/v1', require('./routes/index'))
app.use(errorMiddlewares)

const DB = async () => {
    try {
        const PORT = process.env.PORT || 6000
        mongoose.connect(process.env.MONGO_URL).then(() => console.log("MongoDB connected"))
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
    } catch (error) {
        console.log(error);
    }
}

DB()