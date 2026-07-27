import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Screen,
  Text,
  Card,
  Chip,
  StateView,
  Button,
  TrademyIcon,
  ProgressWidget,
  theme,
  type TrademyIconName,
} from '@/design-system';
import { CharacterScene, MascotFigure } from '@/characters';
import { MiniVisual } from '@/engines/visual';
import {
  WORLDS,
  V5_CONCEPTS,
  conceptsByWorld,
  buildLearningPath,
  worldEntryById,
  guidedModulesForWorld,
  buildWorldMap,
  skillById,
  conceptSlugForSkill,
  useProgress,
  type World,
  type WorldEntry,
  type WorldMap,
  type MapNode,
  type NodeStatus,
  type LearningConcept,
} from '@/data';
import type { Skill } from '@/engines/learning';
import { analytics } from '@/analytics';
import { useNow } from '@/lib/useNow';

/**
 * Fiche Monde canonique (LOT 4-L — canon TradeMy Learning Glass). En moins de cinq secondes,
 * l'utilisateur comprend : le sujet du monde, son statut, sa progression HONNÊTE, la prochaine action
 * recommandée et ce qui l'attend. PRÉSENTATION UNIQUEMENT : l'écran LIT les moteurs existants
 * (`buildLearningPath` pour le statut/progression, `buildWorldMap` pour le trail guidé) et ne modifie
 * ni les données, ni la progression, ni la maîtrise, ni la répétition espacée, ni l'analytics.
 *
 * Vérité pédagogique STRICTE : consulté ≠ terminé ≠ validé ≠ maîtrisé. Aucun pourcentage inventé,
 * aucun compteur codé en dur, aucune écriture de progression au rendu. La « prochaine étape » et le
 * statut du monde suivant sont DÉRIVÉS de l'état réel, jamais codés en dur.
 *
 * Hydratation : le premier rendu est indépendant de l'id (garde `!ready || !state`, d'où un chargement
 * identique au pré-rendu statique) ; `generateStaticParams` dérive de `WORLDS`. `ready` suffit ici
 * (contrairement à concept/glossaire) car le premier rendu ne dépend pas de l'id résolu.
 */

