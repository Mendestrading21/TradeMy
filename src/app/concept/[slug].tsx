import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  Screen,
  Text,
  Card,
  GlassCard,
  Button,
  Chip,
  StateView,
  FavoriteButton,
  TrademyIcon,
  difficultyTone,
  theme,
  type TrademyIconName,
} from '@/design-system';
import {
  V5_CONCEPTS,
  conceptBySlug,
  relatedConcepts,
  worldById,
  categoryById,
  conceptMasteryStatus,
  needsEditorialReview,
  EDITORIAL_REVIEW_NOTICE,
  useProgress,
  type ConceptState,
} from '@/data';
import { VisualCard } from '@/engines/visual';
import { CharacterScene } from '@/characters';
import { Disclaimer } from '@/components/Disclaimer';
import { analytics } from '@/analytics';

/**
 * Fiche concept visuelle (LOT 4-J — canon TradeMy Learning Glass). Surface centrale de lecture d'un
 * concept, pensée pour croître vers 500+ entrées. PRÉSENTATION UNIQUEMENT : l'écran LIT `V5_CONCEPTS`,
 * la machine de maîtrise STRICTE (`conceptMasteryStatus` vers 5 états) et le pont éditorial
 * (`needsEditorialReview`). Il ne modifie ni le contenu, ni les moteurs, ni la progression, ni la
 * persistance, ni l'analytics : ouvrir la fiche marque « exploré » comme avant, rien de plus.
 *
 * Iconographie : `TrademyIcon` UNIQUEMENT (aucun emoji, aucun glyphe de commande). Couleurs
 * sémantiques strictes : bullish/bearish réservés à la DIRECTION de marché des scénarios ; la
 * maîtrise emploie ses tokens dédiés (identiques à la Bibliothèque, LOT 4-F), jamais le cyan
 * d'annotation ; l'état de maîtrise est porté par l'icône + le libellé, jamais par la seule couleur.
 */

/** État strict vers couleur (token dédié) + icône + libellé — MÊME canon que la Bibliothèque (LOT 4-F). */
const STATE_META: Record<ConceptState, { color: string; icon: TrademyIconName }> = {
  new: { color: theme.colors.textMuted, icon: 'book' },
  explored: { color: theme.colors.info, icon: 'library' },
  completed: { color: theme.colors.primaryBright, icon: 'progression' },
  strong: { color: theme.colors.success, icon: 'success' },
  mastered: { color: theme.colors.mastery, icon: 'mastery' },
};

/** Direction de marché vers icône + couleur — bullish/bearish RÉSERVÉS au sens marché du scénario. */
const SCENARIO_META: { key: 'bullish' | 'bearish' | 'neutral'; label: string; icon: TrademyIconName; color: string }[] = [
  { key: 'bullish', label: 'Setup haussier', icon: 'market-up', color: theme.colors.bullish },
  { key: 'bearish', label: 'Setup baissier', icon: 'market-down', color: theme.colors.bearish },
  { key: 'neutral', label: 'Scénario neutre', icon: 'chart', color: theme.colors.neutral },
];

/**
 * Couleur de la puce de difficulté — mapping local STRICT. `difficultyTone` reste employé pour son
 * LIBELLÉ (Découverte / Intermédiaire / Avancé), mais sa couleur renvoie `technical` (cyan d'annotation)
 * pour les difficultés 1–2 : on ne l'utilise donc PAS pour la couleur. Aucun chemin d'exécution de cet
 * écran ne produit `technical` (réservé au `VisualCard` partagé).
 */
const DIFFICULTY_COLOR: Record<string, string> = {
  'Découverte': theme.colors.neutral,
  'Intermédiaire': theme.colors.warning,
  'Avancé': theme.colors.advanced,
};

