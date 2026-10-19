import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutStore } from '@/lib/workout-store';

export default function CategoriesScreen() {
  const { categories, exercises, addCategory, renameCategory, deleteCategory } = useWorkoutStore();
  const theme = useTheme();
  const [newName, setNewName] = useState('');

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    addCategory(name);
    setNewName('');
  };

  const confirmDelete = (id: string, name: string) => {
    const count = exercises.filter((e) => e.categoryId === id).length;
    Alert.alert(
      'Delete category?',
      count > 0
        ? `"${name}" will be removed. Its ${count} exercise${count === 1 ? '' : 's'} will become uncategorised.`
        : `"${name}" will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(id) },
      ]
    );
  };

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.row}>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={add}
          placeholder="New category"
          placeholderTextColor={theme.textSecondary}
          returnKeyType="done"
          style={inputStyle}
        />
        <Pressable
          onPress={add}
          disabled={!newName.trim()}
          style={[styles.addButton, { opacity: newName.trim() ? 1 : 0.5 }]}>
          <ThemedText type="smallBold" style={styles.addButtonText}>
            Add
          </ThemedText>
        </Pressable>
      </ThemedView>

      {categories.length === 0 && (
        <ThemedText themeColor="textSecondary">
          No categories yet. Add one to start grouping your exercises.
        </ThemedText>
      )}

      {categories.map((category) => (
        <ThemedView key={category.id} style={styles.row}>
          <TextInput
            defaultValue={category.name}
            onEndEditing={(e) => {
              const name = e.nativeEvent.text.trim();
              if (name && name !== category.name) renameCategory(category.id, name);
            }}
            style={inputStyle}
          />
          <Pressable onPress={() => confirmDelete(category.id, category.name)} hitSlop={8}>
            <Ionicons name="trash" size={22} color="#e0453c" />
          </Pressable>
        </ThemedView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  input: {
    flex: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addButtonText: {
    color: '#ffffff',
  },
});
