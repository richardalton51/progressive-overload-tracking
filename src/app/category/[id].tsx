import { Stack, useLocalSearchParams } from 'expo-router';
import { SectionList, StyleSheet, View } from 'react-native';

import { ExerciseRow } from '@/components/exercise-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutStore } from '@/lib/workout-store';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, exercises } = useWorkoutStore();
  const theme = useTheme();

  const isUncategorised = id === 'uncategorised';
  const category = categories.find((c) => c.id === id);
  const data = isUncategorised
    ? exercises.filter((e) => !categories.some((c) => c.id === e.categoryId))
    : exercises.filter((e) => e.categoryId === id);

  const groups = new Map<string, typeof data>();
  for (const exercise of data) {
    const key = (!isUncategorised && exercise.subcategory) || '';
    groups.set(key, [...(groups.get(key) ?? []), exercise]);
  }
  const sections = [...groups.entries()]
    .sort(([a], [b]) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)))
    .map(([title, items]) => ({ title, data: items }));

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: isUncategorised ? 'Uncategorised' : (category?.name ?? 'Category') }} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeader}>
              {section.title.toUpperCase()}
            </ThemedText>
          ) : null
        }
        renderItem={({ item }) => <ExerciseRow exercise={item} />}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary">
            No exercises here yet. Assign exercises to this category when adding or editing them.
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.four,
  },
  separator: {
    height: Spacing.two,
  },
  sectionHeader: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    letterSpacing: 0.5,
  },
});
