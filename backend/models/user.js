const mongoose = require('mongoose');

//Par sécurité
const uniqueValidator = require('mongoose-unique-validator');

//Schema des données utilisateur
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);