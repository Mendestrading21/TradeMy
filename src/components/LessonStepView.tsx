import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Button,
  Flashcard,
  TrademyIcon,
  theme,
} from '@/design-system';
import { CharacterScene } from '@/characters';
import { PatternChart, generateCandles } from '@/engines/pattern';
import { VisualCard, MiniVisual, datasetByKey } from '@/engines/visual';
import { conceptBySlug, V5_CONCEPTS } from '@/data';
import { LessonReplay } from './LessonReplay';
import { STEP_META, type LessonStepMeta } from './lessonStepMeta';
import type { LessonStep } from '@/engines/learning';

export { STEP_META } from './lessonStepMeta';

/**
 * LOT E1 — en dessous de ce nombre de bougies, « révéler une à une » n'apprend rien (figures d'une
 * seule bougie : marteau, doji, marubozu…) : la manipulation retombe alors sur la série
 * déterministe, qui enseigne la construction de la structure.
 */
const REPLAYABLE_MIN = 8;

/** Minuscule initiale — un critère de reconnaissance s'enchâsse dans une phrase (« repère : … »). */
function lowerFirst(s: string): string {
  return s.charAt(0).toLocaleLowerCase('fr-FR') + s.slice(1);
}

function StepLabel({ meta }: { meta: LessonStepMeta }) {
  return (
    <View style={styles.labelRow}>
      {meta.icon ? <TrademyIcon name={meta.icon} size={16} color={meta.color} /> : null}
      <Text variant="label" color={meta.color}>
        {meta.label}
      </Text>
    </View>
  );
}

/**
 * Rendu d'une étape de leçon (texte, flashcard, visuel SVG, graphique bougies, hypothèse Toto/Bobo).
 * Composant partagé entre l'écran leçon (`/lesson/[id]`) et la phase « Apprendre » de la session.
 * `conceptSlug` (optionnel) : fiche concept de la COMPÉTENCE porteuse — sert de repli aux étapes
 * sans `conceptRef` propre pour rendre le graphique réel (LOT V5 : observer, c'est regarder).
 */
