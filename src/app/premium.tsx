import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button, TrademyIcon, theme } from '@/design-system';
import { MascotFigure } from '@/characters';

/**
 * Accès libre (v1 gratuite — ADR-110). L'ancien paywall de DÉMONSTRATION a été retiré :
 * pendant la phase de test publique, tout Trademy est gratuit et débloqué. Aucun achat,
 * aucune offre affichée. Cette route reste servie pour les liens existants et expliquera
 * l'offre le jour où une monétisation réelle sera décidée (décision documentée requise).
 */

const INCLUDED: string[] = [
  'Les modules guidés complets, leurs checkpoints et la révision espacée',
  'Les 15 mondes, les fiches concept visuelles et le glossaire unifié',
  'Le Laboratoire, le quiz visuel et le deck de révision des concepts',
  'Les statistiques complètes : activité, maîtrise par compétence, points faibles',
  'Mission du jour, quêtes, série et réussites',
];

export default function AccesLibre() {
  const router = useRouter();

  return (
    <Screen>
      <Text variant="caption" color={theme.colors.primaryBright}>
        ACCÈS LIBRE
      </Text>
      <Text variant="h1">Trademy est gratuit</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        Pendant la phase de test, toutes les fonctionnalités sont débloquées pour tout le monde.
        Aucun achat, aucun abonnement, aucune donnée de paiement.
      </Text>

      <MascotFigure name="celebrate" gesture="celebrate" height={140} decorative />

      <Card elevated>
        <Text variant="title">Tout est inclus</Text>
        <View style={styles.features}>
          {INCLUDED.map((f) => (
            <View key={f} style={styles.featureRow}>
              <TrademyIcon name="check" size={16} color={theme.colors.success} />
              <Text variant="body" color={theme.colors.textSecondary} style={styles.flex1}>
                {f}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="title">Et ensuite ?</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Si une offre payante voit le jour, le cœur d’apprentissage restera gratuit et rien ne sera
          retiré sans l’annoncer clairement. Ton avis pendant la phase de test compte plus que tout.
        </Text>
      </Card>

      <Button label="Retour" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  features: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  flex1: { flex: 1 },
});
