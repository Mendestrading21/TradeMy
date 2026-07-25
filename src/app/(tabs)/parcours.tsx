import { useRouter } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Screen,
  Text,
  Card,
  Button,
  Chip,
  ProgressBar,
  StateView,
  TrademyIcon,
  theme,
  type TrademyIconName,
} from '@/design-system';
import { MascotFigure } from '@/characters';
import { MiniVisual } from '@/engines/visual';
import {
  WORLDS,
  V5_CONCEPTS,
  buildLearningPath,
  worldsOpen,
  worldsDone,
  levelBandForOrder,
  conceptMasteryStatus,
  useProgress,
  type WorldEntry,
  type WorldStatus,
  type LevelBandDef,
} from '@/data';

/**
 * Espace « Apprendre » — LOT 4-E (application du canon TradeMy Learning Glass).
 *
 * Présentation UNIQUEMENT : l'écran LIT `buildLearningPath` (source de vérité pédagogique) et n'ajoute
 * AUCUN second calcul de progression, de déblocage ou de maîtrise. Il ne modifie ni `learningMap`, ni
 * les moteurs, ni la persistance, ni les routes.
 *
 * Hiérarchie : en-tête → résumé global → carte dominante « Ta prochaine étape » (UNE action, dérivée du
 * `current`) → roadmap des 15 mondes en trois bandes (Débutant / Intermédiaire / Avancé) → jalons
 * honnêtes. Chaque nœud regroupe son état en un seul nom accessible ; les couleurs sont sémantiques et
 * ne portent jamais seules l'information (icône + libellé toujours présents).
 *
 * Vérité préservée : « exploré » (fiches consultées) n'est JAMAIS « terminé » (preuve : checkpoint d'un
 * module guidé) ; « maîtrisé » = terminé ET fiches maîtrisées. Ouvrir une carte ne modifie aucune donnée.
 */

/** Descripteur canonique d'un état de monde : couleur (token) + icône (décorative) + libellé + a11y. */
interface StatusVisual {
  label: string;
  token: string;
  icon: TrademyIconName;
  /** Fragment accessible « niveau : … » (jamais un nombre isolé). */
  a11y: string;
}

function statusVisual(entry: WorldEntry): StatusVisual {
  if (entry.mastered) return { label: 'Maîtrisé', token: theme.colors.mastery, icon: 'mastery', a11y: 'maîtrisé' };
  switch (entry.status) {
    case 'done':
      return { label: 'Terminé', token: theme.colors.success, icon: 'check', a11y: 'terminé' };
    case 'explored':
      return { label: 'Exploré', token: theme.colors.info, icon: 'library', a11y: 'exploré (fiches consultées, pas encore validé)' };
    case 'current':
      return { label: 'En cours', token: theme.colors.primaryBright, icon: 'progression', a11y: 'en cours' };
    case 'unlocked':
      return { label: 'Disponible', token: theme.colors.info, icon: 'unlocked', a11y: 'disponible' };
    case 'locked':
    default:
      return { label: 'Verrouillé', token: theme.colors.textMuted, icon: 'lock', a11y: 'verrouillé' };
  }
}

/** Jalons de fin de bande, affichés HONNÊTEMENT (atteint vs à venir), jamais en récompense anticipée. */
const MILESTONES: Record<number, string> = {
  5: 'Bases débutant posées',
  10: 'Niveau intermédiaire franchi',
  15: 'Tour complet des mondes',
};

/** Action principale UNIQUE, dérivée exclusivement du `path` (aucun second calcul). */
function derivePrimary(path: WorldEntry[]): { label: string; hint: string; route: `/monde/${string}`; fallback: boolean } {
  const current = path.find((e) => e.status === 'current');
  if (current) {
    const { world, guided, progress } = current;
    const route = `/monde/${world.id}` as const;
    if (guided) {
      const label = progress > 0 ? `Continuer ${world.title}` : world.order === 1 ? 'Commencer le parcours' : `Commencer ${world.title}`;
      return { label, hint: `Ouvrir le module guidé ${world.title}`, route, fallback: false };
    }
    const label = progress > 0 ? `Continuer ${world.title}` : `Explorer ${world.title}`;
    return { label, hint: `Ouvrir le monde ${world.title}`, route, fallback: false };
  }
  // Aucun `current` : tout le contenu accessible est exploré/terminé. Repli HONNÊTE vers le monde ouvert
  // le plus avancé (route réelle) — jamais « Parcours terminé » tant que les règles ne le prouvent pas.
  const reachable = [...path].reverse().find((e) => e.status !== 'locked') ?? path[0];
  return { label: `Revoir ${reachable.world.title}`, hint: `Ouvrir le monde ${reachable.world.title}`, route: `/monde/${reachable.world.id}`, fallback: true };
}

