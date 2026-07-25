import { useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  Screen,
  Text,
  Card,
  Button,
  Chip,
  XPBar,
  StatTile,
  StateView,
  TrademyIcon,
  theme,
  type TrademyIconName,
} from '@/design-system';
import { useReducedMotion, CharacterAnimationController, GuideSelectionCard } from '@/characters';
import {
  useProgress,
  OBJECTIVES,
  LEVELS,
  TOPICS,
  offlineCapabilities,
  V5_CONCEPTS,
  SKILLS,
  conceptMasteryStatus,
  selectDueReviews,
  summarizeMisconceptions,
} from '@/data';
import { useConnectivity } from '@/lib/connectivity';
import { Disclaimer } from '@/components/Disclaimer';
import { useNow } from '@/lib/useNow';

/**
 * Écran PROFIL (LOT 4-D — application du canon TradeMy Learning Glass).
 *
 * Présentation UNIQUEMENT : cet écran LIT les providers (progression, profil d'onboarding, premium,
 * consentement) et n'expose que des PRÉFÉRENCES réelles (consentement analytics, choix de guide,
 * réinitialisation). Il ne modifie ni le moteur SR/maîtrise, ni la persistance, ni les routes, ni un
 * quelconque système de compte/abonnement. Aucune métrique inventée : chaque valeur a une source réelle.
 *
 * Hiérarchie : identité → résumé de progression → UNE action principale (selon l'état réel) →
 * raccourcis réels → préférences & légal. Icônes de la famille ; couleurs pédagogiques ; a11y complète.
 */
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** Formate une date d'ancienneté RÉELLE (ISO). Renvoie null si absente ou invalide (jamais NaN/undefined). */
function formatJoined(iso?: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function Profil() {
  const router = useRouter();
  const { state, profile, premium, ready, analyticsEnabled, setAnalyticsEnabled, setGuide, reset } = useProgress();
  const reduced = useReducedMotion();
  const online = useConnectivity();
  const now = useNow();

  if (!ready || !state) {
    return (
      <Screen>
        <StateView variant="loading" title="On charge ton profil…" />
      </Screen>
    );
  }

  // ── Données RÉELLES (source identifiée) ──
  const level = state.level;
  const xpInLevel = state.totalXp % 100;
  const streakDays = state.streakDays;
  const coins = state.coins;
  const exploredSlugs = state.learning?.conceptsExplored ?? [];
  const skills = state.skills;
  const completedSkills = state.completedSkills;
  const masteredCount = V5_CONCEPTS.filter(
    (c) => conceptMasteryStatus(c, { exploredSlugs, skills, completedSkills, targets: state.targets ?? {} }).mastered,
  ).length;
  const dueCount = selectDueReviews(state, SKILLS, now).length;
  const allErrorTags: Record<string, number> = {};
  for (const sp of Object.values(skills)) {
    for (const [tag, n] of Object.entries(sp.errorTags ?? {})) allErrorTags[tag] = (allErrorTags[tag] ?? 0) + n;
  }
  const weakCount = summarizeMisconceptions(allErrorTags).length;
  const hasProgress = completedSkills.length > 0 || state.totalXp > 0;

  const objectiveLabel = OBJECTIVES.find((o) => o.value === profile?.objective)?.label;
  const levelLabel = LEVELS.find((l) => l.value === profile?.level)?.label;
  const joined = formatJoined(profile?.completedAt);
  const offline = offlineCapabilities();

  // ── Identité : phrase de progression HONNÊTE selon l'état réel ──
  const phrase = !hasProgress
    ? 'Bienvenue — ton parcours d’apprentissage commence ici.'
    : dueCount > 0
      ? 'Quelques notions t’attendent en révision pour bien les ancrer.'
      : 'Tu avances à ton rythme. Continue, une notion à la fois.';

  // ── Action principale UNIQUE, choisie selon l'état réel ──
  const primary =
    dueCount > 0
      ? { label: `Réviser maintenant`, hint: 'Ouvrir les révisions recommandées', route: '/revisions' as const }
      : hasProgress
        ? { label: 'Continuer le parcours', hint: 'Reprendre le parcours d’apprentissage', route: '/parcours' as const }
        : { label: 'Commencer le parcours', hint: 'Démarrer le parcours d’apprentissage', route: '/parcours' as const };

  // Le guide sélectionné devient l'avatar d'identité ; sinon, le duo Toto + Bobo accueille.
  const guide = profile?.guide;

  return (
    <Screen>
      <View style={styles.header}>
        <TrademyIcon name="profile" size={22} color={theme.colors.primaryBright} />
        <Text variant="h1">Profil</Text>
      </View>

      {/* ── 1. Identité de l'apprenant ── */}
      <Card elevated style={styles.identityCard}>
        <View style={styles.identityRow}>
          <View style={styles.identityMascot}>
            {guide ? (
              <CharacterAnimationController character={guide} state="wave" size={72} />
            ) : (
              <View style={styles.duo}>
                <CharacterAnimationController character="toto" state="wave" size={56} />
                <CharacterAnimationController character="bobo" state="idle" size={56} />
              </View>
            )}
          </View>
          <View style={styles.identityText}>
            <Text variant="h2">Apprenti Trademy</Text>
            <View style={styles.identityChips}>
              <Chip iconName="star" label={`Niveau ${level}`} color={theme.colors.primary} accessibilityLabel={`Niveau d’apprentissage ${level}`} />
              {guide ? (
                <Chip iconName="heart" label={`Guide : ${guide === 'toto' ? 'Toto' : 'Bobo'}`} color={theme.colors.primaryBright} accessibilityLabel={`Guide choisi : ${guide === 'toto' ? 'Toto' : 'Bobo'}`} />
              ) : null}
            </View>
            <Text variant="body" color={theme.colors.textSecondary}>
              {phrase}
            </Text>
            {joined ? (
              <Text variant="caption" color={theme.colors.textMuted}>
                Parcours démarré le {joined}.
              </Text>
            ) : null}
          </View>
        </View>
      </Card>

      {/* ── 2. Résumé de progression (données réelles, chaque tuile = label + valeur + nom accessible) ── */}
      <Card>
        <View style={styles.sectionLabel}>
          <TrademyIcon name="progression" size={16} color={theme.colors.primaryBright} />
          <Text variant="label" color={theme.colors.primaryBright}>
            TA PROGRESSION
          </Text>
        </View>
        <View style={styles.xpWrap}>
          <XPBar level={level} xpInLevel={xpInLevel} />
        </View>
        <View style={styles.tileRow}>
          <StatTile icon="hint" color={theme.colors.info} value={`${exploredSlugs.length}`} label="découvertes" accessibilityLabel={`${exploredSlugs.length} notions découvertes`} />
          <StatTile icon="mastery" color={theme.colors.mastery} value={`${masteredCount}`} label="maîtrisées" accessibilityLabel={`${masteredCount} notions maîtrisées`} />
          <StatTile icon="warning" color={theme.colors.warning} value={`${weakCount}`} label="à renforcer" accessibilityLabel={`${weakCount} notions à renforcer`} />
        </View>
        <View style={styles.tileRow}>
          <StatTile icon="flame" color={theme.colors.warning} value={`${streakDays}`} label="jours de série" accessibilityLabel={`${streakDays} jour${streakDays > 1 ? 's' : ''} de série d’apprentissage`} />
          <StatTile icon="coin" color={theme.colors.reward} value={`${coins}`} label="points" accessibilityLabel={`${coins} point${coins > 1 ? 's' : ''} d’apprentissage`} />
        </View>
      </Card>

      {/* ── 3. Action principale UNIQUE (dominante) ── */}
      <Button label={primary.label} onPress={() => router.push(primary.route)} accessibilityHint={primary.hint} />

      {/* ── 4. Raccourcis réels ── */}
      <Card>
        <View style={styles.sectionLabel}>
          <TrademyIcon name="home" size={16} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            RACCOURCIS
          </Text>
        </View>
        <ShortcutRow
          icon="refresh"
          label="Révisions"
          hint="Ouvrir les révisions"
          caption={dueCount ? `${dueCount} recommandée${dueCount > 1 ? 's' : ''}` : 'À jour'}
          captionColor={dueCount ? theme.colors.warning : theme.colors.textMuted}
          onPress={() => router.push('/revisions')}
        />
        <ShortcutRow icon="chart" label="Statistiques" hint="Ouvrir le tableau de statistiques détaillé" onPress={() => router.push('/statistiques')} />
        <ShortcutRow icon="trophy" label="Mes réussites" hint="Ouvrir tes badges et réussites" onPress={() => router.push('/reussites')} />
        <ShortcutRow icon="book" label="Glossaire & favoris" hint="Ouvrir le glossaire et tes favoris" onPress={() => router.push('/glossaire')} />
      </Card>

      {/* ── 5. Préférences & informations légales ── */}
      <Card>
        <View style={styles.sectionLabel}>
          <TrademyIcon name="settings" size={16} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            TON PROFIL D’APPRENTISSAGE
          </Text>
        </View>
        {profile ? (
          <>
            <View style={styles.profileRows}>
              <ProfileRow label="Objectif" value={objectiveLabel ?? '—'} />
              <ProfileRow label="Niveau déclaré" value={levelLabel ?? '—'} />
              <ProfileRow label="Temps par jour" value={`${profile.dailyMinutes} min`} />
              <ProfileRow
                label="Diagnostic"
                value={profile.diagnosticDone && profile.diagnosticScore != null ? `${Math.round(profile.diagnosticScore * 100)} %` : 'non réalisé'}
              />
            </View>
            {profile.topics.length ? (
              <View style={styles.topicChips}>
                {profile.topics.map((t) => (
                  <Chip key={t} label={TOPICS.find((x) => x.value === t)?.label ?? t} color={theme.colors.neutral} />
                ))}
              </View>
            ) : null}
            <Button label="Repersonnaliser mon parcours" variant="secondary" onPress={() => router.push('/onboarding')} accessibilityHint="Refaire l’onboarding personnalisé" />
          </>
        ) : (
          <>
            <Text variant="body" color={theme.colors.textSecondary}>
              Personnalise ton parcours en quelques questions (objectif, niveau, temps, sujets).
            </Text>
            <Button label="Personnaliser mon parcours" onPress={() => router.push('/onboarding')} accessibilityHint="Démarrer l’onboarding personnalisé" />
          </>
        )}
      </Card>

      <Card>
        <View style={styles.sectionLabel}>
          <TrademyIcon name="heart" size={16} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            TON GUIDE
          </Text>
        </View>
        <Text variant="body" color={theme.colors.textSecondary}>
          Toto explique et célèbre tes réussites ; Bobo reste ton repère sur le risque, l’invalidation et
          les faux signaux. Ils t’accompagnent, sans jamais prédire le marché.
        </Text>
        <GuideSelectionCard selected={guide ?? null} onSelect={setGuide} />
      </Card>

      <Card>
        <View style={styles.sectionLabel}>
          <TrademyIcon name="settings" size={16} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            ACCESSIBILITÉ & HORS-LIGNE
          </Text>
        </View>
        <View style={styles.infoRow} accessible accessibilityLabel={`Réduction des animations : ${reduced ? 'activée' : 'désactivée'} (réglage système)`}>
          <TrademyIcon name={reduced ? 'check' : 'close'} size={18} color={reduced ? theme.colors.success : theme.colors.textMuted} />
          <Text variant="body" style={styles.flex1}>
            Réduction des animations : {reduced ? 'activée' : 'désactivée'} (réglage système).
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Chip label={online ? 'En ligne' : 'Hors ligne'} color={online ? theme.colors.success : theme.colors.textMuted} accessibilityLabel={online ? 'Connexion : en ligne' : 'Connexion : hors ligne'} />
          <Text variant="body" style={styles.flex1} color={theme.colors.textSecondary}>
            Trademy fonctionne entièrement hors-ligne ; ta progression est enregistrée sur cet appareil.
          </Text>
        </View>
        <Text variant="caption" color={theme.colors.textMuted}>
          Embarqués : {offline.skills} compétences · {offline.lessons} leçons · {offline.exercises} exercices ·{' '}
          {offline.concepts} fiches concept · {offline.worlds} mondes. Les visuels sont générés en code,
          jamais téléchargés.
        </Text>
      </Card>

      <Card>
        <View style={styles.sectionLabel}>
          <TrademyIcon name="lock" size={16} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            CONFIDENTIALITÉ
          </Text>
        </View>
        <Text variant="body" color={theme.colors.textSecondary}>
          Suivi d’usage anonyme pour améliorer l’app. Aucune donnée personnelle ni financière n’est
          collectée. Tu peux le désactiver à tout moment.
        </Text>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Suivi d’usage anonyme"
          accessibilityState={{ checked: analyticsEnabled }}
          accessibilityHint="Activer ou désactiver le suivi d’usage anonyme"
          onPress={() => setAnalyticsEnabled(!analyticsEnabled)}
          style={styles.toggle}
        >
          <Text variant="body" style={styles.flex1}>
            Suivi d’usage anonyme
          </Text>
          <View style={[styles.pill, analyticsEnabled ? styles.pillOn : styles.pillOff]} importantForAccessibility="no">
            <Text variant="label" color={analyticsEnabled ? theme.colors.onPrimary : theme.colors.textSecondary}>
              {analyticsEnabled ? 'Activé' : 'Désactivé'}
            </Text>
          </View>
        </Pressable>
        <Button label="Voir le journal d’usage (local)" variant="secondary" onPress={() => router.push('/journal')} accessibilityHint="Voir exactement les évènements enregistrés localement" />
      </Card>

      <Card elevated>
        <View style={styles.sectionLabel}>
          <TrademyIcon name="star" size={16} color={theme.colors.reward} />
          <Text variant="label" color={theme.colors.reward}>
            TRADEMY PREMIUM
          </Text>
          {premium.active ? <Chip iconName="check" label="Actif" color={theme.colors.reward} accessibilityLabel="Premium actif" /> : null}
        </View>
        <Text variant="body" color={theme.colors.textSecondary}>
          {premium.active
            ? 'Merci ! Tout le contenu premium est débloqué.'
            : 'Tous les mondes, le labo complet, les statistiques détaillées et les révisions illimitées.'}
        </Text>
        <Button
          label={premium.active ? 'Gérer mon accès' : 'Découvrir Premium'}
          variant={premium.active ? 'secondary' : 'reward'}
          onPress={() => router.push('/premium')}
          accessibilityHint="Ouvrir l’offre Premium"
        />
      </Card>

      <Button label="À propos & mentions légales" variant="secondary" onPress={() => router.push('/a-propos')} accessibilityHint="Version, confidentialité et mentions légales" />
      <Button label="Réinitialiser ma progression" variant="secondary" onPress={reset} accessibilityHint="Effacer la progression enregistrée sur cet appareil" />

      <Disclaimer />
    </Screen>
  );
}

function ShortcutRow({
  icon,
  label,
  hint,
  caption,
  captionColor,
  onPress,
}: {
  icon: TrademyIconName;
  label: string;
  hint: string;
  caption?: string;
  captionColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={hint}
      onPress={onPress}
      style={styles.shortcut}
    >
      <TrademyIcon name={icon} size={20} color={theme.colors.primaryBright} />
      <Text variant="body" style={styles.flex1}>
        {label}
      </Text>
      {caption ? (
        <Text variant="caption" color={captionColor ?? theme.colors.textMuted}>
          {caption}
        </Text>
      ) : null}
      <TrademyIcon name="chevron-right" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow} accessible accessibilityLabel={`${label} : ${value}`}>
      <Text variant="body" color={theme.colors.textSecondary}>
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
  identityCard: { gap: theme.spacing.sm },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  identityMascot: { alignItems: 'center' },
  duo: { flexDirection: 'row', gap: theme.spacing.xs },
  identityText: { flex: 1, gap: theme.spacing.xs },
  identityChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  xpWrap: { marginVertical: theme.spacing.sm },
  tileRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  shortcut: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 44, paddingVertical: theme.spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  flex1: { flex: 1 },
  profileRows: { gap: theme.spacing.xs, marginVertical: theme.spacing.sm },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm, minHeight: 44 },
  pill: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.pill, borderWidth: 1 },
  pillOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  pillOff: { backgroundColor: 'transparent', borderColor: theme.colors.borderStrong },
});
