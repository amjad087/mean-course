const path = require('path');
const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");

const app = express();

mongoose.connect("mongodb+srv://khan:"+ process.env.MONGO_DB_PWD + "@cluster0.aqwgi.mongodb.net/mean-course?retryWrites=true&w=majority")
  .then(() => {
    console.log('Database connected successfully!');
  })
  .catch((error) => {
    console.log('Database connection failed: ' + error);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(express.static('./images'));
app.use("/images", express.static(__dirname + '/images'));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  next();
});

app.use("/api/posts", postsRoutes);
app.use('/api/auth', userRoutes);
module.exports = app;
