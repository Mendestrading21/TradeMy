import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { Screen, Text, Button, Card, Chip, ProgressBar, TrademyIcon, theme, type TrademyIconName } from '@/design-system';
import { CharacterScene, MascotFigure, MascotDuo, GuideSelectionCard, type CharacterId } from '@/characters';
import { MiniVisual } from '@/engines/visual';
import {
  useProgress,
  SKILLS,
  skillById,
  OBJECTIVES,
  LEVELS,
  DAILY_OPTIONS,
  TOPICS,
  recommendStartSkill,
  exercisesForMinutes,
  ONBOARDING_SCHEMA_VERSION,
  type Objective,
  type DeclaredLevel,
  type DailyMinutes,
  type Topic,
  type OnboardingProfile,
  type VisualSpec,
} from '@/data';
import { analytics } from '@/analytics';
import { Disclaimer } from '@/components/Disclaimer';

const STEPS = ['Bienvenue', 'Objectif', 'Niveau', 'Temps', 'Sujets', 'Diagnostic', 'Ton parcours'] as const;

/**
 * Mappings PRÉSENTATIONNELS option vers icône canonique `TrademyIcon` (LOT 4-I). Fondés sur les `value`
 * STABLES des datasets (jamais modifiés) : on ignore les champs `.emoji` de la donnée et on ne rend
 * plus aucun emoji système ni lettre décorative. Aucune icône sémantique n'est détournée de son sens.
 */
const OBJECTIVE_ICON: Record<Objective, TrademyIconName> = {
  debuter: 'learn',
  comprendre_graphiques: 'chart',
  reviser: 'review',
  gerer_risque: 'risk',
};
const LEVEL_ICON: Record<DeclaredLevel, TrademyIconName> = {
  debutant: 'hint',
  initie: 'book',
  intermediaire: 'progression',
};
const TOPIC_ICON: Record<Topic, TrademyIconName> = {
  actions: 'book',
  tendance: 'chart',
  chandeliers: 'lab',
  figures: 'target',
};
// Durée : une seule icône de temps pour toutes les options (différenciées par le libellé 3/5/10 min).
const DURATION_ICON: TrademyIconName = 'timer';

type DiagQuestion = { prompt: string; options: string[]; correct: number; visual?: VisualSpec };

const DIAGNOSTIC: DiagQuestion[] = [
  { prompt: 'Une action, c’est avant tout…', options: ['Une part d’entreprise', 'Un prêt à une entreprise', 'Une monnaie numérique'], correct: 0 },
  { prompt: 'Des sommets et creux de plus en plus hauts décrivent une tendance…', options: ['Haussière', 'Baissière', 'Sans direction'], correct: 0 },
  {
    prompt: 'Une bougie verte : la clôture est…',
    options: ['Au-dessus de l’ouverture', 'En dessous de l’ouverture', 'Toujours au plus haut'],
    correct: 0,
    // Vraie bougie affichée pour la question : résumé accessible neutre (ne divulgue pas la réponse).
    visual: {
      type: 'candlestick-pattern',
      variant: 'bullish-marubozu',
      direction: 'bullish',
      labels: [],
      annotations: [],
      datasetKey: 'candle.bullish-marubozu.v1',
      accessibilitySummary: 'Une bougie.',
    },
  },
];

