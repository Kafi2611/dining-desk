// All amounts are in poisha (Tk 40 = 4000).
export interface SettingsRecord {
  mealRate: number;
  guestRate: number;
  cutoffTime: string;
  guestDailyLimit: number;
  minRecharge: number;
  lowBalanceAt: number;
}

export interface SettingsRepository {
  get(): Promise<SettingsRecord>;
}
