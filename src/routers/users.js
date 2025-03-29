const express = require('express')
const router = express.Router()


const handler = require('../controllers/userhandler')
router.use(express.json())




router.post('/register', handler.validRegistration, handler.registerUserHandler)
router.post('/login', handler.loginUserHandler)


//protected routes
router.get('/preferences', handler.getPreferencesforAllLoggedInUsers)  // only admin can do this
router.put('/preferences', handler.validateNewsPreferences, handler.updateUserPreferences) // for eg: catagories, language user should be able to do it


module.exports = router