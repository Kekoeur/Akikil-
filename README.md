# 🎯 Jeu "Qui est-ce ?" - Version Sécurisée

Un jeu de devinette de photos avec chiffrement intégré, parfait pour tester la reconnaissance des visages entre amis, famille ou collègues.

## 🌟 Fonctionnalités

- 🔐 **Données chiffrées** : Protection par mot de passe des images et noms
- 📱 **Interface responsive** : Fonctionne sur mobile, tablette et ordinateur
- 🎮 **Gameplay intuitif** : Questions à choix multiples avec feedback visuel
- 📊 **Suivi du score** : Barre de progression et statistiques détaillées
- 🎨 **Design moderne** : Animations fluides et interface élégante
- ⚡ **Déploiement facile** : Compatible GitHub Pages

## 📁 Structure du Projet

```
photo-guessing-game/
│
├── 📄 index.html              # Page principale du jeu
├── 📄 encrypt.html            # Outil de chiffrement des données
│
├── 📁 css/
│   ├── 🎨 style.css           # Styles principaux du jeu
│   └── 🎨 encrypt.css         # Styles de l'outil de chiffrement
│
├── 📁 js/
│   ├── ⚙️ game.js             # Logique principale du jeu
│   ├── 🔐 crypto.js           # Fonctions de chiffrement/déchiffrement
│   └── 🛠️ encrypt-tool.js     # Logique de l'outil de chiffrement
│
├── 📁 data/
│   └── 📊 encrypted-data.js   # Données chiffrées (généré par l'outil)
│
└── 📄 README.md               # Cette documentation
```

## 🚀 Installation et Déploiement

### 1. Cloner ou télécharger le projet
```bash
git clone [votre-repo]
cd photo-guessing-game
```

### 2. Préparer vos images Google Photos

1. **Créer un album public** dans Google Photos
2. **Obtenir les liens directs** de vos images :
   - Ouvrir l'image dans Google Photos
   - Clic droit → "Copier l'adresse de l'image"
   - Le lien ressemble à : `https://lh3.googleusercontent.com/d/[ID_IMAGE]`

### 3. Chiffrer vos données

1. **Ouvrir `encrypt.html`** dans votre navigateur
2. **Organiser vos données** au format JSON :
```json
[
  {
    "name": "Alice Dupont",
    "photos": [
      "https://lh3.googleusercontent.com/d/VOTRE_ID_IMAGE_1",
      "https://lh3.googleusercontent.com/d/VOTRE_ID_IMAGE_2"
    ]
  },
  {
    "name": "Bob Martin",
    "photos": [
      "https://lh3.googleusercontent.com/d/VOTRE_ID_IMAGE_3",
      "https://lh3.googleusercontent.com/d/VOTRE_ID_IMAGE_4"
    ]
  }
]
```
3. **Choisir un mot de passe fort**
4. **Générer les données chiffrées**
5. **Remplacer le contenu** de `data/encrypted-data.js`

### 4. Déployer sur GitHub Pages

1. **Créer un repository GitHub** public
2. **Uploader tous les fichiers** dans ce repository
3. **Activer GitHub Pages** :
   - Aller dans Settings → Pages
   - Source : Deploy from a branch
   - Branch : main / root
4. **Votre jeu sera accessible** à l'URL fournie par GitHub

## 🎮 Utilisation

### Pour les joueurs
1. **Aller sur l'URL** du jeu déployé
2. **Entrer le mot de passe** fourni par l'organisateur
3. **Jouer !** Deviner qui est sur chaque photo

### Pour l'organisateur
1. **Partager l'URL** du jeu
2. **Communiquer le mot de passe** séparément (SMS, appel, etc.)
3. **Ne jamais partager** l'URL et le mot de passe ensemble

## 🔧 Configuration Avancée

### Personnaliser les styles
- Modifier `css/style.css` pour changer l'apparence
- Les couleurs principales sont définies dans les gradients CSS
- Variables CSS personnalisables en haut du fichier

### Modifier la logique du jeu
- `js/game.js` contient toute la logique de gameplay
- Nombre d'options de réponse configurable (ligne ~120)
- Messages de fin personnalisables (ligne ~200)

### Sécurité
- Le chiffrement utilise XOR + Base64 (niveau basique)
- Pour une sécurité renforcée, remplacer par AES dans `js/crypto.js`
- Ne jamais commiter le mot de passe dans le code

## 🎯 Conseils d'Utilisation

### Photos recommandées
- **Résolution** : 400x300px minimum
- **Format** : JPG/PNG
- **Qualité** : Visages bien visibles et éclairés
- **Variété** : Différents angles/expressions par personne

### Gameplay optimal
- **2-6 personnes** : Idéal pour la difficulté
- **3-5 photos** par personne : Bon équilibre
- **Total 15-30 questions** : Session de jeu parfaite

### Sécurité des données
- **Mots de passe forts** : 8+ caractères, mélange de types
- **Communication séparée** : URL et mot de passe par canaux différents
- **Rotation régulière** : Changer le mot de passe périodiquement

## 🐛 Dépannage

### Le jeu ne se charge pas
- Vérifier que tous les fichiers sont bien uploadés
- S'assurer que `data/encrypted-data.js` contient des données valides
- Ouvrir la console du navigateur pour voir les erreurs

### Mot de passe incorrect
- Vérifier la casse (sensible aux majuscules/minuscules)
- S'assurer d'utiliser le même mot de passe que pour le chiffrement
- Régénérer les données si nécessaire

### Images qui ne s'affichent pas
- Vérifier que les liens Google Photos sont corrects
- S'assurer que les albums sont publics
- Tester les liens individuellement dans le navigateur

### Performance lente
- Optimiser la taille des images (max 800x600px)
- Réduire le nombre total de photos si nécessaire
- Vérifier la connexion internet

## 🔒 Sécurité et Confidentialité

### Chiffrement
- Algorithme : XOR avec clé dérivée du mot de passe
- Encodage : Base64 pour le stockage
- Niveau : Protection basique contre accès casual

### Données
- **Aucune donnée** n'est envoyée à des serveurs externes
- **Traitement local** : Tout se passe dans le navigateur
- **Pas de cookies** ou tracking

### Bonnes pratiques
- Utiliser des mots de passe uniques
- Ne pas réutiliser pour d'autres services
- Supprimer les données sensibles après utilisation

## 🤝 Contribution

### Signaler un bug
- Créer une issue sur GitHub avec :
  - Description du problème
  - Étapes pour reproduire
  - Navigateur et version
  - Capture d'écran si pertinent

### Proposer des améliorations
- Fork du projet
- Créer une branche pour votre fonctionnalité
- Commit avec messages clairs
- Pull request avec description détaillée

## 📄 Licence

Ce projet est libre d'utilisation pour un usage personnel et éducatif.

## 📞 Support

Pour toute question ou assistance :
- Créer une issue GitHub
- Consulter la documentation dans le code
- Vérifier les exemples fournis

---

**Amusez-vous bien ! 🎉**