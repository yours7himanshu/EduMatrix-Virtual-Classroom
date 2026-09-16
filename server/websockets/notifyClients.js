/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const WebSocket = require('ws');

const clients = new Set();
let wss = null;

const initWss = () => {
  if (!wss && process.env.NODE_ENV !== 'test') {
    try {
      wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });
      wss.on('connection', (ws) => {
        clients.add(ws);
        ws.on('close', () => {
          clients.delete(ws);
        });
      });
    } catch (e) {
      console.error('Failed to start WebSocket server:', e.message);
    }
  }
  return wss;
};

// Initialize server if not in test environment
initWss();

const notifyClients = (quiz) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(quiz));
    }
  });
};

const closeWss = () => {
  if (wss) {
    wss.close();
    wss = null;
  }
};

module.exports = { notifyClients, closeWss, initWss };
