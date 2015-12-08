// Furball server entry point - run with Node.js
// Copyright (c) 2015 Hans Jorgensen, Betafreak Games

var express = require("express");
var app = express();
app.use(express.static("game"));

var http = require("http").Server(app);
var io = require("socket.io")(http);

io.on("connection", function(socket) {
	console.log("User connected to socket");
	
});

http.listen("8001", function() {
	console.log("Furball server live on *:8001");
});