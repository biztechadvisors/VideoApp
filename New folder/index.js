var fs = require('fs');
var https = require('https');
const app = require("express")();
var privateKey  = fs.readFileSync('../private.key', 'utf8');
var certificate = fs.readFileSync('../primary.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);


const cors = require("cors");

const io = require("socket.io")(httpsServer, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

app.get('/', (req, res) => {
	res.send('Running');
});

	io.on("connection", (socket) => {

	socket.emit('me',socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		console.log("callUser"+userToCall+" SignalData:-"+signalData+" from:-"+from+" name:-"+name)
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		console.log("data:-"+data +" data.signal:-"+data.signal)
		io.to(data.to).emit("callAccepted", data.signal)
	});
// =========End Socket=====================================================
	});
	httpsServer.listen(5000, () => console.log(`Server is running on port 5000`));
	console.log(`Worker ${process.pid} started in last`);