/** Titre de section : icône fonctionnelle `TrademyIcon` (décorative) + libellé. Aucune décoration inutile. */
function SectionHead({ iconName, title, color }: { iconName: TrademyIconName; title: string; color?: string }) {
  return (
    <View style={styles.sectionHead}>
      <TrademyIcon name={iconName} size={18} color={color ?? theme.colors.textSecondary} strokeWidth={2.2} />
      <Text variant="title" color={color}>
        {title}
      </Text>
    </View>
  );
}

export default function ConceptFiche() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { favorites, toggleFavorite, markRecentlyViewed, markConceptExplored, ready, state } = useProgress();
  const concept = conceptBySlug(V5_CONCEPTS, slug ?? '');
  const fav = concept ? favorites.has(concept.slug) : false;

  useEffect(() => {
    if (concept) analytics.track('concept_viewed', { categoryId: concept.categoryId, hasVisual: Boolean(concept.visualSpec) });
  }, [concept]);

  // La progression se charge de façon asynchrone : on n'enregistre l'exploration
  // qu'une fois `ready` (sinon l'état est encore null et le marquage est perdu).
  useEffect(() => {
    if (ready && concept) {
      markRecentlyViewed(concept.slug);
      markConceptExplored(concept.slug, concept.worldId);
    }
  }, [ready, concept, markRecentlyViewed, markConceptExplored]);

  if (!concept) {
    return (
      <Screen>
        <StateView
          variant="empty"
          iconName="search"
          title="Concept introuvable"
          message="Ce concept n’est pas dans l’aperçu V5."
        />
        <Button label="Retour" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const world = worldById(concept.worldId);
  const category = categoryById(concept.categoryId);
  const tone = difficultyTone(concept.difficulty);
  const related = relatedConcepts(V5_CONCEPTS, concept);
  const mastery = conceptMasteryStatus(concept, {
    exploredSlugs: state?.learning?.conceptsExplored ?? [],
    skills: state?.skills ?? {},
    completedSkills: state?.completedSkills ?? [],
    targets: state?.targets ?? {},
  });
  const masteryMeta = STATE_META[mastery.state];
  const scenarios = SCENARIO_META.map((s) => ({
    ...s,
    data: s.key === 'bullish' ? concept.bullishScenario : s.key === 'bearish' ? concept.bearishScenario : concept.neutralScenario,
  })).filter((s) => s.data);

  return (
    <Screen>
      <Text variant="caption" color={theme.colors.textMuted}>
        {world?.title?.toUpperCase()} · {category?.label}
      </Text>
      <View style={styles.headRow}>
        <Text variant="h1" style={styles.flex1}>
          {concept.title}
        </Text>
        <FavoriteButton active={fav} onToggle={() => toggleFavorite(concept.slug)} label={concept.title} size="lg" />
      </View>
      <View style={styles.metaRow}>
        {/* Maîtrise : icône + libellé + couleur dédiée (jamais la couleur seule, jamais le cyan). */}
        <Chip iconName={masteryMeta.icon} label={mastery.stateLabel} color={masteryMeta.color} />
        <Chip iconName="target" label={`${tone.label} · ${concept.difficulty}/5`} color={DIFFICULTY_COLOR[tone.label] ?? theme.colors.neutral} />
        {concept.estimatedMinutes ? <Chip iconName="timer" label={`${concept.estimatedMinutes} min`} color={theme.colors.neutral} /> : null}
        {concept.aliases[0] ? <Chip label={concept.aliases[0]} color={theme.colors.textMuted} /> : null}
      </View>

      {needsEditorialReview(concept) ? (
        <Card style={styles.reviewNotice} accessibilityRole="summary">
          <SectionHead iconName="warning" title="À relire" color={theme.colors.warning} />
          <Text variant="caption" color={theme.colors.textSecondary}>
            {EDITORIAL_REVIEW_NOTICE}
          </Text>
        </Card>
      ) : null}

      {concept.visualSpec ? <VisualCard spec={concept.visualSpec} title="Visuel" /> : null}

      <GlassCard>
        <SectionHead iconName="info" title="En bref" color={theme.colors.textSecondary} />
        <Text variant="body">{concept.definitionShort}</Text>
      </GlassCard>

      {concept.dialogue ? (
        <View style={styles.dialogue}>
          <CharacterScene character="toto" state="explain" size={56} speech={concept.dialogue.toto} />
          <CharacterScene character="bobo" state="false-signal" size={56} reversed speech={concept.dialogue.bobo} />
        </View>
      ) : null}

      <Card>
        <SectionHead iconName="book" title="Définition" color={theme.colors.textSecondary} />
        <Text variant="body">{concept.definitionDetailed}</Text>
      </Card>

      {concept.howToRecognize.length ? (
        <Card>
          <SectionHead iconName="search" title="Comment reconnaître" />
          <View style={styles.list}>
            {concept.howToRecognize.map((r) => (
              <View key={r} style={styles.bulletRow}>
                <TrademyIcon name="check" size={16} color={theme.colors.textMuted} strokeWidth={2.4} />
                <Text variant="body" color={theme.colors.textSecondary} style={styles.flex1}>
                  {r}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {scenarios.map((s) => (
        <Card key={s.key}>
          <SectionHead iconName={s.icon} title={s.label} color={s.color} />
          <View style={styles.list}>
            {s.data!.conditions.map((c) => (
              <View key={c} style={styles.bulletRow}>
                <TrademyIcon name="confirmation" size={16} color={s.color} strokeWidth={2.2} />
                <Text variant="body" color={theme.colors.textSecondary} style={styles.flex1}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.invalidationRow}>
            <TrademyIcon name="invalidation" size={16} color={theme.colors.warning} strokeWidth={2.2} />
            <Text variant="caption" color={theme.colors.warning} style={styles.flex1}>
              Invalidation : {s.data!.invalidation}
            </Text>
          </View>
        </Card>
      ))}

      {concept.falseSignals.length ? (
        <Card>
          {/* Faux signaux = AVERTISSEMENT (warning), jamais une direction de marché (bearish réservé au scénario). */}
          <SectionHead iconName="false-signal" title="Faux signaux" color={theme.colors.warning} />
          <View style={styles.list}>
            {concept.falseSignals.map((f) => (
              <View key={f} style={styles.bulletRow}>
                <TrademyIcon name="false-signal" size={16} color={theme.colors.warning} strokeWidth={2.2} />
                <Text variant="body" color={theme.colors.textSecondary} style={styles.flex1}>
                  {f}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {concept.flashcards[0] ? (
        <Card>
          <SectionHead iconName="review" title="Flashcard" color={theme.colors.primaryBright} />
          <Text variant="body">{concept.flashcards[0].front}</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            {concept.flashcards[0].back}
          </Text>
        </Card>
      ) : null}

      {related.length ? (
        <Card>
          <SectionHead iconName="library" title="Concepts liés" />
          <View style={styles.chips}>
            {related.map((rc) => (
              <Pressable
                key={rc.id}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir ${rc.title}`}
                onPress={() => router.push(`/concept/${rc.slug}`)}
                style={styles.relatedChip}
              >
                <Text variant="caption" color={theme.colors.textPrimary} numberOfLines={1} style={styles.relatedLabel}>
                  {rc.title}
                </Text>
                <TrademyIcon name="chevron-right" size={16} color={theme.colors.textMuted} strokeWidth={2.2} />
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      <Text variant="caption" color={theme.colors.textMuted} center>
        {concept.disclaimer}
      </Text>
      <Disclaimer />
      <Button label="Retour" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
  flex1: { flex: 1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  reviewNotice: { gap: theme.spacing.xs, borderColor: theme.colors.warning },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  dialogue: { gap: theme.spacing.md },
  list: { gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
  invalidationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  relatedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  relatedLabel: { maxWidth: 220 },
});
