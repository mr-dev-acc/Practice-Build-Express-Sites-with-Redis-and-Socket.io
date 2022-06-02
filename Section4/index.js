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
	const now = Date.now();
	console.log(now);
	if((now % 2) == 0) {
		socket.join('even');
	} else {
		socket.join('odd');
	}
	io.to('even').emit('event', 'Even Room: ' + now);
	io.to('odd').emit('event', 'Odd Room: ' + now);
	setTimeout(() => {
		io.to('even').emit('event', 'Even Room ^_^');
		io.to('odd').emit('event', 'Odd Room *_*');
		setTimeout(() => {
			io.to('even').emit('event', 'Thank you for joining @Even room ^_*');
			io.to('odd').emit('event', 'Thank you for joining @Odd room *_^');
		}, 3000);
	}, 4000);
});