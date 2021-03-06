var express = require('express');
var path = require('path');
// var cookieParser = require('cookie-parser');
var bodyParser =  require('body-parser');
// var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var cookieSession = require('cookie-session');
var helmet = require('helmet');
// var MongoDBStore = require('connect-mongodb-session')(session);
var User = require('./models/user.js');
var bcrypt = require('bcryptjs');
var expressSanitizer = require('express-sanitizer');
var socket = require('socket.io');
var fetch = require('node-fetch');
var app = express();
app.use(helmet());

// view engine setup
app.set('view engine','ejs');


// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use('/public',express.static('public'));

//express session



app.use(cookieSession({
  maxAge: 24*60*60*1000,
  keys:['nimishthegreat']
}));

//passport init
app.use(passport.initialize());
app.use(passport.session());

// adding routes
var route = require("./routes/route.js");
app.use('/',route);

//like express middleware telling passport to use local Strategy
passport.use(new LocalStrategy(
function(username, password, done){
  let query = {
    username : username,
  }
  User.findOne(query).then(function(result){
    console.log(result);

    if (result == null)
    {
      return done(null, false);
    }
    else
    {
      console.log(result.password);
      bcrypt.compare(password,result.password,function(err, response){
        if(response === true)
        {
          console.log('done');
          return done(null, result);// passing on the data in the cookie (to serialize)
        }
        else
        {
              return done(null, false);
        }
      })

    }
  });
}
));

 passport.serializeUser(function(user,done){
   //encoding just the id of user
   done(null, user.id);
 })


 passport.deserializeUser(function(id, done){
   //finding user by if that is retrieved from cookie
   User.findById(id).then((user)=>{
     done(null,user);
   });
 })



// set up Mongoose Connection
const mongoose = require('mongoose');
var db = mongoose.connection;

    mongoose.connect('mongodb://localhost/quiz');
    db.once('open', function(){
        console.log('Connection has been made, now make fireworks...');
    }).on('error', function(error){
        console.log('Connection error:', error);
    });

var server = app.listen(3000,() => {
  console.log("app now listening for requests at port 3000");
});

var active = {};
var avail = {};
var room = 0;
var listen;

var io = socket(server);
var nsp = io.of('/survival');
var nspDual = io.of('/');
// functions
var coinUpdate = require('./controllers/coinUpdate');
function questionController(socket, mode)
{
  if(mode == 'survival')
  {
    // counting question Number
    socket.question+=1;


    fetch('https://opentdb.com/api.php?amount=1&type=multiple')
    .then((res)=>{return res.json()})
    .then((data)=>{
      socket.answer = data.results[0].correct_answer;
      var options = data.results[0].incorrect_answers;
      options.splice(Math.floor(Math.random()*3),0,data.results[0].correct_answer);
      var ques = {
        question : data.results[0].question,
        option : options,
        questionNumber : socket.question,
        earned : socket.earned
      };
      console.log('earned',socket.earned);
      socket.emit('chat',{data:ques});
    });
  }
  if(mode == 'dual')
  {
    // counting question Number
          if(!socket.question)
          {
            for (socketID in io.nsps['/'].adapter.rooms[socket.room].sockets) {
              io.nsps['/'].connected[socketID].question=1;
            }
          }
          else
          {
            for (socketID in io.nsps['/'].adapter.rooms[socket.room].sockets)
            {
              io.nsps['/'].connected[socketID].question+=1;
            }
          }

    fetch('https://opentdb.com/api.php?amount=1&type=multiple')
    .then((res)=>{return res.json()})
    .then((data)=>{

      for (socketID in io.nsps['/'].adapter.rooms[socket.room].sockets) {
        io.nsps['/'].connected[socketID].answer = data.results[0].correct_answer;
      }

      var options = data.results[0].incorrect_answers;
      options.splice(Math.floor(Math.random()*3),0,data.results[0].correct_answer);
      // options.push(data.results[0].correct_answer)
      var ques = {
        question : data.results[0].question,
        option : options,
        questionNumber : socket.question,
      };



      for (socketID in io.nsps['/'].adapter.rooms[socket.room].sockets) {
        var info = {
          earned : io.nsps['/'].connected[socketID].earned,
          spend : io.nsps['/'].connected[socketID].spend
        }
        console.log('info',info);
        io.nsps['/'].connected[socketID].emit('chat', {data:ques, info:info})
      }


    });
  }
}

