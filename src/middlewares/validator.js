const jwt = require('jsonwebtoken');
const { body, validationResult } = require("express-validator");

const saltRounds = 10//process.env.SALT_ROUNDS
const JWT_SECRET = process.env.JWT_SECRET

const isUserRegistrationValid = [

    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email')
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional().isIn(['admin', 'user']).withMessage('Invalid role. Must be "admin" or "user"'),


    (req, res, next) => {

        console.log("\n[Middleware] isUserRegistrationValid!")


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("[Middleware] isUserRegistrationValid: failed")
            return res.status(400).json({ errors: errors.array() });
        }
        console.log("[Middleware] isUserRegistrationValid: success!")
        next();
    }
]


const isUserloginValid = [
    body('email')
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    (req, res, next) => {
        console.log("\n[Middleware] isUserloginValid")
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("[Middleware] isUserloginValid: failed!")
            return res.status(400).json({ errors: errors.array() });
        }
        console.log("[Middleware] isUserloginValid: success!")
        next(); // Continue to next middleware or route handler
    }
]


const isUserAdmin = (req, res, next) => {


    console.log("\n[Middleware] isUserAdmin")


    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })


    const token = req.headers.authorization
    if (!token) {
        console.log("[Middleware] isUserAdmin: No token found or token expired!")
        return res.status(401).json({ error: 'Unauthorized, token needed' });
    }


    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== "admin") {
        console.log("[Middleware] isUserAdmin: Unauthorized user")
        return res.status(401).json({ error: 'Unauthorized, only admin can access this' });
    }
    console.log("[Middleware] isUserAdmin: Authorized successfully!")
    next();
}


const isUserPreferencesValid = [


    body('query')
        .optional(),
    body('searchIn')
        .optional().isIn(['title', 'description', 'content']).withMessage('Valid searchIn title, description and content'),
    body('language')
        .optional().isIn(['ar', 'gr', 'nl', 'za', 'au', 'hk', 'nz', 'kr'
            , 'at', 'hu', 'ng', 'se', 'be', 'in', 'no', 'ch', 'br'
            , 'id', 'ph', 'tw', 'bg', 'ie', 'pl', 'th', 'ca', 'il'
            , 'pt', 'tr', 'cn', 'it', 'ro', 'ae', 'co', 'jp', 'ru'
            , 'ua', 'cu', 'lv', 'sa', 'gb', 'cz', 'lt', 'rs', 'us'
            , 'eg', 'my', 'sg', 've', 'fr', 'mx', 'sk', 'de', 'ma'
            , 'si'])
        .withMessage('Invalid language selection'),
    body('pageSize')
        .optional().isInt({ min: 1, max: 100 }).withMessage('pageSize not within range'),
    body('sortBy')
        .optional().isIn(['relevancy', 'popularity', 'publishedAt']).withMessage('sortBy is Invalid'),

    (req, res, next) => {
        console.log("\n[Middleware] isUserPreferencesValid")
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log("[Middleware] isUserPreferencesValid: error")
            return res.status(400).json({ errors: errors.array() })
        }
        console.log("[Middleware] isUserPreferencesValid: success!")
        next();
    }

]


const isNewsRequestValid = [


    (req, res, next) => {
        console.log("[Middleware] isNewsRequestValid")
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return res.status(401).json({ errors: errors.array() })


        // check if loggedIn user
        const token = req.headers.authorization
        if (!token) {
            console.log("[Middleware] isNewsRequestValid: Unauthorized, token needed")
            return res.status(401).json({ error: 'Unauthorized, token needed' });
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET)
            req.useremail = decoded.email
            console.log("[Middleware] isNewsRequestValid: token verified!")
            next()
        } catch (err) {
            console.log("[Middleware] isNewsRequestValid: Invalid token");
            return res.status(401).json({ error: 'Unauthorized, invalid token' });
        }
    }
]
module.exports = { isUserRegistrationValid, isUserloginValid, isUserAdmin, isUserPreferencesValid, isNewsRequestValid }
