export type Category = {
  id: string;
  name: string;
};

export type Exercise = {
  id: string;
  name: string;
  categoryId?: string;
  subcategory?: string;
  repRangeMin: number;
  repRangeMax: number;
  targetSets: number;
  weightIncrement: number;
  assisted?: boolean;
  currentWeight: number;
  unit: 'kg' | 'lb';
  createdAt: number;
};

export type SetLog = {
  reps: number;
  weight: number;
};

export type WorkoutSession = {
  id: string;
  exerciseId: string;
  date: number;
  sets: SetLog[];
  weightIncreased: boolean;
};