export function LessonStepView({ step, conceptSlug }: { step: LessonStep; conceptSlug?: string }) {
  const router = useRouter();

  if (step.kind === 'flashcard' && step.flashcard) {
    return <Flashcard front={step.flashcard.front} back={step.flashcard.back} />;
  }

  // LOT V5 — l'étape « observe » MONTRE ce qu'elle demande d'observer : le visuel réel du concept
  // (dataset de la fiche) au-dessus de la consigne d'une ligne. Repli texte si aucun visuel.
  if (step.kind === 'observe') {
    const concept = conceptBySlug(V5_CONCEPTS, step.conceptRef ?? conceptSlug ?? '');
    if (concept?.visualSpec) {
      return (
        <View style={styles.stepStack}>
          <VisualCard spec={concept.visualSpec} title={STEP_META.observe.label} />
          {step.body ? (
            <Card>
              <StepLabel meta={STEP_META.observe} />
              <Text variant="body">{step.body}</Text>
            </Card>
          ) : null}
        </View>
      );
    }
  }

  if (step.kind === 'visual') {
    const concept = conceptBySlug(V5_CONCEPTS, step.conceptRef ?? conceptSlug ?? '');
    if (concept?.visualSpec) {
      return (
        <View style={styles.stepStack}>
          <VisualCard spec={concept.visualSpec} title={STEP_META.visual.label} />
          {concept.howToRecognize.length ? (
            <Card>
              <Text variant="label" color={theme.colors.textMuted}>
                Comment reconnaître
              </Text>
              {concept.howToRecognize.slice(0, 3).map((r) => (
                <Text key={r} variant="body" color={theme.colors.textSecondary}>
                  • {r}
                </Text>
              ))}
            </Card>
          ) : null}
          <Button
            label="Voir la fiche complète →"
            variant="secondary"
            onPress={() => router.push(`/concept/${concept.slug}`)}
            accessibilityHint={`Ouvrir la fiche ${concept.title}`}
          />
        </View>
      );
    }
    return (
      <Card>
        <StepLabel meta={STEP_META.visual} />
        {step.body ? <Text variant="body">{step.body}</Text> : null}
      </Card>
    );
  }

  if (step.kind === 'hypothesis') {
    const concept = step.conceptRef ? conceptBySlug(V5_CONCEPTS, step.conceptRef) : undefined;
    const bull = concept?.bullishScenario?.conditions?.[0];
    const bear = concept?.bearishScenario?.conditions?.[0] ?? concept?.falseSignals?.[0];
    return (
      <Card style={styles.hypothesis}>
        <StepLabel meta={STEP_META.hypothesis} />
        {step.body ? (
          <Text variant="body" color={theme.colors.textSecondary}>
            {step.body}
          </Text>
        ) : null}
        <View style={styles.debate}>
          <CharacterScene
            character="toto"
            state="observe"
            size={56}
            speech={bull ? `Hypothèse haussière : ${bull}` : 'Toto formule une hypothèse haussière conditionnelle.'}
          />
          <CharacterScene
            character="bobo"
            state="false-signal"
            size={56}
            reversed
            speech={bear ? `Le risque : ${bear}` : 'Bobo cherche ce qui invaliderait le scénario.'}
          />
        </View>
      </Card>
    );
  }

  // LOT W1 — le contre-exemple se VOIT : l'étape « faux signal » montre le visuel réel du concept
  // au-dessus du piège décrit (le lecteur regarde la figure en lisant ce qui la déjoue).
  // Repli texte seul si la fiche n'a pas de visuel — jamais d'étape vide.
  if (step.kind === 'falseSignal') {
    const concept = conceptBySlug(V5_CONCEPTS, step.conceptRef ?? conceptSlug ?? '');
    const trap = concept?.falseSignals?.[0];
    return (
      <View style={styles.stepStack}>
        {concept?.visualSpec ? <VisualCard spec={concept.visualSpec} title={STEP_META.falseSignal.label} /> : null}
        <Card style={styles.falseSignal}>
          {concept?.visualSpec ? null : <StepLabel meta={STEP_META.falseSignal} />}
          {step.body ? <Text variant="body">{step.body}</Text> : null}
          {trap && trap !== step.body ? (
            <Text variant="body" color={theme.colors.textSecondary}>
              Piège type : {trap}
            </Text>
          ) : null}
        </Card>
      </View>
    );
  }

  // LOT W1 — le résumé se REVOIT : vignette compacte du concept (MiniVisual) à côté de la synthèse,
  // pour ancrer visuellement « à retenir ». Repli texte seul sans visuel.
  if (step.kind === 'summary') {
    const concept = conceptBySlug(V5_CONCEPTS, step.conceptRef ?? conceptSlug ?? '');
    return (
      <Card elevated style={styles.summary}>
        <StepLabel meta={STEP_META.summary} />
        <View style={styles.summaryRow}>
          {concept?.visualSpec ? (
            <View style={styles.summaryVisual}>
              <MiniVisual spec={concept.visualSpec} width={112} />
            </View>
          ) : null}
          <View style={styles.summaryBody}>
            {step.body ? <Text variant="body">{step.body}</Text> : null}
          </View>
        </View>
      </Card>
    );
  }

  if (step.kind === 'chart') {
    return (
      <Card>
        <StepLabel meta={STEP_META.chart} />
        <View style={styles.chart}>
          <PatternChart candles={generateCandles(step.chartSeed ?? 1, 30)} width={300} height={150} />
        </View>
        {step.body ? (
          <Text variant="body" color={theme.colors.textSecondary}>
            {step.body}
          </Text>
        ) : null}
      </Card>
    );
  }

  if (step.kind === 'interaction') {
    // LOT E1 — la MANIPULATION du canon (« observer, formuler, vérifier, MANIPULER… ») : on rejoue
    // la FIGURE RÉELLE du concept bougie par bougie quand son dataset est assez long pour qu'une
    // révélation ait du sens ; sinon la série déterministe. La consigne est DÉRIVÉE du premier
    // critère de reconnaissance du concept (source unique) — aucun texte dupliqué dans les données.
    const concept = conceptBySlug(V5_CONCEPTS, step.conceptRef ?? conceptSlug ?? '');
    const figure = datasetByKey(concept?.visualSpec?.datasetKey);
    const cue = concept?.howToRecognize?.[0];
    const consigne = step.body ?? (cue ? `Révèle les bougies une à une, puis repère : ${lowerFirst(cue)}` : undefined);
    return (
      <View style={styles.stepStack}>
        <LessonReplay seed={step.chartSeed ?? 2024} series={figure.length >= REPLAYABLE_MIN ? figure : undefined} />
        {consigne ? (
          <Card>
            <StepLabel meta={STEP_META.interaction} />
            <Text variant="body" color={theme.colors.textSecondary}>
              {consigne}
            </Text>
          </Card>
        ) : null}
      </View>
    );
  }

  const meta = STEP_META[step.kind] ?? { label: step.kind, color: theme.colors.textMuted };
  const elevated = step.kind === 'intro';
  return (
    <Card elevated={elevated} style={meta.accent ? { borderColor: meta.accent } : undefined}>
      <StepLabel meta={meta} />
      {step.body ? <Text variant="body">{step.body}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  chart: { alignItems: 'center', marginVertical: theme.spacing.md },
  stepStack: { gap: theme.spacing.sm },
  hypothesis: { borderColor: theme.colors.advanced },
  debate: { gap: theme.spacing.md, marginTop: theme.spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  falseSignal: { borderColor: theme.colors.falseSignal },
  summary: { borderColor: theme.colors.primary },
  summaryRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center', marginTop: theme.spacing.xs },
  summaryVisual: { flexShrink: 0 },
  summaryBody: { flex: 1 },
});
