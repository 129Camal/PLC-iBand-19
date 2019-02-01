var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');
const { ensureAuthenticated } = require('../config/auth');

router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({email:email})
      .then(user =>{
        if(user){
          req.flash('error', 'Email already in use!')
          res.redirect('/users/register');
        } else {
          if(password.length < 6){
            req.flash('error', 'Password must have at least 6 caracteres!')
            res.redirect('/users/register');
          } else{

            var userType = 3;
            const newUser = new User({name, email, password, userType})
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save()
                  .then(user => {
                    req.flash('success_msg', 'Estás registado! Podes iniciar sessão!')
                    res.redirect('/users/login');
                  })
                  .catch(err => console.log(err));
              });
            });
          }
        }
      })
}); 

//Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, () => {
    if(req.user.userType){
      res.redirect('http://localhost:4020/' + req.user.userType)
    } else {
      req.flash('error', 'Conta Inválida!');
      res.redirect('/users/login');
    }
  })
});

router.get('/changePassword', ensureAuthenticated,(req, res, next) =>{
  if(req.user.userType == 3) res.render('logado3/userPassword');
  if(req.user.userType == 2) res.render('logado2/userPassword');
  if(req.user.userType == 1) res.render('logado1/userPassword')
})

router.post('/changePassword', ensureAuthenticated, (req, res, next) =>{
  var nova
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.nova, salt, (err, hash) => {
      if (err){
        console.log(err)
        res.redirect('/' + req.user.userType)
      };
      nova = hash
      console.log(nova)
      console.log(req.user._id)
      User.update({_id: new Object(req.user._id)}, {$set: {"password": nova}}, () =>{
        req.flash('success_msg', 'Palavra-Passe alterada com sucesso!');
        res.redirect('/' + req.user.userType);
      })
      
    });
  });
  

})

// Logout
router.get('/logout', ensureAuthenticated,(req, res) => {
  req.logout();
  req.flash('success_msg', 'Logout efetuado com sucesso!');
  res.redirect('/users/login');
});

module.exports = router;
