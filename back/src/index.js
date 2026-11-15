import { createApp } from './app.js';
import { config } from './config.js';
import { connectWithRetry, sequelize, syncSchema } from './db.js';
import { log } from './lib/log.js';
import { initPush } from './services/push.js';
import { seed } from './services/seed.js';
import { startScheduler, stopScheduler } from './services/scheduler.js';

async function main() {
  await connectWithRetry();
  await syncSchema();
  await seed();
  await initPush();

  const server = createApp().listen(config.port, '0.0.0.0', () => {
    log.info(`Kryptonews API v${config.version} listening on :${config.port} (public URL ${config.publicUrl})`);
  });

  startScheduler();

  const shutdown = (signal) => {
    log.info(`${signal} received, shutting down`);
    stopScheduler();
    server.close(async () => {
      await sequelize.close().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  log.error('Fatal startup error:', err);
  process.exit(1);
});
