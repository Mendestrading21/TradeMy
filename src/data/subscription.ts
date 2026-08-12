/**
 * Socle d'ABONNEMENT — modèle pur et testable, sans aucun SDK de paiement.
 *
 * Pourquoi ce fichier existe (ADR-138) : `premium.ts` décrit une activation de DÉMONSTRATION
 * (`{ active, plan, since, demo }`) qui ne sait rien de ce qu'est réellement un abonnement de
 * magasin : il n'expire pas, ne se renouvelle pas, n'a pas d'essai, pas de période de grâce et
 * pas de provenance. Brancher un jour l'App Store sur ce modèle demanderait de tout réécrire au
 * pire moment — celui où l'on veut encaisser.
 *
 * Ce module décrit donc l'entitlement TEL QU'UN MAGASIN LE RENVOIE, et rien de plus :
 *  · le catalogue des produits, avec leurs identifiants App Store Connect / Play Console ;
 *  · l'enregistrement d'achat assaini (`SubscriptionRecord`) ;
 *  · la résolution de l'accès comme FONCTION PURE de (enregistrement, instant) ;
 *  · un PORT fournisseur (`SubscriptionProvider`) et son adaptateur de démonstration.
 *
 * Ce que ce module ne fait PAS, volontairement :
 *  · aucune dépendance de paiement (StoreKit, Play Billing, RevenueCat…) : elle serait
 *    invérifiable ici — pas de build natif, pas de bac à sable magasin — et le canon interdit
 *    d'ajouter un service externe sans besoin démontré ET décision documentée ;
 *  · aucun affichage : la v1 reste GRATUITE (ADR-110) et montrer un prix non achetable serait
 *    malhonnête. `PAYWALL_ENABLED` reste donc à `false`, et un test le verrouille ;
 *  · aucune migration destructive : l'état de démonstration déjà persisté reste lisible.
 */

/** Identifiant INTERNE d'une formule (stable, indépendant du magasin). */
export type SubscriptionPlanId = 'monthly' | 'annual' | 'lifetime';

/** Magasin d'où provient un droit d'accès. */
export type EntitlementSource = 'app_store' | 'play_store' | 'promo' | 'demo';

/**
 * Bundle identifier réel de l'application — SOURCE UNIQUE de ce préfixe.
 *
 * Il était auparavant recopié dans chaque identifiant de produit. Un bundle identifier ne se change
 * plus une fois la fiche créée chez Apple : une divergence entre `app.json` et ce catalogue
 * produirait des produits inachetables, et le défaut ne se verrait qu'au moment de vendre. La
 * valeur est donc déclarée ici une fois, et un test la confronte à `app.json` — côté iOS ET côté
 * Android.
 */
export const APP_BUNDLE_ID = 'com.trademy.app';

/**
 * Produit vendable. Les identifiants magasin sont ceux à CRÉER côté propriétaire ; ils sont
 * préfixés par `APP_BUNDLE_ID` pour qu'aucune ambiguïté ne subsiste au moment de les déclarer
 * dans App Store Connect.
 */
export interface StoreProduct {
  id: SubscriptionPlanId;
  /** Identifiant à déclarer dans App Store Connect (abonnement auto-renouvelable, ou non-consommable pour `lifetime`). */
  appStoreProductId: string;
  /** Identifiant à déclarer dans la Play Console. */
  playStoreProductId: string;
  /** Libellé affiché (le jour où une offre sera affichée). */
  label: string;
  /** Durée d'un cycle, en jours. `null` = achat définitif, sans renouvellement. */
  periodDays: number | null;
  /** Durée de l'essai d'introduction, en jours (0 = aucun essai). */
  trialDays: number;
}

/**
 * Catalogue des produits. Les PRIX n'y figurent pas : sur iOS comme sur Android, le prix affiché
 * DOIT venir du magasin (devise, taxes, promotions locales). Coder un prix en dur serait faux
 * dans la plupart des pays.
 */
