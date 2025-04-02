const express = require('express')
const router = express.Router()


const handler = require('../controllers/userhandler')
const middleware = require('../middlewares/validator')
router.use(express.json())


router.post('/register', middleware.isUserRegistrationValid, handler.registerUserHandler)
router.post('/login', middleware.isUserloginValid, handler.loginUserHandler)


//protected routes
router.get('/preferences', middleware.isUserAdmin, handler.getPreferencesloggedUsers)  // only admin can do this
router.put('/preferences', middleware.isUserPreferencesValid, handler.updateUserPreferences) // for eg: catagories, language user should be able to do it


module.exports = router