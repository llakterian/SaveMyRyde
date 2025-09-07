import { readFile } from 'fs/promises'
import path from 'path'
import { connectDatabase, getPool } from '../config/database'

async function applySchema() {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const sql = await readFile(schemaPath, 'utf-8')
    await connectDatabase()
    const pool = getPool()
    // Execute schema; Postgres can process multiple statements separated by semicolons
    await pool.query(sql)
    console.log('✅ Database schema applied (idempotent).')
}

applySchema().catch((err) => {
    console.error('❌ Failed to apply schema:', err)
    process.exit(1)
})