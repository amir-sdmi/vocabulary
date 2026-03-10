import { SavedFilter, SortMode, VocabularyFilters } from "@/app/features/vocabulary/types";
import * as filtersRepo from "@/app/lib/repositories/filters-repo";

export async function listSavedFilters(userId: string): Promise<SavedFilter[]> {
  return filtersRepo.getAll(userId);
}

export async function saveFilter(input: {
  userId: string;
  id?: string;
  name: string;
  filters: VocabularyFilters;
  sort: SortMode;
}): Promise<SavedFilter> {
  return filtersRepo.upsert(input.userId, {
    id: input.id,
    name: input.name,
    filters: input.filters,
    sort: input.sort,
  });
}

export async function deleteFilter(userId: string, id: string): Promise<boolean> {
  return filtersRepo.remove(userId, id);
}
