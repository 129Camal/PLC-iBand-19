var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');
var axios = require('axios')
var url = require('url')
var fs = require('fs')
const fse = require('fs-extra')
const Work = require('../../models/work');
const Calendar = require('../../models/calendar');
const News = require('../../models/news');
const User = require('../../models/user');
var multer = require('multer')
const bcrypt = require('bcryptjs');

var idmusic = 206


//Set storage engine
const storage = multer.diskStorage({
  destination: './uploaded/',
  filename: (req, file, cb) =>{
    cb(null, file.originalname)

  }
})

//Init Upload
const upload = multer({
  storage: storage
}).array('file', 100)


//Receiving the information of a song
router.post('/repertoire/add/', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
  upload(req, res, (errupl) =>{
    if(!errupl){
      var instrumentos = []
      if(req.body.nome instanceof Array){
        for(var i = 0; i < req.body.nome.length; i++){
          var instrumento = {
            nome: req.body.nome[i],
            partitura:{
              path: req.files[i].originalname,
              voz: req.body.voz[i],
              clave: req.body.clave[i],
              afinacao: req.body.afinacao[i]
            }
          }
          instrumentos.push(instrumento)
        }
      } 
      else {
        var instrumento = {
          nome: req.body.nome,
          partitura:{
            path: req.files[0].originalname,
            voz: req.body.voz,
            clave: req.body.clave,
            afinacao: req.body.afinacao
          }
        }
        instrumentos.push(instrumento)
      }
      var obra = {
        _id: "m" + idmusic,
        titulo: req.body.titulo,
        tipo: req.body.tipo,
        compositor: req.body.compositor,
        arranjo: req.body.arranjo,
        instrumentos: instrumentos
      }
      idmusic++
      //console.log(obra)
      const newWork = new Work(obra)
      newWork.save()
                  .then(work => {
                    if(!fs.existsSync('./uploaded/' + req.body.titulo)){
                      fs.mkdirSync('./uploaded/' + req.body.titulo)
                    }
                    for(var j = 0; j < req.files.length; j++){
                      fs.rename('./uploaded/' + req.files[j].originalname, './uploaded/' + req.body.titulo + '/' +req.files[j].originalname, erro => {
                        if(erro) {
                            console.log("Mudar ficheiro de sitio" + erro)
                        }
                      })
                    }
                    req.flash('success_msg', 'Música registada com sucesso!')
                    res.redirect('/1/repertoire');
                  })
                  .catch(err => {
                    console.log(err)
                    req.flash('error', 'Erro no registo da música!')
                    res.redirect('/1/repertoire');
                  });
    } else {
      console.log(errupl)
    }
  })
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

// homepage
router.get('/', ensureAuthenticated, (req, res) =>{
  if(req.user.userType == 1){
    axios.get('http://localhost:4020/api/news/')
      .then( response => {
       
       res.render('logado1/dashboard', {news: response.data })
      })
      .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.post('/repertoire/updateRem/:id/:titulo', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
  if(!req.body.checkbox) res.redirect('/1/repertoire/update?id=' + req.params.id);
  if(req.body.checkbox instanceof Array){
    
    for(var i = 0; i < req.body.checkbox.length; i++){
      var aux = JSON.parse(req.body.checkbox[i])
      Work.update({ _id: req.params.id }, { "$pull": { "instrumentos": { "_id": new Object(aux._id) } } }, { safe: true }, (err, obj) => {
        if(err){
          req.flash('error', 'Instrumentos não removidos!')
          res.redirect('/1/repertoire/update?id=' + req.params.id);
        } 
      });
      fse.remove('uploaded/' + req.params.titulo +"/"+ aux.partitura.path)
    }   
  } else {
    var aux = JSON.parse(req.body.checkbox)
    Work.update({ _id: req.params.id }, { "$pull": { "instrumentos": { "_id": new Object(aux._id) } } }, { safe: true }, (err, obj) => {
      if(err){
        req.flash('error', 'Instrumento não removido!')
        res.redirect('/1/repertoire/update?id=' + req.params.id);
      } 
    });
    fse.remove('uploaded/' + req.params.titulo +"/"+ aux.partitura.path)
  }
  req.flash('success_msg', 'Instrumentos removidos com sucesso!')
  res.redirect('/1/repertoire/update?id=' + req.params.id);     
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
})

router.post('/repertoire/updateAdd/:id/:titulo', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){

  const uploadUpdate = multer({
  storage: multer.diskStorage({
    destination: './uploaded/' + req.params.titulo +'/' ,
    filename: (req, file, cb) =>{
      cb(null, file.originalname)
    }
  })
  }).array('file', 100) 

  uploadUpdate(req, res, (errupl) =>{
    if(!errupl){
      if(req.body.nome instanceof Array){
        for(var i = 0; i < req.body.nome.length; i++){
          var instrumento = {
          nome: req.body.nome[i],
          partitura:{
            path: req.files[i].originalname,
            voz: req.body.voz[i],
            clave: req.body.clave[i],
            afinacao: req.body.afinacao[i]
          }
        }
          Work.update({ _id: req.params.id }, { "$push": { "instrumentos": instrumento } }, (err, obj) => {
            if(err){
              req.flash('error', 'Instrumento não adicionado!')
              res.redirect('/1/repertoire/update?id=' + req.params.id);
              } 
          });
        }
      } else {
          var instrumento = {
            nome: req.body.nome,
            partitura:{
              path: req.files[0].originalname,
              voz: req.body.voz,
              clave: req.body.clave,
              afinacao: req.body.afinacao
            }
          }
          Work.update({ _id: req.params.id },  { "$push": { "instrumentos": instrumento } }, (err, obj) => {
            if(err){
              req.flash('error', 'Instrumento não adicionado!')
              res.redirect('/1/repertoire/update?id=' + req.params.id);
            }
          });
        }
      console.o  
      req.flash('success_msg', 'Instrumentos adicionados com sucesso!')
      res.redirect('/1/repertoire/update?id=' + req.params.id);    
    } else {
      console.log(errupl)
    }
  })
} else {
  req.flash('error', 'Não tem permissão para ver esta rota!')
  res.redirect('/' + req.user.userType)
}
})

router.get('/repertoire/update', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
  var q = url.parse(req.url, true).query

  if(q.id){ 
    axios.get('http://localhost:4020/api/works/'+ q.id)
          .then( response => {
          res.render('logado1/repertoireUpdate', {obras: response.data })
        })
        .catch( error => { console.log(error)});
  } 
} else {
  req.flash('error', 'Não tem permissão para ver esta rota!')
  res.redirect('/' + req.user.userType)
}
})

