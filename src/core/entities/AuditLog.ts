export interface IAuditLogProps {
  id?: string;
  userId?: string | null;
  action: string;
  entityName: string;
  entityId: string;
  details?: Record<string, unknown>;
  timestamp?: Date;
}

export class AuditLog {
  public readonly id?: string;
  public readonly userId?: string | null;
  public readonly action: string;
  public readonly entityName: string;
  public readonly entityId: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(props: IAuditLogProps) {
    this.id = props.id;
    this.userId = props.userId ?? null;
    this.action = props.action;
    this.entityName = props.entityName;
    this.entityId = props.entityId;
    this.details = props.details;
    this.timestamp = props.timestamp ?? new Date();
  }
}
