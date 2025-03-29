const mongoose = require('mongoose');


// Schema
const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    preferences: {

        catagory: {
            type: Array,
            default: ["general"]
        },
        language: {
            type: String,
            default: "en"
        },
        country: {
            type: String,
            default: "uk"


        },
        source: {
            type: Array,
            default: ["bbc-news"]
        }
    },
    lastLoggedIn: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model('User', usersSchema)
