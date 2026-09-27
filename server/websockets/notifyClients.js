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
const jwt = require('jsonwebtoken');

const clients = new Set();
let wss = null;

// Helper function to parse cookies from raw WS upgrade request
const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString
    .split(';')
    .map((c) => c.trim().split('='))
    .reduce((acc, [k, v]) => {
      if (k) acc[k.toLowerCase()] = v || '';
      return acc;
    }, {});
};

// Helper function to extract token from raw WS incoming request
const extractWsToken = (req) => {
  if (!req) return null;

  // 1. Check Authorization header
  const authHeader = req.headers && req.headers.authorization;
  if (authHeader) {
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  // 2. Check query string in request URL (?token=...)
  if (req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      const qToken = parsedUrl.searchParams.get('token');
      if (qToken && qToken !== 'null' && qToken !== 'undefined') {
        return qToken;
      }
    } catch {
      const queryMatch = req.url.match(/[?&]token=([^&]+)/);
      if (queryMatch) return decodeURIComponent(queryMatch[1]);
    }
  }

  // 3. Check Cookie header
  if (req.headers && req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    const cToken = cookies.token || cookies.jwt;
    if (cToken && cToken !== 'null' && cToken !== 'undefined') {
      return cToken;
    }
  }

  return null;
};

const initWss = () => {
  if (!wss && process.env.NODE_ENV !== 'test') {
    try {
      wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });
      wss.on('error', (e) => {
        console.error('WebSocket server error:', e.message);
      });
      wss.on('connection', (ws, req) => {
        try {
          const token = extractWsToken(req);
          if (!token) {
            ws.close(1008, 'Authentication required');
            return;
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          ws.user = {
            id: (decoded.userId || decoded.collegeId || decoded.id || '').toString(),
            role: decoded.role || 'student',
            institutionId: decoded.institutionId ? decoded.institutionId.toString() : null,
          };

          clients.add(ws);
          ws.on('close', () => {
            clients.delete(ws);
          });
        } catch (e) {
          ws.close(1008, 'Invalid or expired token');
        }
      });
    } catch (e) {
      console.error('Failed to start WebSocket server:', e.message);
    }
  }
  return wss;
};

// Initialize server if not in test environment
initWss();

/**
 * Strips answer-key fields from a quiz payload before sending to clients.
 * Ensures correctAnswer is never exposed via the raw WebSocket channel.
 */
const sanitizeQuizPayload = (quiz) => ({
  _id: quiz._id,
  title: quiz.title,
  description: quiz.description,
  institutionId: quiz.institutionId,
  questions: Array.isArray(quiz.questions)
    ? quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: Array.isArray(q.options) ? q.options : [],
      }))
    : [],
});

const notifyClients = (quiz) => {
  if (!quiz) return;
  const quizInstId = quiz.institutionId ? quiz.institutionId.toString() : null;

  // Hard requirement: quizzes without an institutionId must NOT be broadcast globally.
  // If the caller did not set institutionId, silently skip to prevent data leakage.
  if (!quizInstId) {
    console.warn('notifyClients: quiz missing institutionId — broadcast suppressed to prevent global leak.');
    return;
  }

  // Sanitize before sending: correctAnswer must never reach the WebSocket channel.
  const safePayload = sanitizeQuizPayload(quiz);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.user) {
      // Enforce institutional boundary: deliver only to clients whose institution matches.
      if (client.user.institutionId && client.user.institutionId === quizInstId) {
        client.send(JSON.stringify(safePayload));
      }
    }
  });
};

const closeWss = () => {
  if (wss) {
    wss.close();
    wss = null;
  }
};

module.exports = { notifyClients, closeWss, initWss, extractWsToken, clients };
