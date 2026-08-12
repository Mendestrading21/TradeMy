import { describe, it, expect } from '@jest/globals';
// L'identité de l'app est lue à sa SOURCE, pas recopiée : c'est tout l'objet du verrou ci-dessous.
import appJson from '../../app.json';
import {
  STORE_PRODUCTS,
  productById,
  resolveEntitlement,
  daysRemaining,
  migrateSubscription,
  createDemoProvider,
  noEntitlement,
  canAccess,
  PAYWALL_ENABLED,
  GRACE_PERIOD_DAYS,
  type SubscriptionRecord,
  APP_BUNDLE_ID,
} from './subscription';

/**
 * Socle d'abonnement — verrous du modèle PUR (ADR-138).
 *
 * Ces tests décrivent ce qu'est réellement un abonnement de magasin : il expire, il se renouvelle,
 * il commence parfois par un essai, et il survit quelques jours à un échec de paiement. Chacune de
 * ces règles est vérifiée à la FRONTIÈRE (la seconde qui précède et celle qui suit), parce que
 * c'est exactement là qu'un accès se coupe à tort dans la vraie vie.
 */

const NOW = '2026-08-11T12:00:00.000Z';
const DAY = 86_400_000;
const at = (offsetDays: number) => new Date(Date.parse(NOW) + offsetDays * DAY).toISOString();

function record(over: Partial<SubscriptionRecord> = {}): SubscriptionRecord {
  return {
    planId: 'monthly',
    source: 'app_store',
    purchasedAt: at(-10),
    expiresAt: at(20),
    inTrial: false,
    autoRenew: true,
    ...over,
  };
}

describe('catalogue des produits', () => {
  it('chaque produit porte des identifiants magasin DISTINCTS et non vides', () => {
    const appStore = STORE_PRODUCTS.map((p) => p.appStoreProductId);
    expect(new Set(appStore).size).toBe(STORE_PRODUCTS.length);
    for (const p of STORE_PRODUCTS) {
      expect(p.appStoreProductId.length).toBeGreaterThan(0);
      expect(p.playStoreProductId.length).toBeGreaterThan(0);
      // Préfixés par le bundle identifier réel de l'app : aucune ambiguïté au moment de les créer.
      expect(p.appStoreProductId.startsWith(APP_BUNDLE_ID)).toBe(true);
      expect(p.playStoreProductId.startsWith(APP_BUNDLE_ID)).toBe(true);
    }
  });

  it('aucun PRIX n’est codé en dur : il doit venir du magasin', () => {
    // Le prix dépend du pays, de la devise et des taxes. Le coder ici serait faux presque partout.
    for (const p of STORE_PRODUCTS) {
      expect(Object.keys(p)).not.toContain('price');
      expect(Object.keys(p)).not.toContain('currency');
    }
  });

  it('seul l’accès définitif n’a pas de cycle ; les abonnements en ont un', () => {
    expect(productById('lifetime')?.periodDays).toBeNull();
    expect(productById('monthly')?.periodDays).toBe(30);
    expect(productById('annual')?.periodDays).toBe(365);
    expect(productById(null)).toBeUndefined();
  });
});

describe('résolution de l’accès (fonction pure)', () => {
  it('sans enregistrement : aucun accès', () => {
    expect(resolveEntitlement(null, NOW)).toEqual(noEntitlement());
  });

  it('abonnement en cours : accès ouvert, échéance annoncée', () => {
    const e = resolveEntitlement(record(), NOW);
    expect(e.status).toBe('active');
    expect(e.isPro).toBe(true);
    expect(e.until).toBe(at(20));
    expect(e.source).toBe('app_store');
  });

  it('pendant l’essai : accès ouvert, et l’état le DIT (pour ne pas facturer une surprise)', () => {
    const e = resolveEntitlement(record({ inTrial: true }), NOW);
    expect(e.status).toBe('trial');
    expect(e.isPro).toBe(true);
  });

  it('à la frontière de l’échéance : ouvert juste avant, en grâce juste après', () => {
    const r = record({ expiresAt: NOW });
    const uneSecondeAvant = new Date(Date.parse(NOW) - 1000).toISOString();
    expect(resolveEntitlement(r, uneSecondeAvant).status).toBe('active');
    // À la seconde exacte l'échéance est atteinte : on bascule en grâce, l'accès RESTE ouvert.
    const juste = resolveEntitlement(r, NOW);
    expect(juste.status).toBe('grace');
    expect(juste.isPro).toBe(true);
  });

  it('période de grâce : l’accès survit à un échec de paiement, puis se ferme', () => {
    const r = record({ expiresAt: at(-1) });
    const dansLaGrace = resolveEntitlement(r, NOW);
    expect(dansLaGrace.status).toBe('grace');
    expect(dansLaGrace.isPro).toBe(true);

    const apresLaGrace = resolveEntitlement(r, at(GRACE_PERIOD_DAYS));
    expect(apresLaGrace.status).toBe('expired');
    expect(apresLaGrace.isPro).toBe(false);
    // Même expiré, on garde de quoi expliquer honnêtement ce qui s'est passé.
    expect(apresLaGrace.planId).toBe('monthly');
    expect(apresLaGrace.until).toBe(at(-1));
  });

  it('accès définitif : ouvert, sans échéance et sans renouvellement', () => {
    const e = resolveEntitlement(record({ planId: 'lifetime', expiresAt: null, autoRenew: true }), at(9999));
    expect(e.status).toBe('active');
    expect(e.isPro).toBe(true);
    expect(e.until).toBeNull();
    // Un achat définitif ne se renouvelle pas : annoncer l'inverse serait mensonger.
    expect(e.autoRenew).toBe(false);
  });

  it('un enregistrement incohérent n’ouvre RIEN (abonnement sans échéance, date illisible, produit inconnu)', () => {
    expect(resolveEntitlement(record({ expiresAt: null }), NOW).isPro).toBe(false);
    expect(resolveEntitlement(record({ expiresAt: 'pas-une-date' }), NOW).isPro).toBe(false);
    expect(resolveEntitlement(record(), 'pas-une-date').isPro).toBe(false);
    expect(resolveEntitlement(record({ planId: 'inconnu' as any }), NOW).isPro).toBe(false);
  });
});

