import pg from 'pg';
import 'dotenv/config';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
try {
  await pool.query('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pesapalTrackingId" TEXT');
  await pool.query('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pesapalMerchantRef" TEXT');
  console.log('Migration applied successfully');
} catch (e) {
  console.log('Error:', e.message);
}
await pool.end();
