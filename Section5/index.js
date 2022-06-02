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

const namespace1 = io.of('/namespace1');
namespace1.on('connection', (socket) => {
	namespace1.emit('event', 'Connected to Namespace1 *_*');
	setTimeout(() => {
		namespace1.emit('event', 'New message for Namespace1: Hi, Thank you for joining @Namespace1 *_^');
	}, 3000);
	// This is a different namespace
	io.emit('event', 'Normal ^_^');
});

const namespace2 = io.of('/namespace2');
namespace2.on('connection', (socket) => {
	namespace2.emit('event', 'Connected to Namespace2 *_*');
	// This is a different namespace
	io.emit('event', 'Normal ^_^');
});