type DiagState = 'intro' | 'running' | 'done';

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useProgress();

  const [step, setStep] = useState(0);
  const [guide, setGuide] = useState<CharacterId | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [level, setLevel] = useState<DeclaredLevel | null>(null);
  const [minutes, setMinutes] = useState<DailyMinutes | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [diag, setDiag] = useState<DiagState>('intro');
  const [diagIndex, setDiagIndex] = useState(0);
  const [diagCorrect, setDiagCorrect] = useState(0);

  useEffect(() => {
    analytics.track('onboarding_started');
  }, []);

  useEffect(() => {
    if (step === 6) analytics.track('path_generated', { level: level ?? '', topics: topics.join(',') });
  }, [step, level, topics]);

  const startSkillId = recommendStartSkill(level ?? 'debutant', topics, SKILLS);
  const startSkillName = skillById(startSkillId)?.name ?? 'ta première compétence';
  // Question courante du diagnostic (index toujours valide) : capturée en const pour le narrowing TS.
  const currentDiag = DIAGNOSTIC[diagIndex];

  const toggleTopic = (t: Topic) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const canNext = () => {
    switch (step) {
      case 1: return objective !== null;
      case 2: return level !== null;
      case 3: return minutes !== null;
      case 5: return diag !== 'running';
      default: return true;
    }
  };

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const answerDiag = (i: number) => {
    const isCorrect = i === DIAGNOSTIC[diagIndex].correct;
    const correct = diagCorrect + (isCorrect ? 1 : 0);
    setDiagCorrect(correct);
    if (diagIndex + 1 < DIAGNOSTIC.length) {
      setDiagIndex(diagIndex + 1);
    } else {
      setDiag('done');
      analytics.track('diagnostic_completed', { score: correct / DIAGNOSTIC.length });
    }
  };

  const finish = () => {
    if (!objective || !level || !minutes) return;
    const profile: OnboardingProfile = {
      schemaVersion: ONBOARDING_SCHEMA_VERSION,
      objective,
      level,
      dailyMinutes: minutes,
      topics,
      diagnosticDone: diag === 'done',
      diagnosticScore: diag === 'done' ? diagCorrect / DIAGNOSTIC.length : null,
      startSkillId,
      guide: guide ?? undefined,
      completedAt: new Date().toISOString(),
    };
    completeOnboarding(profile);
    router.replace({
      pathname: '/session/[skillId]',
      params: { skillId: startSkillId, count: String(exercisesForMinutes(minutes)) },
    });
  };

  return (
    <Screen>
      <View style={styles.progress}>
        <ProgressBar value={(step + 1) / STEPS.length} accessibilityLabel={`Étape ${step + 1} sur ${STEPS.length} : ${STEPS[step]}`} />
        <Text variant="caption" color={theme.colors.textMuted}>
          Étape {step + 1} / {STEPS.length} · {STEPS[step]}
        </Text>
      </View>

      {step === 0 && (
        <View style={styles.stepGap}>
          <Text variant="h1">Bienvenue sur TradeMy</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            Apprends à lire un graphique en cinq minutes par jour. On personnalise ton
            parcours en quelques questions — aucun compte requis.
          </Text>
          <MascotFigure name="toto-read" height={150} />
          {/* LOT W3 — les DEUX guides se présentent ensemble avant le choix (duo annelé). */}
          <View style={styles.duoRow}>
            <MascotDuo size={64} ring />
          </View>
          <Text variant="label" color={theme.colors.textMuted}>
            Ton guide préféré (tu peux changer plus tard)
          </Text>
          <GuideSelectionCard
            selected={guide}
            onSelect={(id) => {
              setGuide(id);
              analytics.track('goal_selected', { objective: `guide:${id}` });
            }}
          />
          <Disclaimer />
        </View>
      )}

      {step === 1 && (
        <View style={styles.stepGap}>
          <Text variant="h1">Ton objectif principal ?</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            On personnalise tes premières leçons selon ce que tu veux d’abord obtenir.
          </Text>
          {OBJECTIVES.map((o) => (
            <OptionCard
              key={o.value}
              iconName={OBJECTIVE_ICON[o.value]}
              label={o.label}
              selected={objective === o.value}
              onPress={() => {
                setObjective(o.value);
                analytics.track('goal_selected', { objective: o.value });
              }}
            />
          ))}
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepGap}>
          <Text variant="h1">Où en es-tu ?</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            Pour caler le bon point de départ — tu pourras tout débloquer ensuite.
          </Text>
          {LEVELS.map((l) => (
            <OptionCard key={l.value} iconName={LEVEL_ICON[l.value]} label={l.label} hint={l.hint} selected={level === l.value} onPress={() => setLevel(l.value)} />
          ))}
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepGap}>
          <Text variant="h1">Combien de temps par jour ?</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            Une petite session régulière vaut mieux qu’une longue de temps en temps.
          </Text>
          {DAILY_OPTIONS.map((d) => (
            <OptionCard key={d.value} iconName={DURATION_ICON} label={d.label} hint={d.hint} selected={minutes === d.value} onPress={() => setMinutes(d.value)} />
          ))}
        </View>
      )}

      {step === 4 && (
        <View style={styles.stepGap}>
          <Text variant="h1">Quels sujets t’intéressent ?</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            Facultatif — on ajuste ton point de départ. Tu pourras tout débloquer ensuite.
          </Text>
          {TOPICS.map((t) => (
            <OptionCard key={t.value} iconName={TOPIC_ICON[t.value]} label={t.label} selected={topics.includes(t.value)} onPress={() => toggleTopic(t.value)} />
          ))}
        </View>
      )}

      {step === 5 && (
        <View style={styles.stepGap}>
          <Text variant="h1">Diagnostic éclair</Text>
          {diag === 'intro' && (
            <>
              <Text variant="body" color={theme.colors.textSecondary}>
                Trois questions rapides pour calibrer ton départ. C’est facultatif.
              </Text>
              <CharacterScene character="bobo" state="think" size={60} speech="Aucune pression : c’est juste pour t’orienter." />
              <Button label="Faire le diagnostic (30 s)" onPress={() => setDiag('running')} />
              <Button label="Passer" variant="ghost" onPress={next} />
            </>
          )}
          {diag === 'running' && (
            <>
              <Text variant="caption" color={theme.colors.textMuted}>
                Question {diagIndex + 1} / {DIAGNOSTIC.length}
              </Text>
              <Text variant="title">{currentDiag.prompt}</Text>
              {currentDiag.visual ? (
                <View style={styles.diagVisual}>
                  <MiniVisual spec={currentDiag.visual} width={150} />
                </View>
              ) : null}
              {currentDiag.options.map((opt, i) => (
                <OptionCard key={opt} label={opt} onPress={() => answerDiag(i)} />
              ))}
            </>
          )}
          {diag === 'done' && (
            <View style={styles.diagDone}>
              <TrademyIcon name="success" size={44} color={theme.colors.success} />
              <Text variant="h2" center>
                {diagCorrect} / {DIAGNOSTIC.length} bonnes réponses
              </Text>
              <Text variant="body" color={theme.colors.textSecondary} center>
                Parfait — on cale ton parcours en conséquence.
              </Text>
            </View>
          )}
        </View>
      )}

      {step === 6 && (
        <View style={styles.stepGap}>
          <Text variant="h1">Ton parcours</Text>
          <Card elevated>
            <Text variant="label" color={theme.colors.primaryBright}>ON COMMENCE PAR</Text>
            <Text variant="h2">{startSkillName}</Text>
            <View style={styles.recapMascot}>
              <MascotFigure name="toto-present" height={120} />
            </View>
            <Text variant="body" color={theme.colors.textSecondary}>
              Recommandé d’après ton niveau {LEVELS.find((l) => l.value === level)?.label.toLowerCase()}
              {topics.length ? ' et tes sujets favoris.' : '.'}
            </Text>
            <View style={styles.recapChips}>
              <Chip iconName={DURATION_ICON} label={`${minutes} min/j`} color={theme.colors.info} />
              {diag === 'done' ? <Chip iconName="checkpoint" label={`Diag. ${diagCorrect}/${DIAGNOSTIC.length}`} color={theme.colors.info} /> : null}
              {topics.slice(0, 2).map((t) => (
                <Chip key={t} iconName={TOPIC_ICON[t]} label={TOPICS.find((x) => x.value === t)?.label ?? t} color={theme.colors.neutral} />
              ))}
            </View>
          </Card>
          <Button label="Commencer ma première leçon" onPress={finish} accessibilityHint="Lancer la première session" />
          <Disclaimer />
        </View>
      )}

      {/* Barre de navigation (masquée pendant le diagnostic en cours) */}
      {!(step === 5 && diag === 'running') && step !== 6 && (
        <View style={styles.nav}>
          {step > 0 ? <Button label="Retour" variant="ghost" fullWidth={false} onPress={back} /> : <View />}
          <Button
            label={step === 0 ? 'Commencer' : 'Continuer'}
            fullWidth={false}
            onPress={next}
            disabled={!canNext()}
            disabledReason={!canNext() ? 'Fais un choix pour continuer.' : undefined}
          />
        </View>
      )}
    </Screen>
  );
}

