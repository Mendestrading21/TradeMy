import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button, Chip, ProgressBar, TrademyIcon, theme } from '@/design-system';
import { useProgress } from '@/data';
import { recentEvents, clearRecentEvents, computeInsights, type AnalyticsCategory } from '@/analytics';

const CATEGORY_LABEL: Record<AnalyticsCategory, string> = {
  lifecycle: 'Cycle de vie',
  onboarding: 'Onboarding',
  learning: 'Apprentissage',
  engagement: 'Engagement',
  monetization: 'Monétisation',
};

export default function Journal() {
  const router = useRouter();
  const { analyticsEnabled } = useProgress();
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const events = recentEvents();
  const insights = computeInsights(events);
  const funnelPeak = Math.max(1, ...insights.funnel.map((s) => s.count));

  return (
    <Screen>
      <View style={styles.titleRow}>
        <TrademyIcon name="chart" size={22} color={theme.colors.primaryBright} />
        <Text variant="h1">Journal d’usage</Text>
      </View>
      <Text variant="body" color={theme.colors.textSecondary}>
        Transparence totale : voici les évènements d’usage anonymes enregistrés localement sur cet
        appareil. Aucune donnée personnelle, aucun envoi automatique. Tu peux tout effacer.
      </Text>

      {!analyticsEnabled ? (
        <Card style={styles.off}>
          <Text variant="title" color={theme.colors.warning}>
            Suivi désactivé
          </Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            Le suivi d’usage est désactivé : aucun nouvel évènement n’est enregistré. Tu peux le
            réactiver depuis Profil › Confidentialité.
          </Text>
        </Card>
      ) : null}

      <Card elevated>
        <View style={styles.row}>
          <Text variant="title" style={styles.flex1}>
            {insights.total} évènement{insights.total > 1 ? 's' : ''} en mémoire
          </Text>
          <Chip label="local" color={theme.colors.technical} />
        </View>
        {insights.byCategory.length ? (
          <View style={styles.chips}>
            {insights.byCategory.map((c) => (
              <Chip key={c.category} label={`${CATEGORY_LABEL[c.category]} ${c.count}`} color={theme.colors.technical} />
            ))}
          </View>
        ) : (
          <Text variant="body" color={theme.colors.textMuted}>
            Aucun évènement pour l’instant — navigue un peu dans l’app puis rafraîchis.
          </Text>
        )}
      </Card>

      <Card>
        <Text variant="title">Entonnoir d’apprentissage</Text>
        <Text variant="caption" color={theme.colors.textMuted}>
          Comptes bruts des étapes-clés (échantillon récent, borné).
        </Text>
        <View style={styles.funnel}>
          {insights.funnel.map((s) => (
            <View key={s.event} style={styles.funnelRow}>
              <Text variant="caption" style={styles.funnelLabel}>
                {s.label}
              </Text>
              <View style={styles.funnelBar}>
                <ProgressBar value={s.count / funnelPeak} accessibilityLabel={`${s.label} : ${s.count}`} />
              </View>
              <Text variant="caption" color={theme.colors.textMuted}>
                {s.count}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {insights.byEvent.length ? (
        <Card>
          <Text variant="title">Détail par évènement</Text>
          <View style={styles.list}>
            {insights.byEvent.map((e) => (
              <View key={e.event} style={styles.row}>
                <Text variant="body" style={styles.flex1}>
                  {e.event}
                </Text>
                <Text variant="body" color={theme.colors.textMuted}>
                  {e.count}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button label="Rafraîchir" variant="secondary" onPress={refresh} />
        <Button
          label="Vider le journal"
          variant="secondary"
          disabled={insights.total === 0}
          disabledReason={insights.total === 0 ? 'Le journal est déjà vide.' : undefined}
          onPress={() => {
            clearRecentEvents();
            refresh();
          }}
        />
        <Button label="Retour" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  off: { borderColor: theme.colors.warning },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  flex1: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginTop: theme.spacing.sm },
  funnel: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  funnelRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  funnelLabel: { width: 120 },
  funnelBar: { flex: 1 },
  list: { gap: theme.spacing.xs, marginTop: theme.spacing.sm },
  actions: { gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
});
