import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import pg from "pg";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const { DATABASE_URL } = process.env; // use pooled connection string with write role
const YAML_DEFAULT_PATH = path.resolve(process.cwd(), "yaml-files/credit_cards.yaml");

async function main() {
  const yamlPath = process.argv[2] ? path.resolve(process.argv[2]) : YAML_DEFAULT_PATH;
  const yamlText = fs.readFileSync(yamlPath, "utf8");
  const doc = parse(yamlText);
  const client = new pg.Pool({ connectionString: DATABASE_URL });
  const res = await client.query("select ingest_cards_json($1::jsonb) as result", [JSON.stringify(doc)]);
  const result = res.rows[0].result;

  // Validate ingestion results
  const expectedCount = doc.cards?.length ?? 0;
  const actualCount = result.count;

  if (actualCount !== expectedCount) {
    throw new Error(`Ingestion count mismatch: expected ${expectedCount} cards, got ${actualCount}`);
  }

  console.log(JSON.stringify(result, null, 2));
  console.log(`\n✓ Successfully ingested ${actualCount} card(s)`);
  await client.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
