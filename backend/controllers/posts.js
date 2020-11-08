const Post = require("../models/post");

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });

  post.save()
  .then(result => {
    res.status(201).json({
      message: 'Post Added Successfully!',
      createdPost: result
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Could not save post!'
    })
  });
}

exports.updatePost = (req, res, next) => {
  let imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  } else {
    imagePath = req.body.image;
  }
  //console.log(imagePath);
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });

  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post)
  .then(result => {
    if (result.n > 0) {
      res.status(200).json({message: 'post updated!', post: result});
    } else {
      res.status(401).json({
        message: 'not authorized'
      })
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Could not update post!'
    })
  });
}

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currPage = +req.query.page;
  const postQuery = Post.find();
  let fecthedPosts;
  if(pageSize && currPage) {
    postQuery
    .skip(pageSize * (currPage - 1))
    .limit(pageSize)
  }
  postQuery
    .then(docs => {
      fecthedPosts = docs;
      return Post.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fecthed successfully!',
        posts: fecthedPosts,
        totalPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Could not get posts!'
      })
    });
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if(post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found!'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Could not get post!'
    })
  });
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({message: 'post deleted!'});
      } else {
        res.status(401).json({
          error: 'not authorized'
        })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Could not delete the post!'
      })
    });
}

