require('dotenv').config()
const PORT = process.env.PORT


const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./src/routers/users');
const newsRouter = require('./src/routers/news');


const app = express();


app.use('/users', userRouter);
app.use('/news', newsRouter);


app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB")
        app.listen(PORT, () => {
            console.log(`Server is up and running!`)
        })
    })


module.exports = app;