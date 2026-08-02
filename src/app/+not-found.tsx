import { useRouter } from 'expo-router';
import { Screen, StateView } from '@/design-system';

/**
 * Écran « page introuvable » CANONIQUE (audit canon) : remplace l'« Unmatched Route » anglais
 * par défaut d'expo-router. Sert aussi de prérendu à `404.html` (GitHub Pages renvoie ce fichier
 * pour toute URL inconnue — voir `scripts/finalize-web-build.mjs`) : le contenu pré-rendu et le
 * rendu client coïncident, ce qui supprime la divergence d'hydratation React #418 sur les liens
 * profonds inconnus. Une seule action (canon) : revenir à l'accueil.
 */
export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <StateView
        variant="empty"
        iconName="search"
        title="Page introuvable"
        message="Cette adresse ne correspond à aucun contenu Trademy. Reprends depuis l’accueil."
        action={{ label: 'Retour à l’accueil', onPress: () => router.replace('/') }}
      />
    </Screen>
  );
}
