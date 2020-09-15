'use strict';

const fs = require('fs');
const http = require('http');
const Websocket = require('websocket').server;

const index = fs.readFileSync('./index.html', 'utf8');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end(index);
});

server.listen(8000, () => {
  console.log('Listen port 8000');
});

const ws = new Websocket({
  httpServer: server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 100000000,
  maxReceivedMessageSize: 100000000,
});

const clients = [];

ws.on('request', req => {
  const connection = req.accept('', req.origin);
  clients.push({ connection });
  console.log('Connected ' + connection.remoteAddress);
  connection.on('message', message => {
    const dataName = message.type + 'Data';
    const data = message[dataName];
    if (data.startsWith('data:image/jpeg')) {
      const avatar = message[dataName];
      const client = clients.find(obj => obj.connection === connection);
      client['avatar'] = avatar;
    } else {
      const client = clients.find(obj => obj.connection === connection);
      const avatar = client.avatar;
      clients.forEach(client => {
        if (connection !== client.connection) {
          client.connection.send(data + '123456789101112131415' + avatar);
        }
      });
    }
  });
  connection.on('close', (reasonCode, description) => {
    console.log('Disconnected ' + connection.remoteAddress);
    console.dir({ reasonCode, description });
  });
});
