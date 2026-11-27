// Pattern: Factory Method (creational).
// GoF role: TokenSeller is the abstract Creator. sell() is the shared steps; createToken() is the factory method.
import type { MealToken, TokenInput } from "@/lib/patterns/token-seller/meal-token";
import type { SettingsRecord, SettingsRepository } from "@/lib/repositories/settings-repository";
import type { TokenRepository, TokenStore } from "@/lib/repositories/token-repository";
import type { UserLookup } from "@/lib/repositories/user-repository";
import { dhakaTomorrow, isAtOrAfterDhakaTime } from "@/lib/services/dhaka-time";
import { TokenError } from "@/lib/services/token-errors";

export interface TokenSellerDeps {
  tokens: TokenRepository;
  users: UserLookup;
  settings: SettingsRepository;
}

export interface SaleResult {
  token: MealToken;
  price: number; // poisha
  balanceAfter: number; // poisha
}

// What the hook needs. `tx` is the open database transaction of this sale.
export interface SaleContext {
  request: TokenInput;
  hallId: number;
  settings: SettingsRecord;
  tx: TokenStore;
}

export abstract class TokenSeller {
  constructor(protected readonly deps: TokenSellerDeps) {}

  // The shared steps. Subclasses only choose which product to create.
  async sell(request: TokenInput): Promise<SaleResult> {
    const settings = await this.deps.settings.get();
    const now = new Date();
    if (isAtOrAfterDhakaTime(now, settings.cutoffTime)) {
      throw new TokenError("AFTER_CUTOFF", `Tokens are sold only until ${settings.cutoffTime}`);
    }
    if (request.date !== dhakaTomorrow(now)) {
      throw new TokenError("NOT_TOMORROW", "You can buy a token only for tomorrow");
    }

    const user = await this.deps.users.findById(request.userId);
    if (!user) throw new TokenError("NO_USER", "Student not found");

    return this.deps.tokens.transaction(async (tx) => {
      await this.checkExtraRules({ request, hallId: user.hallId, settings, tx });
      const token = this.createToken(request);
      if (await tx.findToken(request.userId, request.date, token.kind)) {
        throw new TokenError("ALREADY_BOUGHT", "You already have this kind of token for that date");
      }
      const price = token.price(settings);

      const wallet = await tx.getWalletByUserId(request.userId);
      if (!wallet) throw new TokenError("NO_WALLET", "Wallet not found");
      if (wallet.balance < price) {
        throw new TokenError("INSUFFICIENT_BALANCE", "Not enough balance");
      }
      const balanceAfter = await tx.debit(wallet.id, price);

      await tx.addTransaction({
        walletId: wallet.id,
        type: token.transactionType,
        method: "WALLET",
        amount: price,
        status: "COMPLETED",
        balanceAfter,
        note: `${request.mealType} for ${request.date}`,
      });
      await tx.addToken(token.toRecord(settings));

      return { token, price, balanceAfter };
    });
  }

  // Hook: a subclass can add its own rules. By default there are none.
  protected async checkExtraRules(_context: SaleContext): Promise<void> {}

  // The factory method: each subclass decides which product it makes.
  protected abstract createToken(input: TokenInput): MealToken;
}
