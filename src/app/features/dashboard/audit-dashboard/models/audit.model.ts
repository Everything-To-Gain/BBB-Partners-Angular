export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  entity: string;
  entityIdentifier: string;
  status: string;
  userVersion: string;
  metadata?: any;
}
