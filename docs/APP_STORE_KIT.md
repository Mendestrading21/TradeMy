# Kit de soumission App Store

Tout ce qui se prépare **sans** le compte Apple Developer. À copier-coller dans App Store Connect le
jour où le compte existe.

Ce document ne remplace pas la relecture éditoriale ni la lecture des règles Apple : il rassemble ce
qui, sinon, s'improvise à 2 h du matin devant un formulaire.

---

## 1. Identité de la fiche

| Champ App Store Connect | Valeur |
|---|---|
| Nom de l'app (30 car. max) | `Trademy` |
| Sous-titre (30 car. max) | `Apprends à lire les marchés` |
| Bundle ID | `com.trademy.app` |
| Catégorie principale | Éducation |
| Catégorie secondaire | Finance |
| Langue principale | Français |

Le **nom** et le **sous-titre** sont indexés par la recherche App Store ; le sous-titre ci-dessus
reprend la tagline canonique (`APP_INFO.tagline`), ce qui garde une seule vérité entre l'app et sa
fiche.

## 2. Texte promotionnel (170 car. max, modifiable sans re-soumission)

> Neuf nouvelles notions d'indicateurs : moyenne mobile, croisements, ATR, retracements,
> stochastique. Chaque graphique est calculé, jamais illustratif.

## 3. Description

```
Trademy t'apprend à LIRE un graphique de marché. Pas à parier dessus.

Quelques minutes par jour, une notion à la fois, avec deux guides qui ne sont
jamais d'accord : Toto voit l'opportunité, Bobo cherche la preuve. C'est leur
désaccord qui enseigne.

CE QUE TU APPRENDS
• Lire une bougie, une tendance, un niveau, une figure
• Comprendre ce qu'un indicateur mesure — et ce qu'il ne dit pas
• Repérer un faux signal avant qu'il ne te coûte quelque chose
• Situer une invalidation : le niveau qui prouve que tu avais tort

COMMENT
15 mondes, du premier graphique aux phases de Wyckoff. Chaque monde se termine
par une preuve, jamais par une simple lecture : tu observes, tu formules, tu
manipules, tu réponds, tu expliques, puis tu révises.

Les graphiques ne sont pas des images : ils sont calculés. Quand une fiche dit
« le croisement arrive trois bougies après le retournement », tu peux les
compter à l'écran.

CE QUE TRADEMY N'EST PAS
Aucun conseil en investissement. Aucun signal d'achat ou de vente. Aucune
promesse de gain. Aucun portefeuille réel, aucune connexion à un courtier.
Le trading comporte un risque de perte.

RESPECT DE TA VIE PRIVÉE
Aucun compte. Aucun e-mail. Aucune donnée personnelle collectée. Ta progression
reste sur ton appareil. L'app fonctionne entièrement hors ligne.

« Ne parie pas. Comprends. »
```

## 4. Mots-clés (100 caractères, séparés par des virgules, sans espaces)

```
bourse,graphique,chandelier,analyse technique,indicateur,RSI,MACD,apprendre,finance,débutant
```

Ne pas y remettre `Trademy` ni `éducation` : le nom et la catégorie sont déjà indexés, les répéter
gaspille des caractères.

## 5. Confidentialité — réponses au questionnaire Apple

App Store Connect demande, type de donnée par type de donnée, si l'app la collecte. La réponse est
la même partout : **non**.

| Question | Réponse |
|---|---|
| Coordonnées (nom, e-mail, téléphone, adresse) | Non collectées |
| Identifiants (compte, appareil) | Non collectés |
| Données financières | **Non collectées** |
| Localisation | Non collectée |
| Contacts, photos, messages, fichiers | Non collectés |
| Historique de navigation ou de recherche | Non collecté |
| Diagnostics, données d'utilisation | Non collectés *hors de l'appareil* |
| Suivi publicitaire (ATT) | **Aucun** — pas de framework de suivi |

