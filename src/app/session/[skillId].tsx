import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button, ProgressBar, StateView, FeedbackPanel, StatTile, TrademyIcon, theme, type TrademyIconName } from '@/design-system';
import { RESULT_STAT_ACCENT, RESULT_ICON_ACCENT } from '@/design-system/resultAccents';
import { CharacterScene, characterLine, useMascotReactions, resolveWithGuide } from '@/characters';
import { useConnectivity } from '@/lib/connectivity';
import { ExercisePlayer, gradeExercise, exerciseFormatLabel, type GradeResult, type Exercise } from '@/engines/exercise';
import {
  getExercises,
  getLessons,
  skillById,
  limitCount,
  rotateExercises,
  checkpointExercises,
  isCheckpoint,
  ALL_MODULE_SKILLS,
  CONTENT_MODULES,
  isFalseSignalExercise,
  useProgress,
  buildSessionSummary,
  conceptBySlug,
  conceptSlugForSkill,
  V5_CONCEPTS,
  mistakeMoment,
  buildLearnSteps,
  sanitizeResume,
  isResumable,
  aggregateAnswered,
  sessionResumeRepository,
  exerciseVariantsForObjective,
  MASTERY_LABEL,
  type AnsweredRecord,
} from '@/data';
import { xpForGrade, masteryStatus } from '@/engines/learning';
import { LessonStepView } from '@/components/LessonStepView';
import { analytics } from '@/analytics';
import { useNow } from '@/lib/useNow';

/**
 * Pré-génère un fichier HTML CONCRET par session connue : TOUTES les compétences des modules guidés
 * (Fondations + Chandeliers, LOT 4-M) ET tous les checkpoints. GitHub Pages sert alors
 * `session/skill.candle.pressure.html` (et `session/checkpoint.candles.html`) directement au lieu du
 * repli `404.html`, ce qui supprime la divergence d'hydratation React #418 sur les liens directs.
 */
export async function generateStaticParams(): Promise<{ skillId: string }[]> {
  return [
    ...ALL_MODULE_SKILLS.map((s) => ({ skillId: s.id })),
    ...CONTENT_MODULES.map((m) => ({ skillId: m.checkpointId })),
  ];
}

/**
 * Variante de REMÉDIATION servie APRÈS une erreur : une autre variante de la MÊME cible pédagogique,
 * jamais celle qui vient d'échouer et — quand c'est possible — différente de l'exercice suivant du
 * parcours (pour prouver que la variante apparaît À CAUSE de l'erreur, pas par simple avance).
 * Déterministe. `null` s'il n'existe aucune autre variante (pas de remédiation → pas de boucle infinie).
 */
export function remediationVariant(failed: Exercise, nextBaseId: string | undefined): Exercise | null {
  const objectiveId = failed.target?.objectiveId;
  if (!objectiveId) return null;
  const others = exerciseVariantsForObjective(objectiveId).filter((v) => v.id !== failed.id);
  if (!others.length) return null;
  return others.find((v) => v.id !== nextBaseId) ?? others[0];
}

/** Seuil de réussite d'une session (déblocage de la compétence). */
const PASS_RATIO = 0.7;
const DAY_MS = 86_400_000;

