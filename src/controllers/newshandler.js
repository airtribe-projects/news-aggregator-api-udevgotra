require('dotenv').config();
const jwt = require('jsonwebtoken');


const API_KEY = process.env.API_KEY
const JWT_SECRET = process.env.JWT_SECRET


const axios = require('axios');


const { validationResult } = require("express-validator");


const usersModels = require('../models/usermodel')


const newsAPIrequest = async (req, res) => {

    // External news api key
    const NEWS_API_KEY = API_KEY
    console.log(`\n[External API request] newsAPIrequest handler`)


    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(401).json({ errors: errors.array() })


    // check if loggedIn user
    const token = req.headers.authorization
    if (!token)
        return res.status(401).json({ error: 'Unauthorized, token needed' });


    const decoded = jwt.verify(token, JWT_SECRET)
    const useremail = decoded.email


    try {
        const user = await usersModels.findOne({ email: useremail });


        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }


        const { catagory, country, sources, language } = user.preferences;

        let url = `https://newsapi.org/v2/everything?apiKey=${NEWS_API_KEY}`;
        if (catagory) url += `&category=${catagory}`;
        if (country) url += `&country=${country}`;
        if (sources) url += `&sources=${sources}`;
        if (language) url += `&language=${language}`;


        const response = await axios.get(url);
        return res.json(response.data.articles);
    } catch (error) {
        console.error("Error fetching news:", error);
        return res.status(500).json({ error: "Failed to fetch news" });
    }
}
module.exports = { newsAPIrequest }