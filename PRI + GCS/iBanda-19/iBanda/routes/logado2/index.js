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
multer = require('multer')

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
  if(req.user.userType == 2){
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
                    res.redirect('/2/repertoire');
                  })
                  .catch(err => {
                    console.log(err)
                    req.flash('error', 'Erro no registo da música!')
                    res.redirect('/2/repertoire');
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
  if(req.user.userType == 2){
    axios.get('http://localhost:4020/api/news/')
      .then( response => {
       
       res.render('logado2/dashboard', {news: response.data })
      })
      .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.post('/repertoire/updateRem/:id/:titulo', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
  if(!req.body.checkbox) res.redirect('/2/repertoire/update?id=' + req.params.id);
  if(req.body.checkbox instanceof Array){
    
    for(var i = 0; i < req.body.checkbox.length; i++){
      var aux = JSON.parse(req.body.checkbox[i])
      Work.update({ _id: req.params.id }, { "$pull": { "instrumentos": { "_id": new Object(aux._id) } } }, { safe: true }, (err, obj) => {
        if(err){
          req.flash('error', 'Instrumentos não removidos!')
          res.redirect('/2/repertoire/update?id=' + req.params.id);
        } 
      });
      fse.remove('uploaded/' + req.params.titulo +"/"+ aux.partitura.path)
    }   
  } else {
    var aux = JSON.parse(req.body.checkbox)
    Work.update({ _id: req.params.id }, { "$pull": { "instrumentos": { "_id": new Object(aux._id) } } }, { safe: true }, (err, obj) => {
      if(err){
        req.flash('error', 'Instrumento não removido!')
        res.redirect('/2/repertoire/update?id=' + req.params.id);
      } 
    });
    fse.remove('uploaded/' + req.params.titulo +"/"+ aux.partitura.path)
  }
  req.flash('success_msg', 'Instrumentos removidos com sucesso!')
  res.redirect('/2/repertoire/update?id=' + req.params.id);     
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
})

router.post('/repertoire/updateAdd/:id/:titulo', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){

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
              res.redirect('/2/repertoire/update?id=' + req.params.id);
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
              res.redirect('/2/repertoire/update?id=' + req.params.id);
            }
          });
        }
      console.o  
      req.flash('success_msg', 'Instrumentos adicionados com sucesso!')
      res.redirect('/2/repertoire/update?id=' + req.params.id);    
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
  if(req.user.userType == 2){
  var q = url.parse(req.url, true).query

  if(q.id){ 
    axios.get('http://localhost:4020/api/works/'+ q.id)
          .then( response => {
          res.render('logado2/repertoireUpdate', {obras: response.data })
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
  if(req.user.userType == 2){
  axios.get('http://localhost:4020/api/works/')
    .then( response => res.render('logado2/repertoireRem', {obras: response.data }))
    .catch( error => { console.log(error)})
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
})

//DELETE A SONG POST
router.post('/repertoire/remove', ensureAuthenticated, function(req, res, next) {  
    //console.log(req.body.checkbox)  
    if(req.user.userType == 2){
    if(req.body.checkbox instanceof Array){
      for(var i = 0; i < req.body.checkbox.length; i++){
          var aux = JSON.parse(req.body.checkbox[i])
          Work.deleteOne({_id:aux._id}, error =>{
            if(error){
              req.flash('error', 'Erro ao remover a música!')
              res.redirect('/2/repertoire/remove');
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
          res.redirect('/2/repertoire/remove');
        }
      })
      fse.remove('uploaded/' + aux.titulo)
    }
    req.flash('success_msg', 'Música removida com sucesso!')
    res.redirect('/2/repertoire/remove');
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
})

//Render the page to add a song
router.get('/repertoire/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
    res.render('logado2/repertoireAdd');
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});


//All the requests of the repertoire
router.get('/repertoire', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){

  var q = url.parse(req.url, true).query

  if(q.id){ 
    axios.get('http://localhost:4020/api/works/'+ q.id)
          .then( response => {
          Work.update({_id: q.id}, {$inc: {"nVisualizacao": 1}}, ()=>{})
          res.render('logado2/repertoireSolo', {obras: response.data })
        })
        .catch( error => { console.log(error)
        });
    
  } else if(q.nome && q.path && q.idIns){
      fs.readFile('uploaded/' + q.nome + '/' + q.path, (erro,dados) =>{
      if(!erro){
        Work.update({"instrumentos._id": new Object(q.idIns)}, {$inc: {"instrumentos.$.nDownloads": 1}}, ()=>{})
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
        res.redirect('http://localhost:4020/2/repertoire')
      }
      })

  } else {
    axios.get('http://localhost:4020/api/works/')
    .then( response => res.render('logado2/repertoire', {obras: response.data }))
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
  res.render('logado2/band');
});

//Noticias
router.get('/news', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
      axios.get('http://localhost:4020/api/news/')
      .then( response => {
       
       res.render('logado2/news', {news: response.data })
      })
      .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.get('/news/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
      res.render('logado2/newsAdd')
  
    } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

//Noticias
router.get('/news/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
      axios.get('http://localhost:4020/api/news/')
      .then( response => {
       
       res.render('logado2/newsRem', {news: response.data })
      })
      .catch( error => { console.log(error)});
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.post('/news/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
    console.log(req.body.checkbox)
    if(req.body.checkbox instanceof Array){
      for(var i = 0; i < req.body.checkbox.length; i++){
        News.deleteOne({_id:new Object(req.body.checkbox[i])}, error =>{
            if(error){
              req.flash('error', 'Erro ao remover a noticia!')
              res.redirect('/2/news');
            }
          })
      }
    } else{
      News.deleteOne({_id:new Object(req.body.checkbox)}, error =>{
        if(error){
          req.flash('error', 'Erro ao remover a noticia!')
          res.redirect('/2/news');
        }
      })
    }
    req.flash('sucess_msg', 'Noticia removida com sucesso!')
    res.redirect('/2/news');
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

//Calendar
router.get('/calendar/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
    res.render('logado2/calendarAdd');
  } else {
    req.flash('error', 'Não tem permissão para ver esta rota!')
    res.redirect('/' + req.user.userType)
  }
});

router.post('/calendar/add', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
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
                    res.redirect('/2/calendar');
                  })
                  .catch(err => {
                    console.log(err)
                    req.flash('error', 'Erro ao registar o Evento!')
                    res.redirect('/2/calendar');
                  });
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
  }
});


router.get('/calendar/remove', ensureAuthenticated, function(req, res, next) {
      if(req.user.userType == 2){
      axios.get('http://localhost:4020/api/calendar/')
            .then( response => {
                
                res.render('logado2/calendarRem', {events: response.data })
              })
      .catch( error => { console.log(error)});
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
  }     
});

router.post('/calendar/remove', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){
  if(req.body.checkbox instanceof Array){
    for(var i = 0; i < req.body.checkbox.length; i++){
      Calendar.deleteOne({_id:new Object(req.body.checkbox[i])}, error =>{
        if(error){
          req.flash('error', 'Erro ao remover o Evento!')
          res.redirect('/2/calendar');
        }
      })
    }
  } else{
    Calendar.deleteOne({_id:new Object(req.body.checkbox)}, error =>{
      if(error){
        req.flash('error', 'Erro ao remover o Evento!')
        res.redirect('/2/calendar');
      }
    })
  }
  req.flash('sucess_msg', 'Evento adicionado com sucesso!')
  res.redirect('/2/calendar');
} else {
  req.flash('error', 'Não tem permissão para ver esta rota!')
  res.redirect('/' + req.user.userType)
}   
});

router.get('/calendar', ensureAuthenticated, function(req, res, next) {
  if(req.user.userType == 2){

  axios.get('http://localhost:4020/api/calendar/')
      .then( response => {
       
       res.render('logado2/calendar', {events: response.data })
      })
      .catch( error => { console.log(error)});
    } else {
      req.flash('error', 'Não tem permissão para ver esta rota!')
      res.redirect('/' + req.user.userType)
    }   
});


module.exports = router;