/**
 * Carte de choix canonique de l'onboarding : icône `TrademyIcon` DÉCORATIVE (jamais un emoji ni une
 * lettre), libellé + indice, et état sélectionné exposé par la FORME (contour), l'ICÔNE `check` et
 * l'état accessible — jamais par la seule couleur. Toute la carte est cliquable et nommée.
 */
function OptionCard({
  iconName,
  label,
  hint,
  selected,
  onPress,
}: {
  iconName?: TrademyIconName;
  label: string;
  hint?: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      onPress={onPress}
    >
      <Card style={selected ? styles.selected : undefined}>
        <View style={styles.optionRow}>
          {iconName ? (
            <TrademyIcon name={iconName} size={24} color={selected ? theme.colors.primaryBright : theme.colors.textSecondary} strokeWidth={selected ? 2.4 : 2} />
          ) : null}
          <View style={styles.flex1}>
            <Text variant="title">{label}</Text>
            {hint ? (
              <Text variant="caption" color={theme.colors.textMuted}>
                {hint}
              </Text>
            ) : null}
          </View>
          {selected ? <TrademyIcon name="check" size={20} color={theme.colors.primary} /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  progress: { gap: theme.spacing.xs },
  stepGap: { gap: theme.spacing.md },
  duoRow: { alignItems: 'center' },
  selected: { borderColor: theme.colors.primary, borderWidth: 1.5 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, minHeight: 44 },
  flex1: { flex: 1 },
  diagVisual: { alignItems: 'center', marginVertical: theme.spacing.xs },
  diagDone: { alignItems: 'center', gap: theme.spacing.sm },
  recapMascot: { alignItems: 'center', marginVertical: theme.spacing.sm },
  recapChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.sm },
});
