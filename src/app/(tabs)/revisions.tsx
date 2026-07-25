import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import {
  Screen,
  Text,
  Card,
  Button,
  ProgressBar,
  Chip,
  StateView,
  TrademyIcon,
  theme,
  type TrademyIconName,
} from '@/design-system';
import { CharacterScene, mascotPresence } from '@/characters';
import { useProgress, SKILLS, selectDueReviews, MASTERY_LABEL, summarizeMisconceptions } from '@/data';
import { isDue, masteryStatus, errorCount, type MasteryStatus } from '@/engines/learning';
import { useNow } from '@/lib/useNow';

/**
 * Écran RÉVISIONS (LOT 4-C — application du canon TradeMy Learning Glass).
 *
 * Présentation UNIQUEMENT : cet écran LIT le moteur de répétition espacée et de maîtrise
 * (`selectDueReviews`, `masteryStatus`, `isDue`, `errorCount`, `summarizeMisconceptions`). Il ne
 * modifie ni les intervalles, ni le calcul de maîtrise, ni la planification, ni la persistance, ni
 * les routes. Hiérarchie à UNE action principale ; icônes de la famille ; couleurs pédagogiques.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

function nextReviewLabel(dueAt: number, now: number): string {
  if (now >= dueAt) return 'À réviser maintenant';
  const days = Math.ceil((dueAt - now) / DAY_MS);
  return days <= 1 ? 'Demain' : `Dans ${days} jours`;
}

// Statut de maîtrise → couleur PÉDAGOGIQUE / informationnelle (JAMAIS une couleur de MARCHÉ ou
// d'annotation) + icône de la famille. La couleur n'est jamais le SEUL signal : chaque statut porte
// aussi une icône ET un libellé.
const STATUS_COLOR: Record<MasteryStatus, string> = {
  new: theme.colors.neutral,
  learning: theme.colors.info,
  fragile: theme.colors.warning,
  reviewing: theme.colors.info,
  strong: theme.colors.success, // réussite PÉDAGOGIQUE (menthe), pas un vert de marché (bullish)
  mastered: theme.colors.mastery, // token de maîtrise dédié (accent de marque)
};
const STATUS_ICON: Record<MasteryStatus, TrademyIconName> = {
  new: 'hint',
  learning: 'progression',
  fragile: 'warning',
  reviewing: 'review',
  strong: 'check',
  mastered: 'mastery',
};

export default function Revisions() {
  const router = useRouter();
  const { state, ready } = useProgress();
  const now = useNow();

  if (!ready || !state) {
    return (
      <Screen>
        <StateView variant="loading" title="On rassemble tes révisions…" />
      </Screen>
    );
  }

  const due = selectDueReviews(state, SKILLS, now);
  const started = SKILLS.filter((s) => state.completedSkills.includes(s.id));

  // Points faibles : agrège les erreurs de toutes les compétences en misconceptions typées.
  const allErrorTags: Record<string, number> = {};
  for (const sp of Object.values(state.skills)) {
    for (const [tag, n] of Object.entries(sp.errorTags ?? {})) {
      allErrorTags[tag] = (allErrorTags[tag] ?? 0) + n;
    }
  }
  const weakSpots = summarizeMisconceptions(allErrorTags);

  // Priorité du jour = première compétence due (ordre du parcours). Présentation seule ; le moteur
  // décide de ce qui est dû, cet écran ne fait qu'en mettre une en avant.
  const primary = due[0];

  return (
    <Screen>
      <View style={styles.header}>
        <TrademyIcon name="review" size={22} color={theme.colors.primaryBright} />
        <Text variant="h1">Révisions</Text>
      </View>
      <Text variant="body" color={theme.colors.textSecondary}>
        La répétition espacée ramène chaque compétence au bon moment pour ancrer ta mémoire.
      </Text>

      {/* Écran dense (liste) → présence compacte : une seule mascotte discrète. */}
      {mascotPresence('review') === 'compact' ? (
        <CharacterScene
          character="bobo"
          state="review"
          size={54}
          showName={false}
          speech="On consolide ce qui compte, au bon moment."
        />
      ) : null}

      {/* ── ACTION PRINCIPALE UNIQUE ── */}
      {primary ? (
        <Card elevated style={styles.heroCard}>
          <View style={styles.sectionLabel}>
            <TrademyIcon name="review" size={16} color={theme.colors.primaryBright} />
            <Text variant="label" color={theme.colors.primaryBright}>
              À RÉVISER AUJOURD’HUI
            </Text>
          </View>
          <Text variant="h2">{primary.name}</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            {due.length > 1
              ? `${due.length} compétences reviennent aujourd’hui — commence par la plus prioritaire.`
              : 'Une compétence revient pour ancrer ta mémoire au bon moment.'}
          </Text>
          <View style={styles.cta}>
            <Button
              label={`Réviser — ${primary.name}`}
              onPress={() => router.push(`/session/${primary.id}`)}
              accessibilityHint={`Lancer la révision de ${primary.name}`}
            />
          </View>
          {due.length > 1 ? (
            <View style={styles.secondaryList}>
              {due.slice(1).map((s) => (
                <Button
                  key={s.id}
                  label={`Réviser — ${s.name}`}
                  variant="secondary"
                  onPress={() => router.push(`/session/${s.id}`)}
                  accessibilityHint={`Lancer la révision de ${s.name}`}
                />
              ))}
            </View>
          ) : null}
        </Card>
      ) : (
        // État « à jour » clair et rassurant, avec UNE seule action utile et existante.
        <Card elevated style={styles.upToDateCard}>
          <View style={styles.sectionLabel}>
            <TrademyIcon name="check" size={16} color={theme.colors.success} />
            <Text variant="label" color={theme.colors.success}>
              TU ES À JOUR
            </Text>
          </View>
          <Text variant="h2">Aucune révision pour l’instant</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            {started.length
              ? 'Tes compétences reviendront automatiquement au bon moment. Avance en attendant.'
              : 'Commence le parcours : chaque compétence réussie entre ensuite en révision.'}
          </Text>
          <View style={styles.cta}>
            <Button
              label="Continuer le parcours"
              onPress={() => router.push('/parcours')}
              accessibilityHint="Ouvrir le parcours d’apprentissage"
            />
          </View>
        </Card>
      )}

      {/* ── Points faibles (secondaire) ── */}
      {weakSpots.length ? (
        <Card>
          <View style={styles.sectionLabel}>
            <TrademyIcon name="target" size={16} color={theme.colors.info} />
            <Text variant="label" color={theme.colors.info}>
              TES POINTS FAIBLES
            </Text>
          </View>
          <Text variant="caption" color={theme.colors.textMuted}>
            Les idées fausses qui reviennent le plus — vise-les en priorité.
          </Text>
          <View style={styles.weakList}>
            {weakSpots.slice(0, 4).map((w) => (
              <View key={w.misconception.id} style={styles.weakItem}>
                <View style={styles.row}>
                  <Text variant="body" style={styles.flex1}>
                    {w.misconception.label}
                  </Text>
                  <Chip
                    iconName="refresh"
                    label={`×${w.count}`}
                    color={theme.colors.warning}
                    accessibilityLabel={`Revient ${w.count} fois`}
                  />
                </View>
                <Text variant="caption" color={theme.colors.textMuted}>
                  {w.misconception.hint}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {/* ── Progression de maîtrise (secondaire) ── */}
      <Text variant="h2">Progression de maîtrise</Text>
      {started.length === 0 ? (
        <StateView
          variant="empty"
          iconName="progression"
          title="Aucune compétence terminée"
          message="Commence le parcours : chaque compétence réussie entre ensuite en révision."
          action={{ label: 'Ouvrir le parcours', onPress: () => router.push('/parcours') }}
        />
      ) : (
        started.map((s) => {
          const sp = state.skills[s.id];
          const mastery = sp?.mastery ?? 0;
          const pct = Math.round(mastery * 100);
          const dueNow = sp ? isDue(sp.review, now) : false;
          const status = sp ? masteryStatus(sp) : 'new';
          const errors = sp ? errorCount(sp) : 0;
          return (
            <Card key={s.id}>
              <View style={styles.row}>
                <Text variant="title" style={styles.flex1}>
                  {s.name}
                </Text>
                <Chip
                  iconName={STATUS_ICON[status]}
                  label={MASTERY_LABEL[status]}
                  color={STATUS_COLOR[status]}
                  accessibilityLabel={`Niveau de maîtrise : ${MASTERY_LABEL[status]}`}
                />
              </View>
              <View style={styles.masteryRow}>
                {/* Jauge = nom + valeur + contexte ; le % visible est décoratif (déjà porté par la jauge). */}
                <ProgressBar
                  value={mastery}
                  color={STATUS_COLOR[status]}
                  accessibilityLabel={`Progression de ${s.name}`}
                />
              </View>
              <View style={styles.metaRow}>
                <Text
                  variant="caption"
                  color={theme.colors.textMuted}
                  style={styles.flex1}
                  importantForAccessibility="no"
                  accessibilityElementsHidden
                >
                  {pct} % de maîtrise
                </Text>
                <Text variant="caption" color={dueNow ? theme.colors.warning : theme.colors.textMuted}>
                  {dueNow ? 'À réviser' : nextReviewLabel(sp?.review.dueAt ?? now, now)}
                </Text>
              </View>
              {errors > 0 ? (
                <View style={styles.errorRow}>
                  <TrademyIcon name="warning" size={14} color={theme.colors.feedbackIncorrect} />
                  <Text variant="caption" color={theme.colors.feedbackIncorrect} style={styles.flex1}>
                    {errors} erreur{errors > 1 ? 's' : ''} à retravailler — une révision les reprogramme.
                  </Text>
                </View>
              ) : null}
            </Card>
          );
        })
      )}

      {/* ── Deck de révision (secondaire, Premium) ── */}
      <Card>
        <View style={styles.row}>
          <View style={[styles.sectionLabel, styles.flex1]}>
            <TrademyIcon name="book" size={18} color={theme.colors.textSecondary} />
            <Text variant="title">Deck de révision des concepts</Text>
          </View>
          <Chip iconName="star" label="Premium" color={theme.colors.reward} accessibilityLabel="Fonction Premium" />
        </View>
        <Text variant="body" color={theme.colors.textSecondary}>
          Flashcards et mini-quiz de tous les concepts, réunis pour réviser d’un coup.
        </Text>
        <Button
          label="Ouvrir le deck"
          variant="secondary"
          onPress={() => router.push('/revision-deck')}
          accessibilityHint="Deck de révision des concepts (Premium)"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  heroCard: { gap: theme.spacing.xs },
  upToDateCard: { gap: theme.spacing.xs, borderColor: theme.colors.success },
  cta: { marginTop: theme.spacing.sm },
  secondaryList: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  weakList: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  weakItem: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.xs },
  flex1: { flex: 1 },
  masteryRow: { marginVertical: theme.spacing.sm },
});
