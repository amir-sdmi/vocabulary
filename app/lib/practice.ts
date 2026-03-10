import { PracticeAttempt } from "@/app/features/vocabulary/types";
import * as attemptsRepo from "@/app/lib/repositories/attempts-repo";

export async function getPracticeAttempts(userId: string): Promise<PracticeAttempt[]> {
  return attemptsRepo.getAll(userId);
}

export async function addPracticeAttempt(userId: string, attempt: PracticeAttempt): Promise<void> {
  await attemptsRepo.add(userId, attempt);
}
