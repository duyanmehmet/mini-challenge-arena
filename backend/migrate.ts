import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

import config from './knexfile';

const env = (process.env.NODE_ENV as string) || 'development';
const db = knex(config[env]);

db.migrate.latest()
  .then(([batchNo, migrations]) => {
    if (migrations.length === 0) {
      console.log('Already up to date.');
    } else {
      console.log(`Batch ${batchNo}: ran ${migrations.length} migration(s).`);
      migrations.forEach((m: string) => console.log(' -', m));
    }
    process.exit(0);
  })
  .catch((err: Error) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
