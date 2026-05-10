import knex from 'knex';
import config from '../knexfile';

export const db = knex(config.development);

// Compatibility layer for existing pool.query calls
export const pool = {
  query: async (text: string, params: any[] = []) => {
    // PostgreSQL style $1, $2 to SQLite ? ? conversion
    const formattedText = text.replace(/\$(\d+)/g, '?');
    const result = await db.raw(formattedText, params);
    
    // SQLite result structure is different from pg
    // pg returns { rows: [] }
    // sqlite3 with knex raw returns the rows directly or in an array depending on operation
    return {
      rows: Array.isArray(result) ? result : [result]
    };
  }
};
