import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Exercise } from '@/lib/types';

export function ExerciseRow({
  exercise,
  workoutId,
  done,
}: {
  exercise: Exercise;
  workoutId?: string;
  done?: boolean;
}) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/exercise/[id]', params: { id: exercise.id, workoutId } })
      }>
      {({ pressed }) => (
        <ThemedView
          type="backgroundElement"
          style={[styles.row, done && styles.done, pressed && styles.pressed]}>
          <View style={styles.rowText}>
            <ThemedText type="smallBold">{exercise.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {exercise.repRangeMin}-{exercise.repRangeMax} reps × {exercise.targetSets} sets
            </ThemedText>
          </View>
          <ThemedText type="subtitle">
            {exercise.currentWeight}
            <ThemedText type="small" themeColor="textSecondary">
              {' '}
              {exercise.unit}
            </ThemedText>
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowText: {
    gap: Spacing.half,
  },
  done: {
    backgroundColor: 'rgba(52, 199, 89, 0.35)',
  },
  pressed: {
    opacity: 0.7,
  },
});
