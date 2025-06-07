import { z } from "zod";

export const purchaseCreditsSchema = z.object({
  amount: z.number().min(1),
  paymentMethod: z.enum(["stripe", "paypal"]),
});

export const useCreditsSchema = z.object({
  amount: z.number().min(1),
  description: z.string(),
});

export const creditTransactionSchema = z.object({
  type: z.string(),
  amount: z.number(),
  id: z.string(),
  createdAt: z.date(),
  ownerType: z.string(),
  ownerId: z.string(),
  reason: z.string(),
});

export type PurchaseCreditsInput = z.infer<typeof purchaseCreditsSchema>;
export type UseCreditsInput = z.infer<typeof useCreditsSchema>;
export type CreditTransactionInput = z.infer<typeof creditTransactionSchema>;