export const STORE_PRODUCTS: readonly StoreProduct[] = [
  {
    id: 'monthly',
    appStoreProductId: `${APP_BUNDLE_ID}.sub.monthly`,
    playStoreProductId: `${APP_BUNDLE_ID}.sub.monthly`,
    label: 'Mensuel',
    periodDays: 30,
    trialDays: 7,
  },
  {
    id: 'annual',
    appStoreProductId: `${APP_BUNDLE_ID}.sub.annual`,
    playStoreProductId: `${APP_BUNDLE_ID}.sub.annual`,
    label: 'Annuel',
    periodDays: 365,
    trialDays: 7,
  },
  {
    id: 'lifetime',
    appStoreProductId: `${APP_BUNDLE_ID}.lifetime`,
    playStoreProductId: `${APP_BUNDLE_ID}.lifetime`,
    label: 'Accès définitif',
    periodDays: null,
    trialDays: 0,
  },
] as const;

export function productById(id: SubscriptionPlanId | null | undefined): StoreProduct | undefined {
  return id ? STORE_PRODUCTS.find((p) => p.id === id) : undefined;
}

/**
 * Enregistrement d'achat ASSAINI — ce qu'on conserve localement après avoir lu le magasin.
 * Aucune donnée de paiement n'y figure jamais : ni carte, ni identité, ni reçu brut.
 */
export interface SubscriptionRecord {
  planId: SubscriptionPlanId;
  source: EntitlementSource;
  /** Date d'achat (ISO). */
  purchasedAt: string;
  /** Fin du cycle en cours (ISO). `null` UNIQUEMENT pour un achat définitif. */
  expiresAt: string | null;
  /** L'utilisateur est-il dans sa période d'essai ? */
  inTrial: boolean;
  /** Le magasin renouvellera-t-il automatiquement à l'échéance ? */
  autoRenew: boolean;
}

/**
 * Période de grâce : Apple comme Google continuent de servir l'accès quelques jours après un
 * échec de paiement, le temps que l'utilisateur régularise. Couper l'accès à la seconde près
 * ferait perdre des abonnés qui n'ont rien annulé.
 */
export const GRACE_PERIOD_DAYS = 16;

/** État d'accès résolu, à un instant donné. */
export type EntitlementStatus = 'none' | 'trial' | 'active' | 'grace' | 'expired';

export interface Entitlement {
  status: EntitlementStatus;
  /** L'accès payant est-il ouvert MAINTENANT ? (essai et grâce comptent comme ouverts.) */
  isPro: boolean;
  planId: SubscriptionPlanId | null;
  source: EntitlementSource | null;
  /** Fin de l'accès (ISO) ; `null` pour un accès définitif ou absent. */
  until: string | null;
  /** Le renouvellement est-il prévu ? Utile pour dire honnêtement « se termine le … ». */
  autoRenew: boolean;
}

/** Aucun droit d'accès. */
export function noEntitlement(): Entitlement {
  return { status: 'none', isPro: false, planId: null, source: null, until: null, autoRenew: false };
}

const DAY_MS = 86_400_000;

/** Instant d'une date ISO, ou `null` si elle est absente ou illisible. */
function instant(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Résout l'accès à un instant donné — FONCTION PURE, aucune horloge implicite.
 *
 * Règles, dans l'ordre :
 *  1. sans enregistrement lisible → aucun accès ;
 *  2. achat définitif (`expiresAt === null`) → accès ouvert, sans échéance ;
 *  3. avant l'échéance → `trial` si l'essai court, sinon `active` ;
 *  4. après l'échéance mais dans la période de grâce → `grace`, accès MAINTENU ;
 *  5. au-delà → `expired`, accès fermé.
 */
export function resolveEntitlement(record: SubscriptionRecord | null, nowIso: string): Entitlement {
  const now = instant(nowIso);
  if (!record || now === null) return noEntitlement();

  const product = productById(record.planId);
  if (!product) return noEntitlement();

  const base = {
    planId: record.planId,
    source: record.source,
    autoRenew: record.autoRenew,
  };

  // 2. Achat définitif : le produit lui-même dit qu'il n'a pas de cycle.
  if (product.periodDays === null) {
    return { ...base, status: 'active', isPro: true, until: null, autoRenew: false };
  }

  const expires = instant(record.expiresAt);
  // Un abonnement à cycle SANS échéance lisible est un enregistrement corrompu : on n'ouvre rien.
  if (expires === null) return noEntitlement();

  if (now < expires) {
    return {
      ...base,
      status: record.inTrial ? 'trial' : 'active',
      isPro: true,
      until: record.expiresAt,
    };
  }

  if (now < expires + GRACE_PERIOD_DAYS * DAY_MS) {
    return { ...base, status: 'grace', isPro: true, until: record.expiresAt };
  }

  return { ...base, status: 'expired', isPro: false, until: record.expiresAt };
}

/** Jours restants avant la fin de l'accès (0 si terminé ou sans échéance). Pur. */
export function daysRemaining(entitlement: Entitlement, nowIso: string): number {
  const end = instant(entitlement.until);
  const now = instant(nowIso);
  if (end === null || now === null || !entitlement.isPro) return 0;
  return Math.max(0, Math.ceil((end - now) / DAY_MS));
}

/** Assainit un enregistrement chargé du stockage local (ou renvoyé par un magasin). */
export function migrateSubscription(raw: unknown): SubscriptionRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<SubscriptionRecord>;
  const product = productById(r.planId);
  if (!product) return null;
  if (typeof r.purchasedAt !== 'string' || instant(r.purchasedAt) === null) return null;

  const sources: EntitlementSource[] = ['app_store', 'play_store', 'promo', 'demo'];
  const source = sources.includes(r.source as EntitlementSource) ? (r.source as EntitlementSource) : 'demo';

  // Un produit à cycle DOIT porter une échéance lisible ; un achat définitif n'en porte jamais.
  const expiresAt =
    product.periodDays === null
      ? null
      : typeof r.expiresAt === 'string' && instant(r.expiresAt) !== null
        ? r.expiresAt
        : null;
  if (product.periodDays !== null && expiresAt === null) return null;

  return {
    planId: product.id,
    source,
    purchasedAt: r.purchasedAt,
    expiresAt,
    inTrial: Boolean(r.inTrial),
    autoRenew: product.periodDays === null ? false : Boolean(r.autoRenew),
  };
}

