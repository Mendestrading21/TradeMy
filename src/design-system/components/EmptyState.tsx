import { StateView } from './StateView';
import type { TrademyIconName } from '../icons/TrademyIcon';

export type EmptyStateProps = {
  iconName?: TrademyIconName;
  title: string;
  message?: string;
};

/** Compat : état « vide » — délègue à la primitive d'état unifiée (StateView, icônes Trademy). */
export function EmptyState({ iconName, title, message }: EmptyStateProps) {
  return <StateView variant="empty" iconName={iconName} title={title} message={message} />;
}
