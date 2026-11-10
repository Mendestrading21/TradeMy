# Trademy — business plan de l'académie visuelle

**Version : 10 novembre 2026 · Statut : proposition stratégique à valider par l'usage.**

Dépôt : [Mendestrading21/TradeMy](https://github.com/Mendestrading21/TradeMy) · Visibilité observée : publique.

Base documentaire : branche `main`, commit [15c36401ce04](https://github.com/Mendestrading21/TradeMy/commit/15c36401ce04460c6d01ccb93e540f7ca77785ce), daté du 2026-08-13. Cette date est celle du code audité ; le plan est daté du 10 novembre 2026.

**Mode de lecture :** les constats sont reliés aux sources ; les tarifs, seuils, budgets et développements futurs sont des propositions. Aucune métrique de clients ou de revenus n'est inventée. Aucun engagement de dépense, lancement commercial ou déploiement applicatif n'est pris par ce document.

## 1. Décision proposée

Faire de **Trademy** une application francophone d'apprentissage visuel des marchés. Priorité : prouver que les utilisateurs comprennent et retiennent une notion, puis qu'ils souhaitent payer pour progresser davantage.

La marque actuelle est Trademy ; le dépôt est TradeMy ; PatternLab est un identifiant historique interne. Les mascottes actuelles sont **Toto et Bobo**. L'offre ne vend ni signaux, ni rendement, ni accès à un courtier. Signature existante : « Ne parie pas. Comprends. »

## 2. Ce qui existe et ce qui manque

| Domaine | Constat documentaire | Limite commerciale |
|---|---|---|
| Produit | Expo/React Native/TypeScript, web et cibles mobiles | La présence du code ne prouve pas la qualité sur appareil réel |
| Apprentissage | Parcours, concepts, exercices, checkpoints et révision | La maîtrise doit être mesurée sans confondre visite et compétence |
| Contenu | CURRENT_STATE déclare le corpus needsReview | Aucun volume de contenus ne peut être vendu comme intégralement validé |
| Données | Progression locale, sans compte ni serveur dans l'état décrit | Reprise entre appareils non acquise |
| Premium | Modèle local, sans SDK de paiement dans l'état décrit | Pas d'encaissement opérationnel vérifié |
| Distribution native | Comptes Apple/Google et essais réels mentionnés comme conditions | Aucun lancement App Store actuel n'est affirmé |

Le compteur canonique se trouve dans src/data/repoTruth.ts ; ce dossier n'invente pas un nombre de concepts validés. Une documentation mentionne encore une série G ouverte alors que le dernier commit audité annonce sa clôture : l'index des décisions confirme ADR-157, cette tâche historique ne doit pas être réouverte automatiquement.

Utilisateurs, taux de rétention, revenus et résultats pédagogiques réels : non fournis. L'audit n'a pas exécuté l'application.

## 3. Cible et besoin

**Premier segment proposé :** adultes francophones débutants ou intermédiaires, frustrés par les vidéos dispersées et le vocabulaire technique. Le produit peut rester adapté à un public plus jeune selon son canon ; le pilote commercial cible des adultes pour simplifier recrutement et mesure.

Le besoin n'est pas « connaître 500 noms de figures ». Il est de pouvoir regarder une situation nouvelle, l'expliquer et identifier ce qui invalide une interprétation.

Deux usages : cinq à dix minutes d'apprentissage quotidien ; retour ciblé sur une erreur rencontrée. La bibliothèque sert d'appui au parcours, pas de substitut à l'entraînement.

## 4. Proposition de valeur et expérience

Une leçon utile combine schéma original, exemple, contre-exemple, exercice sans indice, explication de l'erreur et révision différée. Toto propose une hypothèse ; Bobo demande une preuve. Leur utilité doit se mesurer par compréhension et plaisir, pas par le nombre d'animations.

Expérience initiale : objectif personnel → exercice diagnostique → courte leçon → manipulation → checkpoint → prochaine révision. Les exercices doivent provenir d'une source sémantique commune pour éviter qu'un graphique contredise sa réponse.

Le moteur doit enseigner l'incertitude. Une figure visuelle n'est pas une loi prédictive ; les faux signaux, conditions d'invalidation et limites de méthode font partie du produit vendu.

## 5. Offre et prix à tester

| Offre | Proposition | Prix hypothétique |
|---|---|---|
| Gratuit | Fondations complètes, sécurité, risque, premier parcours et révisions essentielles | 0 CHF |
| Plus | Parcours avancés relus, laboratoires, collections et statistiques utiles | 9,90 CHF/mois ou 99 CHF/an |
| Groupe pédagogique | Accès pour un groupe et progression agrégée respectueuse de la vie privée | Devis après trois demandes qualifiées |
| Achats isolés | Modules thématiques | À différer pour garder une offre lisible |

Ces tarifs sont des propositions de recherche. Ils ne changent aucun paywall. Les avertissements, l'export et la possibilité de reprendre ses données ne deviennent pas des moyens de pression commerciale.

IG Academy offre déjà gratuitement cours, exercices et quiz. Le paiement doit donc rémunérer un meilleur parcours, des manipulations et une rétention mesurée. La simple présence de cours ne suffit pas.

## 6. Marché accessible et concurrence

Concurrents directs ou substituts : IG Academy, vidéos, livres, communautés et formations francophones. La comparaison est fonctionnelle ; aucune taille de marché ou part de marché n'est inventée.

Différenciation à prouver : apprentissage réellement visuel, français simple, erreurs prises en compte, répétition espacée et absence d'incitation à trader. Le patrimoine défendable réside dans des scénarios originaux et revus, une méthode pédagogique et des données de progression recueillies avec les autorisations adaptées.

Un objectif d'acquisition se construit depuis les canaux accessibles. Exemple central : 3 000 visites qualifiées × 20 % de premiers exercices terminés × 5 % de conversion = 30 nouveaux payants mensuels. Chaque facteur reste une hypothèse.

## 7. Acquisition et rétention

1. Produire des exercices publics courts avec correction : attirer par l'expérience réelle.
2. Référencer quelques pages de concepts avec exemples originaux, plutôt que publier massivement du texte IA.
3. Recruter une cohorte de 30 adultes, dont une partie ne connaît pas le créateur.
4. Comparer un exercice avant la leçon, après la leçon et sept jours plus tard, sur des variantes équivalentes.
5. Tester le tarif après validation du parcours et du paiement ; mesurer les achats, pas les réactions enthousiastes.
6. Développer des partenariats éducatifs seulement si leurs incitations restent compatibles avec la pédagogie.

Rétention : session courte, prochaine action claire, reprise locale fiable et révision utile. Éviter les streaks punitifs, compteurs de faux progrès ou récompenses qui encouragent une prise de risque financière.

## 8. Système éditorial et opérations

Chaque notion publiée doit avoir une source, un statut de revue, une date, un objectif et un propriétaire éditorial. L'IA peut préparer et vérifier des formats ; elle ne remplace pas la relecture qui valide le fond.

Commencer par **un parcours relu de bout en bout**, y compris textes accessibles, réponses et contre-exemples. Ne pas bloquer toute valeur sur la validation simultanée de la totalité du corpus.

Cycle proposé : sélection de notions → revue experte → tests de cohérence → essai utilisateur → correction → publication → observation des erreurs fréquentes. Toute modification d'une réponse nécessite de vérifier les exercices et leur accessibilité.

Support : aide à l'installation, sauvegarde, reprise et abonnement. Aucun support ne doit se transformer en conseil d'investissement personnalisé.

## 9. Feuille de route

| Période | Livraison | Preuve requise |
|---|---|---|
| J1–J15 | Choix d'un parcours pilote et grille de revue | Tous ses objectifs et contenus listés ; expert relecteur identifié |
| J16–J30 | Parcours relu et installation sur deux familles d'appareils | Compréhension, geste, reprise et accessibilité observés |
| J31–J60 | Cohorte de 30 utilisateurs | Mesures avant/après/J7, abandon par étape et entretiens |
| J61–J90 | Offre Plus et recette de paiement en environnement de test | Prix compris, achats restaurables, annulation claire ; décision de lancement |
| M4–M6 | Acquisition limitée et nouvelle cohorte | Paiements réels, rétention J30 et erreurs de contenu suivis |
| M7–M12 | Extension d'un domaine à la fois | Qualité maintenue, coût de revue financé, support soutenable |

Aucune date de sortie n'est décidée par ce dossier. Le socle d'abonnement local ne vaut pas intégration de paiement.

## 10. Indicateurs et décisions

Indicateur principal : **apprenants capables de réussir à J7 un exercice nouveau portant sur la compétence travaillée**.

Mesures complémentaires : fin de première leçon, retour J7/J30, couverture des objectifs, demandes d'aide, erreurs éditoriales critiques, conversion après activation, revenu net par utilisateur payant et charge de support.

Seuils pilotes proposés : 70 % terminent la première leçon ; 40 % reviennent à J7 ; amélioration médiane d'au moins 20 points entre prétest et test différé ; aucun défaut critique de réponse dans le parcours payant. Sur 30 personnes, ces seuils sont des signaux exploratoires, pas une preuve scientifique.

Revoir le parcours si la rétention échoue ; revoir la promesse si la progression est bonne mais personne ne paie ; différer l'acquisition si la revue éditoriale ne suit pas.

## 11. Risques et protections

| Risque | Mesure |
|---|---|
| Contenus plausibles mais faux | Revue humaine, sources et contre-exemples avant statut validé |
| Prix difficile face au gratuit | Vendre l'expérience et la progression prouvées |
| Perte de progression locale | Sauvegarde et restauration explicites avant croissance |
| Gamification trompeuse | Maîtrise fondée sur preuves, pas sur clics |
| Coût des stores et support | Hypothèses de commissions et de temps incluses au modèle |
| Confusion avec des signaux | Scénarios éducatifs et aucun ordre ou recommandation personnalisée |
| Corpus trop large | Une tranche cohérente, revue, finie avant extension |

Le coût principal peut être éditorial, même si le coût technique par utilisateur reste faible. Un déploiement web gratuit n'annule pas le coût de maintenance et de validation.

## 12. Sources

- [README](https://github.com/Mendestrading21/TradeMy/blob/15c36401ce04460c6d01ccb93e540f7ca77785ce/README.md), [contrat du dépôt](https://github.com/Mendestrading21/TradeMy/blob/15c36401ce04460c6d01ccb93e540f7ca77785ce/CLAUDE.md), [vision canonique](https://github.com/Mendestrading21/TradeMy/blob/15c36401ce04460c6d01ccb93e540f7ca77785ce/docs/product/TRADEMY_PRODUCT_VISION.md), [état courant](https://github.com/Mendestrading21/TradeMy/blob/15c36401ce04460c6d01ccb93e540f7ca77785ce/docs/CURRENT_STATE.md) : identité, périmètre, limites et blocages déclarés.
- [Compteurs dérivés](https://github.com/Mendestrading21/TradeMy/blob/15c36401ce04460c6d01ccb93e540f7ca77785ce/src/data/repoTruth.ts) : nombre réel à dériver du code, aucun total de contenus validés inventé.
- [IG Academy](https://www.ig.com/en-ch/learn-to-trade/ig-academy), consulté le 10 novembre 2026 : cours et exercices gratuits.
- [PFPDT — mesures de protection](https://www.edoeb.admin.ch/dam/en/sd-web/eVhrh8wY3QcR/TOM_EN.pdf), consulté le 10 novembre 2026 : minimisation et protection dès la conception.

Les seuils, tarifs, budgets et conversions ci-dessous sont proposés. Les comptes stores, analytics et paiements n'ont pas été inspectés.


## Modèle financier — 12 mois, trois scénarios

**Hypothèses de travail, aucune traction ni vente supposée acquise.** M1 est le premier mois d'une éventuelle exécution, pas novembre 2026 par défaut. Aucun financement ni achat n'est autorisé par ce modèle.

| Paramètre commun | Hypothèse |
|---|---:|
| Revenu reconnu moyen par payant/mois, hors taxes | 9.00 CHF |
| Frais de vente, canaux et remboursements provisionnés | 20 % du revenu |
| Coût variable supplémentaire par payant/mois | 0.40 CHF |
| Charges externes fixes mensuelles | 150 CHF |
| Mise en place externe initiale | 3 000 CHF |
| Temps mensuel alloué | 35 h à 60 CHF/h |
| Premières ventes théoriques | M4, après critères de validation |

Les enveloppes sont des hypothèses de capacité, pas des devis. Les frais de canaux sont une provision composite, pas un tarif Apple, Google ou Stripe certifié. Les licences de données, prestations juridiques, fiscalité et coûts fixes exceptionnels doivent être chiffrés avant décision ; s'ils dépassent l'enveloppe, le scénario doit être révisé. Le temps interne est séparé des factures externes pour éviter de le compter deux fois.

### Acquisition et formules

À partir de M4, nouveaux payants du mois = arrondi(nouveaux du premier mois × 1,10 exposant nombre de mois écoulés). Cette croissance de 10 % est une hypothèse, pas une tendance observée. Avant M4, les acquisitions payantes sont nulles.

Payants fin de mois = payants du mois précédent × (1 − attrition) + nouveaux. Revenu du mois = payants × revenu moyen. Cette convention donne un mois complet de revenu aux nouveaux entrants et représente donc une approximation à affiner selon la date réelle d'achat. Les fractions de payants sont des valeurs attendues, affichées arrondies.

L'attrition mensuelle est un équivalent de planification : les contrats annuels se renouvellent en réalité par cohorte annuelle. Les encaissements annuels d'avance ne sont pas modélisés ; ce tableau est lissé, **pas un plan bancaire de trésorerie**. Le revenu observé devra être reconnu selon les périodes de service et les obligations applicables.

| Scénario | Nouveaux au premier mois de vente | Attrition équivalente/mois | CAC externe hypothétique |
|---|---:|---:|---:|
| Prudent | 10 | 10.0 % | 10 CHF |
| Central | 30 | 6.0 % | 18 CHF |
| Expansion | 80 | 4.0 % | 25 CHF |

### Résultats calculés

| Scénario | Payants fin M12 | CA reconnu sur 12 mois | Revenu M12 annualisé | Solde après coûts externes et lancement | Après valorisation du temps interne |
|---|---:|---:|---:|---:|---:|
| Prudent | 98 | 4 228 CHF | 10 563 CHF | -2 956 CHF | -28 156 CHF |
| Central | 333 | 13 884 CHF | 36 013 CHF | -1 618 CHF | -26 818 CHF |
| Expansion | 951 | 38 863 CHF | 102 743 CHF | -2 587 CHF | -27 787 CHF |

Le revenu M12 annualisé est MRR de sortie × 12 : **ce n'est pas le chiffre d'affaires de la première année**. Le solde n'est pas un résultat comptable net : impôts, financement et amortissements ne sont pas intégrés. Les colonnes sont arrondies ; les calculs utilisent les valeurs non arrondies.

### Trajectoire centrale mois par mois

| Mois | Nouveaux | Payants attendus fin de mois | Revenu | Acquisition | Variables et frais | Fixes | Solde cumulé après lancement |
|---|---:|---:|---:|---:|---:|---:|---:|
| M1 | 0 | 0 | 0 | 0 | 0 | 150 | -3 150 |
| M2 | 0 | 0 | 0 | 0 | 0 | 150 | -3 300 |
| M3 | 0 | 0 | 0 | 0 | 0 | 150 | -3 450 |
| M4 | 30 | 30 | 270 | 540 | 66 | 150 | -3 936 |
| M5 | 33 | 61 | 551 | 594 | 135 | 150 | -4 264 |
| M6 | 36 | 94 | 842 | 648 | 206 | 150 | -4 426 |
| M7 | 40 | 128 | 1 151 | 720 | 281 | 150 | -4 426 |
| M8 | 44 | 164 | 1 478 | 792 | 361 | 150 | -4 251 |
| M9 | 48 | 202 | 1 821 | 864 | 445 | 150 | -3 889 |
| M10 | 53 | 243 | 2 189 | 954 | 535 | 150 | -3 339 |
| M11 | 58 | 287 | 2 580 | 1 044 | 631 | 150 | -2 584 |
| M12 | 64 | 333 | 3 001 | 1 152 | 734 | 150 | -1 618 |

Montants en CHF. Déficit cumulé maximal du modèle central lissé : **4 426 CHF**, hors rémunération interne. Il ne suffit pas à fixer le besoin réel de trésorerie : ajouter calendrier des encaissements/décaissements, TVA éventuelle, réserves, délais et devis non connus.

### Économie unitaire et sensibilité

Contribution mensuelle par payant avant acquisition et fixes = 9.00 × (1 − 0.2) − 0.40 = **6.80 CHF**.

Seuil de couverture des seuls fixes : **23 payants actifs**. Avec 35 heures mensuelles valorisées 60 CHF : **331 payants**, avant acquisition et investissement initial. Le retour théorique du CAC central est de 2.6 mois avant attrition, support supplémentaire et coûts fixes ; ce n'est pas un délai garanti.

Avec un revenu moyen inférieur de 20 %, la contribution descend à **5.36 CHF**. Doubler le CAC central ajoute **7 308 CHF** de coût sur les acquisitions prévues de l'année. Deux mois de lancement reportés consomment déjà **300 CHF** de fixes, plus du temps, avant le premier revenu.

**Lecture de décision :** une marge technique positive peut coexister avec une perte économique après le temps humain. Remplacer les hypothèses par les premières cohortes observées avant d'augmenter l'investissement. Ne pas additionner ces ventes avec celles d'un bundle ou d'un autre projet sans éliminer les doubles comptes.
