const express = require('express')
const router = express.Router()


const handler = require('../controllers/newshandler')
router.use(express.json())




router.get('/', handler.newsAPIrequest)
module.exports = router