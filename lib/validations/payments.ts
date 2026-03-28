import { z } from "zod";

export const updatePaymentMethodSchema = z.object({
  primary: z.boolean().optional(),
  verified: z.boolean().optional(),
});

export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
