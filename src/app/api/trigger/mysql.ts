import mysql, { RowDataPacket } from 'mysql2/promise';

async function getDb() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });
}

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

interface ShippedRecordRow extends RowDataPacket, ShippedRecord {}

export async function logSentItem(record: ShippedRecord) {
  const { id, name, type, sent_on } = record

  const connection = await getDb()
  await connection.query(`
    insert into shipped_items (id, name, type, sent_on)
    values (?, ?, ?, ?)`, [
      id,
      name,
      type,
      sent_on
    ])

  connection.destroy()
}

export async function getAllSentItems(): Promise<ShippedRecord[]> {
  const connection = await getDb()

  const [results] = await connection.query<ShippedRecordRow[]>(`
    select id from shipped_items
  `)
  connection.destroy()

  let arr: ShippedRecord[] = []
  results.forEach(r => {
    arr.push({
      id: r.id,
      name: r.name,
      type: r.type,
      sent_on: r.sent_on
    })
  })
  return arr
}