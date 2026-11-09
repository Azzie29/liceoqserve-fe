console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log(
  'Supabase key exists:',
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)