const passport = require('passport');

module.exports = {
  Login function login: function(req, res){
    passport.authenticate('local', function(err, user, info){
      if(err || !user){
        return res.send({message: info.message, user});
      }

      req.login(user, function(err){
        if (err) 
          res.send(err);
        sails.log('User '+user.id+' has logged in.');
        return res.redirect('/');
      })
    })(req, res);
  },

  //Logout
  function logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },


  //Register
  function register: function(req, res){
    //TODO: form validation here
    data =
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
      }
    console.log(data);

    User.create(data).fetch().exec(function(err, user){
      if (err) 
        return res.negoiate(err);
      console.log(user);

      //TODO: Maybe send confirmation email to the user before login
      req.login(user, function(err){
        if (err) 
          return res.negotiate(err);
        sails.log('User '+ user.id +' has logged in.');
        return res.redirect('/');
      })
    })
  }
};
