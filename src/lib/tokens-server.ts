import { db } from "@/server/db";
import { tokenBalances, tokenLedger } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getSubscriptionTokens } from "@/lib/tokens";

// Utility function to add tokens to an account (supports both one-time and subscription)
interface AddTokensToAccountParams {
  userId: string;
  orgId?: string | null;
  baseTokens: number;
  bonusTokens?: number;
  isSubscription?: boolean;
}

export async function addTokensToAccount({
  userId,
  orgId = null,
  baseTokens,
  bonusTokens = 0,
  isSubscription = false,
}: AddTokensToAccountParams): Promise<number> {
  const totalTokens = baseTokens + bonusTokens;
  const ownerType = orgId ? "org" : "user";
  const ownerId = orgId ?? userId;

  return await db.transaction(async (tx) => {
    // Upsert token_balances for owner
    const existingBalance = await tx.query.tokenBalances.findFirst({
      where: and(
        eq(tokenBalances.ownerType, ownerType),
        eq(tokenBalances.ownerId, ownerId)
      ),
    });

    if (isSubscription) {
      // For subscriptions, tokens expire in 30 days
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 30);

      if (!existingBalance) {
        await tx.insert(tokenBalances).values({
          ownerType,
          ownerId,
          expiringTokens: totalTokens,
          expiringTokensExpiry: tokenExpiry,
          nonexpiringTokens: 0,
          updatedAt: new Date(),
        });
      } else {
        await tx
          .update(tokenBalances)
          .set({
            expiringTokens: totalTokens,
            expiringTokensExpiry: tokenExpiry,
            updatedAt: new Date(),
          })
          .where(and(
            eq(tokenBalances.ownerType, ownerType),
            eq(tokenBalances.ownerId, ownerId)
          ));
      }

      // Record in ledger as expiring
      await tx.insert(tokenLedger).values({
        ownerType,
        ownerId,
        type: "expiring",
        amount: totalTokens,
        reason: "subscription",
        expiry: tokenExpiry,
        createdAt: new Date(),
      });
    } else {
      // For one-time purchases, tokens don't expire
      if (!existingBalance) {
        await tx.insert(tokenBalances).values({
          ownerType,
          ownerId,
          expiringTokens: 0,
          expiringTokensExpiry: null,
          nonexpiringTokens: totalTokens,
          updatedAt: new Date(),
        });
      } else {
        await tx
          .update(tokenBalances)
          .set({
            nonexpiringTokens: existingBalance.nonexpiringTokens + totalTokens,
            updatedAt: new Date(),
          })
          .where(and(
            eq(tokenBalances.ownerType, ownerType),
            eq(tokenBalances.ownerId, ownerId)
          ));
      }

      // Record in ledger as non-expiring
      await tx.insert(tokenLedger).values({
        ownerType,
        ownerId,
        type: "nonexpiring",
        amount: totalTokens,
        reason: "topup",
        expiry: null,
        createdAt: new Date(),
      });
    }

    return totalTokens;
  });
}

// New function to handle tier change token adjustments
interface HandleTierChangeParams {
  ownerType: string;
  ownerId: string;
  oldTier: string;
  newTier: string;
  subscriptionEndDate: Date;
}