/**
 * Pré-génère un HTML concret par monde connu, servi directement par GitHub Pages (`monde/world.*.html`
 * au lieu du repli `404.html`), supprimant toute divergence d'hydratation sur les liens directs. Dérivé
 * de la source canonique `WORLDS` (aucune liste recopiée) : tout monde ajouté produit son HTML au build.
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return WORLDS.map((w) => ({ id: w.id }));
}

const DISCLAIMER = 'Application éducative. Aucun contenu ne constitue un conseil financier.';

// ─── Statut du monde vers couleur sémantique + icône + libellé (jamais la couleur seule) ────────
type HeroStatusKey = 'current' | 'unlocked' | 'explored' | 'done' | 'mastered';
const HERO_STATUS: Record<HeroStatusKey, { label: string; icon: TrademyIconName; color: string }> = {
  current: { label: 'En cours', icon: 'play', color: theme.colors.primaryBright },
  unlocked: { label: 'Disponible', icon: 'unlocked', color: theme.colors.info },
  explored: { label: 'Exploré', icon: 'library', color: theme.colors.info },
  done: { label: 'Terminé', icon: 'check', color: theme.colors.success },
  mastered: { label: 'Maîtrisé', icon: 'mastery', color: theme.colors.mastery },
};

function heroStatusKey(entry: WorldEntry): HeroStatusKey {
  if (entry.mastered) return 'mastered';
  if (entry.status === 'done') return 'done';
  if (entry.status === 'explored') return 'explored';
  if (entry.status === 'current') return 'current';
  return 'unlocked';
}

// ─── Nœud du trail guidé vers couleur + icône + texte de statut (accessible, jamais la couleur seule) ─
const NODE_COLORS: Record<NodeStatus, string> = {
  done: theme.colors.success,
  due: theme.colors.warning,
  current: theme.colors.primaryBright,
  locked: theme.colors.textMuted,
};

function nodeGlyph(node: MapNode): { icon?: TrademyIconName; text?: string } {
  if (node.status === 'locked') return { icon: 'lock' };
  if (node.kind === 'checkpoint') return { icon: node.status === 'done' ? 'trophy' : 'checkpoint' };
  if (node.status === 'done') return { icon: 'check' };
  if (node.status === 'due') return { icon: 'review' };
  return { text: String(node.index + 1) };
}

function nodeStatusText(node: MapNode): string {
  if (node.kind === 'checkpoint') {
    if (node.status === 'locked') return 'Verrouillé — termine les compétences pour ouvrir la revue';
    if (node.status === 'done') return 'Module validé';
    return 'Prêt — revois tout le module';
  }
  switch (node.status) {
    case 'done': return 'Terminé';
    case 'due': return 'À réviser — la répétition espacée la ramène';
    case 'current': return 'Prochaine étape';
    default: return 'Verrouillé — termine l’étape précédente';
  }
}

// ─── Prochaine étape : DÉRIVÉE de l'état réel, jamais codée en dur ───────────────────────────────
type NextStepKind = 'lesson' | 'continue' | 'review' | 'checkpoint' | 'explore' | 'next-world' | 'parcours' | 'soon';
interface NextStep {
  kind: NextStepKind;
  typeLabel: string;
  title: string;
  cta: string;
  route?: string;
  icon: TrademyIconName;
  color: string;
  minutes?: number;
  statusText: string;
}

/**
 * Dérive l'action principale unique. Monde guidé : depuis la carte réelle (`buildWorldMap`) —
 * révision due, compétence courante ou checkpoint ; sinon (module terminé) le monde suivant s'il est
 * réellement ouvert, à défaut le parcours. Monde de contenu : la première notion non consultée ;
 * sinon le monde suivant ouvert, à défaut le parcours. Le monde suivant est lu depuis le chemin
 * (`buildLearningPath`), jamais déverrouillé localement.
 */
