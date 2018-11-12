var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static("."));

app.get('/', function(req, res){
    res.sendFile(__dirname + 'index.html');
});

let index = 0;

io.on('connection', function(socket){

    io.to(socket.id).emit("token",socket.id);

    socket.on('disconnect', function(){
        io.emit("player_exit",socket.id);
    });

    socket.on('clientUpdate',function(data){
        data.id = socket.id;
        io.emit("player_update",data);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});