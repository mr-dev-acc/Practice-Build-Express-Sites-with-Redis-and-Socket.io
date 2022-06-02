const express = require('express');
const process = require('process');
const socketio = require('socket.io');
const redisClient = require('./redisConfig');

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
	socket.broadcast.emit('user.events', 'Someone: joined!');
	socket.on('name', async(name) => {
		await redisClient.set(socket.id, name);
		console.log(name + ': says hello!');
		socket.broadcast.emit('name', name);
	});
	socket.on('disconnect', async() => {
		let user = await redisClient.get(socket.id);
		if(typeof user !== 'string' || user === '')
			user = 'Someone';
		console.log(user + ': left');
		socket.broadcast.emit('user.events', user + ': left');
	});
});