function deriveNextStep(
  world: World,
  entry: WorldEntry,
  path: WorldEntry[],
  guidedMap: WorldMap | null,
  concepts: LearningConcept[],
  exploredSlugs: Set<string>,
): NextStep {
  const nextEntry = path.find((e) => e.world.order === world.order + 1);
  const nextWorldStep = (): NextStep | null => {
    if (nextEntry && nextEntry.status !== 'locked') {
      return {
        kind: 'next-world',
        typeLabel: 'Monde suivant',
        title: nextEntry.world.title,
        cta: 'Continuer vers ce monde',
        route: `/monde/${nextEntry.world.id}`,
        icon: 'chevron-right',
        color: theme.colors.success,
        statusText: 'Débloqué',
      };
    }
    return null;
  };
  const backToParcours: NextStep = {
    kind: 'parcours',
    typeLabel: 'Parcours',
    title: 'Reprends ton parcours',
    cta: 'Retour au parcours',
    route: '/parcours',
    icon: 'learn',
    color: theme.colors.primary,
    statusText: 'Choisis ta suite',
  };

  if (guidedMap) {
    const due = guidedMap.nodes.find((n) => n.kind === 'skill' && n.status === 'due');
    if (due) {
      return {
        kind: 'review',
        typeLabel: 'À réviser',
        title: due.title,
        cta: 'Réviser maintenant',
        route: `/session/${due.id}`,
        icon: 'review',
        color: theme.colors.warning,
        statusText: 'Révision due',
      };
    }
    const current = guidedMap.nodes.find((n) => n.status === 'current');
    if (current) {
      if (current.kind === 'checkpoint') {
        return {
          kind: 'checkpoint',
          typeLabel: 'Checkpoint',
          title: current.title,
          cta: 'Passer le checkpoint',
          route: `/session/${current.id}`,
          icon: 'checkpoint',
          color: theme.colors.reward,
          statusText: 'Revue de fin de module',
        };
      }
      const someDone = guidedMap.nodes.some((n) => n.kind === 'skill' && (n.status === 'done' || n.status === 'due'));
      return {
        kind: someDone ? 'continue' : 'lesson',
        typeLabel: 'Leçon',
        title: current.title,
        cta: someDone ? 'Continuer' : 'Commencer la leçon',
        route: `/session/${current.id}`,
        icon: 'play',
        color: theme.colors.primaryBright,
        statusText: someDone ? 'Prochaine étape' : 'Première compétence',
      };
    }
    // Module terminé (checkpoint validé) : pas d'impasse.
    return nextWorldStep() ?? backToParcours;
  }

  // Monde de contenu : la première fiche non consultée, sinon la suite.
  const firstUnexplored = concepts.find((c) => !exploredSlugs.has(c.slug));
  if (firstUnexplored) {
    const someExplored = concepts.some((c) => exploredSlugs.has(c.slug));
    return {
      kind: someExplored ? 'continue' : 'explore',
      typeLabel: 'Notion',
      title: firstUnexplored.title,
      cta: someExplored ? 'Continuer l’exploration' : 'Explorer les notions',
      route: `/concept/${firstUnexplored.slug}`,
      icon: 'book',
      color: theme.colors.primaryBright,
      minutes: firstUnexplored.estimatedMinutes,
      statusText: someExplored ? 'Fiche suivante à consulter' : 'Première fiche à consulter',
    };
  }
  if (concepts.length > 0) {
    // Toutes les fiches consultées (« exploré », jamais « terminé ») : on propose la suite honnête.
    return (
      nextWorldStep() ?? {
        kind: 'explore',
        typeLabel: 'Notions',
        title: 'Revois les notions du monde',
        cta: 'Revoir les notions',
        route: `/concept/${concepts[0].slug}`,
        icon: 'library',
        color: theme.colors.info,
        statusText: 'Toutes les fiches consultées',
      }
    );
  }
  // Monde sans module guidé ni concept publié.
  return {
    kind: 'soon',
    typeLabel: 'Bientôt',
    title: 'Contenu en préparation',
    cta: 'Retour au parcours',
    route: '/parcours',
    icon: 'info',
    color: theme.colors.textMuted,
    statusText: 'Ce monde arrive dans un prochain lot',
  };
}

