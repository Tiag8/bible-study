import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

const LOVABLE_USER_ID = 'c68aac85-0829-4eed-9c32-ef09b28e4cc3';
const LOVABLE_USER_EMAIL = 'tiag8guimaraes@gmail.com';

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await pgClient.connect();

const now = new Date().toISOString();

try {
  await pgClient.query(`
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      created_at,
      updated_at,
      last_sign_in_at,
      email
    ) VALUES (
      $1::uuid,
      $1::uuid,
      $1::uuid,
      $2::jsonb,
      'email',
      $3::timestamptz,
      $3::timestamptz,
      $3::timestamptz,
      $4::text
    )
  `, [
    LOVABLE_USER_ID,
    JSON.stringify({ sub: LOVABLE_USER_ID, email: LOVABLE_USER_EMAIL }),
    now,
    LOVABLE_USER_EMAIL
  ]);
  
  console.log('✅ Identity criada com sucesso!');
  console.log('\n🎉 Agora execute: node scripts/migrate-data-from-lovable.js');
} catch (err) {
  if (err.code === '23505') {
    console.log('ℹ️  Identity já existe!');
    console.log('\n✅ Tudo pronto! Execute: node scripts/migrate-data-from-lovable.js');
  } else {
    throw err;
  }
}

await pgClient.end();
