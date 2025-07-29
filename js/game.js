/**
 * Logique principale du jeu "Qui est-ce ?" avec système d'avatars et badges
 */

// Variables globales du jeu
let gameData = [];
let currentQuestion = 0;
let score = 0;
let gameQuestions = [];
let currentPassword = '';
let gameStartTime = 0;
let questionStartTime = 0;
let questionTimes = [];

/**
 * Gestionnaire d'événement pour l'appui sur Entrée dans le champ mot de passe
 */
function handlePasswordKeyPress(event) {
    if (event.key === 'Enter') {
        unlockGame();
    }
}

/**
 * Fonction principale pour déverrouiller le jeu avec le mot de passe
 */
async function unlockGame() {
    const passwordInput = document.getElementById('password-input');
    const errorDiv = document.getElementById('password-error');
    const unlockBtn = document.querySelector('.unlock-btn');
    
    const password = passwordInput.value.trim();
    
    if (!password) {
        showError('Veuillez entrer un mot de passe');
        return;
    }

    // Afficher le chargement
    unlockBtn.innerHTML = '<div class="loading"></div>Déchiffrement...';
    unlockBtn.disabled = true;
    errorDiv.style.display = 'none';

    try {
        // Simuler un délai de traitement pour l'UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Vérifier que les données chiffrées existent
        if (typeof ENCRYPTED_GAME_DATA === 'undefined') {
            throw new Error('Données du jeu non trouvées');
        }
        
        // Déchiffrer les données
        gameData = decrypt(ENCRYPTED_GAME_DATA, password);
        
        // Valider les données déchiffrées
        const validation = validateGameData(gameData);
        if (!validation.valid) {
            throw new Error('Données invalides: ' + validation.errors.join(', '));
        }

        // Sauvegarder le mot de passe pour déchiffrer les images
        currentPassword = password;

        // SUPPRIMER CES LIGNES QUI CAUSENT L'ERREUR :
        // if (typeof loadGameAvatars === 'function') {
        //     loadGameAvatars();
        // }

        // Démarrer le jeu
        startGame();
        
    } catch (error) {
        console.error('Erreur de déchiffrement:', error);
        showError('❌ Mot de passe incorrect ou données corrompues');
        
        // Réinitialiser le bouton
        unlockBtn.innerHTML = '🔓 Déverrouiller le jeu';
        unlockBtn.disabled = false;
        passwordInput.select();
    }
}

/**
 * Affiche un message d'erreur
 */
