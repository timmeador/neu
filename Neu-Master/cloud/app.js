var express = require('express');
var moment = require('moment');
var _ = require('underscore');
var md5 = require('cloud/libs/md5.js');
// var ParseCloud = require('cloud/libs/parse-cloud-express');
// var Parse = ParseCloud.Parse;

// Controller code in separate files.
var postsController = require('cloud/controllers/posts.js');
var commentsController = require('cloud/controllers/comments.js');
var adminController = require('cloud/controllers/admin.js');
var aboutController = require('cloud/controllers/about.js');
var vizController = require('cloud/controllers/viz.js');

// Required for initializing Express app in Cloud Code.
var app = express();

// We will use HTTP basic auth to protect some routes (e.g. adding a new blog post)
var basicAuth = express.basicAuth('tim','test');

// The information showed about the poster
var userEmail = 'tjmeador@me.com';
var userDisplayName = 'tim';
var userDescription = 'user desc';

// Instead of using basicAuth, you can also implement your own cookie-based
// user session management using the express.cookieSession middleware
// (not shown here).

app.locals.navigation = ["/posts","/viz/1","/viz/2"];
// Global app configuration section
app.set('views', 'cloud/views');
app.set('view engine', 'ejs');  // Switch to Jade by replacing ejs with jade here.

app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(function(req, res, next) {
  var current,referer;
  var length = app.locals.navigation.length;

  if(req.header('Referer') != undefined){
    referer = req.header('Referer').split("http://neu.parseapp.com")[1];
    current = req.app.locals.navigation.indexOf(referer);

    if(current == -1){
      current = 0;
    }

    console.log("referer: " + referer + " index: " + current);
  }
  else{
    current = 0;
  }

  // console.log("app.locals.nav =" + req.session.locals.navigation);
  // console.log()
  if(req.path == '/next/'){
    if(current < length-1){
      current++;
    }
    else{
      current = 0;
    }

    console.log("redirect next =" + req.app.locals.navigation[current]);
    res.redirect(req.app.locals.navigation[current]);
  }
  else if (req.path == '/prev/'){
    if(current > 0){
      current-=1;
    }
    else{
      current = length-1;
    }

    console.log("redirect next =" + req.app.locals.navigation[current]);
    res.redirect(req.app.locals.navigation[current]);
  }
  else{
    console.log("Path:" + req.path);
    next();
  }
});

app.use(function (req, res, next) {
    res.renderWithData = function (view, model, data) {
        res.render(view, model, function (err, viewString) {
            data.view = viewString;
            res.json(data);
        }); 
    };
    next();
});

// Note that we do not write app.use(basicAuth) here because we want some routes
// (e.g. display all blog posts) to be accessible to the public.

// You can use app.locals to store helper methods so that they are accessible
// from templates.
app.locals._ = _;
app.locals.hex_md5 = md5.hex_md5;
app.locals.userEmail = userEmail;
app.locals.userDisplayName = userDisplayName;
app.locals.userDescription = userDescription;

app.locals.formatTime = function(time) {
  return moment(time).format('MMMM Do YYYY, h:mm a');
};

app.locals.formatMonth = function(time) {
  return moment(time).format('MM.YYYY');
};

// Generate a snippet of the given text with the given length, rounded up to the
// nearest word.
app.locals.snippet = function(text, length) {
  if (text == null){
    return "";
  }
  else if (text.length < length) {
    return text;
  } else {
    var regEx = new RegExp("^.{" + length + "}[^ ]*");
    return regEx.exec(text)[0] + "...";
  }
};

function getColor(req,res,next){
  Parse.Cloud.run('getConfig',{"config_name":"color"}, {
    success: function(results) {
     // console.log("found results: " + JSON.stringify(results));
      res.locals.colorSet = results;
      next();
    },
    error: function(error){
      res.locals.colorSet = "failed to get colorSet";
      next();
    }
  });
}

// Show all posts on homepage
app.get('/', getColor, postsController.index);

// RESTful routes for the blog post object.
app.get('/posts', getColor, postsController.index);
app.get('/posts/new', basicAuth, postsController.new);
app.post('/posts', basicAuth, postsController.create);
app.get('/posts/:id', getColor, postsController.show);
app.get('/posts/:id/edit', basicAuth, postsController.edit);
app.put('/posts/:id', basicAuth, postsController.update);
app.del('/posts/:id', basicAuth, postsController.delete);

// RESTful routes for the blog comment object, which belongs to a post.
app.post('/posts/:post_id/comments', commentsController.create);
app.del('/posts/:post_id/comments/:id', basicAuth, commentsController.delete);

// Route for admin pages
app.get('/admin', basicAuth, adminController.index);
app.get('/admin/posts', basicAuth, adminController.index);
app.get('/admin/comments', basicAuth, commentsController.index);

// app.get('/viz', vizController.index);
app.get('/viz/:slug', getColor, vizController.index);
app.get('/api', vizController.api);

//Route for about page
app.get('/about', getColor, aboutController.index);

// Required for initializing Express app in Cloud Code.
app.listen();

