import { GoalSnapshot } from "@/app/features/vocabulary/types";
import * as goalsRepo from "@/app/lib/repositories/goals-repo";

export async function getGoalSnapshot(userId: string): Promise<GoalSnapshot> {
  return goalsRepo.getSnapshot(userId);
}

export async function registerCorrectProduction(userId: string): Promise<GoalSnapshot> {
  return goalsRepo.addCorrectProduction(userId, 1);
}