export async function handleTierChangeTokens({
  ownerType,
  ownerId,
  oldTier,
  newTier,
  subscriptionEndDate,
}: HandleTierChangeParams): Promise<{ newTokenBalance: number; isUpgrade: boolean; consumedTokens: number }> {
  const oldTokenAllowance = getSubscriptionTokens(oldTier);
  const newTokenAllowance = getSubscriptionTokens(newTier);
  const isUpgrade = newTokenAllowance > oldTokenAllowance;
  
  return await db.transaction(async (tx) => {
    // Get current token balance
    const existingBalance = await tx.query.tokenBalances.findFirst({
      where: and(
        eq(tokenBalances.ownerType, ownerType),
        eq(tokenBalances.ownerId, ownerId)
      ),
    });

    // Calculate current remaining tokens (subscription tokens are expiring tokens)
    const currentRemainingTokens = existingBalance?.expiringTokens ?? 0;
    
    // Calculate how many tokens they've consumed from their current plan
    const consumedTokens = Math.max(0, oldTokenAllowance - currentRemainingTokens);
    
    // Calculate new token balance: new plan allowance minus what they've already consumed
    const newTokenBalance = Math.max(0, newTokenAllowance - consumedTokens);

    console.log(`🔄 Token adjustment calculation:`, {
      oldTier,
      newTier,
      oldTokenAllowance,
      newTokenAllowance,
      currentRemainingTokens,
      consumedTokens,
      newTokenBalance,
      isUpgrade,
    });

    // Update token balance with new calculated amount
    if (existingBalance) {
      await tx
        .update(tokenBalances)
        .set({
          expiringTokens: newTokenBalance,
          expiringTokensExpiry: subscriptionEndDate,
          updatedAt: new Date(),
        })
        .where(and(
          eq(tokenBalances.ownerType, ownerType),
          eq(tokenBalances.ownerId, ownerId)
        ));
    } else {
      // Create new balance record if none exists
      await tx.insert(tokenBalances).values({
        ownerType,
        ownerId,
        expiringTokens: newTokenBalance,
        expiringTokensExpiry: subscriptionEndDate,
        nonexpiringTokens: 0,
        updatedAt: new Date(),
      });
    }

    // Log in ledger for audit with detailed information
    await tx.insert(tokenLedger).values({
      ownerType,
      ownerId,
      type: "expiring",
      amount: newTokenBalance - currentRemainingTokens, // Net change (can be negative)
      reason: isUpgrade ? 
        `tier_upgrade_${oldTier}_to_${newTier}_adjustment` : 
        `tier_downgrade_${oldTier}_to_${newTier}_adjustment`,
      expiry: subscriptionEndDate,
      createdAt: new Date(),
    });

    return { newTokenBalance, isUpgrade, consumedTokens };
  });
}

// New shared token deduction utility function
interface DeductTokensParams {
  userId: string;
  orgId?: string | null;
  tokensUsed: number;
  reason: string;
}

export async function deductTokensFromAccount({
  userId,
  orgId = null,
  tokensUsed,
  reason = "usage",
}: DeductTokensParams): Promise<{ 
  tokensDeducted: number; 
  finalExpiringBalance: number; 
  finalNonexpiringBalance: number 
}> {
  const ownerType = orgId ? "org" : "user";
  const ownerId = orgId ?? userId;

  return await db.transaction(async (tx) => {
    const userTokenBalance = await tx.query.tokenBalances.findFirst({
      where: and(
        eq(tokenBalances.ownerType, ownerType),
        eq(tokenBalances.ownerId, ownerId),
      ),
    });

    if (!userTokenBalance) {
      throw new Error("Token balance not found during deduction");
    }

    // Deduct tokens (expiring first, then nonexpiring) - allow negative balances
    let toDeduct = tokensUsed;
    let expiringUsed = 0;
    let nonexpiringUsed = 0;
    const now = new Date();

    // First, try to use expiring tokens if they're not expired
    if (
      userTokenBalance.expiringTokens > 0 &&
      (!userTokenBalance.expiringTokensExpiry ||
        userTokenBalance.expiringTokensExpiry > now)
    ) {
      if (userTokenBalance.expiringTokens >= toDeduct) {
        expiringUsed = toDeduct;
        toDeduct = 0;
      } else {
        expiringUsed = userTokenBalance.expiringTokens;
        toDeduct -= userTokenBalance.expiringTokens;
      }
    }

    // Then use nonexpiring tokens (can go negative)
    if (toDeduct > 0) {
      nonexpiringUsed = toDeduct;
    }

    const finalExpiringBalance = userTokenBalance.expiringTokens - expiringUsed;
    const finalNonexpiringBalance = userTokenBalance.nonexpiringTokens - nonexpiringUsed;

    // Update token_balances (allowing negative balances)
    await tx
      .update(tokenBalances)
      .set({
        expiringTokens: finalExpiringBalance,
        nonexpiringTokens: finalNonexpiringBalance,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tokenBalances.ownerType, ownerType),
          eq(tokenBalances.ownerId, ownerId),
        ),
      );

    // Record ledger entries
    if (expiringUsed > 0) {
      await tx.insert(tokenLedger).values({
        ownerType,
        ownerId,
        type: "expiring",
        amount: -expiringUsed,
        reason,
        expiry: userTokenBalance.expiringTokensExpiry,
        createdAt: new Date(),
      });
    }

    if (nonexpiringUsed > 0) {
      await tx.insert(tokenLedger).values({
        ownerType,
        ownerId,
        type: "nonexpiring",
        amount: -nonexpiringUsed,
        reason,
        expiry: null,
        createdAt: new Date(),
      });
    }

    return {
      tokensDeducted: tokensUsed,
      finalExpiringBalance,
      finalNonexpiringBalance,
    };
  });
} 