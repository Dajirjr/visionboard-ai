import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AdminLogEntry {
  user_id: string
  action: string
  entity: string
  details: Record<string, any>
}

export const useAdminLogs = () => {
  const logAdminAction = async (
    user: User,
    action: string,
    entity: string,
    details: Record<string, any> = {}
  ) => {
    try {
      const { error } = await supabase.from('admin_logs').insert({
        user_id: user.id,
        action,
        entity,
        details: {
          ...details,
          triggered_by: user.email,
          timestamp: new Date().toISOString()
        }
      })

      if (error) throw error
    } catch (e) {
      console.error('Failed to log admin action:', e)
      // Don't throw - we don't want to break the main action if logging fails
    }
  }

  const getAdminLogs = async (limit = 50) => {
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        id,
        user_id,
        action,
        entity,
        details,
        created_at,
        auth.users (email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  return {
    logAdminAction,
    getAdminLogs
  }
} 