function showError(message) {
    const errorDiv = document.getElementById('password-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function startGame() {
    try {
        // Basculer vers l'écran de sélection d'avatar
        document.getElementById('password-screen').style.display = 'none';
        document.getElementById('avatar-screen').style.display = 'block';
        
        // Afficher la sélection d'avatar
        showAvatarSelection();
        
    } catch (error) {
        console.error('Erreur lors du démarrage du jeu:', error);
        showError('Erreur lors du démarrage du jeu');
    }
}

/**
 * Continue le jeu après la sélection d'avatar
 */
function continueGameAfterAvatar() {
    try {
        // Créer toutes les questions possibles
        gameQuestions = [];
        gameData.forEach(person => {
            person.photos.forEach(photo => {
                gameQuestions.push({
                    photo: photo, // Image chiffrée
                    correctAnswer: person.name
                });
            });
        });

        // Mélanger les questions pour plus de variété
        gameQuestions = shuffleArray(gameQuestions);

        // Initialiser les variables du jeu
        currentQuestion = 0;
        score = 0;
        gameStartTime = Date.now();
        questionTimes = [];
        
        // Afficher la première question
        showQuestion();
        
    } catch (error) {
        console.error('Erreur lors du démarrage du jeu:', error);
        showError('Erreur lors du démarrage du jeu');
    }
}

/**
 * Affiche la question courante
 */
async function showQuestion() {
    if (currentQuestion >= gameQuestions.length) {
        endGame();
        return;
    }

    const question = gameQuestions[currentQuestion];
    questionStartTime = Date.now();
    
    // Afficher l'indicateur de chargement
    showImageLoading(true);
    
    try {
        // Déchiffrer et afficher l'image
        const decryptedImageData = decryptImage(question.photo, currentPassword);
        
        const photoElement = document.getElementById('current-photo');
        
        // Ajouter la classe de chargement pour l'animation
        photoElement.classList.add('loading');
        
        photoElement.src = decryptedImageData;
        photoElement.alt = `Photo mystère ${currentQuestion + 1}`;
        
        // Attendre que l'image soit chargée
        await new Promise((resolve, reject) => {
            photoElement.onload = resolve;
            photoElement.onerror = reject;
        });
        
        // Masquer le chargement et afficher l'image
        showImageLoading(false);
        photoElement.style.display = 'block';
        
        // Supprimer la classe de chargement après un petit délai
        setTimeout(() => {
            photoElement.classList.remove('loading');
        }, 600);
        
    } catch (error) {
        console.error('Erreur lors du déchiffrement de l\'image:', error);
        showImageLoading(false);
        
        // Afficher une image d'erreur circulaire
        const photoElement = document.getElementById('current-photo');
        photoElement.classList.add('error');
        photoElement.style.display = 'flex';
        photoElement.textContent = '❌ Erreur de déchiffrement';
    }
    
    // Mettre à jour le score et la progression
    updateUI();
    
    // Créer les options de réponse
    createAnswerOptions(question);
    
    // Réinitialiser les éléments d'interface
    resetQuestionUI();
}

/**
 * Affiche/masque l'indicateur de chargement d'image
 */
function showImageLoading(show) {
    const loadingDiv = document.getElementById('image-loading');
    const photoElement = document.getElementById('current-photo');
    
    if (show) {
        loadingDiv.style.display = 'flex';
        photoElement.style.display = 'none';
    } else {
        loadingDiv.style.display = 'none';
    }
}

/**
 * Met à jour les éléments d'interface (score, progression)
 */
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('total').textContent = gameQuestions.length;
    
    // Mettre à jour la barre de progression
    const progress = (currentQuestion / gameQuestions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    
    // Ajouter une classe selon le pourcentage de réussite actuel
    updatePhotoContainerStyle();
}

/**
 * Met à jour le style du conteneur photo selon le score
 */
function updatePhotoContainerStyle() {
    const photoContainer = document.querySelector('.photo-container');
    const currentPercentage = gameQuestions.length > 0 ? (score / Math.max(1, currentQuestion)) * 100 : 0;
    
    // Supprimer les anciennes classes
    photoContainer.classList.remove('excellent', 'good', 'average', 'poor');
    
    // Ajouter la classe selon le score
    if (currentPercentage >= 90) {
        photoContainer.classList.add('excellent');
    } else if (currentPercentage >= 70) {
        photoContainer.classList.add('good');
    } else if (currentPercentage >= 50) {
        photoContainer.classList.add('average');
    } else if (currentQuestion > 0) {
        photoContainer.classList.add('poor');
    }
}

/**
 * Crée les options de réponse pour la question courante
 */
function createAnswerOptions(question) {
    const options = [question.correctAnswer];
    const otherNames = gameData
        .map(person => person.name)
        .filter(name => name !== question.correctAnswer);
    
    // Ajouter 2-3 mauvaises réponses aléatoires
    const numWrongAnswers = Math.min(3, otherNames.length);
    const shuffledNames = shuffleArray([...otherNames]);
    
    for (let i = 0; i < numWrongAnswers; i++) {
        if (!options.includes(shuffledNames[i])) {
            options.push(shuffledNames[i]);
        }
    }

    // Mélanger toutes les options
    const shuffledOptions = shuffleArray(options);

    // Créer les boutons
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(option, question.correctAnswer);
        optionsContainer.appendChild(button);
    });
}

/**
 * Gère la sélection d'une réponse
 */
