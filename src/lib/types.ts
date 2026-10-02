export type Exercise = {
  id: string;
  name: string;
  repRangeMin: number;
  repRangeMax: number;
  targetSets: number;
  weightIncrement: number;
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
