import fs from "node:fs";
import { parse } from yaml;
import pg from "pg";

const { SUPABASE_DB_URL } = process.env; // use pooled connection string with write role

async function main() {
  const yamlText = fs.readFileSync("./cards_final.yaml", "utf8");
  const doc = parse(yamlText);
  const client = new pg.Pool({ connectionString: SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
  const res = await client.query("select ingest_cards_json($1::jsonb) as result", [JSON.stringify(doc)]);
  console.log(JSON.stringify(res.rows[0].result, null, 2));
  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
