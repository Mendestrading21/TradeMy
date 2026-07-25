import { useMemo, type ComponentProps } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs, Link, type Href } from 'expo-router';
import { theme, Text, TrademyIcon } from '@/design-system';
import { PRIMARY_SPACES } from '@/lib/navigation';

/**
 * Barre d'onglets canonique Trademy (LOT 4-H) — shell global des cinq espaces.
 *
 * Elle remplace la barre par défaut de react-navigation (libellés « Bibliothèque »/« Laboratoire »
 * tronqués sous 360 px) par une composition VERTICALE (icône + libellé) à largeur distribuée qui reste
 * lisible dès 320 px. Elle N'introduit AUCUNE route : la source unique reste `PRIMARY_SPACES`
 * (icône + libellé + nom de route), et la navigation passe par les évènements du navigateur.
 *
 * État actif communiqué par PLUSIEURS indices (jamais la seule couleur) : capsule (fond + contour),
 * graisse du libellé et épaisseur du trait de l'icône, en plus de l'accent de marque. Cibles ≥ 44 px,
 * focus clavier visible sur le web, contraste AA, `reduced-motion` respecté (aucune animation ici).
 */

// Type des props de la barre dérivé directement du render-prop `tabBar` d'expo-router : aucune
// dépendance importée, aucun type interne recopié.
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/**
 * URL réelle de chaque espace (routes EXISTANTES, non renommées). On rend chaque onglet comme un VRAI
 * lien (`<a href>` côté web via `Link`) : navigation sans JS/SSR conservée, sémantique de lien correcte,
 * et références HTML préservées. La navigation client passe par expo-router (le `href` reste la vérité).
 */
const TAB_HREF: Record<string, Href> = {
  index: '/',
  parcours: '/parcours',
  apprendre: '/apprendre',
  laboratoire: '/laboratoire',
  profil: '/profil',
};

export function TrademyTabBar({ state, insets }: TabBarProps) {
  // On dérive les entrées visibles de la SOURCE UNIQUE `PRIMARY_SPACES`, dans l'ordre canonique,
  // en retrouvant la route réelle (clé + focus) pour chaque espace. Les écrans hors-barre
  // (`href: null` : revisions, lecons, quiz) restent montés mais ne sont jamais rendus ici.
  const items = useMemo(() => {
    const activeName = state.routes[state.index]?.name;
    return PRIMARY_SPACES.map((space) => {
      const route = state.routes.find((r) => r.name === space.name);
      return route ? { space, key: route.key, focused: space.name === activeName } : null;
    }).filter((x): x is { space: (typeof PRIMARY_SPACES)[number]; key: string; focused: boolean } => x !== null);
  }, [state.routes, state.index]);

  return (
    <View
      role="navigation"
      accessibilityLabel="Navigation principale"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, theme.spacing.xs) }]}
    >
      {items.map(({ space, key, focused }) => {
        const accent = focused ? theme.colors.primaryBright : theme.colors.textSecondary;
        return (
          // Chaque onglet est un VRAI lien (route existante). L'état actif est exposé à la fois par
          // `accessibilityState.selected` (natif) ET par le nom accessible (« … , espace actif »),
          // jamais par la seule couleur — le lien web n'accepte pas `aria-selected`.
          <Link key={key} href={TAB_HREF[space.name]} asChild>
            <Pressable
              accessible
              accessibilityState={{ selected: focused }}
              accessibilityLabel={focused ? `${space.title}, espace actif` : space.title}
              style={styles.item}
            >
              {(kbState) => (
                // `focused` (focus clavier web) est ajouté par react-native-web mais absent des types RN.
                <View style={[styles.pill, focused && styles.pillActive, (kbState as { focused?: boolean }).focused && styles.pillFocus]}>
                  <TrademyIcon name={space.icon} size={22} color={accent} strokeWidth={focused ? 2.6 : 2} />
                  <Text variant="caption" color={accent} numberOfLines={1} style={styles.label}>
                    {space.title}
                  </Text>
                </View>
              )}
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderStrong,
    paddingTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  item: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    alignSelf: 'stretch',
    minHeight: 44,
    paddingVertical: 4,
    paddingHorizontal: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: theme.colors.surfaceSelected,
    borderColor: theme.colors.primary,
  },
  pillFocus: {
    borderColor: theme.colors.focusRing,
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: -0.1,
    textAlign: 'center',
    width: '100%',
  },
});
