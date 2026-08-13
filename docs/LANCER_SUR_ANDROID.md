# Lancer Trademy sur Android

Ce guide sert à **voir l'app tourner sur un vrai téléphone**. C'est l'étape qui manque : tout ce qui
a été validé jusqu'ici l'a été par des tests Node et un export web. Personne n'a encore vu Trademy
sur un écran de téléphone.

Deux chemins. Le premier ne demande **aucun compte** et prend cinq minutes.

---

## Chemin A — Expo Go (le plus rapide, à faire en premier)

Trademy n'utilise **aucun module natif sur mesure** : toutes ses dépendances sont des modules du SDK
Expo 57 ou des bibliothèques standard (Reanimated, Gesture Handler, SVG, Safe Area, Screens,
AsyncStorage). `expo-doctor` confirme que leurs versions correspondent au SDK. Expo Go peut donc les
charger telles quelles.

**Sur le téléphone** — installer **Expo Go** depuis le Play Store.

**Sur l'ordinateur**, dans le dossier du projet :

```bash
nvm use            # la version de .nvmrc (Node 24.14.0)
npm ci             # à faire une seule fois
npx expo start
```

Un QR code s'affiche. Ouvrir Expo Go sur le téléphone et le scanner. **L'ordinateur et le téléphone
doivent être sur le même réseau Wi-Fi.** Si le réseau bloque la connexion (Wi-Fi public, réseau
d'entreprise) :

```bash
npx expo start --tunnel
```

C'est plus lent, mais ça passe partout.

### Ce qu'il faut regarder en priorité

L'ordre ci-dessous n'est pas décoratif : il va du plus probablement cassé au plus sûr.

1. **Les gestes de placement.** Dans une session, l'exercice « place la ligne d'invalidation »
   demande de faire glisser une ligne sur le graphique. C'est l'interaction la plus exposée : elle
   dépend de Gesture Handler et de Reanimated ensemble. Vérifier qu'elle répond au doigt et que la
   ligne suit sans à-coups. **Il y en a maintenant 20 dans le parcours** (10 dans les chandeliers,
   10 dans les figures) : en croiser une est quasi certain.
2. **Le champ de calcul.** Depuis le LOT C8, le monde 1 et le monde du risque posent des questions à
   réponse chiffrée (PER, rendement du dividende, ratio, taille de position). Vérifier que le clavier
   numérique s'ouvre, que le bouton « Valider » reste désactivé tant que rien n'est saisi, et qu'il
   ne masque pas le champ sur un petit écran.
3. **Toto et Bobo.** Ils doivent respirer au repos, bondir sur une bonne réponse, se balancer sur une
   mise en garde, se pencher quand ils désignent quelque chose. Sur un téléphone d'entrée de gamme,
   regarder si le mouvement reste fluide.
4. **Les graphiques.** Ils sont dessinés en SVG. Vérifier qu'ils s'affichent en entier, sans
   débordement, et qu'ils restent nets.
5. **La reprise de session.** Commencer une session, quitter l'app, la rouvrir : elle doit reprendre
   là où elle s'est arrêtée.
6. **Le mode hors ligne.** Activer le mode avion et parcourir l'app : tout le contenu doit rester
   accessible.
7. **« Réduire les animations ».** Dans les réglages Android (Accessibilité → Supprimer les
   animations), activer l'option et rouvrir l'app : les mascottes doivent devenir **strictement
   fixes**, sans ombre animée, et rester lisibles au lecteur d'écran.

### Ce qu'Expo Go ne dira pas

L'icône de l'app, l'écran de démarrage, le nom sous l'icône, et le comportement d'une vraie
installation. Pour ça, il faut le chemin B.

---

## Chemin B — un APK installable (build EAS)

Nécessite un **compte Expo** gratuit. Aucun compte Google Play n'est requis pour un APK de test.

```bash
npm install -g eas-cli
eas login                       # compte Expo (gratuit)
eas build --platform android --profile preview
```

Le profil `preview` est déjà configuré dans `eas.json` : il produit un **APK** (et non un bundle
Play Store), directement installable. Le build tourne sur les serveurs d'Expo — comptez 10 à 20
minutes. À la fin, EAS donne un lien de téléchargement à ouvrir depuis le téléphone.

Sur Android, autoriser l'installation depuis une source inconnue lorsque le système le demande.

---

## Ce qui a été vérifié, et quand

Vérifications refaites **après la série C complète** (LOTS C6 à C10), sur `main` :

- **L'app se bundle pour les deux plateformes.** `expo export --platform android` : 1973 modules,
  succès. `--platform ios` : 1881 modules, succès. C'est l'étape qui échouerait en premier dans un
  build EAS.
- **Le chemin de déploiement web ne fuit toujours pas dans le bundle natif.** Le correctif d'ADR-146
  tient : **zéro occurrence** de `TradeMy/assets` dans les bundles Android et iOS régénérés.
- **`expo-doctor` : 18 vérifications sur 20.** Les 2 échecs sont des appels réseau bloqués par
  l'environnement d'exécution (schéma de config et annuaire React Native), pas des défauts du projet.
- **Gate complète verte** : 1642 tests, export web de 300 pages HTML et 2175 références.

### Poids mesuré du bundle

| | Android | iOS |
|---|---|---|
| Total | **12 Mo** | **10 Mo** |
| dont bytecode JS | 5,5 Mo | — |
| dont assets | 5,5 Mo | — |

Sur les assets, **4,4 Mo sont les huit rendus 3D des mascottes** (de 448 à 724 Ko pièce), en une
seule densité d'écran. S'y ajoutent l'icône de l'app (736 Ko) et l'écran de démarrage (332 Ko).

C'est perceptible sur un téléphone modeste ou une connexion lente. Le canon interdisant de
redimensionner les rendus de mascottes, **la décision appartient au propriétaire** — et elle mérite
d'être prise après avoir vu l'app démarrer sur un vrai appareil, pas avant.

## Ce qui n'a pas pu être vérifié, et qu'il faut donc regarder

**Tout ce qui touche au rendu réel** : fluidité, températures, mémoire, tailles d'écran, ouverture du
clavier, comportement du geste au doigt. Aucun test ne remplace le fait de tenir l'app dans la main.

## Si quelque chose casse

Le plus utile est le message d'erreur exact, tel qu'il s'affiche sur le téléphone ou dans le
terminal. Les erreurs de bundling apparaissent dans le terminal ; les erreurs d'exécution
s'affichent en rouge sur l'écran du téléphone, avec une pile d'appels.