//DELETE A SONG MENU
router.get('/repertoire/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
  axios.get('http://localhost:4020/api/works/')
    .then( response => res.render('logado1/repertoireRem', {obras: response.data }))
    .catch( error => { console.log(error)})
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
})

//DELETE A SONG POST
router.post('/repertoire/remove', ensureAuthenticated, function(req, res, next) {  
    //console.log(req.body.checkbox)  
    if(req.user.userType == 1){
    if(req.body.checkbox instanceof Array){
      for(var i = 0; i < req.body.checkbox.length; i++){
          var aux = JSON.parse(req.body.checkbox[i])
          Work.deleteOne({_id:aux._id}, error =>{
            if(error){
              req.flash('error', 'Erro ao remover a música!')
              res.redirect('/1/repertoire/remove');
            }
          })
          //console.log('uploaded/' + aux.titulo)
          fse.remove('uploaded/' + aux.titulo)
      }
    } else {
      var aux = JSON.parse(req.body.checkbox)
      Work.deleteOne({_id:aux._id}, error =>{
        if(error){
          req.flash('error', 'Erro ao remover a música!!')
          res.redirect('/1/repertoire/remove');
        }
      })
      fse.remove('uploaded/' + aux.titulo)
    }
    req.flash('success_msg', 'Música removida com sucesso!')
    res.redirect('/1/repertoire/remove');
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
})

//Render the page to add a song
router.get('/repertoire/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
    res.render('logado1/repertoireAdd');
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});


