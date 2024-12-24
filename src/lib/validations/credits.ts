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
  id: z.string().uuid(),
  userId: z.string(),
  amount: z.number(),
  type: z.enum(["purchase", "usage"]),
  description: z.string().nullable(),
  status: z.enum(["pending", "completed", "failed"]),
  paymentId: z.string().nullable(),
  createdAt: z.date(),
});

export type PurchaseCreditsInput = z.infer<typeof purchaseCreditsSchema>;
export type UseCreditsInput = z.infer<typeof useCreditsSchema>;
export type CreditTransactionInput = z.infer<typeof creditTransactionSchema>;
