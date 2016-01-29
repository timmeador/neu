var _ = require('underscore');

// Display all posts.
exports.index = function(req, res) {
  res.render('about/index', {});
};