/** Phrase d'orientation honnête pour la carte « prochaine étape ». */
function nextStepPhrase(path: WorldEntry[]): string {
  const current = path.find((e) => e.status === 'current');
  if (!current) return 'Tu as parcouru tous les mondes ouverts. Reviens consolider ou attends la suite du parcours.';
  if (current.guided) {
    return current.progress > 0
      ? 'Reprends ton module guidé là où tu t’es arrêté, une compétence à la fois.'
      : 'Ton premier module guidé t’attend : observe, formule, vérifie, puis valide le checkpoint.';
  }
  return current.progress > 0
    ? 'Continue d’explorer ce monde ; chaque fiche consultée ouvre la suite.'
    : 'Explore les fiches de ce monde pour débloquer le suivant.';
}

export default function Apprendre() {
  const router = useRouter();
  const { state, ready } = useProgress();

  if (!ready || !state) {
    return (
      <Screen>
        <StateView variant="loading" title="On déroule ta carte…" />
      </Screen>
    );
  }

  // ── Données RÉELLES (source unique : buildLearningPath), aucun second calcul dans l'écran ──
  const exploredSlugs = state.learning?.conceptsExplored ?? [];
  const masteredSlugs = V5_CONCEPTS.filter(
    (c) =>
      conceptMasteryStatus(c, {
        exploredSlugs,
        skills: state.skills ?? {},
        completedSkills: state.completedSkills ?? [],
        targets: state.targets ?? {},
      }).mastered,
  ).map((c) => c.slug);

  const path = buildLearningPath(WORLDS, V5_CONCEPTS, {
    completedSkills: state.completedSkills,
    exploredSlugs,
    masteredSlugs,
  });
  const total = WORLDS.length;
  const done = worldsDone(path);
  const open = worldsOpen(path);
  const explored = path.filter((e) => e.status === 'explored').length;

  const primary = derivePrimary(path);
  const current = path.find((e) => e.status === 'current');
  const hero = current ?? ([...path].reverse().find((e) => e.status !== 'locked') ?? path[0]);

  return (
    <Screen>
      {/* ── En-tête ── */}
      <View style={styles.header}>
        <TrademyIcon name="progression" size={22} color={theme.colors.primaryBright} />
        <Text variant="label" color={theme.colors.primaryBright}>
          APPRENDRE
        </Text>
      </View>
      <Text variant="h1">Ton parcours</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        Un seul chemin, du niveau zéro à l’analyse autonome. Un monde s’ouvre quand tu as exploré le
        précédent ; il n’est « terminé » qu’une fois sa preuve d’apprentissage validée.
      </Text>

      {/* ── Résumé global (progression annoncée UNE seule fois par la barre) ── */}
      <Card>
        <View style={styles.summaryHead}>
          <TrademyIcon name="chart" size={16} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            PROGRESSION GLOBALE
          </Text>
        </View>
        <ProgressBar value={done / total} accessibilityLabel={`${done} monde${done > 1 ? 's' : ''} terminé${done > 1 ? 's' : ''} sur ${total}`} />
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Text variant="caption" color={theme.colors.textMuted}>
            {done}/{total} terminés · {explored} explorés · {open}/{total} débloqués
          </Text>
        </View>
      </Card>

      {/* ── Carte DOMINANTE « Ta prochaine étape » (une seule action) ── */}
      <Card elevated style={styles.heroCard}>
        <View style={styles.heroHead}>
          <View style={styles.flex1}>
            <Text variant="label" color={theme.colors.primaryBright}>
              TA PROCHAINE ÉTAPE
            </Text>
            <Text variant="h2">{hero.world.title}</Text>
            <Text variant="caption" color={theme.colors.textMuted}>
              Monde {hero.world.order} · {statusVisual(hero).label}
            </Text>
          </View>
          <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <MascotFigure name="toto-present" height={84} />
          </View>
        </View>
        <Text variant="body" color={theme.colors.textSecondary}>
          {nextStepPhrase(path)}
        </Text>
        {hero.sampleSpec ? (
          <View style={styles.heroVisual} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <MiniVisual spec={hero.sampleSpec} width={150} />
          </View>
        ) : null}
        <Button label={primary.label} onPress={() => router.push(primary.route)} accessibilityHint={primary.hint} />
      </Card>

      {/* ── Légende : icône + libellé (la couleur n'est jamais seule) ── */}
      <Card>
        <View style={styles.summaryHead}>
          <TrademyIcon name="hint" size={16} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            REPÈRES
          </Text>
        </View>
        <View style={styles.legend}>
          {LEGEND.map((l) => (
            <View key={l.label} style={styles.legendItem} accessible accessibilityLabel={l.label}>
              <TrademyIcon name={l.icon} size={16} color={l.color} />
              <Text variant="caption" color={theme.colors.textMuted}>
                {l.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* ── Roadmap : 15 mondes, trois bandes ── */}
      <View style={styles.trail}>
        {path.map((entry, i) => {
          const band = levelBandForOrder(entry.world.order);
          const prevBand = i > 0 ? levelBandForOrder(path[i - 1].world.order) : null;
          const showHeader = !prevBand || prevBand.band !== band.band;
          const milestone = MILESTONES[entry.world.order];
          return (
            <View key={entry.world.id}>
              {showHeader ? <BandHeader def={band} /> : null}
              <WorldNode entry={entry} isCurrent={entry.status === 'current'} onOpen={() => router.push(`/monde/${entry.world.id}`)} />
              {milestone ? <Milestone label={milestone} reached={entry.status === 'done' || entry.status === 'explored' || entry.mastered} /> : null}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const LEGEND: { label: string; color: string; icon: TrademyIconName }[] = [
  { label: 'Disponible', color: theme.colors.info, icon: 'unlocked' },
  { label: 'En cours', color: theme.colors.primaryBright, icon: 'progression' },
  { label: 'Exploré', color: theme.colors.info, icon: 'library' },
  { label: 'Terminé', color: theme.colors.success, icon: 'check' },
  { label: 'Maîtrisé', color: theme.colors.mastery, icon: 'mastery' },
  { label: 'Verrouillé', color: theme.colors.textMuted, icon: 'lock' },
];

function BandHeader({ def }: { def: LevelBandDef }) {
  return (
    <View style={styles.bandHeader} accessibilityRole="header" accessible accessibilityLabel={`Niveau ${def.label}`}>
      <Text variant="label" color={theme.colors.textSecondary}>
        {def.label.toUpperCase()}
      </Text>
      <View style={styles.bandLine} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
    </View>
  );
}

/** Nom accessible complet d'un monde (numéro + titre + statut + détail/raison). */
function worldAccessibleLabel(entry: WorldEntry): string {
  const sv = statusVisual(entry);
  const base = `Monde ${entry.world.order}, ${entry.world.title}. Niveau : ${sv.a11y}.`;
  if (entry.status === 'locked') {
    return `${base} ${entry.lockReason ?? 'Explore le monde précédent pour le débloquer.'}`;
  }
  if (entry.guided) {
    return `${base} Module guidé, ${Math.round(entry.progress * 100)} % réalisé.`;
  }
  if (entry.conceptCount > 0) {
    return `${base} ${entry.exploredCount} fiche${entry.exploredCount > 1 ? 's' : ''} sur ${entry.conceptCount} consultée${entry.exploredCount > 1 ? 's' : ''}.`;
  }
  return `${base} Contenu à venir.`;
}

function StatusChip({ entry }: { entry: WorldEntry }) {
  const sv = statusVisual(entry);
  return <Chip iconName={sv.icon} label={sv.label} color={sv.token} />;
}

function WorldNode({ entry, isCurrent, onOpen }: { entry: WorldEntry; isCurrent: boolean; onOpen: () => void }) {
  const sv = statusVisual(entry);
  const color = sv.token;
  const locked = entry.status === 'locked';
  const filled = entry.status === 'done' || entry.mastered;
  const onFill = entry.mastered ? theme.colors.surface : theme.colors.background;

  return (
    <View style={styles.trailRow}>
      {/* Rail décoratif (numéro/icône) — masqué au lecteur d'écran, l'info est dans le nom groupé. */}
      <View style={styles.rail} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {entry.world.order > 1 ? (
          <View style={[styles.connector, { backgroundColor: locked ? theme.colors.border : color }]} />
        ) : (
          <View style={styles.connector} />
        )}
        <View style={[styles.badge, { borderColor: color, backgroundColor: filled ? color : theme.colors.surface }]}>
          {locked ? (
            <TrademyIcon name="lock" size={20} color={color} />
          ) : entry.mastered ? (
            <TrademyIcon name="mastery" size={20} color={onFill} />
          ) : entry.status === 'done' ? (
            <TrademyIcon name="check" size={20} color={onFill} />
          ) : (
            <Text variant="label" color={color}>
              {entry.world.order}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.labelWrap}>
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel={worldAccessibleLabel(entry)}
          accessibilityHint={locked ? 'Voir pourquoi ce monde est verrouillé' : 'Ouvrir le monde'}
          onPress={onOpen}
        >
          <Card style={[styles.worldCard, isCurrent ? styles.worldCardCurrent : null, { borderColor: locked ? theme.colors.border : color }]}>
            {/* Contenu VISUEL décoratif : le nom accessible du Pressable porte déjà toute l'information. */}
            <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <View style={styles.worldHead}>
                <View style={styles.flex1}>
                  <Text variant="title" color={locked ? theme.colors.textMuted : theme.colors.textPrimary}>
                    {entry.world.title}
                  </Text>
                  <Text variant="caption" color={theme.colors.textMuted}>
                    {entry.world.subtitle}
                  </Text>
                </View>
                <StatusChip entry={entry} />
              </View>

              {entry.guided ? (
                <View style={styles.guidedRow}>
                  <TrademyIcon name="checkpoint" size={14} color={theme.colors.textSecondary} />
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Module guidé
                  </Text>
                </View>
              ) : null}

              {!locked && entry.sampleSpec ? (
                <View style={styles.worldVisual}>
                  <MiniVisual spec={entry.sampleSpec} width={132} />
                </View>
              ) : null}

              {locked ? (
                <View style={styles.lockRow}>
                  <TrademyIcon name="lock" size={14} color={theme.colors.textMuted} />
                  <Text variant="caption" color={theme.colors.textMuted} style={styles.flex1}>
                    {entry.lockReason ?? 'Explore le monde précédent pour débloquer ce monde.'}
                  </Text>
                </View>
              ) : entry.guided ? (
                <View style={styles.worldProgress}>
                  <ProgressBar value={entry.progress} color={color} accessibilityLabel={`Progression du module ${entry.world.title}`} />
                  <Text variant="caption" color={theme.colors.textMuted}>
                    {Math.round(entry.progress * 100)} % du module réalisé
                  </Text>
                </View>
              ) : entry.conceptCount > 0 ? (
                <View style={styles.worldProgress}>
                  <ProgressBar value={entry.progress} color={color} accessibilityLabel={`Fiches consultées dans ${entry.world.title}`} />
                  <Text variant="caption" color={theme.colors.textMuted}>
                    {entry.exploredCount}/{entry.conceptCount} fiche{entry.conceptCount > 1 ? 's' : ''} consultée{entry.conceptCount > 1 ? 's' : ''}
                  </Text>
                </View>
              ) : (
                <Text variant="caption" color={theme.colors.textMuted}>
                  Contenu à venir
                </Text>
              )}
            </View>
          </Card>
        </Pressable>
      </View>
    </View>
  );
}

function Milestone({ label, reached }: { label: string; reached: boolean }) {
  const color = reached ? theme.colors.reward : theme.colors.textMuted;
  return (
    <View style={styles.milestone} accessible accessibilityLabel={`Palier ${reached ? 'atteint' : 'à venir'} : ${label}`}>
      <TrademyIcon name={reached ? 'check' : 'target'} size={16} color={color} />
      <Text variant="caption" color={color}>
        Palier {reached ? 'atteint' : 'à venir'} — {label}
      </Text>
    </View>
  );
}

const RAIL_W = 52;
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
  flex1: { flex: 1 },
  heroCard: { gap: theme.spacing.sm, borderColor: theme.colors.primary, borderWidth: 1.5 },
  heroHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  heroVisual: { alignItems: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trail: { marginTop: theme.spacing.sm },
  bandHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  bandLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  trailRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'stretch' },
  rail: { width: RAIL_W, alignItems: 'center' },
  connector: { width: 3, flex: 1, minHeight: theme.spacing.md, backgroundColor: 'transparent', borderRadius: 2 },
  badge: { width: RAIL_W, height: RAIL_W, borderRadius: RAIL_W / 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  labelWrap: { flex: 1, marginBottom: theme.spacing.md },
  worldCard: { borderWidth: 1.5, gap: theme.spacing.xs },
  worldCardCurrent: { borderWidth: 2 },
  worldHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  guidedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  worldVisual: { alignItems: 'center', marginTop: theme.spacing.xs },
  worldProgress: { gap: 2 },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginLeft: RAIL_W + theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
