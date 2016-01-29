var _ = require('underscore');
var moment = require('moment');
var Post = Parse.Object.extend('Post');
var Comment = Parse.Object.extend('Comment');

// Display all posts.
exports.index = function(req, res) {
  // res.locals.colorSet = "test";
 
  // Parse.Cloud.run('getConfig',{"config_name":"color"}, {
  //   success: function(results) {
  //     res.locals.colorSet = results;

      var query = new Parse.Query(Post);
      // query.descending('createdAt');
      query.descending('date');
      query.include("icons");
      query.find().then(function(results) {
        //loop based on month of createdAt field. render each month into separate template.

        var months = _(results).map(function(post) {
          var date = post.get('date');

          var dateFormated = moment(date).format('MM.YYYY');
          var mmm = moment(date).format('MMM');
          var mm = moment(date).format('MMYYYY');
          var year = moment(date).format('YYYY');

          return {'date':dateFormated,'mm':mm,'mmm':mmm,'year':year}
        });
        
        months = _.groupBy(months,function(post){ 
          return post.date;
        });

        months = _.map(months, function(month,date){
          if (month.length == 1) {
            month.length = 2;
          }
          
          return {'name':date, 'height':month.length,'mm':month[0].mm,'mmm':month[0].mmm,'year':month[0].year};
        });

        var months = _(months).chain()
        .sortBy('mm')
        .sortBy('year')
        .reverse()
        .value();

        res.render('posts/index', {
          posts: results,
          months: months
        });
        
      },
      function() {
        res.send(500, 'Failed loading posts');
      });
    
  //   },
  //   error: function(error){
  //     res.send(500, error);
  //   }
  // });
};

// Display a form for creating a new post.
exports.new = function(req, res) {
  res.render('posts/new', {});
};

// Create a new post with specified title and body.
exports.create = function(req, res) {
  var post = new Post();

  // Explicitly specify which fields to save to prevent bad input data
  post.save(_.pick(req.body, 'title', 'body')).then(function() {
    res.redirect('/posts');
  },
  function() {
    res.send(500, 'Failed saving post');
  });
};

// Show a given post based on specified id.
exports.show = function(req, res) {
  var postQuery = new Parse.Query(Post);
  var foundPost;
  postQuery.get(req.params.id).then(function(post) {
    if (post) {
      foundPost = post;
      var commentQuery = new Parse.Query(Comment);
      commentQuery.equalTo('post', post);
      commentQuery.descending('createdAt');
      return commentQuery.find();
    } else {
      return [];
    }
  }).then(function(comments) {
    res.render('posts/show', {
      post: foundPost,
      comments: comments
    });
  },
  function() {
    res.send(500, 'Failed finding the specified post to show');
  });
};

// Display a form for editing a specified post.
exports.edit = function(req, res) {
  var query = new Parse.Query(Post);
  query.get(req.params.id).then(function(post) {
    if (post) {
      res.render('posts/edit', { 
        post: post
      })
    } else {
      res.send('specified post does not exist')
    }
  },
  function() {
    res.send(500, 'Failed finding post to edit');
  });
};

// Update a post based on specified id, title and body.
exports.update = function(req, res) {
  var post = new Post();
  post.id = req.params.id;
  
  console.log(_.pick(req.body, 'title', 'body','justify'));

  post.save(_.pick(req.body, 'title', 'body','justify')).then(function() {
    res.redirect('/posts/' + post.id);
  },
  function() {
    res.send(500, 'Failed saving post');
  });
};

// Delete a post corresponding to the specified id.
exports.delete = function(req, res) {
  var post = new Post();
  post.id = req.params.id;
  
  var query = new Parse.Query(Comment)
  query.equalTo("post", post)
  query.find().then(function(results) {
    results.push(post)
    return Parse.Object.destroyAll(results)
  }).then(function () {
    res.redirect('/posts')
  }, function() {
    res.send(500, 'Failed deleting post')
  })
};
