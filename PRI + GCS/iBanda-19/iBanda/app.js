var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
var winston = require('./config/winston')
var morgan = require('morgan')
var fs = require('fs')
const Work = require('./models/work');


var indexRouterAnon = require('./routes/index');
var indexRouterLogged1 = require('./routes/logado1/index')
var indexRouterLogged2 = require('./routes/logado2/index')
var indexRouterLogged3 = require('./routes/logado3/index');
var usersRouter = require('./routes/user');
var usersAPIRouter = require('./routes/api/user');
var worksAPIRouter = require('./routes/api/work');
var newsAPIRouter = require('./routes/api/news')
var calendarAPIRouter = require('./routes/api/calendar')
require('./config/passport')(passport);

var app = express();

//BD Connection
mongoose.connect('mongodb://127.0.0.1:27017/iBanda', {useNewUrlParser:true})
  .then(()=> {
    console.log("Mongo Ready: " + mongoose.connection.readyState)
    //Adicionar os json
    /*fs.readdir('./json/', (erro, files)=>{
      console.log(files)
      files.forEach((file) =>{
        fs.readFile('./json/' + file, (error, dados)=>{
          if(!error){
              //console.log(JSON.parse(dados))
              const newWork = new Work(JSON.parse(dados))
              newWork.save()
                .then(console.log("Sucess a guardar o ficheiro: " + file))
                .catch(err => console.log("Erro a guardar o ficheiro: " + file +"   " + err))

          }
          else{
            console.log("Erro de Read: " + error +" no ficheiro " + file)
          } 
        })
      })
    })*/
  })
  .catch(()=>console.log("Error Connection!")) 

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());
 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(logger('dev'));
app.use(morgan('combined',{ stream: winston.stream }));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', indexRouterAnon);
app.use('/3', indexRouterLogged3);
app.use('/2', indexRouterLogged2);
app.use('/1', indexRouterLogged1);
app.use('/users', usersRouter);
app.use('/api/news', newsAPIRouter)
app.use('/api/calendar', calendarAPIRouter)
app.use('/api/users', usersAPIRouter);
app.use('/api/works', worksAPIRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