function selectAnswer(selected, correct) {
    const buttons = document.querySelectorAll('.option-btn');
    const feedback = document.getElementById('feedback');
    const photoElement = document.getElementById('current-photo');
    
    // Calculer le temps de réponse
    const questionTime = Date.now() - questionStartTime;
    questionTimes.push(questionTime);
    
    // Désactiver tous les boutons et appliquer les styles
    buttons.forEach(button => {
        button.disabled = true;
        
        if (button.textContent === correct && selected === correct) {
            button.className = 'option-btn correct';
        } else if (button.textContent === selected && selected !== correct) {
            button.className = 'option-btn incorrect';
        }
    });

    // Afficher le feedback et effet visuel sur l'image
    if (selected === correct) {
        score++;
        feedback.textContent = '🎉 Correct ! Bien joué !';
        feedback.className = 'feedback correct';
        
        // Effet de succès sur l'image
        photoElement.style.filter = 'brightness(1.2) saturate(1.3) hue-rotate(10deg)';
        photoElement.style.transform = 'scale(1.05)';
        
        // Mettre à jour la streak
        if (typeof playerProfile !== 'undefined') {
            playerProfile.stats.streak++;
            if (playerProfile.stats.streak > playerProfile.stats.bestStreak) {
                playerProfile.stats.bestStreak = playerProfile.stats.streak;
            }
        }
    } else {
        feedback.textContent = `❌ Incorrect !`;
        feedback.className = 'feedback incorrect';
        
        // Effet d'erreur sur l'image
        photoElement.style.filter = 'brightness(0.7) saturate(0.5) hue-rotate(-10deg)';
        photoElement.style.transform = 'scale(0.95)';
        
        // Réinitialiser la streak
        if (typeof playerProfile !== 'undefined') {
            playerProfile.stats.streak = 0;
        }
    }

    // Remettre l'image normale après 2 secondes
    setTimeout(() => {
        photoElement.style.filter = '';
        photoElement.style.transform = '';
    }, 2000);

    // Afficher le bouton "Suivant"
    document.getElementById('next-btn').style.display = 'inline-block';
}

/**
 * Passe à la question suivante
 */
function nextQuestion() {
    currentQuestion++;
    showQuestion();
}

/**
 * Réinitialise les éléments d'interface pour une nouvelle question
 */
function resetQuestionUI() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('next-btn').style.display = 'none';
    
    // Réinitialiser les styles de l'image
    const photoElement = document.getElementById('current-photo');
    photoElement.classList.remove('error', 'loading');
    photoElement.style.filter = '';
    photoElement.style.transform = '';
}

/**
 * Termine le jeu et affiche les résultats
 */
