const app = require('./index.js');

const port = 3010;

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;

