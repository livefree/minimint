/**
 * listTransactionsForSymbol — recent non-deleted transactions for
 * a (profileId, symbol) pair, ordered executedAt DESC.
 *
 * Server-only. Powers the "Recent trades" list on SymbolDetail so
 * the operator can review what they recorded and undo mistakes via
 * the delete + sonner-toast flow (M2-9).
 *
 * Returns the transaction's account name joined in so the row can
 * show "Fidelity · Individual" without a second fetch.
 */

import Decimal from 'decimal.js';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db as defaultDb, type DB } from '@/db/client';
import { accounts, transactions } from '@/db/schema';

export interface TradeRow {
  id: string;
  kind:
    | 'BUY'
    | 'SELL'
    | 'DIV'
    | 'SPLIT'
    | 'FEE'
    | 'CASH_IN'
    | 'CASH_OUT'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT';
  quantity: Decimal;
  price: Decimal;
  fees: Decimal;
  executedAt: Date;
  note: string | null;
  accountId: string;
  accountName: string;
}

export async function listTransactionsForSymbol(
  profileId: string,
  symbol: string,
  limit = 20,
  database: DB = defaultDb,
): Promise<TradeRow[]> {
  const rows = await database
    .select({
      id: transactions.id,
      kind: transactions.kind,
      quantity: transactions.quantity,
      price: transactions.price,
      fees: transactions.fees,
      executedAt: transactions.executedAt,
      note: transactions.note,
      accountId: transactions.accountId,
      accountName: accounts.name,
    })
    .from(transactions)
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .where(
      and(
        eq(transactions.profileId, profileId),
        eq(transactions.symbol, symbol),
        isNull(transactions.deletedAt),
      ),
    )
    .orderBy(desc(transactions.executedAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    quantity: new Decimal(r.quantity),
    price: new Decimal(r.price),
    fees: new Decimal(r.fees),
    executedAt: r.executedAt,
    note: r.note,
    accountId: r.accountId,
    accountName: r.accountName,
  }));
}
