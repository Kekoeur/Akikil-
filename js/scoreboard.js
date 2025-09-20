/**
 * Logique principale du jeu "Qui est-ce ?" avec scoreboard
 */

// Variables globales du jeu
let gameData = [];
let currentQuestion = 0;
let score = 0;
let gameQuestions = [];
let currentPassword = '';
let currentPlayerName = '';
let gameStartTime = null;

// Clé pour le localStorage
const SCOREBOARD_KEY = 'akikileleq_scoreboard';

/**
 * Initialisation au chargement de la page
 */
document.addEventListener('DOMContentLoaded', function() {
    showPasswordScreen();
});

/**
 * Affiche l'écran de mot de passe (premier écran)
 */
function showPasswordScreen() {
    document.getElementById('password-screen').style.display = 'block';
    document.getElementById('name-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'none';
    
    // Focus sur l'input mot de passe
    setTimeout(() => {
        document.getElementById('password-input').focus();
    }, 500);
}

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
        showPasswordError('Veuillez entrer un mot de passe');
        return;
    }

    // Afficher le chargement
    unlockBtn.innerHTML = '<div class="loading"></div>DÉCHIFFREMENT...';
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

        // Aller à l'écran de saisie du nom
        showNameScreen();
        
    } catch (error) {
        console.error('Erreur de déchiffrement:', error);
        showPasswordError('❌ Mot de passe incorrect ou données corrompues');
        
        // Réinitialiser le bouton
        unlockBtn.innerHTML = '🔓 DÉVERROUILLER LE JEU';
        unlockBtn.disabled = false;
        passwordInput.select();
    }
}

/**
 * Affiche un message d'erreur pour le mot de passe
 */