export default function Session() {
  const { skillId, count } = useLocalSearchParams<{ skillId: string; count?: string }>();
  const router = useRouter();
  const { recordAnswer, recordSessionReview, completeSession, recordFalseSignal, state, profile } = useProgress();
  // Connectivité (magasin local-first, sans dépendance réseau). Sert la réaction hors-ligne
  // ci-dessous — appelée AVANT tout retour anticipé (règles des hooks).
  const online = useConnectivity();
  // Contrôleur UNIQUE de réactions mascottes : tout le parcours émet des ÉVÉNEMENTS, le contrôleur
  // résout l'état + le personnage (priorités, retour à idle) et porte le guide choisi sur les moments
  // neutres. Le TEXTE reste pédagogique (characterLine/mistakeMoment). Ne bloque jamais la navigation.
  const guide = profile?.guide ?? null;
  const { reaction, speech, emit } = useMascotReactions(guide);

  // Session valide = un id qui correspond à un contenu réel (compétence avec exercices, ou point
  // de contrôle dont `getExercises` agrège des exercices réels). AUCUN repli silencieux : un id
  // inconnu affiche un état « Session introuvable » (plus bas), jamais un autre contenu enseigné.
  const resolvedId = typeof skillId === 'string' ? skillId : '';
  const all = resolvedId ? getExercises(resolvedId) : [];
  const known = all.length > 0;
  // `count` (facultatif) provient de la mission du jour : longueur modulée par le temps quotidien.
  const target = count != null ? Number.parseInt(count, 10) : null;
  // Rotation déterministe : au lieu des premiers N figés, une page qui avance à chaque session
  // TERMINÉE (réussie ou non). `round` dérive du compteur de rotation PERSISTÉ (indépendant des
  // répétitions SM-2 qu'un échec remet à zéro), donc stable pendant une session (la reprise retrouve
  // la MÊME liste) et avançant entre sessions — même après un échec (variantes différentes).
  const round = state?.rotation?.[resolvedId] ?? 0;
  const list = isCheckpoint(resolvedId)
    ? checkpointExercises(resolvedId, round, 2)
    : rotateExercises(all, limitCount(all.length, target), round);
  const skillName = skillById(resolvedId)?.name ?? 'Session';
  const lessons = known ? getLessons(resolvedId) : [];

  // Séquence d'apprentissage : les steps de la 1re leçon, avec un contre-exemple garanti.
  const concept = conceptBySlug(V5_CONCEPTS, conceptSlugForSkill(resolvedId) ?? '');
  const learnSteps = lessons.length ? buildLearnSteps(lessons[0].steps, concept?.falseSignals?.[0]) : [];

  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [correct, setCorrect] = useState(0);
  const [learnStep, setLearnStep] = useState(0);
  // Remédiation EN COURS (déclenchée par une erreur) : variante de la même cible affichée avant de
  // reprendre le parcours ; `draft` = brouillon d'une interaction d'ordre inachevée (reprise fidèle).
  const [remediation, setRemediation] = useState<Exercise | null>(null);
  const [draft, setDraft] = useState<number[] | undefined>(undefined);
  // Un point de contrôle (`getLessons` vide) démarre directement en « practice ».
  const [phase, setPhase] = useState<'learn' | 'practice'>(lessons.length ? 'learn' : 'practice');
  const [hydrated, setHydrated] = useState(false);
  const hydratedOnce = useRef(false);
  // Suivi pour l'orchestration des réactions : la session a-t-elle été REPRISE ? l'événement d'entrée
  // a-t-il déjà été émis ? l'état de connectivité précédent (pour détecter les transitions).
  const resumedRef = useRef(false);
  const entryEmittedRef = useRef(false);
  const wasOnlineRef = useRef(true);
  // Réponses RÉELLEMENT validées de la session (commit à « Continuer »), pour planifier la
  // révision espacée une seule fois par compétence à la fin. Idempotent : une réponse commitée
  // ne l'est jamais deux fois (la reprise repart de la 1re question non commitée).
  const answeredRef = useRef<AnsweredRecord[]>([]);
  // Garde-fou : la note de session (maîtrise + planification de révision) n'est appliquée qu'UNE fois.
  const sessionScoredRef = useRef(false);

  // Reprise exacte : au 1er rendu, restaure la position sauvegardée de CETTE compétence.
  useEffect(() => {
    if (hydratedOnce.current) return;
    hydratedOnce.current = true;
    let cancelled = false;
    (async () => {
      if (known) {
        const resume = sanitizeResume(await sessionResumeRepository.load(), { skillId: resolvedId });
        if (!cancelled && isResumable(resume) && resume) {
          setPhase(resume.phase);
          setLearnStep(resume.learnStep);
          setIndex(resume.index);
          setCorrect(resume.correct);
          setStreak(resume.streak);
          // Restaure les réponses déjà validées (avec leur cible) : la fin de session agrège
          // EXACTEMENT les mêmes réponses qu'une session continue (pré- et post-fermeture).
          answeredRef.current = resume.answered;
          // Reprise fidèle d'une manipulation inachevée + d'une remédiation en cours.
          if (resume.draftOrder) setDraft(resume.draftOrder);
          if (resume.remediationId) {
            const base = list[resume.index];
            const v = base ? remediationVariant(base, list[resume.index + 1]?.id) : null;
            if (v && v.id === resume.remediationId) setRemediation(v);
          }
          resumedRef.current = true; // pilote la réaction d'entrée (accueil, JAMAIS une célébration).
        }
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [known, resolvedId]);

  // Journalise l'accès à une session inexistante (transparence ; jamais de repli muet).
  useEffect(() => {
    if (!known) analytics.track('session_not_found', { requested: resolvedId || '(vide)' });
  }, [known, resolvedId]);

  // Persiste la position tant que la session n'est pas terminée (reprise après fermeture).
  useEffect(() => {
    if (!known || !hydrated) return;
    if (index >= list.length) return;
    sessionResumeRepository.save({
      skillId: resolvedId,
      phase,
      learnStep,
      index,
      correct,
      streak,
      count: target,
      answered: answeredRef.current,
      remediationId: remediation?.id,
      draftOrder: draft,
    });
  }, [known, hydrated, phase, learnStep, index, correct, streak, resolvedId, list.length, target, remediation, draft]);

  // Session terminée → efface la reprise (rien à restaurer).
  useEffect(() => {
    if (known && hydrated && index >= list.length) sessionResumeRepository.clear();
  }, [known, hydrated, index, list.length]);

  // ── Orchestration des réactions : émission des ÉVÉNEMENTS réels du parcours ──
  // Événement d'ENTRÉE (une fois, après hydratation) : reprise → accueil (jamais une célébration
  // rejouée) ; leçon → introduction ; point de contrôle → révision ; pratique directe → observation.
  useEffect(() => {
    if (!known || !hydrated || entryEmittedRef.current) return;
    entryEmittedRef.current = true;
    if (resumedRef.current) emit({ type: 'session_resumed' }, 'On reprend où tu t’étais arrêté.');
    else if (lessons.length) emit({ type: 'lesson_started' }, 'On regarde d’abord, puis on s’exerce.');
    else if (isCheckpoint(resolvedId)) emit({ type: 'checkpoint_started' }, 'On consolide : point de contrôle.');
    else emit({ type: 'chart_revealed' });
  }, [known, hydrated, lessons.length, resolvedId, emit]);

  // FEEDBACK : à l'affichage du résultat, émettre l'événement RÉEL selon les données de l'exercice.
  // Bonne réponse → Toto (série réelle) ; erreur → misconception si l'exercice en porte une (Bobo,
  // faux signal), sinon answer_incorrect. Le TEXTE vient de la pédagogie, jamais du registre.
  useEffect(() => {
    if (!result) return;
    if (result.correct) {
      emit({ type: 'answer_correct', streak }, characterLine({ kind: 'answer', correct: true, streak }, index).text);
    } else {
      // Misconception de l'exercice RÉELLEMENT affiché (base ou variante de remédiation).
      const moment = mistakeMoment((remediation ?? list[index])?.id ?? '');
      emit(moment.misconceptionId ? { type: 'misconception_detected' } : { type: 'answer_incorrect' }, moment.text);
    }
    // `result` est le déclencheur ; les autres valeurs ne sont lues que lorsqu'il est défini.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // CONNECTIVITÉ : transitions réelles hors-ligne ↔ en ligne (offline_detected / online_restored).
  useEffect(() => {
    if (online === wasOnlineRef.current) return;
    wasOnlineRef.current = online;
    if (!online) emit({ type: 'offline_detected' }, 'Hors ligne : tout le contenu de la session est déjà sur ton appareil. On continue.');
    else emit({ type: 'online_restored' });
  }, [online, emit]);

  const finished = index >= list.length;

  const restart = () => {
    setPhase(lessons.length ? 'learn' : 'practice');
    setLearnStep(0);
    setIndex(0);
    setResult(null);
    setCorrect(0);
    setStreak(0);
    answeredRef.current = [];
    sessionScoredRef.current = false;
    sessionResumeRepository.clear();
    emit({ type: 'retry_started' }, 'On y retourne — à ton rythme.'); // encouragement (porté par le guide)
  };

  // Premier rendu STABLE (indépendant du paramètre de route) : l'export web statique pré-rend cette
  // route dynamique SANS `skillId` (donc `known=false`), tandis que le client résout le paramètre à
  // l'hydratation. Rendre d'abord l'état « chargement » — identique côté serveur (avant effet) et côté
  // client (1er rendu) — supprime la divergence d'hydratation (React #418). Après montage, `hydrated`
  // passe à true et l'écran affiche la session OU « introuvable ».
  if (!hydrated) {
    return (
      <Screen>
        <StateView variant="loading" title="On prépare ta session…" />
      </Screen>
    );
  }

  if (!known) {
    return (
      <Screen>
        <Text variant="caption" color={theme.colors.textMuted}>
          SESSION
        </Text>
        <Text variant="h2">Session introuvable</Text>
        <CharacterScene
          character="bobo"
          state="review"
          size={60}
          speech="Cette session n’existe pas (ou plus). Reprenons depuis le parcours."
        />
        <Card>
          <Text variant="body" color={theme.colors.textMuted}>
            Le contenu demandé est introuvable. Choisis une compétence depuis le parcours pour
            continuer ton apprentissage.
          </Text>
        </Card>
        <Button label="Voir le parcours" onPress={() => router.replace('/parcours')} />
        <Button label="Accueil" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  if (phase === 'learn' && learnSteps.length) {
    const stepIdx = Math.min(learnStep, learnSteps.length - 1);
    const step = learnSteps[stepIdx];
    const isLast = stepIdx >= learnSteps.length - 1;
    return (
      <Screen>
        <View style={styles.header}>
          <View style={styles.headRow}>
            <Text variant="caption" color={theme.colors.primary}>
              APPRENDRE · étape {stepIdx + 1} / {learnSteps.length}
            </Text>
            {stepIdx > 0 || index > 0 ? (
              <Button label="Recommencer" variant="ghost" fullWidth={false} onPress={restart} accessibilityHint="Reprendre la session depuis le début" />
            ) : null}
          </View>
          <Text variant="h2">{skillName}</Text>
          <ProgressBar value={stepIdx / learnSteps.length} accessibilityLabel={`Étape ${stepIdx + 1} sur ${learnSteps.length}`} />
        </View>

        {stepIdx === 0 && reaction ? (
          <CharacterScene character={reaction.character} state={reaction.state} size={56} speech={speech} />
        ) : null}

        <LessonStepView key={step.id} step={step} />

        {isLast && lessons.length > 1 ? (
          <Card>
            <Text variant="label" color={theme.colors.textMuted}>
              Pour aller plus loin
            </Text>
            {lessons.slice(1).map((l) => (
              <Button
                key={l.id}
                label={`${l.title} →`}
                variant="ghost"
                onPress={() => router.push(`/lesson/${l.id}`)}
                accessibilityHint={`Ouvrir la leçon ${l.title}`}
              />
            ))}
          </Card>
        ) : null}

        <View style={styles.stepNav}>
          {stepIdx > 0 ? (
            <Button label="◀ Retour" variant="secondary" fullWidth={false} onPress={() => setLearnStep((s) => Math.max(0, s - 1))} />
          ) : null}
          {isLast ? (
            <Button
              label="Commencer les exercices"
              onPress={() => {
                analytics.track('lesson_started', { skillId: resolvedId });
                emit({ type: 'chart_revealed' }); // le graphique/les exercices apparaissent → le guide observe.
                setPhase('practice');
              }}
            />
          ) : (
            <Button label="Suivant ▶" onPress={() => setLearnStep((s) => s + 1)} />
          )}
        </View>
      </Screen>
    );
  }

  if (finished) {
    return (
      <Results
        skillId={resolvedId}
        total={list.length}
        correct={correct}
        onComplete={(passed) => {
          if (sessionScoredRef.current) return;
          sessionScoredRef.current = true;
          // Agrégation UNE fois depuis les réponses réellement validées (persistées avec la reprise) :
          // par compétence (révision de compétence) ET par cible (couverture/maîtrise). Le résultat est
          // donc identique avec ou sans fermeture intermédiaire, sans double comptage.
          const { perSkill, perTarget } = aggregateAnswered(answeredRef.current);
          if (perSkill.length) recordSessionReview(perSkill, perTarget);
          completeSession(resolvedId, passed);
          if (isCheckpoint(resolvedId)) analytics.track('checkpoint_completed', { passed });
        }}
        onHome={() => router.replace('/(tabs)')}
        onRetry={restart}
      />
    );
  }

  const baseExercise = list[index];
  // Exercice RÉELLEMENT affiché : la variante de remédiation prime sur l'exercice de base.
  const exercise = remediation ?? baseExercise;
  // Une remédiation est-elle proposable après CETTE erreur ? (variante ≠ échouée, non déjà en cours)
  const canRemediate = Boolean(result && !result.correct && !remediation && remediationVariant(baseExercise, list[index + 1]?.id));

  const validate = (answer: unknown) => {
    if (result) return;
    const graded = gradeExercise(exercise, answer);
    setResult(graded);
    analytics.track('feedback_viewed', { exerciseId: exercise.id, correct: graded.correct });
  };

  /** Commit UNIQUE de la réponse de base (compteurs + XP/errorTags + faux signal + agrégat). */
  const commitBaseAnswer = (res: GradeResult) => {
    if (res.correct) setCorrect((c) => c + 1);
    setStreak((s) => (res.correct ? s + 1 : 0));
    recordAnswer(baseExercise.skillId, res.correct ? 5 : 2, res.correct ? undefined : baseExercise.id);
    if (res.correct && isFalseSignalExercise(baseExercise.type)) recordFalseSignal();
    answeredRef.current.push({
      exerciseId: baseExercise.id,
      skillId: baseExercise.skillId,
      conceptId: baseExercise.target?.conceptId,
      objectiveId: baseExercise.target?.objectiveId,
      correct: res.correct,
    });
  };

  // REMÉDIATION déclenchée PAR L'ERREUR : on compte l'erreur de base UNE fois (ici), puis on injecte
  // immédiatement une AUTRE variante de la même cible avant de reprendre le parcours. La tentative de
  // remédiation n'est jamais comptée (aucune double comptabilisation, une seule transition par cible).
  const retryOtherwise = () => {
    if (!result || result.correct || remediation) return;
    const variant = remediationVariant(baseExercise, list[index + 1]?.id);
    if (!variant) return;
    commitBaseAnswer(result); // l'erreur est enregistrée une fois, SANS avancer l'index
    setRemediation(variant);
    setDraft(undefined);
    setResult(null);
    emit({ type: 'retry_started' }, 'On réessaie autrement : même objectif, autre exemple.');
  };

  const next = () => {
    if (remediation) {
      // Fin de la remédiation : l'erreur de base a DÉJÀ été comptée à l'entrée → on ne recompte pas.
      setRemediation(null);
      setDraft(undefined);
      setResult(null);
      setIndex((i) => i + 1);
      return;
    }
    // Commit atomique de la réponse de base validée, puis avance (aucune double comptabilisation).
    if (result) commitBaseAnswer(result);
    setDraft(undefined);
    setIndex((i) => i + 1);
    setResult(null);
  };

  // Scène mascotte DOMINANTE (unique) de la phase pratique, pilotée par le contrôleur : réaction au
  // feedback (Toto réussite / Bobo faux signal) OU état hors-ligne, jamais deux à la fois. Le texte
  // est celui produit par la pédagogie. Pas de scène pendant une question en cours (écran épuré).
  const showMascot = reaction != null && (result != null || !online);

  return (
    <Screen>
      <Text variant="h2">{skillName}</Text>
      <View style={styles.header}>
        <Text variant="caption" color={theme.colors.textMuted}>
          Exercice {index + 1} / {list.length}
        </Text>
        <ProgressBar value={index / list.length} accessibilityLabel="Progression de la session" />
      </View>

      {showMascot ? (
        <CharacterScene character={reaction.character} state={reaction.state} size={52} showName={false} speech={speech} />
      ) : null}

      <Card>
        <Text variant="caption" color={theme.colors.primary}>
          {remediation ? 'REMÉDIATION · autre exemple, même objectif' : exerciseFormatLabel(exercise.type)}
        </Text>
        <Text variant="title">{exercise.prompt}</Text>
        <ExercisePlayer
          key={exercise.id}
          exercise={exercise}
          result={result}
          onValidate={validate}
          draft={draft}
          onDraftChange={(d) => setDraft(d as number[])}
        />
      </Card>

      {result ? (
        <>
          <FeedbackPanel
            correct={result.correct}
            message={result.correct ? result.feedback.correct : result.feedback.incorrect}
            rule={result.feedback.rule}
            whenItFails={result.feedback.whenItFails}
          />
          {canRemediate ? (
            <Button
              label="Réessayer autrement"
              variant="secondary"
              onPress={retryOtherwise}
              accessibilityHint="Un autre exemple du même objectif, pour corriger l’erreur"
            />
          ) : null}
          <Button label={index + 1 >= list.length ? 'Voir mon résultat' : 'Continuer'} onPress={next} />
        </>
      ) : null}
    </Screen>
  );
}

function Results({
  skillId,
  total,
  correct,
  onComplete,
  onHome,
  onRetry,
}: {
  skillId: string;
  total: number;
  correct: number;
  onComplete: (passed: boolean) => void;
  onHome: () => void;
  onRetry: () => void;
}) {
  const { state, profile } = useProgress();
  const now = useNow();
  const summary = buildSessionSummary(correct, total, PASS_RATIO);
  const success = summary.passed;
  const done = useRef(false);
  useEffect(() => {
    if (!done.current) {
      done.current = true;
      onComplete(success);
      analytics.track('lesson_completed', { total, correct, passed: success });
    }
  }, [onComplete, success, total, correct]);

  // Barème identique à l'XP réellement enregistré (grade 5 si correct, sinon 2).
  const xp = correct * xpForGrade(5) + (total - correct) * xpForGrade(2);
  // Maîtrise RÉELLE de la compétence (pas un emoji décoratif) + prochaine révision.
  const sp = state?.skills[skillId];
  const masteryLabel = sp ? MASTERY_LABEL[masteryStatus(sp)] : null;
  const dueDays = sp ? Math.max(0, Math.ceil((sp.review.dueAt - now) / DAY_MS)) : null;
  const nextReview = dueDays == null ? null : dueDays <= 0 ? 'aujourd’hui' : dueDays === 1 ? 'demain' : `dans ${dueDays} j`;
  // Texte pédagogique du résultat (varié selon le score). Pour un POINT DE CONTRÔLE, l'état + le
  // personnage viennent de l'orchestrateur (checkpoint_completed) : réussi → célébration
  // proportionnelle ; échoué → encouragement (jamais celebrate-big). Sinon, l'état vient de la
  // réplique (déjà proportionnelle : parfait → celebrate-big, passé → celebrate-small, à revoir →
  // encourage). Le guide choisi porte l'encouragement (moment neutre).
  const line = characterLine({ kind: 'result', tier: summary.tier }, correct);
  const guide = profile?.guide ?? null;
  const chk = isCheckpoint(skillId) ? resolveWithGuide({ type: 'checkpoint_completed', passed: success }, guide) : null;
  const mascotCharacter = chk?.character ?? line.character;
  const mascotState = chk?.state ?? line.state;

  return (
    <Screen>
      <Card elevated style={styles.results}>
        {/* Icône de résultat de la FAMILLE Trademy (plus d'emoji système), proportionnée au palier.
            Accent = canon d'apprentissage (jamais marché/récompense/technique). */}
        <TrademyIcon name={RESULT_ICON[summary.tier]} size={44} color={RESULT_ICON_ACCENT[summary.tier as 'perfect' | 'pass' | 'retry']} />
        <Text variant="h1" center>
          {correct} / {total}
        </Text>
        <Text variant="body" color={theme.colors.textSecondary} center>
          {summary.headline}
        </Text>

        <View style={styles.accuracyWrap}>
          <ProgressBar value={summary.accuracy} accessibilityLabel={`Précision : ${summary.accuracyPct} %`} />
        </View>

        {/* Trois tuiles récapitulatives : XP · Précision · MAÎTRISE réelle (icônes de la famille). */}
        <View style={styles.statTiles}>
          <StatTile label="XP" value={`+${xp}`} color={RESULT_STAT_ACCENT.xp} icon="bolt" />
          <StatTile label="Précision" value={`${summary.accuracyPct}%`} color={RESULT_STAT_ACCENT.accuracy} icon="target" />
          <StatTile label="Maîtrise" value={masteryLabel ?? TIER_FALLBACK[summary.tier]} color={RESULT_STAT_ACCENT.mastery} icon="mastery" />
        </View>

        {nextReview ? (
          <View style={styles.reviewRow} accessible accessibilityLabel={`Prochaine révision : ${nextReview}`}>
            <TrademyIcon name="review" size={14} color={theme.colors.textMuted} />
            <Text variant="caption" color={theme.colors.textMuted}>
              Prochaine révision : {nextReview}
            </Text>
          </View>
        ) : null}

        {/* Scène de personnage VECTORIELLE (nette, sans artefact) — remplace la figure « celebrate »
            dont l'asset PNG portait un damier de transparence. Taille proportionnée au palier. */}
        <CharacterScene
          character={mascotCharacter}
          state={mascotState}
          size={summary.tier === 'retry' ? 72 : 88}
          speech={line.text}
        />
      </Card>
      <Button label="Retour à l’accueil" onPress={onHome} />
      <Button label="Refaire la session" variant="secondary" onPress={onRetry} />
    </Screen>
  );
}

/** Étiquette de repli pour la tuile Maîtrise quand la compétence n'a pas de progression propre
 *  (ex. point de contrôle qui agrège plusieurs compétences). */
const TIER_FALLBACK: Record<string, string> = { perfect: 'Excellent', pass: 'Validé', retry: 'À revoir' };

/** Icône de résultat par palier (famille Trademy) — remplace l'emoji d'affichage.
 *  Les accents COULEUR viennent de `RESULT_ICON_ACCENT` (canon d'apprentissage, jamais marché). */
const RESULT_ICON: Record<string, TrademyIconName> = { perfect: 'trophy', pass: 'success', retry: 'review' };

const styles = StyleSheet.create({
  header: { gap: theme.spacing.sm },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  stepNav: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, alignItems: 'center' },
  results: { alignItems: 'center', gap: theme.spacing.md },
  accuracyWrap: { width: '100%' },
  statTiles: { flexDirection: 'row', gap: theme.spacing.sm, width: '100%' },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
});
