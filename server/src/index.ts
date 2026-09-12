import 'dotenv/config';
import app from './app';
import { connectDB } from './lib/db';
import { logger } from './lib/logger';
import User from './models/User';
import { hashPassword } from './lib/password';

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5000;

if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedAdmin(): Promise<void> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    logger.warn('ADMIN_USERNAME or ADMIN_PASSWORD not set — admin seed skipped');
    return;
  }

  const existing = await User.findOne({ username: adminUsername, role: 'admin' });
  if (existing) {
    logger.info('Admin user already exists, skipping seed');
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  const admin = new User({
    username: adminUsername,
    displayName: adminUsername,
    role: 'admin',
    passwordHash,
  });
  await admin.save();
  logger.info({ username: adminUsername }, 'Admin user seeded');
}

async function main() {
  await connectDB();
  await seedAdmin();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, 'Error listening on port');
      process.exit(1);
    }
    logger.info({ port }, 'Server listening');
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
