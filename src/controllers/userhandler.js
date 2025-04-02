const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersModels = require('../models/usermodel')

const { body, validationResult } = require("express-validator");

const saltRounds = 10//process.env.SALT_ROUNDS
const JWT_SECRET = process.env.JWT_SECRET


const registerUserHandler = async (req, res) => {


    console.log(`[Handler] registerUserHandler`)

    const user = req.body
    user.password = bcrypt.hashSync(user.password, saltRounds)


    const isUserExist = await usersModels.findOne({ email: user.email })


    if (!isUserExist) {
        const dbUser = await usersModels.create(user)
        if (!dbUser)
            return res.status(500).json("Cannot register User")
        console.log("[Handler] registerUserHandler: User registered successfully!")
        return res.status(201).send(dbUser);
    }
    console.log("[Handler] registerUserHandler: User already exists!")
    return res.status(200).send("User already exists!");
}


const loginUserHandler = async (req, res) => {


    console.log("[Handler] loginUserHandler!")


    const { email, password } = req.body
    const dbUser = await usersModels.findOne({ email })

    if (!dbUser) {
        console.log("[Handler] loginUserHandler: User does not exists")
        return res.status(500).json("User does not exists")
    }


    console.log(`[Handler] loginUserHandler: User found\n[Handler] loginUserHandler: matching password......`)

    //Verifying credentials
    const isMatch = bcrypt.compareSync(password, dbUser.password);


    if (!isMatch) {
        console.log("[Handler] loginUserHandler: Incorrect Password!")
        return res.status(500).json("Incorrect Password!")
    }
    console.log("[Handler] loginUserHandler: Password matched, User logged in successfully!")


    //update lastloggedIn
    updatelastLoggedIn = await usersModels.findOneAndUpdate(
        { email: email },
        { $set: { "lastLoggedIn": new Date() } }
    );
    if (!updatelastLoggedIn) { return res.status(500).json("Cannot update User lastLoggedIn") }
    console.log(`[Handler] loginUserHandler: lastLoggedIn ${updatelastLoggedIn.lastLoggedIn}`)


    // User successfully logged in, generate JWT token
    const token = jwt.sign({ email: dbUser.email, role: dbUser.role }, JWT_SECRET, { expiresIn: '1h' });


    return res.status(201).send({ token: token });
}


const getPreferencesloggedUsers = async (req, res) => {


    console.log(`[Handler] getPreferencesloggedUsers handler!`)


    const usersPreferences = await usersModels.find(
        { role: "user" },
        { preferences: 1, _id: 0 }
    );
    if (!usersPreferences) {
        console.log("[Handler] getPreferencesloggedUsers: Failed to fetch!, cannot get User preferences, try again later!")
        return res.status(500).json("Failed to fetch!, cannot get User preferences, try again later!")
    }


    console.log(`[Handler] getPreferencesloggedUsers: Users preferences fetched successfully!`)
    return res.status(201).send({ usersPreferences });
}


const updateUserPreferences = async (req, res) => {


    console.log(`[Handler] updateUserPreferences handler!`)


    const token = req.headers.authorization


    if (!token) {
        console.log("[Handler] updateUserPreferences: Unauthorized, token needed")
        return res.status(401).json({ error: 'Unauthorized, token needed' });
    }


    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("[Handler] updateUserPreferences: decoded", decoded)


    const getAllPreferences = req.body;


    //TODO, need to change searchIn to Array type
    //MongoServerError: Plan executor error during findAndModify :: caused by :: Cannot apply $addToSet to non-array field. Field named 'searchIn' has non-array type string

    // const updateFields = {};
    // if (getAllPreferences.searchIn)
    //     updateFields["preferences.searchIn"] = { $each: getAllPreferences.searchIn };


    const updatePreference = await usersModels.findOneAndUpdate(
        { email: decoded.email },
        {
            //...(Object.keys(updateFields).length > 0 && { $addToSet: updateFields }),
            $set: {
                "preferences.searchIn": getAllPreferences.searchIn,
                "preferences.query": getAllPreferences.query,
                "preferences.language": getAllPreferences.language,
                "preferences.pageSize": getAllPreferences.pageSize,
                "preferences.sortBy": getAllPreferences.sortBy
            }
        },
        { new: true }
    )


    if (!updatePreference) {
        console.log("[Handler] updateUserPreferences: Cannot update User preferences")
        return res.status(500).json("Cannot update User preferences")
    }


    console.log(`[Handler] updateUserPreferences: User preferences updated successfully!`)
    return res.status(200).json('Success');
}


module.exports = {
    registerUserHandler, loginUserHandler, getPreferencesloggedUsers,
    updateUserPreferences
};
