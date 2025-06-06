const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');

function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getUserByToken(token) {
  const users = readJSON(USERS_FILE);
  return users.find(u => u.tokens && u.tokens.includes(token));
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const users = readJSON(USERS_FILE);
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'User exists' });
  }
  const id = users.length ? users[users.length - 1].id + 1 : 1;
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const token = crypto.randomBytes(16).toString('hex');
  const user = { id, username, password: hash, tokens: [token] };
  users.push(user);
  writeJSON(USERS_FILE, users);
  res.json({ token });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (user.password !== hash) return res.status(400).json({ error: 'Invalid credentials' });
  const token = crypto.randomBytes(16).toString('hex');
  user.tokens.push(token);
  writeJSON(USERS_FILE, users);
  res.json({ token });
});

app.post('/api/check', (req, res) => {
  const token = req.headers['x-token'];
  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Not authorized' });
  const { text, link } = req.body;
  if (!text && !link) return res.status(400).json({ error: 'Missing data' });
  const submissions = readJSON(SUBMISSIONS_FILE);
  const id = submissions.length ? submissions[submissions.length - 1].id + 1 : 1;
  const data = text || link;
  const isFake = /fake/i.test(data);
  const result = isFake ? 'fake' : 'real';
  const submission = { id, userId: user.id, text, link, result, date: new Date().toISOString() };
  submissions.push(submission);
  writeJSON(SUBMISSIONS_FILE, submissions);
  res.json({ result, submission });
});

app.get('/api/submissions', (req, res) => {
  const submissions = readJSON(SUBMISSIONS_FILE);
  res.json(submissions);
});

app.post('/api/comment', (req, res) => {
  const token = req.headers['x-token'];
  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Not authorized' });
  const { submissionId, text } = req.body;
  const comments = readJSON(COMMENTS_FILE);
  const id = comments.length ? comments[comments.length - 1].id + 1 : 1;
  const comment = { id, userId: user.id, submissionId, text, date: new Date().toISOString() };
  comments.push(comment);
  writeJSON(COMMENTS_FILE, comments);
  res.json(comment);
});

app.post('/api/vote', (req, res) => {
  const token = req.headers['x-token'];
  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Not authorized' });
  const { submissionId, vote } = req.body; // vote: 1 or -1
  const votes = readJSON(VOTES_FILE);
  const id = votes.length ? votes[votes.length - 1].id + 1 : 1;
  const v = { id, userId: user.id, submissionId, vote, date: new Date().toISOString() };
  votes.push(v);
  writeJSON(VOTES_FILE, votes);
  res.json(v);
});

app.get('/api/user', (req, res) => {
  const token = req.headers['x-token'];
  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Not authorized' });
  const submissions = readJSON(SUBMISSIONS_FILE).filter(s => s.userId === user.id);
  const comments = readJSON(COMMENTS_FILE).filter(c => c.userId === user.id);
  const votes = readJSON(VOTES_FILE).filter(v => v.userId === user.id);
  res.json({ user: { id: user.id, username: user.username }, submissions, comments, votes });
});

app.delete('/api/user', (req, res) => {
  const token = req.headers['x-token'];
  let users = readJSON(USERS_FILE);
  const user = users.find(u => u.tokens && u.tokens.includes(token));
  if (!user) return res.status(401).json({ error: 'Not authorized' });
  users = users.filter(u => u.id !== user.id);
  writeJSON(USERS_FILE, users);

  const clean = file => {
    const arr = readJSON(file).filter(x => x.userId !== user.id);
    writeJSON(file, arr);
  };
  [SUBMISSIONS_FILE, COMMENTS_FILE, VOTES_FILE].forEach(clean);
  res.json({ success: true });
});


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