export default function WorldDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, ready } = useProgress();
  const now = useNow();

  const worldId = typeof id === 'string' ? id : '';
  const world = WORLDS.find((w) => w.id === worldId);

  // Analytics inchangé : un seul `world_opened` par montage (deps stables `world`/`worldId`), le
  // comportement « introuvable » contractuel est conservé. Aucun effet pendant le pré-rendu statique.
  useEffect(() => {
    if (world) analytics.track('world_opened', { worldId });
    else if (worldId) analytics.track('session_not_found', { requested: `monde:${worldId}` });
  }, [world, worldId]);

  // Premier rendu STABLE, indépendant de l'id : identique au HTML pré-rendu, d'où aucune divergence #418.
  if (!ready || !state) {
    return (
      <Screen>
        <StateView variant="loading" title="On ouvre le monde…" />
      </Screen>
    );
  }

  // Monde inexistant : état explicite (aucun repli silencieux, aucun contenu d'un autre monde).
  if (!world) {
    return (
      <Screen>
        <Text variant="caption" color={theme.colors.textMuted}>MONDE</Text>
        <Text variant="h2">Monde introuvable</Text>
        <CharacterScene character="bobo" state="review" size={60} speech="Ce monde n’existe pas. Reviens au parcours." />
        <Button label="Voir le parcours" onPress={() => router.replace('/parcours')} />
      </Screen>
    );
  }

  const path = buildLearningPath(WORLDS, V5_CONCEPTS, {
    completedSkills: state.completedSkills,
    exploredSlugs: state.learning?.conceptsExplored ?? [],
  });
  const entry = worldEntryById(path, worldId);
  const locked = entry?.status === 'locked';
  const guidedModules = guidedModulesForWorld(worldId);
  const isGuided = guidedModules.length > 0;
  const concepts = conceptsByWorld(V5_CONCEPTS, worldId);

  const heroLabel = (
    <Text variant="label" color={theme.colors.textMuted}>
      MONDE {world.order} / {WORLDS.length}
    </Text>
  );

  // Monde verrouillé : raison réelle + retour, sans dévoiler le contenu ni proposer d'étape ouvrable.
  if (locked) {
    return (
      <Screen>
        {heroLabel}
        <Text variant="h1">{world.title}</Text>
        <Text variant="body" color={theme.colors.textSecondary}>{world.subtitle}</Text>
        <Chip iconName="lock" label="Verrouillé" color={theme.colors.textMuted} accessibilityLabel="Statut : verrouillé" />
        <Card style={styles.lockCard}>
          <TrademyIcon name="lock" size={28} color={theme.colors.textMuted} strokeWidth={2} />
          <Text variant="body" color={theme.colors.textSecondary}>
            {entry?.lockReason ?? 'Termine le monde précédent pour débloquer celui-ci.'}
          </Text>
        </Card>
        <Button label="Voir le parcours" onPress={() => router.replace('/parcours')} accessibilityHint="Retour à la liste des mondes" />
      </Screen>
    );
  }

  // LOT 4-M — carte pilotée par le module (registre canonique) : compétences + checkpoint PROPRES au
  // monde, résolus depuis son descripteur `GUIDED_MODULES` (aucune dépendance au checkpoint Fondations).
  const guided = guidedModules[0];
  const moduleSkills: Skill[] = guided
    ? guided.skillIds.map((sid) => skillById(sid)).filter((s): s is Skill => Boolean(s))
    : [];
  const guidedMap =
    isGuided && guided
      ? buildWorldMap(state, moduleSkills, guided.title, now, {
          checkpointId: guided.checkpointId,
          checkpointTitle: skillById(guided.checkpointId)?.name,
          worldTitle: `Monde ${world.order} · ${world.title}`,
        })
      : null;
  const exploredSet = new Set(state.learning?.conceptsExplored ?? []);
  const statusKey = entry ? heroStatusKey(entry) : 'unlocked';
  const statusMeta = HERO_STATUS[statusKey];
  const nextStep = entry
    ? deriveNextStep(world, entry, path, guidedMap, concepts, exploredSet)
    : null;
  const progressCaption = entry
    ? isGuided && guidedMap
      ? `${guidedMap.completed}/${guidedMap.total} étape${guidedMap.total > 1 ? 's' : ''} du module`
      : `${entry.exploredCount}/${entry.conceptCount} fiche${entry.conceptCount > 1 ? 's' : ''} consultée${entry.conceptCount > 1 ? 's' : ''}`
    : '';
  const isDone = entry?.status === 'done';

  return (
    <Screen>
      {/* 1 — En-tête héro : sujet, statut, progression honnête. */}
      <View style={styles.hero}>
        {heroLabel}
        <Text variant="h1">{world.title}</Text>
        <Text variant="body" color={theme.colors.textSecondary}>{world.subtitle}</Text>
        <View style={styles.heroStatusRow}>
          <Chip
            iconName={statusMeta.icon}
            label={statusMeta.label}
            color={statusMeta.color}
            accessibilityLabel={`Statut : ${statusMeta.label}`}
          />
          <Chip
            iconName={isGuided ? 'checkpoint' : 'library'}
            label={isGuided ? 'Module guidé' : `${concepts.length} notion${concepts.length > 1 ? 's' : ''}`}
            color={theme.colors.textMuted}
            accessibilityLabel={isGuided ? 'Monde avec module guidé' : `${concepts.length} notions à explorer`}
          />
        </View>
      </View>

      {entry ? (
        <ProgressWidget
          title="Progression"
          value={entry.progress}
          accent={statusMeta.color}
          caption={progressCaption}
        />
      ) : null}

      {/* 2 — Carte « Prochaine étape » : action principale, dérivée de l'état réel. */}
      {nextStep ? <NextStepCard step={nextStep} onPress={() => nextStep.route && navigate(router, nextStep.route)} /> : null}

      {/* 3 — Objectifs (module guidé) : la promesse pédagogique, distincte du trail (qui porte le statut). */}
      {isGuided ? (
        <View style={styles.section}>
          <SectionTitle icon="target" label="Ce que tu vas savoir faire" />
          <Card style={styles.objectives}>
            {moduleSkills.map((s) => (
              <View key={s.id} style={styles.objectiveRow}>
                <TrademyIcon name="chevron-right" size={16} color={theme.colors.primaryBright} strokeWidth={2.4} />
                <Text variant="body" style={styles.flex1}>{s.name}</Text>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {/* 4 — Parcours du monde. Guidé : trail chronologique. Contenu : collection honnête de notions. */}
      {isGuided && guidedMap ? (
        <View style={styles.section}>
          <View style={styles.headerMascot}>
            <MascotFigure name="toto-present" height={88} decorative />
          </View>
          <SectionTitle icon="checkpoint" label={`Module : ${guidedModules[0].title}`} />
          <GuidedTrail
            map={guidedMap}
            onOpenNode={(nodeId, isLocked) => !isLocked && navigate(router, `/session/${nodeId}`)}
            onDiscover={(slug) => navigate(router, `/concept/${slug}`)}
          />
        </View>
      ) : null}

      {/* 5 — Concepts du monde. Contenu : source principale. Guidé : accès secondaire non envahissant. */}
      {concepts.length > 0 ? (
        <View style={styles.section}>
          <SectionTitle icon="library" label={isGuided ? 'Notions de ce monde' : 'Notions à explorer'} />
          <Text variant="caption" color={theme.colors.textMuted}>
            {isGuided
              ? 'Fiches illustrées liées à ce monde. La consultation éclaire ; la maîtrise passe par la pratique.'
              : 'Consulte chaque fiche illustrée. Consulter une notion n’est pas la maîtriser — la pratique guidée arrive dans un prochain lot.'}
          </Text>
          <ConceptList
            concepts={concepts}
            exploredSet={exploredSet}
            onOpen={(slug) => navigate(router, `/concept/${slug}`)}
          />
        </View>
      ) : !isGuided ? (
        <Card>
          <Text variant="body" color={theme.colors.textSecondary}>
            Le contenu de ce monde arrive bientôt. En attendant, explore la bibliothèque visuelle et le
            glossaire depuis l’onglet Apprendre.
          </Text>
        </Card>
      ) : null}

      {/* 6 — Monde terminé : validation réelle, révision et suite, jamais une impasse. */}
      {isDone ? (
        <Card style={styles.doneCard} accessibilityLabel="Monde terminé">
          <View style={styles.doneHead}>
            <TrademyIcon name="trophy" size={24} color={theme.colors.reward} strokeWidth={2.2} />
            <Text variant="title" color={theme.colors.reward}>Module validé</Text>
          </View>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Tu as prouvé ta compréhension au checkpoint. Reviens réviser quand une compétence est due, ou
            continue ton parcours.
          </Text>
          <Button label="Retour au parcours" variant="secondary" onPress={() => navigate(router, '/parcours')} />
        </Card>
      ) : null}

      <Text variant="caption" color={theme.colors.textMuted} style={styles.disclaimer}>
        {DISCLAIMER}
      </Text>
    </Screen>
  );
}

/** Navigation SPA (aucune écriture de progression). */
function navigate(router: ReturnType<typeof useRouter>, route: string) {
  router.push(route as never);
}

function SectionTitle({ icon, label }: { icon: TrademyIconName; label: string }) {
  return (
    <View style={styles.sectionTitle} accessibilityRole="header">
      <TrademyIcon name={icon} size={18} color={theme.colors.textSecondary} strokeWidth={2.2} />
      <Text variant="h2" style={styles.flex1}>{label}</Text>
    </View>
  );
}

/** Carte de la prochaine étape — action principale unique et accessible. */
function NextStepCard({ step, onPress }: { step: NextStep; onPress: () => void }) {
  const hasDestination = Boolean(step.route);
  return (
    <Card style={[styles.nextCard, { borderColor: step.color }]}>
      <View style={styles.nextHead}>
        <View style={[styles.nextIcon, { borderColor: step.color }]}>
          <TrademyIcon name={step.icon} size={22} color={step.color} strokeWidth={2.2} />
        </View>
        <View style={styles.flex1}>
          <Text variant="label" color={step.color}>{step.typeLabel.toUpperCase()}</Text>
          <Text variant="title">{step.title}</Text>
          <Text variant="caption" color={theme.colors.textMuted}>
            {step.statusText}
            {step.minutes ? ` · ~${step.minutes} min` : ''}
          </Text>
        </View>
      </View>
      <Button
        label={step.cta}
        onPress={hasDestination ? onPress : undefined}
        accessibilityHint={`${step.cta} : ${step.title}`}
      />
    </Card>
  );
}

/** Trail du module guidé — chronologie claire, statut texte + icône + couleur, cibles ≥ 44 px. */
function GuidedTrail({
  map,
  onOpenNode,
  onDiscover,
}: {
  map: WorldMap;
  onOpenNode: (nodeId: string, locked: boolean) => void;
  onDiscover: (slug: string) => void;
}) {
  return (
    <View style={styles.trail}>
      {map.nodes.map((node) => {
        const color = NODE_COLORS[node.status];
        const isLocked = node.status === 'locked';
        const reached = node.status !== 'locked';
        const conceptSlug = node.kind === 'skill' ? conceptSlugForSkill(node.id) : undefined;
        const glyph = nodeGlyph(node);
        const glyphColor = node.status === 'done' ? theme.colors.onPrimary : color;
        const statusText = nodeStatusText(node);
        return (
          <View key={node.id} style={styles.trailRow}>
            <View style={styles.rail}>
              {node.index > 0 ? (
                <View style={[styles.connector, { backgroundColor: reached ? color : theme.colors.border }]} />
              ) : (
                <View style={styles.connector} />
              )}
              <View style={[styles.badge, { borderColor: color, backgroundColor: node.status === 'done' ? color : theme.colors.surface }]}>
                {glyph.icon ? (
                  <TrademyIcon name={glyph.icon} size={22} color={glyphColor} strokeWidth={2.2} />
                ) : (
                  <Text variant="title" color={glyphColor}>{glyph.text}</Text>
                )}
              </View>
            </View>
            <View style={styles.labelWrap}>
              <Pressable
                disabled={isLocked}
                accessibilityRole="button"
                accessibilityState={{ disabled: isLocked }}
                accessibilityLabel={`${node.title} — ${statusText}`}
                accessibilityHint={isLocked ? 'Étape verrouillée' : 'Ouvrir cette étape'}
                onPress={() => onOpenNode(node.id, isLocked)}
                style={styles.nodeTap}
              >
                <Card style={[styles.labelCard, { borderColor: reached ? color : theme.colors.border }]}>
                  <View style={styles.labelHead}>
                    <Text variant="title" style={styles.flex1}>{node.title}</Text>
                    {node.status === 'due' ? <Chip iconName="review" label="à réviser" color={theme.colors.warning} /> : null}
                    {node.kind === 'checkpoint' && node.status === 'current' ? (
                      <Chip iconName="checkpoint" label="revue" color={theme.colors.reward} />
                    ) : null}
                  </View>
                  <Text variant="caption" color={theme.colors.textMuted}>{statusText}</Text>
                </Card>
              </Pressable>
              {conceptSlug ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Découvrir la notion liée à ${node.title}`}
                  onPress={() => onDiscover(conceptSlug)}
                  style={styles.discover}
                >
                  <View style={styles.discoverInner}>
                    <TrademyIcon name="book" size={14} color={theme.colors.textSecondary} strokeWidth={2.2} />
                    <Text variant="caption" color={theme.colors.textSecondary}>Découvrir la notion</Text>
                    <TrademyIcon name="chevron-right" size={14} color={theme.colors.textSecondary} strokeWidth={2.2} />
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Liste des concepts du monde — visuel réel, consultation distinguée de la maîtrise. */
function ConceptList({
  concepts,
  exploredSet,
  onOpen,
}: {
  concepts: LearningConcept[];
  exploredSet: Set<string>;
  onOpen: (slug: string) => void;
}) {
  return (
    <View style={styles.conceptList}>
      {concepts.map((c) => {
        const explored = exploredSet.has(c.slug);
        return (
          <Pressable
            key={c.slug}
            accessibilityRole="button"
            accessibilityLabel={`${c.title}${explored ? ' — déjà consultée' : ''}`}
            accessibilityHint={`Ouvrir la fiche ${c.title}`}
            onPress={() => onOpen(c.slug)}
          >
            <Card style={styles.conceptRow}>
              {c.visualSpec ? <MiniVisual spec={c.visualSpec} width={96} /> : null}
              <View style={styles.conceptText}>
                <View style={styles.conceptTitleRow}>
                  <Text variant="title" style={styles.flex1}>{c.title}</Text>
                  {explored ? <TrademyIcon name="check" size={16} color={theme.colors.info} strokeWidth={2.4} /> : null}
                </View>
                <Text variant="caption" color={theme.colors.textSecondary}>{c.definitionShort}</Text>
                {explored ? (
                  <Text variant="label" color={theme.colors.info}>Consultée · pas encore maîtrisée</Text>
                ) : null}
              </View>
              <TrademyIcon name="chevron-right" size={20} color={theme.colors.textMuted} strokeWidth={2.2} />
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

const RAIL_W = 52;
const styles = StyleSheet.create({
  hero: { gap: theme.spacing.xs },
  heroStatusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  section: { gap: theme.spacing.sm },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  // Prochaine étape.
  nextCard: { borderWidth: 1.5, gap: theme.spacing.md },
  nextHead: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
  nextIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  // Objectifs.
  objectives: { gap: theme.spacing.sm },
  objectiveRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  // Trail guidé.
  headerMascot: { alignItems: 'center' },
  trail: { marginTop: theme.spacing.xs },
  trailRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'stretch' },
  rail: { width: RAIL_W, alignItems: 'center' },
  connector: { width: 3, flex: 1, minHeight: theme.spacing.md, backgroundColor: 'transparent', borderRadius: 2 },
  badge: { width: RAIL_W, height: RAIL_W, borderRadius: RAIL_W / 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  labelWrap: { flex: 1, marginBottom: theme.spacing.md },
  nodeTap: { minHeight: theme.touchTarget.min, justifyContent: 'center' },
  labelCard: { borderWidth: 1.5, gap: 2 },
  labelHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  discover: { minHeight: theme.touchTarget.min, justifyContent: 'center', paddingVertical: theme.spacing.xs, marginTop: theme.spacing.xs },
  discoverInner: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  // Concepts.
  conceptList: { gap: theme.spacing.md },
  conceptRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  conceptText: { flex: 1, gap: 2 },
  conceptTitleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  // Terminé + verrouillé.
  doneCard: { gap: theme.spacing.sm, borderColor: theme.colors.reward, borderWidth: 1.5 },
  doneHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  lockCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  disclaimer: { marginTop: theme.spacing.md },
  flex1: { flex: 1 },
});