function showPasswordError(message) {
    const errorDiv = document.getElementById('password-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

/**
 * Affiche l'écran de saisie du nom (après le mot de passe)
 */
function showNameScreen() {
    document.getElementById('password-screen').style.display = 'none';
    document.getElementById('name-screen').style.display = 'block';
    
    // Focus sur l'input nom
    setTimeout(() => {
        document.getElementById('player-name-input').focus();
    }, 500);
}

/**
 * Gestionnaire d'événement pour l'appui sur Entrée dans le champ nom
 */
function handleNameKeyPress(event) {
    if (event.key === 'Enter') {
        startWithName();
    }
}

/**
 * Démarre le jeu avec le nom du joueur
 */
function startWithName() {
    const nameInput = document.getElementById('player-name-input');
    const errorDiv = document.getElementById('name-error');
    
    const name = nameInput.value.trim().toUpperCase();
    
    if (!name) {
        showNameError('Entre ton nom, champion ! 🎮');
        return;
    }
    
    if (name.length < 2) {
        showNameError('Ton nom doit faire au moins 2 caractères ! ⚡');
        return;
    }
    
    if (name.length > 20) {
        showNameError('Ton nom est trop long ! Maximum 20 caractères 📏');
        return;
    }
    
    // Sauvegarder le nom du joueur
    currentPlayerName = name;
    
    // Démarrer le jeu
    startGame();
}

/**
 * Affiche un message d'erreur pour le nom
 */
function showNameError(message) {
    const errorDiv = document.getElementById('name-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Focus sur l'input
    document.getElementById('player-name-input').focus();
    document.getElementById('player-name-input').select();
}

/**
 * Retourne à l'écran de mot de passe
 */
function goBackToPassword() {
    currentPassword = '';
    gameData = [];
    document.getElementById('player-name-input').value = '';
    document.getElementById('name-error').style.display = 'none';
    showPasswordScreen();
}

/**
 * Démarre le jeu une fois les données déchiffrées et le nom saisi
 */
function startGame() {
    try {
        // Enregistrer l'heure de début
        gameStartTime = new Date();
        
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

        // Basculer vers l'écran de jeu
        document.getElementById('name-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        
        // Afficher le nom du joueur
        document.getElementById('game-player-name').textContent = currentPlayerName;
        
        // Afficher la première question
        showQuestion();
        
    } catch (error) {
        console.error('Erreur lors du démarrage du jeu:', error);
        showNameError('Erreur lors du démarrage du jeu');
    }
}

/**
 * Affiche le scoreboard complet dans une modal
 */
function showFullScoreboard() {
    displayScoreboard('modal-scoreboard-content');
    document.getElementById('scoreboard-modal').style.display = 'flex';
}

/**
 * Masque le scoreboard complet
 */
function hideFullScoreboard() {
    document.getElementById('scoreboard-modal').style.display = 'none';
}

/**
 * Affiche le scoreboard dans un conteneur donné
 */
function displayScoreboard(containerId) {
    const container = document.getElementById(containerId);
    const scores = getScores();
    
    if (scores.length === 0) {
        container.innerHTML = '<div class="no-scores">Aucun score enregistré... Sois le premier ! 🔥</div>';
        return;
    }
    
    let html = '';
    scores.forEach((scoreData, index) => {
        const rank = index + 1;
        const isCurrentPlayer = scoreData.playerName === currentPlayerName && 
                              Math.abs(scoreData.timestamp - new Date().getTime()) < 60000; // 1 minute
        
        const date = new Date(scoreData.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const duration = formatDuration(scoreData.duration);
        
        html += `
            <div class="score-item ${getRankClass(rank)} ${isCurrentPlayer ? 'current-player' : ''}">
                <div class="score-rank ${getRankClass(rank)}">${getRankEmoji(rank)}</div>
                <div class="score-name">${scoreData.playerName}</div>
                <div class="score-details">
                    <div class="score-percentage">${scoreData.percentage}%</div>
                    <div class="score-total">${scoreData.score}/${scoreData.total}</div>
                    <div class="score-date">${date}<br><small>${duration}</small></div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Recommence une partie avec le même joueur
 */
function restartGame() {
    // Réinitialiser les variables
    currentQuestion = 0;
    score = 0;
    gameQuestions = [];
    gameStartTime = null;
    
    // Retour à l'écran de nom (garder le mot de passe déchiffré)
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('player-name-input').value = currentPlayerName;
    showNameScreen();
}

/**
 * Nouveau joueur
 */
function newPlayer() {
    // Réinitialiser complètement
    currentPlayerName = '';
    currentPassword = '';
    gameData = [];
    currentQuestion = 0;
    score = 0;
    gameQuestions = [];
    gameStartTime = null;
    
    // Retour à l'écran de mot de passe
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('player-name-input').value = '';
    document.getElementById('password-input').value = '';
    showPasswordScreen();
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
    } else {
        feedback.textContent = `❌ Incorrect !`;
        feedback.className = 'feedback incorrect';
        
        // Effet d'erreur sur l'image
        photoElement.style.filter = 'brightness(0.7) saturate(0.5) hue-rotate(-10deg)';
        photoElement.style.transform = 'scale(0.95)';
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
 * Termine le jeu et affiche les résultats avec scoreboard
 */
function endGame() {
    const percentage = Math.round((score / gameQuestions.length) * 100);
    const gameEndTime = new Date();
    const gameDuration = Math.round((gameEndTime - gameStartTime) / 1000); // en secondes
    
    // Sauvegarder le score
    const gameResult = {
        playerName: currentPlayerName,
        score: score,
        total: gameQuestions.length,
        percentage: percentage,
        duration: gameDuration,
        date: gameEndTime.toISOString(),
        timestamp: gameEndTime.getTime()
    };
    
    saveScore(gameResult);
    
    // Déterminer le message et emoji en fonction du score
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
        message = 'Eh bien mon coquin ! On sait ce que tu regardais pendant le week-end…';
        emoji = '🏆🍑';
    } else if (percentage >= 70) {
        message = 'Pas tout à fait expert, mais t\'as l\'instinct du chasseur...';
        emoji = '🎯🍑';
    } else if (percentage >= 50) {
        message = 'T\'as maté, mais t\'as pas retenu !';
        emoji = '👀🍑';
    } else {
        message = 'Soit t\'as jamais regardé, soit tu fais semblant…';
        emoji = '👀❓🍑';
    }
    
    // Afficher l'écran de fin
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block';
    
    // Remplir les informations du résultat
    document.getElementById('final-player-name').textContent = currentPlayerName;
    document.getElementById('final-emoji').textContent = emoji;
    document.getElementById('final-percentage').textContent = percentage + '%';
    document.getElementById('final-score').textContent = `Score: ${score} / ${gameQuestions.length}`;
    document.getElementById('final-message').textContent = message;
    
    // Afficher le rang
    const rank = getPlayerRank(gameResult);
    document.getElementById('rank-info').textContent = getRankMessage(rank, percentage);
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
    
    // Fermer la modal en cliquant à côté
    document.addEventListener('click', function(e) {
        if (e.target.id === 'scoreboard-modal') {
            hideFullScoreboard();
        }
        if (e.target.id === 'confirm-modal') {
            hideConfirmModal();
        }
    });
});

/**
 * Affiche la question courante
 */
async function showQuestion() {
    if (currentQuestion >= gameQuestions.length) {
        endGame();
        return;
    }

    const question = gameQuestions[currentQuestion];
    
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
    } else {
        feedback.textContent = `❌ Incorrect !`;
        feedback.className = 'feedback incorrect';
        
        // Effet d'erreur sur l'image
        photoElement.style.filter = 'brightness(0.7) saturate(0.5) hue-rotate(-10deg)';
        photoElement.style.transform = 'scale(0.95)';
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
 * Termine le jeu et affiche les résultats avec scoreboard
 */
function endGame() {
    const percentage = Math.round((score / gameQuestions.length) * 100);
    const gameEndTime = new Date();
    const gameDuration = Math.round((gameEndTime - gameStartTime) / 1000); // en secondes
    
    // Sauvegarder le score
    const gameResult = {
        playerName: currentPlayerName,
        score: score,
        total: gameQuestions.length,
        percentage: percentage,
        duration: gameDuration,
        date: gameEndTime.toISOString(),
        timestamp: gameEndTime.getTime()
    };
    
    saveScore(gameResult);
    
    // Déterminer le message et emoji en fonction du score
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
        message = 'Eh bien mon coquin ! On sait ce que tu regardais pendant le week-end…';
        emoji = '🏆🍑';
    } else if (percentage >= 70) {
        message = 'Pas tout à fait expert, mais t\'as l\'instinct du chasseur...';
        emoji = '🎯🍑';
    } else if (percentage >= 50) {
        message = 'T\'as maté, mais t\'as pas retenu !';
        emoji = '👀🍑';
    } else {
        message = 'Soit t\'as jamais regardé, soit tu fais semblant…';
        emoji = '👀❓🍑';
    }
    
    // Afficher l'écran de fin
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block';
    
    // Remplir les informations du résultat
    document.getElementById('final-player-name').textContent = currentPlayerName;
    document.getElementById('final-emoji').textContent = emoji;
    document.getElementById('final-percentage').textContent = percentage + '%';
    document.getElementById('final-score').textContent = `Score: ${score} / ${gameQuestions.length}`;
    document.getElementById('final-message').textContent = message;
    
    // Afficher le rang
    const rank = getPlayerRank(gameResult);
    document.getElementById('rank-info').textContent = getRankMessage(rank, percentage);
    
    // Afficher le scoreboard complet
    displayScoreboard('scoreboard-content');
}

/**
 * Sauvegarde un score dans le localStorage
 */
function saveScore(gameResult) {
    try {
        const scores = getScores();
        scores.push(gameResult);
        
        // Trier par pourcentage décroissant, puis par temps croissant (plus rapide = meilleur)
        scores.sort((a, b) => {
            if (b.percentage !== a.percentage) {
                return b.percentage - a.percentage;
            }
            return a.duration - b.duration; // Temps plus court = meilleur
        });
        
        // Limiter à 50 scores maximum
        if (scores.length > 50) {
            scores.splice(50);
        }
        
        localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(scores));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du score:', error);
    }
}

/**
 * Récupère tous les scores du localStorage
 */
function getScores() {
    try {
        const stored = localStorage.getItem(SCOREBOARD_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Erreur lors de la lecture des scores:', error);
        return [];
    }
}

/**
 * Obtient le rang d'un joueur
 */
function getPlayerRank(gameResult) {
    const scores = getScores();
    
    // Compter combien de scores sont meilleurs
    let betterScores = 0;
    for (const score of scores) {
        if (score.percentage > gameResult.percentage || 
           (score.percentage === gameResult.percentage && score.duration < gameResult.duration)) {
            betterScores++;
        }
    }
    
    return betterScores + 1;
}

/**
 * Génère un message de rang
 */
function getRankMessage(rank, percentage) {
    if (rank === 1) {
        return '🥇 NOUVEAU RECORD ! Champion absolu !';
    } else if (rank <= 3) {
        return `🥉 Top ${rank} ! Tu fais partie de l'élite !`;
    } else if (rank <= 5) {
        return `🏅 Top ${rank} ! Très respectable !`;
    } else if (rank <= 10) {
        return `⭐ Top ${rank} ! Pas mal du tout !`;
    } else {
        return `📊 Rang ${rank} - Continue à t'entraîner !`;
    }
}

/**
 * Affiche le scoreboard dans un conteneur donné
 */
function displayScoreboard(containerId) {
    const container = document.getElementById(containerId);
    const scores = getScores();
    
    if (scores.length === 0) {
        container.innerHTML = '<div class="no-scores">Aucun score enregistré... Sois le premier ! 🔥</div>';
        return;
    }
    
    let html = '';
    scores.forEach((scoreData, index) => {
        const rank = index + 1;
        const isCurrentPlayer = scoreData.playerName === currentPlayerName && 
                              Math.abs(scoreData.timestamp - new Date().getTime()) < 60000; // 1 minute
        
        const date = new Date(scoreData.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }) + ' ' + new Date(scoreData.date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const duration = formatDuration(scoreData.duration);
        
        html += `
            <div class="score-item ${getRankClass(rank)} ${isCurrentPlayer ? 'current-player' : ''}">
                <div class="score-rank ${getRankClass(rank)}">${getRankEmoji(rank)}</div>
                <div class="score-name">${scoreData.playerName}</div>
                <div class="score-details">
                    <div class="score-percentage">${scoreData.percentage}%</div>
                    <div class="score-time">${duration}</div>
                    <div class="score-date">${date}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Retourne la classe CSS pour un rang
 */
function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

/**
 * Retourne l'emoji pour un rang
 */
function getRankEmoji(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

/**
 * Formate une durée en secondes
 */
function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m${remainingSeconds.toString().padStart(2, '0')}s`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h${minutes.toString().padStart(2, '0')}m`;
    }
}

/**
 * Vide le scoreboard avec confirmation par mot de passe
 */
function clearScoreboard() {
    showConfirmModal();
}

/**
 * Affiche la modal de confirmation pour reset
 */
function showConfirmModal() {
    const modalHtml = `
        <div id="confirm-modal" class="confirm-modal">
            <div class="confirm-content">
                <h3>🚨 RESET SCOREBOARD 🚨</h3>
                <p>Cette action supprimera DÉFINITIVEMENT tous les scores.<br>
                Entrez le mot de passe administrateur pour confirmer :</p>
                <input type="password" id="confirm-password" class="confirm-password-input" 
                       placeholder="MOT DE PASSE ADMIN..." onkeypress="handleConfirmKeyPress(event)">
                <div class="confirm-actions">
                    <button class="confirm-btn" onclick="confirmReset()">
                        🗑️ CONFIRMER
                    </button>
                    <button class="cancel-btn" onclick="hideConfirmModal()">
                        ❌ ANNULER
                    </button>
                </div>
                <div id="confirm-error" class="error-message" style="display: none; margin-top: 10px;"></div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Focus sur l'input
    setTimeout(() => {
        document.getElementById('confirm-password').focus();
    }, 100);
}

/**
 * Masque la modal de confirmation
 */
function hideConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Gestionnaire pour la touche Entrée dans la confirmation
 */
function handleConfirmKeyPress(event) {
    if (event.key === 'Enter') {
        confirmReset();
    }
}

/**
 * Confirme le reset avec vérification du mot de passe
 */
function confirmReset() {
    const passwordInput = document.getElementById('confirm-password');
    const errorDiv = document.getElementById('confirm-error');
    const confirmBtn = document.querySelector('.confirm-btn');
    
    const password = passwordInput.value.trim();
    
    if (!password) {
        showConfirmError('Entrez le mot de passe administrateur');
        return;
    }
    
    // Vérifier le mot de passe (utilise le même que pour déchiffrer)
    if (password !== currentPassword) {
        showConfirmError('❌ Mot de passe incorrect !');
        passwordInput.select();
        return;
    }
    
    // Mot de passe correct, procéder au reset
    confirmBtn.innerHTML = '<div class="loading"></div>SUPPRESSION...';
    confirmBtn.disabled = true;
    
    try {
        localStorage.removeItem(SCOREBOARD_KEY);
        
        // Mettre à jour l'affichage
        displayScoreboard('modal-scoreboard-content');
        
        // Fermer la modal de confirmation
        hideConfirmModal();
        
        // Afficher un message de succès temporaire
        const successMsg = document.createElement('div');
        successMsg.innerHTML = '✅ Scoreboard vidé avec succès !';
        successMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--darker-bg);
            color: var(--neon-green);
            border: 2px solid var(--neon-green);
            border-radius: 10px;
            padding: 20px;
            font-weight: 700;
            text-shadow: 0 0 10px var(--neon-green);
            box-shadow: 0 0 20px var(--neon-green);
            z-index: 1200;
            animation: modalAppear 0.3s ease-out;
        `;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 2000);
        
    } catch (error) {
        console.error('Erreur lors de la suppression des scores:', error);
        showConfirmError('Erreur lors de la suppression des scores');
        confirmBtn.innerHTML = '🗑️ CONFIRMER';
        confirmBtn.disabled = false;
    }
}

/**
 * Affiche un message d'erreur dans la modal de confirmation
 */
function showConfirmError(message) {
    const errorDiv = document.getElementById('confirm-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
} 

function getScores() {
    try {
        const stored = localStorage.getItem(SCOREBOARD_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Erreur lors de la lecture des scores:', error);
        return [];
    }
}

/**
 * Obtient le rang d'un joueur
 */
function getPlayerRank(gameResult) {
    const scores = getScores();
    
    // Compter combien de scores sont meilleurs
    let betterScores = 0;
    for (const score of scores) {
        if (score.percentage > gameResult.percentage || 
           (score.percentage === gameResult.percentage && score.duration < gameResult.duration)) {
            betterScores++;
        }
    }
    
    return betterScores + 1;
}

/**
 * Génère un message de rang
 */
function getRankMessage(rank, percentage) {
    if (rank === 1) {
        return '🥇 NOUVEAU RECORD ! Champion absolu !';
    } else if (rank <= 3) {
        return `🥉 Top ${rank} ! Tu fais partie de l'élite !`;
    } else if (rank <= 5) {
        return `🏅 Top ${rank} ! Très respectable !`;
    } else if (rank <= 10) {
        return `⭐ Top ${rank} ! Pas mal du tout !`;
    } else {
        return `📊 Rang ${rank} - Continue à t'entraîner !`;
    }
}

/**
 * Affiche le scoreboard dans un conteneur donné
 */
function displayScoreboard(containerId) {
    const container = document.getElementById(containerId);
    const scores = getScores();
    
    if (scores.length === 0) {
        container.innerHTML = '<div class="no-scores">Aucun score enregistré... Sois le premier ! 🔥</div>';
        return;
    }
    
    let html = '';
    scores.forEach((scoreData, index) => {
        const rank = index + 1;
        const isCurrentPlayer = scoreData.playerName === currentPlayerName && 
                              scoreData.timestamp === scores.find(s => s.playerName === currentPlayerName)?.timestamp;
        
        const date = new Date(scoreData.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const duration = formatDuration(scoreData.duration);
        
        html += `
            <div class="score-item ${getRankClass(rank)} ${isCurrentPlayer ? 'current-player' : ''}">
                <div class="score-rank ${getRankClass(rank)}">${getRankEmoji(rank)}</div>
                <div class="score-name">${scoreData.playerName}</div>
                <div class="score-details">
                    <div class="score-percentage">${scoreData.percentage}%</div>
                    <div class="score-total">${scoreData.score}/${scoreData.total}</div>
                    <div class="score-date">${date}<br><small>${duration}</small></div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Retourne la classe CSS pour un rang
 */
function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

/**
 * Retourne l'emoji pour un rang
 */
function getRankEmoji(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

/**
 * Formate une durée en secondes
 */
function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}

/**
 * Charge l'aperçu du scoreboard sur l'écran d'accueil
 */
function loadScoreboardPreview() {
    const container = document.getElementById('scoreboard-preview-content');
    const scores = getScores().slice(0, 5); // Top 5
    
    if (scores.length === 0) {
        container.innerHTML = '<div class="no-scores">Aucun score enregistré... Sois le premier ! 🔥</div>';
        return;
    }
    
    let html = '';
    scores.forEach((scoreData, index) => {
        const rank = index + 1;
        html += `
            <div class="score-item-preview">
                <div class="score-rank">${getRankEmoji(rank)}</div>
                <div class="score-name">${scoreData.playerName}</div>
                <div class="score-percentage">${scoreData.percentage}%</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Affiche le scoreboard complet dans une modal
 */
function showFullScoreboard() {
    displayScoreboard('modal-scoreboard-content');
    document.getElementById('scoreboard-modal').style.display = 'flex';
}

/**
 * Masque le scoreboard complet
 */
function hideFullScoreboard() {
    document.getElementById('scoreboard-modal').style.display = 'none';
}

/**
 * Recommence une partie avec le même joueur
 */
function restartGame() {
    // Réinitialiser les variables
    currentQuestion = 0;
    score = 0;
    gameQuestions = [];
    gameStartTime = null;
    
    // Retour à l'écran de mot de passe
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('password-input').value = '';
    showPasswordScreen();
}

/**
 * Nouveau joueur
 */
function newPlayer() {
    // Réinitialiser complètement
    currentPlayerName = '';
    currentPassword = '';
    currentQuestion = 0;
    score = 0;
    gameQuestions = [];
    gameStartTime = null;
    
    // Retour à l'écran de nom
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('player-name-input').value = '';
    document.getElementById('password-input').value = '';
    showNameScreen();
    loadScoreboardPreview(); // Recharger l'aperçu
}

/**
 * Vide le scoreboard
 */
function clearScoreboard() {
    if (confirm('Es-tu sûr de vouloir supprimer TOUS les scores ? Cette action est irréversible ! 🗑️')) {
        try {
            localStorage.removeItem(SCOREBOARD_KEY);
            displayScoreboard('scoreboard-content');
            loadScoreboardPreview();
            alert('Scoreboard vidé ! 🧹');
        } catch (error) {
            console.error('Erreur lors de la suppression des scores:', error);
            alert('Erreur lors de la suppression des scores');
        }
    }
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
    
    // Fermer la modal en cliquant à côté
    document.getElementById('scoreboard-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideFullScoreboard();
        }
    });
});