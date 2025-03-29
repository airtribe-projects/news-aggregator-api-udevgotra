const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const saltRounds = 10
const JWT_SECRET = process.env.JWT_SECRET


const { body, validationResult } = require("express-validator");


const usersModels = require('../models/usermodel')


const validRegistration = [

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // Continue to next middleware or route handler
    }
]


const registerUserHandler = async (req, res) => {


    console.log(`register user handler`)

    const user = req.body
    user.password = bcrypt.hashSync(user.password, saltRounds)


    const isUserExist = await usersModels.findOne({ email: user.email })


    if (!isUserExist) {
        const dbUser = await usersModels.create(user)
        if (!dbUser)
            return res.status(500).json("Cannot register User")
        console.log("User registered successfully!")
        return res.status(201).send(dbUser);
    }
    console.log("User already exists!")
    return res.status(200).send("User already exists!");
}


const loginUserHandler = async (req, res) => {


    console.log("\nlogin user handler !!")


    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })


    const { email, password } = req.body
    console.log(`${email}\n${password}`)


    const dbUser = await usersModels.findOne({ email })

    if (!dbUser) {
        console.log("User does not exists")
        return res.status(500).json("User does not exists")
    }


    console.log(`User found ${dbUser}\n\nmatching password......`)

    //Verifying credentials
    const isMatch = bcrypt.compareSync(password, dbUser.password);


    if (!isMatch) {
        console.log("Incorrect Password!")
        return res.status(500).json("Incorrect Password!")
    }
    console.log("\nPassword matched, User logged in successfully!")


    //update lastloggedIn
    updatelastLoggedIn = await usersModels.findOneAndUpdate(
        { email: email },
        { $set: { "lastLoggedIn": new Date() } }
    );
    if (!updatelastLoggedIn) { return res.status(500).json("Cannot update User lastLoggedIn") }
    console.log(`lastLoggedIn : ${updatelastLoggedIn.lastLoggedIn}`)



    // User successfully logged in, generate JWT token
    const token = jwt.sign({ email: dbUser.email, role: dbUser.role }, JWT_SECRET, { expiresIn: '1h' });


    return res.status(201).send({ token: token });
}


const getPreferencesforAllLoggedInUsers = async (req, res) => {


    console.log(`\n[Admin control] getPreferencesforAllLoggedInUsers handler !!`)


    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })


    const token = req.headers.authorization
    if (!token)
        return res.status(401).json({ error: 'Unauthorized, token needed' });


    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== "admin")
        return res.status(401).json({ error: 'Unauthorized, only admin can access this' });

    console.log("decoded", decoded)

    const usersPreferences = await usersModels.find(
        { role: "user" },
        { preferences: 1, _id: 0 }
    );
    if (!usersPreferences) {
        return res.status(500).json("For some reason, cannot get User preferences")
    }


    return res.status(201).send({ usersPreferences });
}


const validateNewsPreferences = [


    body('catagory')
        .optional().isIn(['business', 'entertainment', 'general',
            'health', 'science', 'sports', 'technology'
        ]).withMessage('Invalid catagory selection Must be "business entertainment general health science sports technology" '),
    body('source')
        .optional().isIn(['*']).withMessage('source(s).'),
    body('language')
        .optional().isIn(['ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl',
            'no', 'pt', 'ru', 'sv', 'ud', 'zh']).withMessage('Invalid language selection'),
    body('country')
        .optional().isIn(['uk', 'usa', 'ind', 'chi', 'jpn']).withMessage('Invalid country selection'),



    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // Continue to next middleware or route handler
    }


]


const updateUserPreferences = async (req, res) => {


    console.log(`updateUserPreferences handler !!`)


    const token = req.headers.authorization
    console.log(`token: ${token}`)


    if (!token) {
        return res.status(401).json({ error: 'Unauthorized, token needed' });
    }


    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("decoded", decoded)


    const getAllPreferences = req.body;


    console.log(`catagory : ${getAllPreferences.catagory}`)
    console.log(`source : ${getAllPreferences.source}`)
    console.log(`language : ${getAllPreferences.language}`)
    console.log(`country : ${getAllPreferences.country}`)

    const updatePreference = await usersModels.findOneAndUpdate(
        { email: decoded.email },
        {
            $addToSet: { "preferences.catagory": { $each: getAllPreferences.catagory } },
            $addToSet: { "preferences.source": { $each: getAllPreferences.source } },
            $set: {
                "preferences.language": getAllPreferences.language,
                "preferences.country": getAllPreferences.country
            }
        },
        { new: true }
    )


    if (!updatePreference)
        return res.status(500).json("Cannot update User preferences")


    return res.status(200).json('Success');
}


module.exports = {
    registerUserHandler, loginUserHandler, getPreferencesforAllLoggedInUsers,
    updateUserPreferences, validRegistration, validateNewsPreferences
};
