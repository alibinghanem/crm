import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxbkhlziwsmagrnlmenw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4YmtobHppd3NtYWdybmxtZW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NzY1MTEsImV4cCI6MjA3NjQ1MjUxMX0.D7-rWGdyYbaqcjoz0Jd1IZzQo2BXaEEdrtrOK9Lb4qw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
