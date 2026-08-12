# ADR-147 — L'identité de l'application devient Trademy, avant Apple et non après

- **Statut** : accepté (décision propriétaire, 12/08/2026).
- **Contexte** : le propriétaire s'apprête à créer la fiche App Store. Le bundle identifier de
  l'application était encore `com.patternlab.app`, alors que la marque publique est **Trademy**.

## Pourquoi maintenant, et pourquoi ça ne pouvait pas attendre

Un bundle identifier **ne se change plus** une fois la fiche créée dans App Store Connect. Il
identifie l'application chez Apple pour toute sa vie : changer d'avis ensuite oblige à créer une
seconde fiche, à repartir de zéro sur les avis et les téléchargements, et à recréer tous les
produits d'abonnement.

`CLAUDE.md` est explicite : **« Marque publique : Trademy »**, **« PatternLab : identifiant
historique interne uniquement »**. Livrer chez Apple sous `com.patternlab.app` aurait gravé
l'identifiant historique dans le seul endroit irréversible du projet.

C'était donc la dernière fenêtre où la correction coûte cinq minutes plutôt qu'une nouvelle fiche.

## Décision

- `ios.bundleIdentifier` et `android.package` deviennent **`com.trademy.app`**.
- `scheme` devient `trademy`. Aucun lien profond `patternlab://` n'existait dans le code — vérifié
  par recherche sur `src/` et `docs/` : zéro occurrence. Le changement n'a donc rien cassé.
- `slug` **reste `patternlab`**. C'est l'identifiant du projet chez Expo, pas l'identité publique, et
  le canon range précisément PatternLab dans les identifiants historiques internes. Le changer
  aurait rompu la continuité du projet Expo sans rien apporter à l'utilisateur.
- Les **clés de stockage local** (`patternlab.progress.v1`, `patternlab.session.v1`, etc.) restent
  elles aussi inchangées. Les renommer effacerait la progression de tout apprenant déjà installé :
  ce serait une migration destructive, pour un préfixe que personne ne voit jamais. Le canon exige
  des migrations non destructives ; ici la meilleure migration est de ne rien migrer.

## Le préfixe ne peut plus diverger

Le catalogue de produits recopiait le préfixe **six fois** en dur (`com.patternlab.app.sub.monthly`,
etc.). Une divergence entre `app.json` et ce catalogue produit des identifiants de produits
inachetables — et le défaut ne se voit qu'au moment de vendre, c'est-à-dire trop tard.

`src/data/subscription.ts` déclare désormais :

```ts
export const APP_BUNDLE_ID = 'com.trademy.app';
```

Les identifiants de produits en sont dérivés. Et deux tests interdisent la dérive :

- `APP_BUNDLE_ID` est **exactement** `app.json → expo.ios.bundleIdentifier` **et**
  `app.json → expo.android.package`. Les trois valeurs ne peuvent plus s'éloigner en silence.
- Le format est du reverse-DNS valide et **contient la marque publique**.

Ce sont des tests, pas des commentaires : ils tournent dans la gate.

## Ce qui a été mis à jour, et ce qui a été laissé tel quel

Mis à jour : `app.json`, `src/data/subscription.ts`, ses tests, la fixture de
`src/release/releaseCheck.test.ts`, `docs/RELEASE_CHECKLIST.md`.

**ADR-138 a été annoté, pas réécrit.** Il citait les anciens identifiants ; il reçoit une note
« Mise à jour — ADR-147 » qui donne les nouveaux et précise que c'est elle qui fait foi. Le canon
interdit d'effacer les ADR : une décision se complète, elle ne se maquille pas.

De même, `ADR-025` et `docs/PROJECT_STATUS_ARCHIVE.md` mentionnent toujours `com.patternlab.app`.
C'est **volontaire** : ce sont des archives, et elles disent la vérité de leur époque.

Vérification : `grep -rn "com\.patternlab\.app" src/ docs/RELEASE_CHECKLIST.md` ne renvoie plus rien.

## Conséquence côté propriétaire

Les produits à créer dans App Store Connect (et, le jour venu, dans la Play Console) sont :

| Plan | Identifiant de produit |
|---|---|
| Mensuel | `com.trademy.app.sub.monthly` |
| Annuel | `com.trademy.app.sub.annual` |
| Accès définitif | `com.trademy.app.lifetime` |

Rien d'autre ne change : aucune dépendance ajoutée, aucun paiement branché, aucune migration
persistante. Le socle d'abonnement reste ce que décrivait ADR-138 — un modèle local et testé, prêt à
recevoir un magasin réel le jour où le propriétaire ouvre son compte Apple Developer.
