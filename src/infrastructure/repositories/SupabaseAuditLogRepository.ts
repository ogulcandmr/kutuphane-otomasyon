import { AuditLog } from '../../core/entities/AuditLog';
import { IAuditLogRepository } from '../../core/interfaces/IRepositories';
import { getSupabaseClient, isSupabaseConfigured } from '../db/supabaseClient';

interface DbAuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  entity_name: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  timestamp: string;
}

export class SupabaseAuditLogRepository implements IAuditLogRepository {
  private static localLogs: AuditLog[] = [];

  public async save(log: AuditLog): Promise<void> {
    if (!isSupabaseConfigured()) {
      SupabaseAuditLogRepository.localLogs.unshift(log);
      return;
    }

    const supabase = getSupabaseClient();
    await supabase.from('audit_logs').insert({
      id: log.id,
      user_id: log.userId,
      action: log.action,
      entity_name: log.entityName,
      entity_id: log.entityId,
      details: log.details,
      timestamp: log.timestamp.toISOString(),
    });
  }

  public async findRecent(limit: number = 20): Promise<AuditLog[]> {
    if (!isSupabaseConfigured()) {
      return SupabaseAuditLogRepository.localLogs.slice(0, limit);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error || !data) return SupabaseAuditLogRepository.localLogs.slice(0, limit);

    return data.map(
      (row: DbAuditLogRow) =>
        new AuditLog({
          id: row.id,
          userId: row.user_id,
          action: row.action,
          entityName: row.entity_name,
          entityId: row.entity_id,
          details: row.details ?? undefined,
          timestamp: new Date(row.timestamp),
        })
    );
  }
}
