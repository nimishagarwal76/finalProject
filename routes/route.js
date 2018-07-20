var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user.js');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser =  require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var user_controller = require("../controllers/user.js");
var passport = require('passport');
var sanitize = require('mongo-sanitize');


const authenticationMiddleware = (req, res, next) => {
  if(!req.user)
  {
    // if user is not logged in
    res.redirect('/login');
  }
  else
  {
    next();
  }
}

router.get('/',function(req, res){
  res.redirect('/home')
});

router.get('/logout', user_controller.logout);

router.get('/home', user_controller.home);

router.get('/login', user_controller.login);

router.get('/register',user_controller.register_get);

router.post('/register',user_controller.register_post);

// When the login operation completes, user will be assigned to req.user.
// if authentication fails user is set to false

router.post('/login', passport.authenticate('local', {
  successRedirect: '/entry',
  failureRedirect: '/login',
}));


router.get('/entry',function(req,res){
  res.redirect(req.user.username + '/menu');
});


router.get('/:user/menu', authenticationMiddleware, function(req, res){
  User.findOne({username:req.user.username},{coin:1, _id:0},function(err,result){
    if(err) throw err;

    res.render('menu', { user:req.user.username, coin:result.coin });
  });
});

router.get('/:user/duel', authenticationMiddleware, function(req, res){
  res.render('duel',{ user:req.user.username });
});

router.get('/:user/survival', authenticationMiddleware, function(req, res){
  res.render('survival',{ user:req.user.username });
});


module.exports = router;