function endGame() {
    const percentage = Math.round((score / gameQuestions.length) * 100);
    const totalGameTime = Date.now() - gameStartTime;
    const avgQuestionTime = questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length;
    
    // Mettre à jour les statistiques du joueur
    if (typeof updatePlayerStats === 'function') {
        updatePlayerStats(score, gameQuestions.length, totalGameTime);
    }
    
    let message = '';
    let emoji = '';
    
    // Déterminer le message en fonction du score
    if (percentage >= 90) {
        message = "Eh bien mon coquin ! On sait ce que tu regardais pendant le week-end…";
        emoji = '🏆🍑';
    } else if (percentage >= 70) {
        message = "Pas tout à fait expert, mais t'as l'instinct du chasseur...";
        emoji = '🎯🍑';
    } else if (percentage >= 50) {
        message = "T'as maté, mais t'as pas retenu !";
        emoji = '👀🍑';
    } else {
        message = "Soit t'as jamais regardé, soit tu fais semblant…";
        emoji = '👀❓🍑';
    }

    // Statistiques du jeu
    const statsHtml = `
        <div style="background: rgba(26, 26, 46, 0.8); border: 1px solid var(--neon-cyan); border-radius: 10px; padding: 15px; margin: 20px 0; font-size: 0.9rem;">
            <div style="color: var(--neon-yellow); margin-bottom: 10px;">📊 Statistiques de la partie</div>
            <div style="color: var(--neon-cyan);">⏱️ Temps total: ${Math.round(totalGameTime / 1000)}s</div>
            <div style="color: var(--neon-cyan);">⚡ Temps moyen/question: ${Math.round(avgQuestionTime / 1000)}s</div>
            <div style="color: var(--neon-cyan);">🎯 Questions réussies: ${score}/${gameQuestions.length}</div>
        </div>
    `;

    // Afficher l'écran de fin
    document.getElementById('game-screen').innerHTML = `
        <h1>🎯 Jeu terminé !</h1>
        <div style="font-size: 4rem; margin: 30px 0;">${emoji}</div>
        <div style="font-size: 3rem; margin: 20px 0; color: var(--neon-cyan); font-weight: bold; text-shadow: 0 0 20px var(--neon-cyan);">
            ${percentage}%
        </div>
        <div style="font-size: 1.5rem; margin: 20px 0; color: var(--neon-yellow); text-shadow: 0 0 10px var(--neon-yellow);">
            Score final: <strong>${score} / ${gameQuestions.length}</strong>
        </div>
        ${statsHtml}
        <div style="font-size: 1.2rem; margin: 30px 0; color: var(--neon-green); line-height: 1.5; text-shadow: 0 0 8px var(--neon-green);">
            ${message}
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
            <button class="unlock-btn" onclick="location.reload()" style="margin: 0; width: auto;">
                🔄 Jouer à nouveau
            </button>
            <button class="unlock-btn" onclick="showPlayerStats()" style="margin: 0; width: auto; background: linear-gradient(45deg, var(--neon-purple), var(--neon-pink));">
                📊 Mes statistiques
            </button>
        </div>
    `;
    
    // Créer des particules de fin de jeu
    if (typeof createCelebrationParticles === 'function') {
        createCelebrationParticles();
    }
}

/**
 * Affiche les statistiques détaillées du joueur
 */
function showPlayerStats() {
    if (typeof getFormattedStats !== 'function') return;
    
    const stats = getFormattedStats();
    const badges = typeof getAvailableBadges === 'function' ? getAvailableBadges() : [];
    
    const statsPopup = document.createElement('div');
    statsPopup.className = 'achievement-popup';
    statsPopup.style.transform = 'translate(-50%, -50%) scale(1)';
    statsPopup.style.maxWidth = '90vw';
    statsPopup.style.maxHeight = '90vh';
    statsPopup.style.overflow = 'auto';
    statsPopup.innerHTML = `
        <h3>📊 Vos Statistiques</h3>
        <div style="text-align: left; margin: 20px 0;">
            <div style="color: var(--neon-cyan); margin: 8px 0;">🎮 Parties jouées: <strong>${stats.gamesPlayed}</strong></div>
            <div style="color: var(--neon-cyan); margin: 8px 0;">🏆 Meilleur score: <strong>${stats.bestScore}</strong></div>
            <div style="color: var(--neon-cyan); margin: 8px 0;">📈 Score moyen: <strong>${stats.averageScore}</strong></div>
            <div style="color: var(--neon-cyan); margin: 8px 0;">💯 Parties parfaites: <strong>${stats.perfectGames}</strong></div>
            <div style="color: var(--neon-cyan); margin: 8px 0;">✨ Taux de réussite: <strong>${stats.successRate}</strong></div>
        </div>
        ${badgesHtml}
        <div style="margin-top: 25px;">
            <button class="btn-cancel" onclick="this.parentElement.remove()" style="margin: 0;">
                Fermer
            </button>
        </div>
    `;
    
    document.body.appendChild(statsPopup);
    
    // Supprimer automatiquement après 10 secondes
    setTimeout(() => {
        if (statsPopup.parentElement) {
            statsPopup.remove();
        }
    }, 10000);
}