L'app enregistre bien une activité d'usage **anonyme et locale** (elle alimente les statistiques que
l'utilisateur voit dans son Profil, et se désactive dans les réglages). Elle ne quitte jamais
l'appareil, donc elle n'est pas une « collecte » au sens du questionnaire. Si un doute subsiste au
moment de remplir, déclarer « Données d'utilisation — non liées à l'identité — non utilisées pour le
suivi » reste plus prudent que de cocher « non collectées » à tort.

**URL de politique de confidentialité** : obligatoire. Le résumé affiché dans l'app vient de
`PRIVACY_SUMMARY` (`src/lib/appInfo.ts`) — c'est la source à publier sur une page web avant la
soumission.

## 6. Classification par âge

| Question | Réponse |
|---|---|
| Jeux d'argent simulés | **Non** — aucun pari, aucune mise, aucune monnaie |
| Concours / loteries | Non |
| Violence, contenu sexuel, substances | Non |
| Contenu web illimité | Non |
| Thèmes matures ou suggestifs | Non |

Classification attendue : **4+**. Attention au piège : « jeux d'argent simulés » ne s'applique pas —
Trademy n'a ni mise, ni gain, ni monnaie virtuelle échangeable.

## 7. Abonnements auto-renouvelables — ce qu'Apple EXIGE

C'est la section qui fait rejeter les apps. Les trois produits (`sub.monthly`, `sub.annual`,
`lifetime`) sont déjà définis dans le modèle (ADR-138), mais **l'écran d'achat** doit afficher,
au même endroit et lisiblement :

- [ ] le **titre** de l'abonnement ;
- [ ] sa **durée** (mensuel / annuel) ;
- [ ] son **prix**, et le prix par unité de durée si un essai existe ;
- [ ] ce que l'abonnement **donne** concrètement ;
- [ ] un lien **fonctionnel** vers la politique de confidentialité ;
- [ ] un lien **fonctionnel** vers les conditions d'utilisation (EULA) ;
- [ ] un bouton **« Restaurer les achats »**.

Ces sept points sont une checklist de conformité, pas un conseil de design.

**État actuel du code** : l'écran `/premium` affiche « Trademy est gratuit » — c'est la décision
ADR-110 (v1 entièrement gratuite). Tant qu'aucun achat n'est proposé, ces exigences ne s'appliquent
pas. Elles deviendront bloquantes **le jour où un prix apparaît** : c'est le moment de rouvrir cette
liste, pas avant.

`restorePremium` existe déjà côté modèle (`progressContext`), sans SDK de paiement.

## 8. Notes pour l'équipe de revue

```
Trademy est une application ÉDUCATIVE d'analyse graphique. Elle ne se connecte
à aucun courtier, ne passe aucun ordre, n'affiche aucune donnée de marché en
temps réel et ne propose aucun signal d'investissement.

Tous les graphiques sont générés localement à partir de jeux de données
déterministes intégrés à l'app, à des fins d'illustration pédagogique.

Aucun compte n'est nécessaire : lancez l'app et suivez l'introduction. Tout le
contenu est accessible immédiatement et gratuitement. L'app fonctionne hors
ligne.

Un avertissement rappelle sur les écrans concernés que le contenu ne constitue
pas un conseil en investissement et que le trading comporte un risque de perte.
```

## 9. Captures d'écran — ce qu'il faut, et ce qu'il faut montrer

Apple exige au minimum le format **6,7"** (1290 × 2796). Les autres tailles sont dérivées
automatiquement.

Les cinq écrans à capturer, dans cet ordre — il raconte une histoire plutôt qu'il n'énumère des
fonctionnalités :

1. **Un graphique annoté** — c'est le produit, il doit être la première image.
2. **Un exercice en cours**, de préférence un placement d'invalidation : ça montre qu'on manipule.
3. **Toto et Bobo en désaccord** — l'identité de l'app tient dans cette image.
4. **Le parcours des 15 mondes** — l'ampleur.
5. **Une fiche concept** — la profondeur.

Ces captures se prennent **sur un appareil réel** (ou le simulateur Xcode), pas depuis le web : les
proportions et les polices diffèrent.

## 10. Avant d'appuyer sur « Soumettre »

- [ ] Compte Apple Developer actif (99 $/an)
- [ ] Politique de confidentialité publiée à une URL stable
- [ ] Les fiches relues éditorialement (statut `needsReview` levé)
- [ ] L'app testée sur un appareil réel de bout en bout
- [ ] Build produit par EAS et téléversé
- [ ] Captures aux dimensions exigées
- [ ] Version de `app.json`, `package.json` et `appInfo.ts` alignées (`release:check` le vérifie)