describe('jours restants', () => {
  it('compte les jours jusqu’à l’échéance, jamais en négatif', () => {
    expect(daysRemaining(resolveEntitlement(record({ expiresAt: at(3) }), NOW), NOW)).toBe(3);
    expect(daysRemaining(noEntitlement(), NOW)).toBe(0);
    expect(daysRemaining(resolveEntitlement(record({ planId: 'lifetime', expiresAt: null }), NOW), NOW)).toBe(0);
  });
});

describe('assainissement d’un enregistrement', () => {
  it('rejette tout ce qui n’est pas un achat exploitable', () => {
    expect(migrateSubscription(null)).toBeNull();
    expect(migrateSubscription('abonné')).toBeNull();
    expect(migrateSubscription({})).toBeNull();
    expect(migrateSubscription({ planId: 'monthly' })).toBeNull(); // sans date d'achat
    expect(migrateSubscription({ planId: 'monthly', purchasedAt: at(-1) })).toBeNull(); // sans échéance
  });

  it('retient une provenance INCONNUE comme « demo » plutôt que de l’inventer', () => {
    const m = migrateSubscription({ planId: 'annual', source: 'bitcoin', purchasedAt: at(-1), expiresAt: at(1) });
    expect(m?.source).toBe('demo');
  });

  it('impose la cohérence du produit : un accès définitif n’a ni échéance ni renouvellement', () => {
    const m = migrateSubscription({
      planId: 'lifetime',
      source: 'app_store',
      purchasedAt: at(-1),
      expiresAt: at(30),
      autoRenew: true,
    });
    expect(m?.expiresAt).toBeNull();
    expect(m?.autoRenew).toBe(false);
  });
});

describe('adaptateur de démonstration', () => {
  it('n’encaisse rien : tout achat simulé est marqué « demo »', async () => {
    const provider = createDemoProvider(NOW);
    const bought = await provider.purchase('monthly');
    expect(bought?.source).toBe('demo');
    expect(bought?.expiresAt).toBe(at(30));
    expect(bought?.inTrial).toBe(true); // le mensuel documente un essai de 7 jours
    expect(resolveEntitlement(bought, NOW).status).toBe('trial');
  });

  it('expose le catalogue et ne restaure rien (aucun achat réel n’existe)', async () => {
    const provider = createDemoProvider(NOW);
    expect(await provider.availableProducts()).toEqual(STORE_PRODUCTS);
    expect(await provider.restore()).toBeNull();
    expect(await provider.purchase('inconnu' as any)).toBeNull();
  });
});

describe('la v1 reste GRATUITE tant qu’aucun achat réel n’existe (ADR-110)', () => {
  it('le paywall est fermé', () => {
    expect(PAYWALL_ENABLED).toBe(false);
  });

  it('TOUT est accessible, quel que soit l’entitlement — aucun lot ne peut refermer la v1 par accident', () => {
    expect(canAccess(noEntitlement())).toBe(true);
    expect(canAccess(resolveEntitlement(record({ expiresAt: at(-999) }), NOW))).toBe(true);
    expect(canAccess(resolveEntitlement(record(), NOW))).toBe(true);
  });
});

describe('identité de l’application — le préfixe ne peut pas diverger', () => {
  it('APP_BUNDLE_ID est EXACTEMENT le bundle identifier déclaré dans app.json, iOS et Android', () => {
    // Un bundle identifier ne se change plus une fois la fiche créée chez Apple. Si cette constante
    // et `app.json` divergeaient, les produits d'abonnement seraient déclarés sous un préfixe qui
    // n'existe pas — et le défaut ne se verrait qu'au moment d'essayer de vendre.
    expect(APP_BUNDLE_ID).toBe(appJson.expo.ios.bundleIdentifier);
    expect(APP_BUNDLE_ID).toBe(appJson.expo.android.package);
  });

  it('le bundle identifier est en reverse-DNS et porte la marque publique', () => {
    expect(APP_BUNDLE_ID).toMatch(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/);
    expect(APP_BUNDLE_ID).toContain('trademy');
  });
});
