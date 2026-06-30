import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export function getSupabaseServer(event: any) {
  return serverSupabaseClient(event)
}

export function getSupabaseServiceRole(event: any) {
  return serverSupabaseServiceRole(event)
}
