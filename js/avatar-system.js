/**
 * Système d'avatars et de badges pour le jeu
 */

// Données du système d'avatars
let playerProfile = {
    name: '',
    avatar: null,
    badges: [],
    stats: {
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        perfectGames: 0,
        streak: 0,
        bestStreak: 0
    }
};

// Définition des badges
const BADGES = {
    FIRST_GAME: {
        id: 'first_game',
        name: 'Premier Pas',
        icon: '🎮',
        description: 'Jouer votre premier jeu',
        condition: (stats) => stats.gamesPlayed >= 1
    },
    PERFECT_SCORE: {
        id: 'perfect_score',
        name: 'Perfection',
        icon: '💯',
        description: 'Obtenir 100% à un jeu',
        condition: (stats, currentScore, totalQuestions) => 
            currentScore === totalQuestions && totalQuestions > 0
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        name: 'Éclair',
        icon: '⚡',
        description: 'Répondre en moins de 2 secondes',
        condition: (stats, currentScore, totalQuestions, avgTime) => avgTime < 2000
    },
    EXPERIENCED: {
        id: 'experienced',
        name: 'Vétéran',
        icon: '🏆',
        description: 'Jouer 10 parties',
        condition: (stats) => stats.gamesPlayed >= 10
    },
    SHARP_EYE: {
        id: 'sharp_eye',
        name: 'Œil de Lynx',
        icon: '👁️',
        description: '5 bonnes réponses consécutives',
        condition: (stats) => stats.bestStreak >= 5
    },
    MASTER: {
        id: 'master',
        name: 'Maître',
        icon: '👑',
        description: '3 jeux parfaits',
        condition: (stats) => stats.perfectGames >= 3
    }
};

/**
 * Initialise le système d'avatars
 */
function initAvatarSystem() {
    // Charger le profil sauvegardé
    loadPlayerProfile();
    // Ne pas afficher automatiquement les infos - on attend le bon moment
}

/**
 * Charge des avatars par défaut (sans avoir besoin des données du jeu)
 */
function loadDefaultAvatars() {
    const container = document.getElementById('game-avatars');
    container.innerHTML = '';
    
    // Ajouter une option pour créer un avatar personnalisé
    const createNew = document.createElement('div');
    createNew.className = 'avatar-option create-new';
    createNew.innerHTML = '+';
    createNew.title = 'Créer un avatar personnalisé';
    createNew.onclick = () => switchAvatarTab('custom');
    container.appendChild(createNew);
    
    // Créer quelques avatars par défaut avec des couleurs
    const defaultAvatars = [
        { name: 'Joueur Bleu', color: '#4299e1', letter: 'J' },
        { name: 'Joueur Rouge', color: '#f56565', letter: 'J' },
        { name: 'Joueur Vert', color: '#48bb78', letter: 'J' },
        { name: 'Joueur Violet', color: '#9f7aea', letter: 'J' },
        { name: 'Joueur Orange', color: '#ed8936', letter: 'J' },
        { name: 'Joueur Rose', color: '#ed64a6', letter: 'J' }
    ];
    
    defaultAvatars.forEach((avatar, index) => {
        const avatarOption = document.createElement('div');
        avatarOption.className = 'avatar-option';
        avatarOption.style.backgroundColor = avatar.color;
        avatarOption.innerHTML = `<div style="color: white; font-weight: bold; text-align: center; line-height: 74px; font-size: 1.2rem;">${avatar.letter}</div>`;
        avatarOption.title = avatar.name;
        avatarOption.onclick = () => selectDefaultAvatar(avatar.name, avatar.color, avatar.letter);
        container.appendChild(avatarOption);
    });
}

/**
 * Sélectionne un avatar par défaut
 */
function selectDefaultAvatar(name, bgColor, letter) {
    // Marquer comme sélectionné
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
    event.target.classList.add('selected');
    
    // Sauvegarder le profil
    playerProfile.name = name;
    playerProfile.avatar = {
        type: 'default',
        bgColor: bgColor,
        letter: letter,
        name: name
    };
    
    savePlayerProfile();
    
    // Activer le bouton continuer
    document.getElementById('continue-btn').disabled = false;
}

