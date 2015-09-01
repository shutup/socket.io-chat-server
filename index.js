var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
res.sendFile(__dirname+'/index.html');
});

var count =0;
io.on('connection', function(socket){
	console.log('a user connected');
	console.log('total person is '+ ++count);

	socket.on('add user',function(name){
		console.log('add user '+name.name);
		socket.name = name.name;
	});

	socket.on('join group',function(data){
		var room =data.room;
		var name =socket.name; 
		socket.room=room;
		console.log(name+' join group:'+room);
		socket.join(room);
		socket.broadcast.to(room).emit('user joined',{'name':name});
		socket.on(room,function(data){
			var msgdata =data.data;
			var time=data.time;
			console.log(time +'-->'+room+' recv:' +msgdata);
			console.log(time +'-->'+room+' recv:' +msgdata.msg);
			socket.broadcast.to(room).emit(room,data);
		});
	});

	socket.on('leave group',function(data){
		var room =data.room;
		var name =socket.name;
		socket.leave(room);
		socket.broadcast.to(room).emit('user left',{'name':name});
		console.log(name +' leave group:'+data.room)
	});

	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	//io.emit('chat message', msg);
		socket.broadcast.emit('chat message','hi,'+msg);  
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
		console.log('total person is '+ --count);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});