/**
 * PORT fournisseur : la seule frontière entre l'app et un magasin réel.
 *
 * Le jour où un compte Apple Developer existe, brancher l'App Store consiste à écrire UN
 * adaptateur qui implémente cette interface — aucun autre fichier de l'app ne bouge. Les prix
 * ne transitent pas par ce port : ils s'affichent depuis le magasin, jamais depuis notre code.
 */
export interface SubscriptionProvider {
  /** Produits réellement disponibles à la vente sur cet appareil (peut être vide hors ligne). */
  availableProducts(): Promise<readonly StoreProduct[]>;
  /** Lance l'achat et renvoie l'enregistrement assaini, ou `null` si l'utilisateur a renoncé. */
  purchase(planId: SubscriptionPlanId): Promise<SubscriptionRecord | null>;
  /** Restaure un achat déjà effectué (obligation Apple : le bouton doit exister). */
  restore(): Promise<SubscriptionRecord | null>;
}

/**
 * Adaptateur de DÉMONSTRATION : aucun achat réel, aucun réseau, aucun encaissement.
 * Il sert aux tests et à un éventuel mode d'essai interne. `source` vaut toujours `demo`,
 * ce qui rend un droit simulé reconnaissable partout dans le code.
 */
export function createDemoProvider(nowIso: string): SubscriptionProvider {
  return {
    async availableProducts() {
      return STORE_PRODUCTS;
    },
    async purchase(planId) {
      const product = productById(planId);
      if (!product) return null;
      const start = instant(nowIso);
      if (start === null) return null;
      const cycle = product.periodDays ?? 0;
      return {
        planId,
        source: 'demo',
        purchasedAt: nowIso,
        expiresAt: product.periodDays === null ? null : new Date(start + cycle * DAY_MS).toISOString(),
        inTrial: product.trialDays > 0,
        autoRenew: product.periodDays !== null,
      };
    },
    async restore() {
      return null;
    },
  };
}

/**
 * Le paywall reste FERMÉ tant qu'un achat réel n'existe pas (ADR-110, confirmé par ADR-138).
 * Afficher une offre non achetable serait un état trompeur — exactement ce que le canon interdit.
 * Passer ce drapeau à `true` exige : un adaptateur de magasin réel, les produits créés côté
 * propriétaire, et une décision documentée.
 */
export const PAYWALL_ENABLED = false;

/**
 * Décide de l'accès à une fonctionnalité. Tant que `PAYWALL_ENABLED` est faux, TOUT est ouvert —
 * quel que soit l'entitlement. C'est la garantie qu'aucun lot ne peut refermer par accident ce
 * que la v1 gratuite a ouvert.
 */
export function canAccess(entitlement: Entitlement): boolean {
  if (!PAYWALL_ENABLED) return true;
  return entitlement.isPro;
}
