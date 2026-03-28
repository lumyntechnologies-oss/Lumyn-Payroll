import { z } from "zod";

export const reviewLeaveRequestSchema = z.object({
  reviewNote: z.string().optional(),
});

export type ReviewLeaveRequestInput = z.infer<typeof reviewLeaveRequestSchema>;