nsp.on('connection', (socket) => {
  console.log('made socket connection namespace', socket.id);
  console.log('survival');
  socket.on('user', function(data, callback){
    console.log(data);

    if(data.user in avail)
    {
      if(avail[data.user] !=  socket)
      {
        callback(false);
      }
    }
    else
    {

      console.log('room event occured');
      console.log('room'+room);
      // console.log('user',data.user);
      avail[data.user] = socket;
      socket.user = data.user;
      socket.earned = 0;
      console.log('in here');
      socket.join('room'+room);
      socket.room = 'room'+room;

        if(!socket.question)
        {
          socket.question = 0;
        }
        console.log('finish');

        questionController(socket, 'survival');
        // setTimeout(()=>{console.log(socket.answer);},3000);

        // socket.emit('play',{question:socket.question});
        ++room;

      callback(true);
    }
  });

  socket.on('check',function(data){
    console.log(data);
    if(data.select==socket.answer)
    {
      socket.earned += 5;
      socket.emit('correct');
    }
    else
    {
      socket.emit('incorrect');
    }
  });

  socket.on('next',function(){
    questionController(socket, 'survival');
  });

  socket.on('gameover',function(){
    User.findOne({username : socket.user},function(err, result){
      if(err) throw err;
      console.log(result);
      result.coin += Number(socket.earned);
      result.save();
    });
    setTimeout(()=>{
      socket.emit('gameover');
    },1000);

  })

  socket.on('disconnect',function(data){
    console.log('disconnected',socket.user);
    delete avail[socket.user];

  });

});


nspDual.on('connection', (socket) => {

  console.log('dual');
  socket.on('user', function(data, callback){
    console.log(data);

    if(data.user in avail)
    {
      if(avail[data.user] != socket)
      {callback(false);}
    }
    else
    {

      console.log('room event occured');
      console.log('room'+room);
      avail[data.user] = socket;
      socket.user = data.user;
      socket.earned = 0;
      socket.spend = 0;
      console.log('i m here');
      socket.join('room'+room);
      socket.room = 'room'+room;
      if(io.nsps['/'].adapter.rooms["room"+room].length == 2)
      {
        questionController(socket, 'dual');
        ++room;
      };

      callback(true);
    }
  });


    socket.on('next',function(data){
        console.log('i m here');
        console.log('question',socket.question);

        if(!socket.question)
        {
          socket.question = 1;
        }

        ///////////////////////////////////////////////
        if(socket.question < 10)
        {
          questionController(socket,'dual');
        }
        else
        {
          //decalre winner
          var temp = io.nsps['/'].connected[socket.id].earned;
          var id = socket.id;

          for (let socketID in io.nsps['/'].adapter.rooms[socket.room].sockets) {
            console.log('earnedTest',io.nsps['/'].connected[socketID].earned);
            coinUpdate(io, socket);

            if(temp < io.nsps['/'].connected[socketID].earned)
            {
              id = socketID;
              console.log('id',id);
            }
          }


          io.nsps['/'].connected[id].broadcast.in(socket.room).emit('gameover',{result : 'lost'});
          setTimeout(()=>{
            io.nsps['/'].connected[id].emit('gameover',{result : 'win'});
          },1000)
        }

      // }

    });

    socket.on('check',function(data){
      console.log(data);
      if(data.select==socket.answer)
      {
        socket.earned += 2;
        socket.emit('correct');
      }
      else
      {
        socket.spend += 1;
        socket.emit('incorrect');
      }
    });

    socket.on('personalMessage',function(data){
      io.sockets.in(socket.room).emit('pMessageServer',{message:data.message,emiter:socket.user});
    });

    socket.on('disconnect',function(data){
      if(socket.question < 10)
      {
        socket.broadcast.in(socket.room).emit('win',{data:'data'});
      }

      console.log(socket.user,socket.earned,socket.spend);
      socket.leave(socket.room);
      console.log('disconnected',socket.user);
      delete avail[socket.user];
    });

});
