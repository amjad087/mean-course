const mongoose = require('mongoose');
const uniqvalidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqvalidator);

module.exports = mongoose.model('User', userSchema);