/**
 * Fonction utilitaire pour mélanger un tableau (algorithme Fisher-Yates)
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Fonctions de déchiffrement intégrées (pour compatibilité)
 */
function decrypt(encryptedData, password) {
    try {
        const encrypted = atob(encryptedData);
        let decrypted = '';
        
        for (let i = 0; i < encrypted.length; i++) {
            decrypted += String.fromCharCode(
                encrypted.charCodeAt(i) ^ password.charCodeAt(i % password.length)
            );
        }
        
        // Essayer de parser en JSON, sinon retourner la chaîne
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted; // Pour les images base64
        }
    } catch (error) {
        throw new Error('Déchiffrement échoué - mot de passe incorrect ou données corrompues');
    }
}

/**
 * Déchiffre spécifiquement une image et retourne l'URL data:
 */
function decryptImage(encryptedImage, password) {
    try {
        const decryptedImage = decrypt(encryptedImage, password);
        
        // Vérifier que c'est bien une URL data:
        if (typeof decryptedImage === 'string' && decryptedImage.startsWith('data:')) {
            return decryptedImage;
        } else {
            throw new Error('Format d\'image invalide');
        }
    } catch (error) {
        throw new Error('Erreur déchiffrement image: ' + error.message);
    }
}

/**
 * Valide le format des données de jeu
 */
function validateGameData(data) {
    const result = {
        valid: true,
        errors: [],
        stats: {
            totalPeople: 0,
            totalPhotos: 0
        }
    };

    try {
        // Vérifier que c'est un tableau
        if (!Array.isArray(data)) {
            result.valid = false;
            result.errors.push('Les données doivent être un tableau');
            return result;
        }

        // Vérifier qu'il y a au moins 2 personnes
        if (data.length < 2) {
            result.valid = false;
            result.errors.push('Il faut au moins 2 personnes pour jouer');
            return result;
        }

        // Valider chaque personne
        data.forEach((person, index) => {
            if (!person.name || typeof person.name !== 'string' || person.name.trim() === '') {
                result.valid = false;
                result.errors.push(`Personne ${index + 1}: nom manquant ou invalide`);
            }

            if (!person.photos || !Array.isArray(person.photos)) {
                result.valid = false;
                result.errors.push(`Personne ${index + 1}: liste de photos manquante ou invalide`);
            } else if (person.photos.length === 0) {
                result.valid = false;
                result.errors.push(`Personne ${index + 1}: aucune photo fournie`);
            } else {
                // Valider chaque photo
                person.photos.forEach((photo, photoIndex) => {
                    if (typeof photo !== 'string' || photo.trim() === '') {
                        result.valid = false;
                        result.errors.push(`Personne ${index + 1}, photo ${photoIndex + 1}: données invalides`);
                    }
                });
                result.stats.totalPhotos += person.photos.length;
            }

            result.stats.totalPeople++;
        });

        // Vérifier les noms en double
        const names = data.map(person => person.name?.toLowerCase().trim()).filter(Boolean);
        const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicateNames.length > 0) {
            result.valid = false;
            result.errors.push(`Noms en double détectés: ${[...new Set(duplicateNames)].join(', ')}`);
        }

    } catch (error) {
        result.valid = false;
        result.errors.push('Erreur lors de la validation: ' + error.message);
    }

    return result;
}

/**
 * Gestionnaire d'erreur global pour les images
 */
document.addEventListener('DOMContentLoaded', function() {
    // Gérer les erreurs de chargement d'images
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && e.target.id === 'current-photo') {
            console.error('Erreur de chargement de l\'image:', e.target.src);
            showImageLoading(false);
            e.target.classList.add('error');
            e.target.style.display = 'flex';
            e.target.textContent = '❌ Erreur de chargement de l\'image';
        }
    }, true);
});

// Exposer les fonctions globalement
window.showPlayerStats = showPlayerStats;
window.continueGameAfterAvatar = continueGameAfterAvatar;