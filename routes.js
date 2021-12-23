const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, myDataBase) {
    
      //Homepage
    app.route('/').get((req, res) => {
      res.render(process.cwd() + '/views/pug', {
        title: 'Connected to Database',
        message: 'Please login',
        showLogin: true,
        showRegistration: true,
        showSocialAuth: true
      });
    });

    //Login
    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/profile');
    });

    app.route('/profile').get(ensureAuthenticated, (req, res) => {
      res.render(process.cwd() + '/views/pug/profile', { username: req.user.username });
    });

    app.route('/chat').get(ensureAuthenticated, (request, response) => {
      response.render(process.cwd() + '/views/pug/chat.pug', { user: req.user })
    });

    //Logout
    app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
  });

  //Registration
  app.route('/register').post((req, res, next) => {

    //password encrption.
    const hash = bcrypt.hashSync(req.body.password, 12);

    myDataBase.findOne({username: req.body.username}, (err, user) => {
      if (err) {
        next(err);
      }else if (user) {
        res.redirect('/');
      }else {
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
        (err, doc) => {
          if (err) {
            res.redirect('/');
          }else {
            next(null, doc.ops[0]);
          }
        });
      }
    });
  },
  passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
    res.redirect('/profile');
  }
  );

  app.route('/auth/github').get(passport.authenticate('github'));
  app.route('/auth/github/callback').get(passport.authenticate('github', {failureRedirect: '/'}), (request, response) => {
    request.session.user_id = request.user.id;
    response.redirect('/chat');
  });

  

  //code for the file not found.
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

    //middleware
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect('/');
      }
  



  

}