/**
 * Continue vers l'écran de mot de passe
 */
function continueToPassword() {
    if (!playerProfile.name || !playerProfile.avatar) {
        alert('Veuillez d\'abord choisir un avatar !');
        return;
    }
    
    document.getElementById('avatar-screen').style.display = 'none';
    document.getElementById('password-screen').style.display = 'block';
    displayPlayerInfo();
    startParticleSystem();
}

// Exposer la fonction globalement
window.continueToPassword = continueToPassword;

/**
 * Vérifie si le joueur a besoin de choisir un avatar après connexion
 */
function checkAvatarSelectionNeeded() {
    // Toujours retourner false pour forcer la sélection d'avatar
    // (ou tu peux vérifier si un profil existe déjà)
    return !playerProfile.name || !playerProfile.avatar;
}

/**
 * Affiche l'interface de sélection d'avatar (après connexion)
 */
/**
 * Affiche l'interface de sélection d'avatar (après déverrouillage)
 */
function showAvatarSelection() {
    const avatarScreen = document.getElementById('avatar-screen');
    
    // Créer l'interface de sélection d'avatar
    avatarScreen.innerHTML = `
        <h1>🎭 Choisir votre profil</h1>
        <div class="avatar-selection">
            <div class="avatar-tabs">
                <button class="tab-btn active" onclick="switchAvatarTab('game')">Personnages du jeu</button>
                <button class="tab-btn" onclick="switchAvatarTab('custom')">Créer le mien</button>
            </div>
            
            <div id="game-avatars" class="avatar-grid">
                <div class="loading">Chargement...</div>
            </div>
            
            <div id="custom-avatar" class="custom-avatar-form">
                <div class="form-group">
                    <label for="player-name">Nom du joueur :</label>
                    <input type="text" id="player-name" placeholder="Entrez votre nom..." maxlength="20">
                </div>
                <div class="form-group">
                    <label for="player-image">Votre photo :</label>
                    <input type="file" id="player-image" accept="image/*" onchange="previewCustomAvatar(event)">
                </div>
                <img id="avatar-preview" class="avatar-preview" style="display: none;" alt="Aperçu">
                <div class="form-buttons">
                    <button class="btn-save" onclick="saveCustomAvatar()">Créer</button>
                    <button class="btn-cancel" onclick="cancelCustomAvatar()">Annuler</button>
                </div>
            </div>
        </div>
    `;
    
    // Charger les avatars du jeu maintenant que les données sont disponibles
    loadGameAvatars();
}

/**
 * Démarre le jeu après sélection d'avatar
 */
