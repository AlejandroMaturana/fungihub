import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Tobias475@localhost:5432/mush2'
});

async function main() {
  await client.connect();
  console.log("Connected to DB!");
  const res = await client.query(`
    SELECT pid, query, state, wait_event_type, wait_event 
    FROM pg_stat_activity 
    WHERE pid != pg_backend_pid();
  `);
  console.table(res.rows);
  await client.end();
}
main().catch(console.error);
