require('dotenv').config();
const express = require('express');
const path = require('path');
const commentsRouter = require('./routes/comments');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use('/', commentsRouter);

// Generic error handler.
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).send('Something went wrong.');
});

// Bind to localhost only: this app is intentionally vulnerable.
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Stored XSS demo running at http://localhost:${PORT} (localhost only)`);
});
