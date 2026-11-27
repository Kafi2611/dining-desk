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

// The 4 values the manager can change (FR10). Rates are in poisha.
export type SettingsUpdate = Pick<
  SettingsRecord,
  "mealRate" | "guestRate" | "cutoffTime" | "guestDailyLimit"
>;

export interface SettingsAdmin extends SettingsRepository {
  update(data: SettingsUpdate): Promise<SettingsRecord>;
}
