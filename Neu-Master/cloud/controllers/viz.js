var _ = require('underscore');
var Post = Parse.Object.extend('Post');
// var Comment = Parse.Object.extend('Comment');

exports.index = function(req,res){
  var slug = req.params.slug;
  console.log('slug:' + slug);
  var query = new Parse.Query(Post);
  query.descending('createdAt');

  query.find().then(function(posts) {
      res.render('viz/viz' + req.params.slug, { 
        posts: JSON.stringify(posts)
      });
    },
    function() {
      res.send(500, 'Failed loading comments');
    },
  function() {
    res.send(500, 'Failed loading posts');
  });
}

exports.api = function(req, res){
  var query = new Parse.Query(Post);
  query.descending('createdAt');
  query.find().then(function(posts) {
      res.json(posts)
    },
    function() {
      res.send(500, 'Failed loading posts');
  });
}