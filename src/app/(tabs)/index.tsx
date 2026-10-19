import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseRow } from '@/components/exercise-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutStore } from '@/lib/workout-store';

type Folder = { id: string; name: string; count: number };

function FolderTile({ folder }: { folder: Folder }) {
  const theme = useTheme();
  return (
    <Pressable
      style={styles.tileWrapper}
      onPress={() => router.push({ pathname: '/category/[id]', params: { id: folder.id } })}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.tile, pressed && styles.pressed]}>
          <Ionicons name="folder" size={56} color="#3c87f7" />
          <ThemedText type="smallBold" numberOfLines={1} style={styles.tileName}>
            {folder.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {folder.count} {folder.count === 1 ? 'exercise' : 'exercises'}
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

export default function ExercisesScreen() {
  const { categories, exercises, isLoaded } = useWorkoutStore();
  const theme = useTheme();

  const folders: Folder[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: exercises.filter((e) => e.categoryId === c.id).length,
  }));
  const loose = exercises.filter((e) => !categories.some((c) => c.id === e.categoryId));
  if (categories.length > 0 && loose.length > 0) {
    folders.push({ id: 'uncategorised', name: 'Uncategorised', count: loose.length });
  }
  const showLooseList = categories.length === 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Exercises</ThemedText>
        <ThemedView style={styles.headerActions}>
          <Pressable onPress={() => router.push('/categories')} hitSlop={8}>
            <Ionicons name="folder-open" size={28} color={theme.text} />
          </Pressable>
          <Pressable onPress={() => router.push('/exercise/new')} hitSlop={8}>
            <Ionicons name="add-circle" size={32} color={theme.text} />
          </Pressable>
        </ThemedView>
      </ThemedView>

      {isLoaded && exercises.length === 0 && categories.length === 0 && (
        <ThemedView style={styles.empty}>
          <ThemedText themeColor="textSecondary">
            No exercises yet. Tap + to add your first one.
          </ThemedText>
        </ThemedView>
      )}

      {showLooseList ? (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ExerciseRow exercise={item} />}
        />
      ) : (
        <FlatList
          key="folders"
          data={folders}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columns}
          renderItem={({ item }) => <FolderTile folder={item} />}
        />
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  columns: {
    gap: Spacing.three,
  },
  tileWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  tile: {
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  tileName: {
    maxWidth: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
  empty: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
});
