import { z } from 'zod';

export const driveCommandSchema = z.object({
  type: z.literal('drive'),
  x: z.number().min(-1).max(1),
  y: z.number().min(-1).max(1),
  speed: z.number().int().min(0).max(100),
  seq: z.number().int().optional(),
  ts: z.string().optional(),
});

export const stopCommandSchema = z.object({
  type: z.literal('stop'),
  seq: z.number().int().optional(),
  ts: z.string().optional(),
});

export const commandSchema = z.discriminatedUnion('type', [
  driveCommandSchema,
  stopCommandSchema,
]);

export type RoverCommand = z.infer<typeof commandSchema>;

export function parseCommand(payload: unknown): RoverCommand {
  return commandSchema.parse(payload);
}