function startActualGame() {
    // Basculer vers l'écran de jeu
    document.getElementById('avatar-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('game-screen').classList.add('game-screen-enter');
    
    // Afficher les infos du joueur
    displayPlayerInfo();
    startParticleSystem();
    
    // Démarrer le jeu
    if (typeof continueGameAfterAvatar === 'function') {
        continueGameAfterAvatar();
    }
}

/**
 * Change l'onglet de sélection d'avatar
 */
function switchAvatarTab(tab) {
    // Mettre à jour les boutons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Afficher/masquer les sections
    const gameAvatars = document.getElementById('game-avatars');
    const customAvatar = document.getElementById('custom-avatar');
    
    if (tab === 'game') {
        gameAvatars.style.display = 'grid';
        customAvatar.classList.remove('active');
    } else {
        gameAvatars.style.display = 'none';
        customAvatar.classList.add('active');
    }
}

/**
 * Charge les avatars des personnages du jeu
 */
function loadGameAvatars() {
    const container = document.getElementById('game-avatars');
    
    // Attendre que les données du jeu soient disponibles
    if (typeof gameData === 'undefined' || gameData.length === 0) {
        setTimeout(loadGameAvatars, 500);
        return;
    }
    
    container.innerHTML = '';
    
    // Ajouter une option pour créer un avatar personnalisé
    const createNew = document.createElement('div');
    createNew.className = 'avatar-option create-new';
    createNew.innerHTML = '+';
    createNew.title = 'Créer un avatar personnalisé';
    createNew.onclick = () => switchAvatarTab('custom');
    container.appendChild(createNew);
    
    // Ajouter les avatars des personnages du jeu
    gameData.forEach((person, index) => {
        if (person.photos && person.photos.length > 0) {
            const avatarOption = document.createElement('div');
            avatarOption.className = 'avatar-option';
            avatarOption.style.backgroundImage = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')`;
            avatarOption.style.backgroundColor = `hsl(${index * 137.5 % 360}, 70%, 50%)`;
            avatarOption.innerHTML = `<div style="color: white; font-weight: bold; text-align: center; line-height: 74px; font-size: 0.8rem;">${person.name.charAt(0)}</div>`;
            avatarOption.title = person.name;
            avatarOption.onclick = () => selectGameAvatar(person.name, avatarOption.style.backgroundColor, person.name.charAt(0));
            container.appendChild(avatarOption);
            
            // Essayer de déchiffrer et afficher la vraie image
            if (currentPassword) {
                try {
                    const decryptedImage = decryptImage(person.photos[0], currentPassword);
                    avatarOption.style.backgroundImage = `url('${decryptedImage}')`;
                    avatarOption.innerHTML = '';
                } catch (error) {
                    console.log('Impossible de déchiffrer l\'image pour l\'avatar');
                }
            }
        }
    });
}




/**
 * Prévisualise l'avatar personnalisé
 */
function previewCustomAvatar(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('avatar-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Sélectionne un avatar du jeu
 */
function selectGameAvatar(name, bgColor, letter) {
    // Marquer comme sélectionné
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
    event.target.classList.add('selected');
    
    // Sauvegarder le profil
    playerProfile.name = name;
    playerProfile.avatar = {
        type: 'game',
        bgColor: bgColor,
        letter: letter,
        name: name
    };
    
    savePlayerProfile();
    
    // Démarrer le jeu directement
    startActualGame();
}

/**
 * Sauvegarde l'avatar personnalisé
 */
function saveCustomAvatar() {
    const name = document.getElementById('player-name').value.trim();
    const imageFile = document.getElementById('player-image').files[0];
    const preview = document.getElementById('avatar-preview');
    
    if (!name) {
        alert('Veuillez entrer un nom !');
        return;
    }
    
    if (!imageFile) {
        alert('Veuillez sélectionner une image !');
        return;
    }
    
    // Sauvegarder le profil
    playerProfile.name = name;
    playerProfile.avatar = {
        type: 'custom',
        image: preview.src,
        name: name
    };
    
    savePlayerProfile();
    
    // Démarrer le jeu directement
    startActualGame();
}

/**
 * Démarre le jeu après sélection d'avatar
 */
function startActualGame() {
    // Basculer vers l'écran de jeu
    document.getElementById('avatar-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('game-screen').classList.add('game-screen-enter');
    
    // Afficher les infos du joueur
    displayPlayerInfo();
    startParticleSystem();
    
    // Démarrer le jeu
    if (typeof continueGameAfterAvatar === 'function') {
        continueGameAfterAvatar();
    }
}

/**
 * Annule la création d'avatar personnalisé
 */
function cancelCustomAvatar() {
    document.getElementById('player-name').value = '';
    document.getElementById('player-image').value = '';
    document.getElementById('avatar-preview').style.display = 'none';
    switchAvatarTab('game');
}

/**
 * Masque l'interface de sélection d'avatar
 */
function hideAvatarSelection() {
    const avatarSelection = document.querySelector('.avatar-selection');
    if (avatarSelection) {
        avatarSelection.remove();
    }
}

/**
 * Affiche les informations du joueur
 */
function displayPlayerInfo() {
    // Supprimer l'ancien affichage s'il existe
    const existingInfo = document.querySelector('.player-info');
    if (existingInfo) existingInfo.remove();
    
    const playerInfo = document.createElement('div');
    playerInfo.className = 'player-info';
    
    let avatarHtml = '';
    if (playerProfile.avatar.type === 'custom') {
        avatarHtml = `<img src="${playerProfile.avatar.image}" class="player-avatar" alt="${playerProfile.name}">`;
    } else {
        avatarHtml = `<div class="player-avatar" style="background: ${playerProfile.avatar.bgColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${playerProfile.avatar.letter}</div>`;
    }
    
    playerInfo.innerHTML = `
        ${avatarHtml}
        <div class="player-name">${playerProfile.name}</div>
    `;
    
    document.body.appendChild(playerInfo);
    
    // Afficher les badges
    displayBadges();
}

/**
 * Affiche les badges du joueur
 */
function displayBadges() {
    // Supprimer l'ancien conteneur s'il existe
    const existingBadges = document.querySelector('.badges-container');
    if (existingBadges) existingBadges.remove();
    
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'badges-container';
    
    playerProfile.badges.forEach(badgeId => {
        const badge = BADGES[badgeId];
        if (badge) {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            badgeElement.innerHTML = `
                ${badge.icon}
                <div class="badge-tooltip">${badge.name}: ${badge.description}</div>
            `;
            badgesContainer.appendChild(badgeElement);
        }
    });
    
    document.body.appendChild(badgesContainer);
}

/**
 * Affiche une popup d'achievement
 */
function showAchievementPopup(badge) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <h3>🎉 Nouveau Badge !</h3>
        <div class="badge-icon">${badge.icon}</div>
        <div style="font-size: 1.2rem; font-weight: 700;">${badge.name}</div>
        <div style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">${badge.description}</div>
    `;
    
    document.body.appendChild(popup);
    
    // Animer l'apparition
    setTimeout(() => {
        popup.classList.add('show');
    }, 100);
    
    // Supprimer après l'animation
    setTimeout(() => {
        popup.remove();
    }, 3000);
    
    // Créer des particules spéciales
    createCelebrationParticles();
}

/**
 * Ajoute un badge à l'affichage avec animation
 */
function addBadgeToDisplay(badge) {
    const badgesContainer = document.querySelector('.badges-container');
    if (!badgesContainer) return;
    
    const badgeElement = document.createElement('div');
    badgeElement.className = 'badge new';
    badgeElement.innerHTML = `
        ${badge.icon}
        <div class="badge-tooltip">${badge.name}: ${badge.description}</div>
    `;
    
    badgesContainer.appendChild(badgeElement);
    
    // Retirer la classe 'new' après l'animation
    setTimeout(() => {
        badgeElement.classList.remove('new');
    }, 1000);
}

/**
 * Met à jour les statistiques du joueur
 */
function updatePlayerStats(score, totalQuestions, gameTime) {
    playerProfile.stats.gamesPlayed++;
    playerProfile.stats.totalScore += score;
    
    if (score > playerProfile.stats.bestScore) {
        playerProfile.stats.bestScore = score;
    }
    
    if (score === totalQuestions && totalQuestions > 0) {
        playerProfile.stats.perfectGames++;
    }
    
    // Calculer la streak (on peut l'implémenter plus tard dans le jeu principal)
    const avgTime = gameTime / totalQuestions;
    
    // Vérifier les nouveaux badges
    checkBadges(score, totalQuestions, avgTime);
    
    savePlayerProfile();
}

/**
 * Sauvegarde le profil du joueur
 */
function savePlayerProfile() {
    try {
        localStorage.setItem('playerProfile', JSON.stringify(playerProfile));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du profil:', error);
    }
}

/**
 * Charge le profil du joueur
 */
function loadPlayerProfile() {
    try {
        const saved = localStorage.getItem('playerProfile');
        if (saved) {
            playerProfile = { ...playerProfile, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        // Réinitialiser en cas d'erreur
        playerProfile = {
            name: '',
            avatar: null,
            badges: [],
            stats: {
                gamesPlayed: 0,
                totalScore: 0,
                bestScore: 0,
                perfectGames: 0,
                streak: 0,
                bestStreak: 0
            }
        };
    }
}

/**
 * Système de particules personnalisé
 */
function startParticleSystem() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    // Supprimer l'ancien système s'il existe
    const existingSystem = gameContainer.querySelector('.particle-system');
    if (existingSystem) existingSystem.remove();
    
    const particleSystem = document.createElement('div');
    particleSystem.className = 'particle-system';
    gameContainer.appendChild(particleSystem);
    
    // Créer des particules régulièrement
    setInterval(() => {
        createParticle(particleSystem);
    }, 2000);
    
    // Créer quelques particules initiales
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createParticle(particleSystem), i * 400);
    }
}

/**
 * Crée une particule
 */
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Couleur aléatoire selon les badges
    const colors = ['cyan', 'pink', 'yellow', 'green', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    particle.classList.add(randomColor);
    
    // Position et timing aléatoires
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (2 + Math.random() * 2) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(particle);
    
    // Supprimer après l'animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 5000);
}

/**
 * Crée des particules de célébration
 */
function createCelebrationParticles() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    const particleSystem = gameContainer.querySelector('.particle-system') || gameContainer;
    
    // Créer 20 particules de célébration
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle celebration';
            particle.style.background = ['var(--neon-yellow)', 'var(--neon-green)', 'var(--neon-pink)'][Math.floor(Math.random() * 3)];
            particle.style.left = (45 + Math.random() * 10) + '%';
            particle.style.animationDuration = '2s';
            particle.style.width = '6px';
            particle.style.height = '6px';
            
            particleSystem.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }, i * 50);
    }
}

/**
 * Réinitialise le profil du joueur (pour les tests)
 */
function resetPlayerProfile() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser votre profil ? Tous vos badges et statistiques seront perdus.')) {
        localStorage.removeItem('playerProfile');
        location.reload();
    }
}

/**
 * Change d'avatar (accessible depuis un menu paramètres)
 */
function changeAvatar() {
    hideAvatarSelection();
    playerProfile.name = '';
    playerProfile.avatar = null;
    savePlayerProfile();
    showAvatarSelection();
}

/**
 * Obtient les badges disponibles pour affichage
 */
function getAvailableBadges() {
    return Object.values(BADGES).map(badge => ({
        ...badge,
        earned: playerProfile.badges.includes(badge.id)
    }));
}

/**
 * Obtient les statistiques formatées du joueur
 */
function getFormattedStats() {
    const stats = playerProfile.stats;
    const avgScore = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;
    const successRate = stats.gamesPlayed > 0 ? Math.round((stats.perfectGames / stats.gamesPlayed) * 100) : 0;
    
    return {
        gamesPlayed: stats.gamesPlayed,
        bestScore: stats.bestScore,
        averageScore: avgScore,
        perfectGames: stats.perfectGames,
        successRate: successRate + '%',
        badgesEarned: playerProfile.badges.length,
        totalBadges: Object.keys(BADGES).length
    };
}

/**
 * Exporte le profil du joueur
 */
function exportProfile() {
    const profileData = {
        ...playerProfile,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(profileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `profil_${playerProfile.name}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

/**
 * Importe un profil du joueur
 */
function importProfile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedProfile = JSON.parse(e.target.result);
            
            // Valider la structure
            if (importedProfile.name && importedProfile.avatar && importedProfile.stats) {
                if (confirm(`Importer le profil de ${importedProfile.name} ? Cela remplacera votre profil actuel.`)) {
                    playerProfile = importedProfile;
                    savePlayerProfile();
                    location.reload();
                }
            } else {
                alert('Fichier de profil invalide !');
            }
        } catch (error) {
            alert('Erreur lors de la lecture du fichier !');
        }
    };
    reader.readAsText(file);
}

/**
 * Démarre le jeu après sélection d'avatar
 */
function startActualGame() {
    // Cette fonction sera appelée depuis le jeu principal
    if (typeof continueGameAfterAvatar === 'function') {
        continueGameAfterAvatar();
    }
}

// Initialiser le système au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Attendre un peu que les autres systèmes se chargent
    setTimeout(initAvatarSystem, 500);
});

// Exposer certaines fonctions globalement pour les boutons
window.switchAvatarTab = switchAvatarTab;
window.previewCustomAvatar = previewCustomAvatar;
window.saveCustomAvatar = saveCustomAvatar;
window.cancelCustomAvatar = cancelCustomAvatar;
window.resetPlayerProfile = resetPlayerProfile;
window.changeAvatar = changeAvatar;
window.exportProfile = exportProfile;
window.importProfile = importProfile;
window.checkAvatarSelectionNeeded = checkAvatarSelectionNeeded;