const WebSocket = require("ws");

const ws = new WebSocket("ws://127.0.0.1:8080/positionBroadcaster");

ws.on("open", function() {
  console.log("ws connected...");
});

ws.on("message", function(data) {
  console.log(data);
});
