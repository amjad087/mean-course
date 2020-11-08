const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user.save()
    .then(result => {
      res.status(201).json({
        message: 'User created!',
        user: result
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Invalid Authentication Credentials!'
      });
    });
  });
}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
  .then(user => {
    if(!user) {
      return res.status(401).json({
        message: 'authentication failed'
      });
    }
    fetchedUser = user;
    return bcrypt.compare(req.body.password, user.password);
  })
  .then(result => {
    if(!result) {
      return res.status(401).json({
        message: 'authentication failed!'
      });
    }
    const token = jwt.sign(
      { email: fetchedUser.email, userId: fetchedUser._id },
      process.env.JWT_KEY ,
      { expiresIn: '1h'}
    );
    const response = {
      message: 'user logged in',
      userId: fetchedUser._id,
      token: token,
      expiresIn: 3600 // in seconds = 1 hr
    }
    // console.log(response);
    res.status(200).json(response);
  })
  .catch(err => {
    res.status(401).json({
      message: 'Invalid Authentication Credentials!'
    });
  });
}