const path = require('path')
  , express = require('express')
  , app = module.exports = express.createServer()
  , port = process.env.PORT || 1337
;

/** Configuration */
app.configure(function() {
  this.set('views', path.join(__dirname, 'views'));
  this.set('view engine', 'ejs');
  this.use(express.static(path.join(__dirname, '/public')));
  this.use(express.cookieParser());
  this.use(express.bodyParser());
  this.use(express.session({
    "secret": "Bobobob",
    "store":  new express.session.MemoryStore({ reapInterval: 60000 * 10 }))
  }));
});

app.configure('development', function(){
  this.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  this.use(express.errorHandler());
});

/** Routes */
app.get('/', function (req, res, next) {
  res.render('index');
});
//session index
app.get('/session-index', function (req, res, next) {
  //Increment "index" in session
  req.session.index = (req.session.index || 0) + 1;
  // View "session-index.ejs"
  res.render('session-index', {
    "index":  req.session.index,
    "sessId": req.sessionID
  });
});

function requireLogin (req, res, next) {
  if (req.session.username) {
    // User is authenticated, let him in
    next();
  } else {
    // Otherwise, we redirect him to login form
    res.redirect("/login");
  }
}

/** Home page (requires authentication) */
app.get('/', [requireLogin], function (req, res, next)
  {
    res.render('index');
  });
/*app.get('/', function (req, res, next) {
  if (req.session.username) {
    //User is authenticated, let him in
    res.render('index');
  } else {
    // Otherwise we redirect him to login form
    res.redirect("/login");
  }
});*/
    /** Login form */
    app.get("/login", function (req, res) {
      // Show form, default value = current username
      res.render("login", { "username": req.session.username, "error": null
      });
    });
app.post("/login", function (req, res) {
  var options = { "username": req.body.username, "error": null };
  if (!req.body.username) {
    options.error = "User name is required";
    res.render("login", options);
  } else if (req.body.username == req.session.username) {
    // User has not changed username, accept it as-is
    res.redirect("/");
  } else if (!req.body.username.match(/^[a-zA-Z0-9\-_]{3,}$/)) {
    options.error = "User name must have at least 3 alphanumeric characters";
    res.render("login", options);
  } else {
    // Validate if username is free
    req.sessionStore.all(function (err, sessions) {
      if (!err) {
        var found = false;
        for (var i=0; i<sessions.length; i++) {
          var session = JSON.parse(sessions[i]); // Si les sessions sont stockées en JSON
          if (session.username == req.body.username) {
            err = "User name already used by someone else";
            found = true;
            break;
          }
        }
      }
      if (err) {
        options.error = ""+err;
        res.render("login", options);
        if (usernameIsAlreadyUsed) {
          options.error = "User name is already used by someone else";
          res.render("login", options);
        } else {
          req.session.username = req.body.username;
          res.redirect("/");
        }
      }
    });
    /** Start server */
    if (!module.parent) {
      app.listen(port)
    }
