import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutSession } from '@/lib/types';
import { useWorkoutStore } from '@/lib/workout-store';

type ExerciseFilter = 'all' | string;
// 'all' or a calendar-day key (see dayKey) identifying one specific logged date.
type DateFilter = 'all' | string;

function dayKey(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HistoryScreen() {
  const { exercises, sessions } = useWorkoutStore();
  const theme = useTheme();
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const loggedExercises = useMemo(() => {
    const ids = new Set(sessions.map((s) => s.exerciseId));
    return exercises.filter((e) => ids.has(e.id));
  }, [exercises, sessions]);

  // Only the dates the current exercise filter was actually logged on.
  const loggedDates = useMemo(() => {
    const relevant = sessions.filter((s) => exerciseFilter === 'all' || s.exerciseId === exerciseFilter);
    const byKey = new Map<string, number>();
    for (const s of relevant) {
      const key = dayKey(s.date);
      if (!byKey.has(key)) byKey.set(key, s.date);
    }
    return Array.from(byKey, ([key, timestamp]) => ({ key, timestamp })).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }, [sessions, exerciseFilter]);

  const sorted = [...sessions]
    .filter((s) => exerciseFilter === 'all' || s.exerciseId === exerciseFilter)
    .filter((s) => dateFilter === 'all' || dayKey(s.date) === dateFilter)
    .sort((a, b) => b.date - a.date);

  const exerciseFilterLabel =
    exerciseFilter === 'all'
      ? 'All exercises'
      : (exercises.find((e) => e.id === exerciseFilter)?.name ?? 'All exercises');

  const selectedDate = dateFilter === 'all' ? undefined : loggedDates.find((d) => d.key === dateFilter);
  const dateFilterLabel = selectedDate ? formatDate(selectedDate.timestamp) : 'All dates';

  const selectExerciseFilter = (next: ExerciseFilter) => {
    setExerciseFilter(next);
    setDateFilter('all');
    setExercisePickerOpen(false);
  };

  const selectDateFilter = (next: DateFilter) => {
    setDateFilter(next);
    setDatePickerOpen(false);
  };

  const renderSession = ({ item }: { item: WorkoutSession }) => {
    const exercise = exercises.find((e) => e.id === item.exerciseId);
    return (
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold">{exercise?.name ?? 'Deleted exercise'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatDate(item.date)}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {item.sets.map((set) => `${set.reps}×${set.weight}`).join('  ·  ')}
        </ThemedText>
        {item.weightIncreased && (
          <ThemedText type="small" style={styles.levelUp}>
            {exercise?.assisted ? 'Assistance decreased 🎉' : 'Weight increased 🎉'}
          </ThemedText>
        )}
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">History</ThemedText>
      </ThemedView>

      <View style={styles.filterRow}>
        {loggedExercises.length > 0 ? (
          <Pressable
            onPress={() => setExercisePickerOpen(true)}
            style={[styles.filterButton, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">{exerciseFilterLabel}</ThemedText>
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
          </Pressable>
        ) : (
          <View />
        )}

        {loggedDates.length > 0 && (
          <Pressable
            onPress={() => setDatePickerOpen(true)}
            style={[styles.filterButton, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">{dateFilterLabel}</ThemedText>
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {sorted.length === 0 && (
        <ThemedView style={styles.empty}>
          <ThemedText themeColor="textSecondary">
            {exerciseFilter === 'all' && dateFilter === 'all'
              ? 'Logged workouts will show up here.'
              : 'No workouts logged for this filter.'}
          </ThemedText>
        </ThemedView>
      )}

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderSession}
      />

      <Modal
        visible={exercisePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setExercisePickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setExercisePickerOpen(false)}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <Pressable style={styles.option} onPress={() => selectExerciseFilter('all')}>
              <ThemedText type="smallBold" themeColor={exerciseFilter === 'all' ? 'text' : 'textSecondary'}>
                All exercises
              </ThemedText>
            </Pressable>
            {loggedExercises.map((exercise) => (
              <Pressable key={exercise.id} style={styles.option} onPress={() => selectExerciseFilter(exercise.id)}>
                <ThemedText
                  type="smallBold"
                  themeColor={exerciseFilter === exercise.id ? 'text' : 'textSecondary'}>
                  {exercise.name}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </Pressable>
      </Modal>

      <Modal
        visible={datePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDatePickerOpen(false)}>
          <ScrollView style={styles.dateModalScroll}>
            <ThemedView type="backgroundElement" style={styles.modalCard}>
              <Pressable style={styles.option} onPress={() => selectDateFilter('all')}>
                <ThemedText type="smallBold" themeColor={dateFilter === 'all' ? 'text' : 'textSecondary'}>
                  All dates
                </ThemedText>
              </Pressable>
              {loggedDates.map(({ key, timestamp }) => (
                <Pressable key={key} style={styles.option} onPress={() => selectDateFilter(key)}>
                  <ThemedText type="smallBold" themeColor={dateFilter === key ? 'text' : 'textSecondary'}>
                    {formatDate(timestamp)}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          </ScrollView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelUp: {
    color: '#3c87f7',
  },
  empty: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalCard: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
  },
  dateModalScroll: {
    maxHeight: '70%',
  },
  option: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});
