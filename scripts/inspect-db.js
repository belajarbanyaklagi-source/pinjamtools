import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ooclgunuvtvckaxlugsg.supabase.co'
const supabaseKey = 'sb_publishable_bP7oKDWlg30ysUX5LtIpWw_J7smqIPM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
  const { data: tools, error: toolsError } = await supabase.from('tools').select('*').limit(5)
  console.log('Tools query:', { tools, error: toolsError?.message })

  const { data: borrows, error: borrowsError } = await supabase.from('borrows').select('*').limit(5)
  console.log('Borrows query:', { borrows, error: borrowsError?.message })

  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').limit(5)
  console.log('Profiles query:', { profiles, error: profilesError?.message })
}

inspect()