//All the requests of the repertoire
router.get('/repertoire', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){

    var q = url.parse(req.url, true).query

    if(q.id){ 
      axios.get('http://localhost:4020/api/works/'+ q.id)
            .then( response => {
            //Work.update({_id: q.id}, {$inc: {"nVisualizacao": 1}}, ()=>{})
            res.render('logado1/repertoireSolo', {obras: response.data })
          })
          .catch( error => { console.log(error)
          });
      
    } else if(q.nome && q.path && q.idIns){
        fs.readFile('uploaded/' + q.nome + '/' + q.path, (erro,dados) =>{
        if(!erro){
          //Work.update({"instrumentos._id": new Object(q.idIns)}, {$inc: {"instrumentos.$.nDownloads": 1}}, ()=>{})
          var extension = q.path.split(".");
          if(extension[1] == "pdf"){
            res.contentType("application/pdf")
          } else {
            res.contentType("image/tiff")
          }
          res.send(dados)
        } 
        else {
          req.flash('error', 'Não possuímos esse documento! Pedimos desculpa!')
          res.redirect('http://localhost:4020/1/repertoire')
        }
        })
  
    } else {
      axios.get('http://localhost:4020/api/works/')
      .then( response => res.render('logado1/repertoire', {obras: response.data }))
      .catch( error => { console.log(error)
    });
    }
} else {
  req.flash('error', 'Não tem permissão para ver esta rota!')
  res.redirect('/' + req.user.userType)
}
});

//Information of the band
router.get('/band', ensureAuthenticated, function(req, res, next) {
  res.render('logado1/band');
});

//Noticias
router.get('/news/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
      axios.get('http://localhost:4020/api/news/')
      .then( response => {
       
       res.render('logado1/newsRem', {news: response.data })
      })
      .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.get('/news/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
       res.render('logado1/newsAdd')
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.post('/news/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
    console.log(req.body.checkbox)
    if(req.body.checkbox instanceof Array){
      for(var i = 0; i < req.body.checkbox.length; i++){
        News.deleteOne({_id:new Object(req.body.checkbox[i])}, error =>{
            if(error){
              req.flash('error', 'Erro ao remover a noticia!')
              res.redirect('/1/news');
            }
          })
      }
    } else{
      News.deleteOne({_id:new Object(req.body.checkbox)}, error =>{
        if(error){
          req.flash('error', 'Erro ao remover a noticia!')
          res.redirect('/1/news');
        }
      })
    }
    req.flash('sucess_msg', 'Noticia removida com sucesso!')
    res.redirect('/1/news');
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

//Noticias
router.get('/news', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
      axios.get('http://localhost:4020/api/news/')
      .then( response => {
       
       res.render('logado1/news', {news: response.data })
      })
      .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

//Calendar
router.get('/calendar/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
    res.render('logado1/calendarAdd');
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.post('/calendar/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
  var calendar = {
    nome : req.body.nome,
    data : req.body.data,
    tipo : req.body.tipo,
    local: req.body.local,
    bilhetes: req.body.url
  }
  const newCalendar = new Calendar(calendar)
      newCalendar.save()
                  .then(cal => {
                    req.flash('success_msg', 'Evento registado com sucesso!')
                    res.redirect('/1/calendar');
                  })
                  .catch(err => {
                    console.log(err)
                    req.flash('error', 'Erro ao registar o Evento!')
                    res.redirect('/1/calendar');
                  });
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
  }
});


router.get('/calendar/remove', ensureAuthenticated, function(req, res, next) {
      if(req.user.userType == 1){
      axios.get('http://localhost:4020/api/calendar/')
            .then( response => {
                
                res.render('logado1/calendarRem', {events: response.data })
              })
      .catch( error => { console.log(error)});
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
  }     
});

router.post('/calendar/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
  if(req.body.checkbox instanceof Array){
    for(var i = 0; i < req.body.checkbox.length; i++){
      Calendar.deleteOne({_id:new Object(req.body.checkbox[i])}, error =>{
        if(error){
          req.flash('error', 'Erro ao remover o Evento!')
          res.redirect('/1/calendar');
        }
      })
    }
  } else{
    Calendar.deleteOne({_id:new Object(req.body.checkbox)}, error =>{
      if(error){
        req.flash('error', 'Erro ao remover o Evento!')
        res.redirect('/1/calendar');
      }
    })
  }
  req.flash('sucess_msg', 'Evento adicionado com sucesso!')
  res.redirect('/1/calendar');
} else {
  req.flash('error', 'Não tem permissão para ver esta rota!')
  res.redirect('/' + req.user.userType)
}   
});

router.get('/calendar', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){

  axios.get('http://localhost:4020/api/calendar/')
      .then( response => {
       res.render('logado1/calendar', {events: response.data })
      })
      .catch( error => { console.log(error)});
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    }   
});

