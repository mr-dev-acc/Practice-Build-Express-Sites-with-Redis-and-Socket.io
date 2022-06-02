const express = require('express');
const process = require('process');
const socketio = require('socket.io');

const app = express();

app.get('/', async(req, res, next) => {
	try {
		res.send(`
			<html>
				<head><title>Page</title></head>
				<body>
					<h1>Our Express and Socket.io Web Application</h1>
					<p>Hi, How are you?</p>
					<a href="http://localhost:${process.argv[2] || 5000}/index.html">Click here to say hello!</a>
				</body>
			</html>
		`);
	} catch(err) {
		return next(err);
	}
});

app.use((err, req, res, next) => {
	// console.error('Error:', err);
	res.send(`
		<html>
			<head><title>Page</title></head>
			<body><h1>Our Express and Redis Web Application</h1><p>${err}</p></body>
		</html>
	`);
});

const server = app
.listen(process.argv[2] || 5000)
.on('listening', () => {
    console.log(`Server is running on "http://localhost:${process.argv[2] || 5000}"`);
})
.on('error', (err) => {
    console.error('Server Error:', err);
});;

const io = socketio(server);

app.use(express.static('static'));

io.on('connection', (socket) => {
	socket.on('room.join', (room) => {
		const currentDate = new Date();
		// console.log(socket.rooms);
		Object.keys(socket.rooms).filter((r) => r != socket.id).forEach((r) => socket.leave(r));
		setTimeout(() => {
			socket.join(room);
			socket.emit('event', 'Joined room ' + room);
			socket.broadcast.to(room).emit('event', 'Someone joined room ' + room + ' [Time: ' + currentDate.toLocaleTimeString() + ']');
		}, 0);
	});

	socket.on('event', (e) => {
		const currentDate = new Date();
		socket.broadcast.to(e.room).emit('event', e.name + ' says hello! [Time: ' + currentDate.toLocaleTimeString() + ']');
	});
});