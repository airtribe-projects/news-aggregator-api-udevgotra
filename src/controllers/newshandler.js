require('dotenv').config();
const jwt = require('jsonwebtoken');

const API_KEY = process.env.API_KEY
const JWT_SECRET = process.env.JWT_SECRET

const axios = require('axios');

const { validationResult } = require("express-validator");

const usersModels = require('../models/usermodel')


const news = async (req, res) => {

    // External news api key
    console.log(`[Handler] news handler!`)


    try {
        const user = await usersModels.findOne({ email: req.useremail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log(`[Handler] news: user found, adding preferences..`)
        const { query, searchIn, language, pageSize, sortBy } = user.preferences;

        // TODO, I need to put searchIn as an array, but during update preferences, it's throwing error (string,array type confusion)
        let queryParams = {
            apiKey: API_KEY,
            q: query,
            searchIn: searchIn, //Array.isArray(searchIn) ? searchIn.join(',') : searchIn,
            language: language,
            pageSize: pageSize,
            sortBy: sortBy
        };
        console.log("[Handler] news: queryParams ", queryParams)


        // TODO, I want to do it below way but this gives an 401 unauthorize error ;(
        // const response = await axios.get("https://newsapi.org/v2/everything?apiKey",{
        //     headers: { Authorization: `Bearer ${API_KEY}` },  params: queryParams });


        let url = "https://newsapi.org/v2/everything?apiKey"
        const queryParam_apikey = "=" + queryParams.apiKey
        const queryParam_query = "&q=" + queryParams.q
        const queryParam_searchIn = "&searchIn=" + queryParams.searchIn
        const queryParam_language = "&language=" + queryParams.language
        const queryParam_pageSize = "&pageSize=" + queryParams.pageSize
        const queryParam_sortBy = "&sortBy=" + queryParams.sortBy


        const response = await axios.get(url
            + queryParam_apikey
            + queryParam_query
            + queryParam_searchIn
            + queryParam_language
            + queryParam_pageSize
            + queryParam_sortBy
        )
        //console.log("[Handler] news: response=",response)
        return res.json(response.data);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        return res.status(500).json({ error: "Failed to fetch news" });
    }
}
module.exports = { news }


