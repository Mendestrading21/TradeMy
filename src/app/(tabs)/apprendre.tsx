import { useMemo, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { View, TextInput, Pressable, ScrollView, FlatList, StyleSheet } from 'react-native';
import {
  Screen,
  Text,
  Card,
  SegmentedControl,
  FavoriteButton,
  StateView,
  TrademyIcon,
  theme,
  hitSlopFor,
  type SegmentOption,
  type TrademyIconName,
} from '@/design-system';
import {
  V5_CONCEPTS,
  CATEGORIES,
  browseConcepts,
  conceptFamilies,
  difficultyLabel,
  conceptMasteryStatus,
  useProgress,
  type LearningConcept,
  type ConceptState,
} from '@/data';
import { Disclaimer } from '@/components/Disclaimer';
import { analytics } from '@/analytics';

/**
 * Espace « Bibliothèque » (LOT 4-F — canon TradeMy Learning Glass). La référence cherchable de
 * TradeMy, conçue pour croître vers 500+ concepts (liste NATIVE virtualisée via `FlatList`, sans
 * toucher au shell : `Screen scroll={false}`).
 *
 * Présentation UNIQUEMENT : l'écran LIT `V5_CONCEPTS`, la recherche/filtres purs (`browseConcepts`) et
 * la machine de maîtrise STRICTE (`conceptMasteryStatus` → 5 états). Il ne modifie ni le moteur de
 * maîtrise, ni la répétition espacée, ni la persistance, ni le contenu. Ouvrir/filtrer/ajouter un
 * favori ne mute aucune progression (la fiche `/concept/{slug}` marque « exploré », pas la liste).
 *
 * Vérité stricte : Nouveau (new) · Découvert (explored, jamais maîtrisé) · En cours (completed) ·
 * Solide (strong) · Maîtrisé (mastered). La liste affiche la MÊME vérité que les fiches (les 4
 * paramètres — exploredSlugs, skills, completedSkills, targets — sont transmis, plus de sous-report).
 */
type Collection = 'all' | 'favorites' | 'recent';
type StateFilter = 'all' | ConceptState;

const TOOLS: { icon: TrademyIconName; label: string; route: Href }[] = [
  { icon: 'book', label: 'Glossaire', route: '/glossaire' },
  { icon: 'chart', label: 'Figures', route: '/bibliotheque-visuelle' },
  { icon: 'search', label: 'Quiz visuel', route: '/reconnaissance' },
  { icon: 'play', label: 'Leçons', route: '/lecons' },
  { icon: 'target', label: 'Quiz éclair', route: '/quiz' },
];

/** État strict → couleur (token) + icône (décorative) + libellé. La couleur n'est jamais seule. */
const STATE_META: Record<ConceptState, { label: string; color: string; icon: TrademyIconName }> = {
  new: { label: 'Nouveau', color: theme.colors.textMuted, icon: 'book' },
  explored: { label: 'Découvert', color: theme.colors.info, icon: 'library' },
  completed: { label: 'En cours', color: theme.colors.primaryBright, icon: 'progression' },
  strong: { label: 'Solide', color: theme.colors.success, icon: 'success' },
  mastered: { label: 'Maîtrisé', color: theme.colors.mastery, icon: 'mastery' },
};
const STATE_ORDER: ConceptState[] = ['new', 'explored', 'completed', 'strong', 'mastered'];

export default function Bibliotheque() {
  const router = useRouter();
  const { favorites, recentSlugs, toggleFavorite, state, ready } = useProgress();
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState<Collection>('all');
  const [categoryId, setCategoryId] = useState<string | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');

  // ── Statut STRICT par concept, mémorisé (aucun second calcul ; les 4 paramètres réels sont transmis :
  // exploredSlugs, skills, completedSkills, targets — source unique de vérité `conceptMasteryStatus`). ──
  const stateBySlug = useMemo(() => {
    const exploredSlugs = state?.learning?.conceptsExplored ?? [];
    const skills = state?.skills ?? {};
    const completedSkills = state?.completedSkills ?? [];
    const targets = state?.targets ?? {};
    const m = new Map<string, ConceptState>();
    for (const c of V5_CONCEPTS) m.set(c.slug, conceptMasteryStatus(c, { exploredSlugs, skills, completedSkills, targets }).state);
    return m;
  }, [state]);

  const families = useMemo(() => conceptFamilies(V5_CONCEPTS, CATEGORIES), []);

  const results = useMemo(() => {
    let base: LearningConcept[] = V5_CONCEPTS;
    if (collection === 'favorites') {
      base = base.filter((c) => favorites.has(c.slug));
    } else if (collection === 'recent') {
      const order = new Map(recentSlugs.map((s, i) => [s, i]));
      base = base.filter((c) => order.has(c.slug)).sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
    }
    let list = browseConcepts(base, { query, categoryId: categoryId === 'all' ? null : categoryId });
    if (stateFilter !== 'all') list = list.filter((c) => stateBySlug.get(c.slug) === stateFilter);
    return list;
  }, [query, collection, categoryId, stateFilter, favorites, recentSlugs, stateBySlug]);

  if (!ready) {
    return (
      <Screen>
        <StateView variant="loading" title="On ouvre la bibliothèque…" />
      </Screen>
    );
  }

  const total = V5_CONCEPTS.length;
  const hasSearch = query.trim().length > 0;
  const hasFilter = hasSearch || categoryId !== 'all' || stateFilter !== 'all';
  const activeFamily = categoryId !== 'all' ? families.find((f) => f.id === categoryId)?.label : null;
  const activeState = stateFilter !== 'all' ? STATE_META[stateFilter].label : null;

  const clearFilters = () => {
    setQuery('');
    setCategoryId('all');
    setStateFilter('all');
  };

  const collections: SegmentOption<Collection>[] = [
    { id: 'all', label: 'Tous' },
    { id: 'favorites', label: 'Favoris', badge: favorites.size },
    { id: 'recent', label: 'Récents', badge: recentSlugs.length },
  ];

  // Résumé contextualisé (un seul nom accessible ; jamais un nombre isolé).
  const parts = [
    activeFamily ? `famille ${activeFamily}` : null,
    activeState ? `niveau ${activeState}` : null,
    hasSearch ? `recherche « ${query.trim()} »` : null,
  ].filter(Boolean);
  const summaryLabel =
    `${results.length} concept${results.length !== 1 ? 's' : ''}` +
    (hasFilter ? ` correspondant${results.length !== 1 ? 's' : ''}` : '') +
    ` sur ${total}` +
    (parts.length ? ` — ${parts.join(', ')}` : '');

  const renderItem = ({ item: c }: { item: LearningConcept }) => {
    const cat = CATEGORIES.find((x) => x.id === c.categoryId);
    const st = stateBySlug.get(c.slug) ?? 'new';
    const meta = STATE_META[st];
    const fav = favorites.has(c.slug);
    const a11y =
      `${c.title}. ${cat?.label ?? 'Concept'}, ${difficultyLabel(c.difficulty)}` +
      (c.estimatedMinutes ? `, ${c.estimatedMinutes} minutes` : '') +
      `. Niveau : ${meta.label}.` +
      (fav ? ' En favori.' : '');
    return (
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <Pressable
            style={styles.flex1}
            accessible
            accessibilityRole="button"
            accessibilityLabel={a11y}
            accessibilityHint="Ouvrir la fiche"
            onPress={() => router.push(`/concept/${c.slug}`)}
          >
            <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Text variant="title">{c.title}</Text>
              <Text variant="caption" color={theme.colors.textMuted}>
                {cat?.label} · {difficultyLabel(c.difficulty)}
                {c.estimatedMinutes ? ` · ${c.estimatedMinutes} min` : ''}
              </Text>
              <Text variant="body" color={theme.colors.textSecondary} numberOfLines={2} style={styles.summary}>
                {c.definitionShort}
              </Text>
              <View style={styles.statusRow}>
                <TrademyIcon name={meta.icon} size={14} color={meta.color} />
                <Text variant="caption" color={meta.color}>
                  {meta.label}
                </Text>
              </View>
            </View>
          </Pressable>
          <FavoriteButton active={fav} onToggle={() => toggleFavorite(c.slug)} label={c.title} />
        </View>
      </Card>
    );
  };

  const Header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <TrademyIcon name="library" size={22} color={theme.colors.primaryBright} />
        <Text variant="h1">Bibliothèque</Text>
      </View>
      <Text variant="body" color={theme.colors.textSecondary}>
        Cherche une notion, filtre par famille ou par niveau, et ouvre une fiche. Consulter aide à
        comprendre — la maîtrise, elle, se prouve.
      </Text>

      {/* Recherche DOMINANTE, avec effacement rapide */}
      <View style={styles.searchWrap}>
        <TrademyIcon name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => analytics.track('library_searched', { queryLength: query.trim().length, results: results.length })}
          placeholder="Rechercher un concept…"
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel="Rechercher un concept"
          returnKeyType="search"
        />
        {hasSearch ? (
          <Pressable onPress={() => setQuery('')} hitSlop={hitSlopFor(24)} accessibilityRole="button" accessibilityLabel="Effacer la recherche">
            <TrademyIcon name="close" size={18} color={theme.colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <SegmentedControl options={collections} value={collection} onChange={setCollection} accessibilityLabel="Collection" />

      {/* Filtre par famille (dérivé du corpus réel) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <FilterPill label="Toutes les familles" active={categoryId === 'all'} onPress={() => setCategoryId('all')} />
        {families.map((f) => (
          <FilterPill key={f.id} label={`${f.label} · ${f.count}`} active={categoryId === f.id} onPress={() => setCategoryId(f.id)} />
        ))}
      </ScrollView>

      {/* Filtre par état pédagogique STRICT (5 états) */}
      <View style={styles.chipsWrap}>
        <FilterPill label="Tout niveau" active={stateFilter === 'all'} onPress={() => setStateFilter('all')} />
        {STATE_ORDER.map((s) => (
          <FilterPill key={s} label={STATE_META[s].label} icon={STATE_META[s].icon} color={STATE_META[s].color} active={stateFilter === s} onPress={() => setStateFilter(s)} />
        ))}
      </View>

      <View style={styles.summaryRow}>
        <View accessible accessibilityLabel={summaryLabel} style={styles.flex1}>
          <Text variant="caption" color={theme.colors.textMuted}>
            {summaryLabel}
          </Text>
        </View>
        {hasFilter ? (
          <Pressable onPress={clearFilters} hitSlop={hitSlopFor(16)} accessibilityRole="button" accessibilityLabel="Effacer les filtres" style={styles.clearBtn}>
            <TrademyIcon name="close" size={14} color={theme.colors.primaryBright} />
            <Text variant="label" color={theme.colors.primaryBright}>
              Effacer les filtres
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const Empty = (
    <StateView
      variant="empty"
      iconName={collection === 'favorites' ? 'star' : collection === 'recent' ? 'review' : 'search'}
      title={
        collection === 'favorites'
          ? 'Aucun favori pour l’instant'
          : collection === 'recent'
            ? 'Aucun concept consulté récemment'
            : 'Aucun concept ne correspond'
      }
      message={
        collection === 'favorites'
          ? 'Touche l’étoile d’une fiche pour la retrouver ici.'
          : collection === 'recent'
            ? 'Les fiches que tu ouvres apparaîtront ici.'
            : 'Essaie un autre mot ou retire un filtre.'
      }
      action={
        collection !== 'all'
          ? { label: 'Voir tous les concepts', onPress: () => { setCollection('all'); clearFilters(); } }
          : hasFilter
            ? { label: 'Effacer les filtres', onPress: clearFilters }
            : undefined
      }
    />
  );

  const Footer = (
    <View style={styles.footer}>
      <View style={styles.toolsHead}>
        <TrademyIcon name="settings" size={16} color={theme.colors.textSecondary} />
        <Text variant="label" color={theme.colors.textSecondary}>
          OUTILS DE RÉFÉRENCE
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tools}>
        {TOOLS.map((t) => (
          <Pressable
            key={t.label}
            accessibilityRole="button"
            accessibilityLabel={t.label}
            accessibilityHint={`Ouvrir : ${t.label}`}
            onPress={() => router.push(t.route)}
            style={styles.tool}
          >
            <TrademyIcon name={t.icon} size={18} color={theme.colors.primaryBright} />
            <Text variant="label" color={theme.colors.textSecondary}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Disclaimer />
    </View>
  );

  return (
    <Screen scroll={false}>
      <FlatList
        data={results}
        keyExtractor={(c) => c.slug}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        ListEmptyComponent={Empty}
        ListFooterComponent={Footer}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        windowSize={8}
        removeClippedSubviews
      />
    </Screen>
  );
}

function FilterPill({
  label,
  active,
  color,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  icon?: TrademyIconName;
  onPress: () => void;
}) {
  const accent = color ?? theme.colors.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={hitSlopFor(24)}
      style={[styles.pill, active && { backgroundColor: accent, borderColor: accent }]}
    >
      {icon ? <TrademyIcon name={icon} size={13} color={active ? theme.colors.onPrimary : accent} /> : null}
      <Text variant="label" color={active ? theme.colors.onPrimary : theme.colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: theme.spacing.lg, gap: theme.spacing.md },
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  searchInput: { flex: 1, color: theme.colors.textPrimary, fontSize: 16, paddingVertical: theme.spacing.sm },
  chipsRow: { gap: theme.spacing.xs, paddingVertical: 2 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36, paddingHorizontal: theme.spacing.sm },
  card: {},
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.sm },
  flex1: { flex: 1, gap: 2, minHeight: 44 },
  summary: { marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: theme.spacing.xs },
  footer: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  toolsHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  tools: { gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
});
