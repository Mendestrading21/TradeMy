/**
 * Monétisation — modèle d'entitlement et offres, purs et testables.
 *
 * IMPORTANT (skill) :
 * - PatternLab n'est pas un casino et ne fait aucune promesse de gain.
 * - Les prix sont des **hypothèses configurables**, pas un engagement.
 * - **Aucun achat réel** n'est effectué : l'activation est une simulation locale
 *   (drapeau `demo`). Aucune donnée de paiement, aucun Stripe, aucun abonnement importé.
 * - **v1 gratuite (ADR-110)** : aucun paywall n'est affiché et aucun écran ne verrouille de
 *   fonctionnalité. Ce modèle pur est conservé (testé) pour le jour où une monétisation réelle
 *   serait décidée — décision documentée requise avant tout réaffichage d'une offre.
 */

export type PlanId = 'founder' | 'monthly' | 'annual';

export interface Plan {
  id: PlanId;
  label: string;
  /** Prix hypothétique (configurable). */
  price: number;
  /** Suffixe de période affiché après le prix. */
  period: string;
  /** Accroche courte optionnelle. */
  tagline?: string;
  /** Badge mis en avant (ex. « Meilleure valeur »). */
  badge?: string;
}

/** Devise d'affichage (hypothèse ; le marché WMB est CHF/€). */
export const CURRENCY = 'CHF';

/** Offres hypothétiques (skill : Pass Fondateur, mensuel, annuel). */
export const PRICING: Plan[] = [
  { id: 'founder', label: 'Pass Fondateur', price: 14.99, period: 'à vie', badge: 'Meilleure valeur' },
  { id: 'annual', label: 'Annuel', price: 44.99, period: '/ an', tagline: 'Deux mois offerts vs mensuel' },
  { id: 'monthly', label: 'Mensuel', price: 7.99, period: '/ mois' },
];

export function planById(id: PlanId | null): Plan | undefined {
  return id ? PRICING.find((p) => p.id === id) : undefined;
}

export interface PremiumFeature {
  id: string;
  label: string;
  icon: string;
}

/**
 * Ce que débloque Premium (skill). Le cœur d'apprentissage reste gratuit : Premium n'apporte
 * que de la COMMODITÉ et de la PROFONDEUR (jamais du contenu d'apprentissage essentiel).
 * Deux perks sont réellement livrés et vérrouillés aujourd'hui (`stats`, `deck`) ; les autres
 * décrivent l'offre à venir.
 */
export const PREMIUM_FEATURES: PremiumFeature[] = [
  { id: 'stats', label: 'Statistiques complètes et historique', icon: '📊' },
  { id: 'deck', label: 'Deck de révision des concepts (flashcards + quiz réunis)', icon: '🃏' },
  { id: 'exercises', label: 'Exercices avancés', icon: '🎯' },
  { id: 'lab', label: 'Laboratoire complet (tous les scénarios)', icon: '🧪' },
  { id: 'reviews', label: 'Révisions illimitées', icon: '🔁' },
  { id: 'offline', label: 'Mode hors-ligne étendu', icon: '📶' },
];

/** Ce qui reste gratuit, affiché pour la transparence (tout l'apprentissage essentiel). */
export const FREE_FEATURES: string[] = [
  'Le module pilote « Lire un graphique » en entier',
  'Les 15 mondes en aperçu et les fiches concept visuelles',
  'Le glossaire unifié, la recherche et les favoris',
  'Mission du jour, quêtes, série et réussites',
  'Un aperçu de tes statistiques',
];

export interface PremiumState {
  active: boolean;
  plan: PlanId | null;
  /** Date d'activation (ISO) ; null si inactif. */
  since: string | null;
  /** Toujours vrai : activation simulée, aucun achat réel. */
  demo: boolean;
}

export function emptyPremium(): PremiumState {
  return { active: false, plan: null, since: null, demo: true };
}

export function isPremium(p: PremiumState | null): boolean {
  return Boolean(p && p.active);
}

/** Active l'accès Premium (simulation locale — aucun achat réel). Pur. */
export function activate(plan: PlanId, nowIso: string): PremiumState {
  return { active: true, plan, since: nowIso, demo: true };
}

/** Désactive l'accès (démo / restauration d'un état). Pur. */
export function deactivate(): PremiumState {
  return emptyPremium();
}

/** Assainit un état premium chargé du stockage local. */
export function migratePremium(raw: unknown): PremiumState {
  if (!raw || typeof raw !== 'object') return emptyPremium();
  const p = raw as Partial<PremiumState>;
  const plan = p.plan === 'founder' || p.plan === 'monthly' || p.plan === 'annual' ? p.plan : null;
  const active = Boolean(p.active) && plan !== null;
  return {
    active,
    plan: active ? plan : null,
    since: active && typeof p.since === 'string' ? p.since : null,
    demo: true,
  };
}
