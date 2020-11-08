const express = require("express");

const checkAuth = require('../middleware/check-auth');
const fileExtract = require('../middleware/file');

const postsController = require('../controllers/posts');

const router = express.Router();

router.post ("", checkAuth, fileExtract, postsController.createPost);

router.put("/:id", checkAuth, fileExtract, postsController.updatePost);

router.get ("", postsController.getPosts);

router.get("/:id", postsController.getPost);

router.delete("/:id", checkAuth, postsController.deletePost);

module.exports = router;
