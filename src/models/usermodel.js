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

        query: {
            type: String,
            default: "latest"
        },
        searchIn: {
            type: String, // TODO, need to change it to Array type
            default: "title"
        },
        language: {
            type: String,
            default: "gb"
        },
        pageSize: {
            type: Number,
            default: 10
        },
        sortBy: {
            type: String,
            default: "publishedAt"
        }
    },
    lastLoggedIn: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('User', usersSchema)
