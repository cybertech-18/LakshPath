import env from '@config/env';
import app from './app';

const server = app.listen(env.PORT, () => {
  console.log(`LakshPath API listening on port ${env.PORT}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️  Port ${env.PORT} is already in use. Please stop the other process or set PORT to a different value.`);
    process.exit(1);
  }
  console.error('Server error:', error);
  process.exit(1);
});

const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
