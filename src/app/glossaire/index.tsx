import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Screen, Text, Card, SegmentedControl, FavoriteButton, theme, hitSlopFor, type SegmentOption } from '@/design-system';
import {
  UNIFIED_GLOSSARY,
  GLOSSARY_CATEGORIES,
  searchGlossary,
  hasConceptFiche,
  useProgress,
  type GlossaryCategory,
  type GlossaryTerm,
} from '@/data';
import { analytics } from '@/analytics';

type ViewMode = 'all' | 'favorites' | 'recent';

export default function Glossaire() {
  const router = useRouter();
  const { favorites, recentSlugs, toggleFavorite } = useProgress();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<GlossaryCategory | 'all'>('all');
  const [view, setView] = useState<ViewMode>('all');

  let list: GlossaryTerm[];
  if (view === 'recent') {
    const bySlug = new Map(UNIFIED_GLOSSARY.map((t) => [t.slug, t]));
    const recents = recentSlugs.map((s) => bySlug.get(s)).filter((t): t is GlossaryTerm => Boolean(t));
    list = query.trim() ? searchGlossary(recents, query, cat) : recents.filter((t) => cat === 'all' || t.category === cat);
  } else {
    const base = view === 'favorites' ? UNIFIED_GLOSSARY.filter((t) => favorites.has(t.slug)) : UNIFIED_GLOSSARY;
    list = searchGlossary(base, query, cat);
  }

  const open = (t: GlossaryTerm) =>
    router.push(hasConceptFiche(t.slug) ? `/concept/${t.slug}` : `/glossaire/${t.slug}`);

  const views: SegmentOption<ViewMode>[] = [
    { id: 'all', label: 'Tout' },
    { id: 'favorites', label: '★ Favoris', badge: favorites.size },
    { id: 'recent', label: 'Récents', badge: recentSlugs.length },
  ];

  return (
    <Screen>
      <Text variant="h1">Glossaire</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        Le vocabulaire des marchés, expliqué simplement.
      </Text>

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() =>
          analytics.track('glossary_searched', { queryLength: query.trim().length, category: cat, results: list.length })
        }
        placeholder="Rechercher un terme…"
        placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel="Rechercher un terme"
      />

      <SegmentedControl options={views} value={view} onChange={setView} accessibilityLabel="Filtrer le glossaire" />

      <View style={styles.chips}>
        {GLOSSARY_CATEGORIES.map((c) => {
          const active = cat === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCat(c.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              hitSlop={hitSlopFor(30)}
              style={[styles.chip, active && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
            >
              <Text variant="label" color={active ? theme.colors.onPrimary : theme.colors.textSecondary}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="caption" color={theme.colors.textMuted}>
        {list.length} terme{list.length > 1 ? 's' : ''} sur {UNIFIED_GLOSSARY.length} · le vocabulaire essentiel des marchés
      </Text>

      {list.map((t) => {
        const c = GLOSSARY_CATEGORIES.find((x) => x.id === t.category);
        const fav = favorites.has(t.slug);
        const fiche = hasConceptFiche(t.slug);
        return (
          <Card key={t.slug}>
            <View style={styles.top}>
              <Pressable style={styles.flex1} accessibilityRole="button" accessibilityHint={`Ouvrir ${t.term}`} onPress={() => open(t)}>
                <View style={styles.titleRow}>
                  <Text variant="title">{t.term}</Text>
                  {fiche ? (
                    <View style={styles.ficheTag}>
                      <Text variant="caption" color={theme.colors.technical}>
                        fiche visuelle
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="caption" color={theme.colors.textMuted}>
                  {t.english}
                </Text>
                <Text variant="body" color={theme.colors.textSecondary} style={styles.summary}>
                  {t.summary}
                </Text>
              </Pressable>
              <View style={styles.side}>
                <FavoriteButton active={fav} onToggle={() => toggleFavorite(t.slug)} label={t.term} />
                <View style={[styles.tag, { borderColor: c?.color ?? theme.colors.border }]}>
                  <Text variant="caption" color={c?.color}>
                    {c?.label}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        );
      })}
      {list.length === 0 ? (
        <Text variant="body" color={theme.colors.textMuted} center>
          {view === 'favorites'
            ? 'Aucun favori pour l’instant. Touche ★ sur un terme pour l’enregistrer.'
            : view === 'recent'
              ? 'Aucun terme consulté récemment.'
              : `Aucun terme ne correspond à « ${query} ».`}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.sm },
  flex1: { flex: 1, gap: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' },
  ficheTag: { borderWidth: 1, borderColor: theme.colors.technical, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: 1 },
  summary: { marginTop: 2 },
  side: { alignItems: 'flex-end', gap: theme.spacing.xs },
  tag: { borderWidth: 1, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: 2 },
});
