const messages = [
    {
      id: 'M0000000000001',
      username: "Bob",
      content: "Has anyone seen my marbles?",
    },
    {
      id: 'M0000000000002',
      username: "Anonymous",
      content: "No, I think you lost them. You lost your marbles Bob. You lost them for good."
    }
  ];

const express       = require('express');
const WebSocket     = require('ws');
const SocketServer  = WebSocket.Server;
const uuidv1        = require('uuid/v1');

// Set the port to 3001
const PORT          = process.env.PORT || 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws, req) => {
  console.log('Client connected');

  wss.broadcast(JSON.stringify({type: 'multiMessages', data: messages}));
  // const ip = req.connection.remoteAddress;

  ws.on('open', function open() {
    ws.send(JSON.stringify({type: 'multiMessages', data: messages}));
  });

  ws.on('message', function incoming(message) {
    const jsonData = JSON.parse(message)
    jsonData['id'] = uuidv1();
    messages.push(jsonData);
    wss.broadcast(JSON.stringify({type: 'singleMessage', data:jsonData}));
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});