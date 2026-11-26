export interface NotificationRecord {
  id: number;
  userId: number;
  title: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationRepository {
  create(userId: number, title: string): Promise<void>;
  listForUser(userId: number, limit: number): Promise<NotificationRecord[]>;
}
