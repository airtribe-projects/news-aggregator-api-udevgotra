const express = require('express')
const router = express.Router()

const handler = require('../controllers/newshandler')
const middleware = require('../middlewares/validator')
router.use(express.json())

router.get('/', middleware.isNewsRequestValid, handler.news)
module.exports = router