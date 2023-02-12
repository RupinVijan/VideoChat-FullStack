const app = require("express")();
const express = require("express");
const server = require("http").createServer(app);
const cors = require("cors");
const { disconnect } = require("process");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});
app.use(express.json())
app.use(cors());

const PORT = process.env.PORT || 5002;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	// console.log(socket,'socket');
	console.log(socket.id, "Connection")
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		console.log("disconnect")
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name, userName }) => {
		console.log({userToCall, from, name, userName} , "callUser")
		io.to(userToCall).emit("callUser", { signal: signalData, from, name, userName });
	})
	socket.on("callUserAdd", (userToCall) => {
		console.log(userToCall, "callUserAdd")
		// io.to(userToCall).emit("callUserAdd", userToCall);
		socket.emit("callUserAdd", userToCall);

	})

	socket.on("answerCall", (data) => {
		// console.log(data.signal,'anserCall')
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
