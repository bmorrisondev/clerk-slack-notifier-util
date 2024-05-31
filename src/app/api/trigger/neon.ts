import postgres from "postgres";

let {
  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  ENDPOINT_ID
} = process.env;

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

export enum ShippedType {
  Project = 1,
  Milestone = 2
}

export type ShippedRecord = {
  id: string
  name: string
  type: ShippedType
  sent_on: Date
}

export async function logSentItem(record: ShippedRecord) {
  const { id, name, type, sent_on } = record
  await sql`insert into shipped_items (id, name, type, sent_on)
    values (${id}, ${name}, ${type}, ${sent_on})`
}

export async function getAllSentItems(): Promise<ShippedRecord[]> {
  return await sql`select id from shipped_items`
}