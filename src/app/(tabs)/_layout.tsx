import { Tabs } from 'expo-router';
import { theme } from '@/design-system';
import { PRIMARY_SPACES, HIDDEN_TAB_ROUTES } from '@/lib/navigation';
import { TrademyTabBar } from '@/components/TrademyTabBar';

/**
 * Shell des cinq espaces principaux (LOT 4-H). La barre d'onglets par défaut est remplacée par
 * `TrademyTabBar` (composition verticale lisible dès 320 px, capsule active, a11y, focus web). La
 * source des libellés/icônes/routes reste `PRIMARY_SPACES` ; les écrans hors-barre gardent `href: null`.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TrademyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {PRIMARY_SPACES.map((space) => (
        <Tabs.Screen key={space.name} name={space.name} options={{ title: space.title }} />
      ))}

      {/* Écrans conservés, accessibles par navigation, hors barre d'onglets.
          Réviser est intégré à l'Accueil / au Profil (accès rapide). */}
      {HIDDEN_TAB_ROUTES.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
