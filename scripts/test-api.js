import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ooclgunuvtvckaxlugsg.supabase.co'
const supabaseKey = 'sb_publishable_bP7oKDWlg30ysUX5LtIpWw_J7smqIPM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testApi() {
  console.log('Testing Supabase REST API connection...')
  try {
    const { data, error } = await supabase.from('tools').select('count', { count: 'exact', head: true })
    console.log('Response error (expected if table not created yet):', error?.message || 'No error! Tables exist.')
    console.log('API reachable!')
  } catch (e) {
    console.error('Fetch error:', e.message)
  }
}

testApi()
