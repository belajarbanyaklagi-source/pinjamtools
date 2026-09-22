import pg from 'pg'

const { Client } = pg

const passwords = ['&5N?X?uT?KUC7Dx', '[&5N?X?uT?KUC7Dx]']

async function test() {
  for (const pw of passwords) {
    const client = new Client({
      host: 'db.ooclgunuvtvckaxlugsg.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: pw,
      ssl: { rejectUnauthorized: false }
    })
    try {
      console.log(`Trying password... (${pw.substring(0, 3)}...)`)
      await client.connect()
      console.log('Connected successfully!')
      const res = await client.query('SELECT current_database(), now();')
      console.log('Query result:', res.rows[0])
      await client.end()
      return pw
    } catch (err) {
      console.log('Connection failed with this password:', err.message)
    }
  }
}

test()