router.get('/users/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
         res.render('logado1/usersAdd')
      } else {
        req.flash('error', 'Não tem permissão para ver esta rota!')
        res.redirect('/' + req.user.userType)
      }  
});

router.get('/users/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){

  axios.get('http://localhost:4020/api/users/')
      .then( response => {
       res.render('logado1/usersRem', {users: response.data })
      })
      .catch( error => { console.log(error)});
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    }   
});

router.post('/users/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
    console.log(req.body)
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) console.log(err)
        req.body.password = hash
        console.log(req.body)
        var newUser = new User(req.body)
        newUser.save()
            .then(user =>{
              req.flash('success_msg', 'Utilizador inserido com sucesso!')
              res.redirect('/1/users/');
            })
            .catch(err => {
              req.flash('error', 'Erro ao remover o utilizador!')
              res.redirect('/1/users/');
            })

      });
    });
  } else {
        req.flash('error', 'Não tem permissão para ver esta rota!')
        res.redirect('/' + req.user.userType)
  }  
});

router.post('/users/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
    if(req.body.checkbox instanceof Array){
      for(var i = 0; i < req.body.checkbox.length; i++){
          User.deleteOne({_id:req.body.checkbox[i]}, error =>{
            if(error){
              req.flash('error', 'Erro ao remover o utilizador!')
              res.redirect('/1/users/');
            }
          })
      }
    } else {
      User.deleteOne({_id:req.body.checkbox}, error =>{
        if(error){
          req.flash('error', 'Erro ao remover o utilizador!')
          res.redirect('/1/users/');
        }
      })
    }
    req.flash('success_msg', 'Utilizadores eliminados com sucesso!')
    res.redirect('/1/users/');
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    } 
});

router.get('/users/update', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){

    var q = url.parse(req.url, true).query

    if(q.id){
      axios.get('http://localhost:4020/api/users/'+ q.id)
          .then( response => {
          res.render('logado1/usersUpdate', {users: response.data })
        })
        .catch( error => { console.log(error)
        });
    }} else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    } 
});

router.post('/users/update/:id', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){
    if(req.body.name != '') User.update({_id: new Object(req.params.id)}, {$set: {"name": req.body.name}}, ()=>{})
    if(req.body.email != '' ) User.update({_id: new Object(req.params.id)}, {$set: {"email": req.body.email}}, ()=>{})
    if(req.body.userType != '') User.update({_id: new Object(req.params.id)}, {$set: {"userType": req.body.userType}}, ()=>{})
    if(req.body.password){
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err){
            console.log(err)
            res.redirect('/' + req.user.userType)
          };
          req.body.password = hash
          console.log(req.body.password)
          User.update({_id: new Object(req.params.id)}, {$set: {"password": req.body.password}}, ()=>{})
        });
      });
    }
    req.flash('success_msg', 'Utilizador atualizado com sucesso!');
    res.redirect('/1/users/update?id='+ req.params.id);
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    } 
});

router.get('/users', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){

  axios.get('http://localhost:4020/api/users/')
      .then( response => {
       res.render('logado1/users', {users: response.data })
      })
      .catch( error => { console.log(error)});
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    }   
});

router.get('/information/:id', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){

  axios.get('http://localhost:4020/api/works/' + req.params.id)
      .then( response => {
       res.render('logado1/informationSolo', {obras: response.data })
      })
      .catch( error => { console.log(error)});
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    }   
});

router.get('/information', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 1){

  axios.get('http://localhost:4020/api/works/')
      .then( response => {
       res.render('logado1/information', {obras: response.data })
      })
      .catch( error => { console.log(error)});
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    }   
});



module.exports = router;
