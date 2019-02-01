var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');
var axios = require('axios')

// homepage
router.get('/', ensureAuthenticated, (req, res) =>{
  if(req.user.userType == 3){
    axios.get('http://localhost:4020/api/news/')
      .then( response => {
       
       res.render('logado3/dashboard', {news: response.data })
      })
      .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

//All the requests of the repertoire
router.get('/repertoire', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 3){
    axios.get('http://localhost:4020/api/works/')
    .then( response => res.render('logado3/repertoire', {obras: response.data }))
    .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

//Information of the band
router.get('/band', ensureAuthenticated, function(req, res, next) {
  res.render('logado3/band');
});

//Noticias
router.get('/news', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 3){
    axios.get('http://localhost:4020/api/news/')
      .then( response => {
       
       res.render('logado3/news', {news: response.data })
      })
      .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.get('/calendar', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 3){
    axios.get('http://localhost:4020/api/calendar/')
        .then( response => { res.render('logado3/calendar', {events: response.data })})
        .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});


module.exports = router;
