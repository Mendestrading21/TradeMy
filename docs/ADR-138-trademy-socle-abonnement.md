# ADR-138 — Socle d'abonnement App Store : le modèle, pas le paiement

- **Statut** : accepté (demande propriétaire du 11/08/2026 : « une app où je peux créer des
  abonnements sur l'App Store »).
> **Mise à jour — ADR-147.** Les identifiants cités plus bas étaient préfixés par
> `com.patternlab.app`. Le bundle identifier est devenu **`com.trademy.app`** avant toute création
> de fiche chez Apple. Les identifiants de produits à créer sont donc `com.trademy.app.sub.monthly`,
> `…sub.annual` et `…lifetime`. Le texte d'origine est conservé tel quel — un ADR se complète, il ne
> se réécrit pas — mais **c'est cette note qui fait foi** pour les identifiants.
- **Contexte** : le canon interdit d'ajouter « une dépendance, une migration persistante, un
  paiement ou un service externe sans besoin démontré ET décision documentée » (CLAUDE.md). Le
  besoin est ici explicitement demandé ; cet ADR est la décision.

## Ce que je ne peux pas faire, dit franchement

**Je ne peux pas créer les abonnements App Store.** Cela demande, côté propriétaire uniquement :
un compte Apple Developer Program actif, une fiche d'app dans App Store Connect, et les produits
d'abonnement créés puis soumis. Aucune ligne de code ne remplace ces étapes.

**Je n'ajoute pas de SDK de paiement.** StoreKit, Play Billing ou RevenueCat seraient
**invérifiables ici** : pas de build natif, pas de bac à sable magasin, pas de compte. Ajouter une
dépendance qu'aucun test ne peut exercer affaiblirait la gate au lieu de la renforcer — et
donnerait l'illusion que l'encaissement est prêt.

## Le vrai problème que ce lot résout

`premium.ts` décrit une activation de **démonstration** : `{ active, plan, since, demo }`. Ce
modèle ne sait rien de ce qu'est un abonnement de magasin. Il **n'expire pas**, ne se renouvelle
pas, ignore l'essai d'introduction, ignore la période de grâce après un échec de paiement, et ne
distingue pas d'où vient le droit d'accès. Brancher l'App Store dessus obligerait à tout réécrire
au pire moment : celui où l'on veut encaisser.

## Décision

Un module **pur et testé**, `src/data/subscription.ts`, qui décrit l'entitlement **tel qu'un
magasin le renvoie** :

1. **Catalogue** (`STORE_PRODUCTS`) : mensuel, annuel, accès définitif. Chaque produit porte son
   identifiant App Store Connect et Play Console, **préfixé par le bundle identifier réel**
   (`com.patternlab.app`, tiré de `app.json`) : il n'y aura aucune ambiguïté au moment de les créer.
   **Aucun prix n'est codé** — sur iOS comme sur Android le prix affiché doit venir du magasin
   (devise, taxes, promotions locales) ; le coder en dur serait faux dans presque tous les pays.
   Un test le verrouille.
2. **Enregistrement assaini** (`SubscriptionRecord`) : formule, provenance
   (`app_store` / `play_store` / `promo` / `demo`), achat, échéance, essai, renouvellement.
   **Aucune donnée de paiement** n'y figure jamais : ni carte, ni identité, ni reçu brut.
3. **Résolution pure** `resolveEntitlement(record, now)` → `none` / `trial` / `active` / `grace` /
   `expired`, sans horloge implicite. La **période de grâce de 16 jours** est la règle qui compte le
   plus en pratique : Apple et Google continuent de servir l'accès après un échec de paiement, et
   couper à la seconde ferait perdre des abonnés qui n'ont rien annulé.
4. **Port fournisseur** (`SubscriptionProvider`) + adaptateur de démonstration. C'est la seule
   frontière entre l'app et un magasin : brancher l'App Store consistera à écrire **un** adaptateur.
5. **`PAYWALL_ENABLED = false`** et `canAccess()` qui ouvre **tout** tant que ce drapeau est faux.
   Un test vérifie qu'aucun lot futur ne peut refermer par accident ce que la v1 gratuite a ouvert.

## Ce qui n'a pas changé

- **Aucune interface modifiée.** La v1 reste gratuite (ADR-110) : montrer un prix non achetable
  serait un état trompeur, exactement ce que le canon interdit. `/premium` reste l'écran
  « Accès libre ».
- **Aucune dépendance, aucune migration.** `premium.ts` et son stockage restent intacts et lus tels
  quels ; ce module vit à côté, sans rien casser.
- Aucun contenu pédagogique touché.

## Ce qui reste à faire — et par qui

**Côté propriétaire (je ne peux pas le faire) :**

1. Ouvrir un compte **Apple Developer Program** (99 $/an) et, si Android est visé, un compte
   **Google Play Console** (25 $ une fois).
2. Créer la fiche d'app dans **App Store Connect** avec le bundle identifier `com.patternlab.app`
   (ou changer celui d'`app.json` pour correspondre à un identifiant déjà réservé).
3. Créer les produits avec **exactement** les identifiants du catalogue
   (`com.patternlab.app.sub.monthly`, `…sub.annual`, `…lifetime`), fixer les prix par territoire,
   et remplir les **accords bancaires et fiscaux** — sans eux, aucun produit n'est vendable.
4. Choisir le fournisseur : `react-native-iap` (pas d'intermédiaire, tout à écrire) ou RevenueCat
   (moins de code, un service externe et une commission de plus).

**Côté code (une fois les points ci-dessus faits) :**

5. Ajouter la dépendance choisie et écrire **un** adaptateur qui implémente
   `SubscriptionProvider` — aucun autre fichier de l'app ne bouge.
6. Faire persister le `SubscriptionRecord` (un dépôt calqué sur `premiumRepository`, migration
   additive).
7. Décider **ce qui devient payant** — et le documenter : le canon impose que le cœur
   d'apprentissage reste gratuit, donc l'offre ne peut porter que sur de la commodité et de la
   profondeur.
8. Rouvrir l'écran d'offre, passer `PAYWALL_ENABLED` à `true`, ajouter le bouton
   **« Restaurer mes achats »** (obligatoire chez Apple).
9. Construire avec **EAS** (`eas.json` est déjà configuré : profils development / preview /
   production) et tester en **bac à sable StoreKit** avant soumission.

## Tests (exécutés)

`subscription.test.ts` — 18 tests verts : identifiants magasin distincts et préfixés, absence de
prix codé, cohérence produit/cycle, accès à la **frontière exacte** de l'échéance (ouvert la
seconde d'avant, en grâce la seconde d'après), survie puis fermeture après la grâce, accès définitif
sans échéance ni renouvellement, refus de tout enregistrement incohérent, provenance inconnue
ramenée à `demo` plutôt qu'inventée, adaptateur de démonstration qui n'encaisse rien, et
verrouillage de la gratuité de la v1.

Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.
