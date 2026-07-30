import { View, Pressable, StyleSheet } from 'react-native';
import { theme } from '../design-system/theme';
import { Text } from '../design-system/components/Text';
import { TrademyIcon } from '../design-system/icons/TrademyIcon';
import { CharacterAnimationController } from './CharacterAnimationController';
import { CHARACTER_NAME, type CharacterId } from './types';
import { GUIDE_ROLE, GUIDE_PRESENT_STATE } from './guideRoles';

export interface GuideSelectionCardProps {
  /** Guide sélectionné (null = aucun). */
  selected: CharacterId | null;
  onSelect: (id: CharacterId) => void;
}

/**
 * Carte de choix de guide (Toto/Bobo) — groupe de boutons radio ACCESSIBLE :
 * rôle pédagogique visible, état sélectionné, focus clavier (Pressable), libellé et
 * indice lecteur d'écran. La couleur n'est jamais l'unique signal (icône + libellé « Choisi »).
 * Une seule scène mascotte dominante : ce sont deux petits avatars de sélection, pas une scène.
 */
export function GuideSelectionCard({ selected, onSelect }: GuideSelectionCardProps) {
  return (
    <View
      style={styles.group}
      accessibilityRole="radiogroup"
      accessibilityLabel="Choix du guide d’apprentissage"
    >
      {(['toto', 'bobo'] as const).map((id) => {
        const active = selected === id;
        const accent = id === 'toto' ? theme.colors.bullish : theme.colors.bearish;
        return (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${CHARACTER_NAME[id]} — ${GUIDE_ROLE[id]}`}
            accessibilityHint={active ? 'Guide déjà choisi' : `Choisir ${CHARACTER_NAME[id]} comme guide`}
            style={[styles.card, { borderColor: active ? accent : theme.colors.border }]}
          >
            <View style={styles.head}>
              {/* LOT W3 — mise en avant du guide : avatar annelé à sa couleur d'identité + halo. */}
              <CharacterAnimationController character={id} state={GUIDE_PRESENT_STATE[id]} size={56} ring />
              <View style={styles.flex1}>
                <View style={styles.nameRow}>
                  <Text variant="title" color={accent}>
                    {CHARACTER_NAME[id]}
                  </Text>
                  {active ? (
                    <View style={styles.chosen}>
                      <TrademyIcon name="check" size={14} color={accent} />
                      <Text variant="caption" color={accent}>
                        Choisi
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  {GUIDE_ROLE[id]}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: theme.spacing.sm },
  card: {
    borderWidth: 2,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  flex1: { flex: 1, gap: theme.spacing.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  chosen: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
});
