import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutStore } from '@/lib/workout-store';

export default function WorkoutsScreen() {
  const { workouts, isLoaded } = useWorkoutStore();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Workouts</ThemedText>
        <Pressable onPress={() => router.push('/workout/new')} hitSlop={8}>
          <Ionicons name="add-circle" size={32} color={theme.text} />
        </Pressable>
      </ThemedView>

      {isLoaded && workouts.length === 0 && (
        <ThemedView style={styles.empty}>
          <ThemedText themeColor="textSecondary">
            No workouts yet. Tap + to build one from your exercises.
          </ThemedText>
        </ThemedView>
      )}

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const done = item.completedExerciseIds.length;
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/workout/[id]', params: { id: item.id } })}>
              {({ pressed }) => (
                <ThemedView
                  type="backgroundElement"
                  style={[styles.row, pressed && styles.pressed]}>
                  <ThemedView style={styles.rowText}>
                    <ThemedText type="smallBold">{item.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.exerciseIds.length}{' '}
                      {item.exerciseIds.length === 1 ? 'exercise' : 'exercises'}
                      {done > 0 ? ` · ${done} done` : ''}
                    </ThemedText>
                  </ThemedView>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </ThemedView>
              )}
            </Pressable>
          );
        }}
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
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
  empty: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
});
