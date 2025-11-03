import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await pgClient.connect();

try {
  await pgClient.query(`ALTER TYPE public.lifetracker_timeframe_type ADD VALUE 'yearly'`);
  console.log('✅ Valor "yearly" adicionado ao ENUM lifetracker_timeframe_type');
} catch (err) {
  if (err.message.includes('already exists')) {
    console.log('ℹ️  Valor "yearly" já existe no ENUM');
  } else {
    throw err;
  }
}

await pgClient.end();
console.log('\n✅ Pronto! Execute novamente: node scripts/migrate-data-from-lovable.js');
