import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Exercise } from '@/lib/types';
import { useWorkoutStore } from '@/lib/workout-store';

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <Pressable onPress={() => router.push(`/exercise/${exercise.id}`)}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
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

export default function ExercisesScreen() {
  const { exercises, isLoaded } = useWorkoutStore();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Exercises</ThemedText>
        <Pressable onPress={() => router.push('/exercise/new')} hitSlop={8}>
          <Ionicons name="add-circle" size={32} color={theme.text} />
        </Pressable>
      </ThemedView>

      {isLoaded && exercises.length === 0 && (
        <ThemedView style={styles.empty}>
          <ThemedText themeColor="textSecondary">
            No exercises yet. Tap + to add your first one.
          </ThemedText>
        </ThemedView>
      )}

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ExerciseRow exercise={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
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
  pressed: {
    opacity: 0.7,
  },
  empty: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
});
