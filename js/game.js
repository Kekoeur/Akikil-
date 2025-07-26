/**
 * Logique principale du jeu "Qui est-ce ?"
 */

// Variables globales du jeu
let gameData = [];
let currentQuestion = 0;
let score = 0;
let gameQuestions = [];

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

/**
 * Démarre le jeu une fois les données déchiffrées
 */
function startGame() {
    try {
        // Créer toutes les questions possibles
        gameQuestions = [];
        gameData.forEach(person => {
            person.photos.forEach(photo => {
                gameQuestions.push({
                    photo: photo,
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
        document.getElementById('password-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        
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
function showQuestion() {
    if (currentQuestion >= gameQuestions.length) {
        endGame();
        return;
    }

    const question = gameQuestions[currentQuestion];
    
    // Mettre à jour l'image
    const photoElement = document.getElementById('current-photo');
    photoElement.src = question.photo;
    photoElement.alt = `Photo mystère ${currentQuestion + 1}`;
    
    // Mettre à jour le score et la progression
    updateUI();
    
    // Créer les options de réponse
    createAnswerOptions(question);
    
    // Réinitialiser les éléments d'interface
    resetQuestionUI();
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
    
    // Désactiver tous les boutons et appliquer les styles
    buttons.forEach(button => {
        button.disabled = true;
        
        if (button.textContent === correct) {
            button.className = 'option-btn correct';
        } else if (button.textContent === selected && selected !== correct) {
            button.className = 'option-btn incorrect';
        }
    });

    // Afficher le feedback
    if (selected === correct) {
        score++;
        feedback.textContent = '🎉 Correct ! Bien joué !';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `❌ Incorrect ! C'était ${correct}.`;
        feedback.className = 'feedback incorrect';
    }

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
}

/**
 * Termine le jeu et affiche les résultats
 */
function endGame() {
    const percentage = Math.round((score / gameQuestions.length) * 100);
    let message = '';
    let emoji = '';
    
    // Déterminer le message en fonction du score
    if (percentage >= 90) {
        message = 'Excellent ! Tu connais vraiment bien tout le monde !';
        emoji = '🏆';
    } else if (percentage >= 70) {
        message = 'Très bien ! Tu as une bonne mémoire des visages !';
        emoji = '👍';
    } else if (percentage >= 50) {
        message = 'Pas mal ! Tu peux encore t\'améliorer !';
        emoji = '😊';
    } else {
        message = 'Il faut peut-être mieux regarder les photos la prochaine fois !';
        emoji = '🤔';
    }

    // Afficher l'écran de fin
    document.getElementById('game-screen').innerHTML = `
        <h1>🎯 Jeu terminé !</h1>
        <div style="font-size: 4rem; margin: 30px 0;">${emoji}</div>
        <div style="font-size: 3rem; margin: 20px 0; color: #667eea; font-weight: bold;">
            ${percentage}%
        </div>
        <div style="font-size: 1.5rem; margin: 20px 0; color: #555;">
            Score final: <strong>${score} / ${gameQuestions.length}</strong>
        </div>
        <div style="font-size: 1.2rem; margin: 30px 0; color: #666; line-height: 1.5;">
            ${message}
        </div>
        <button class="unlock-btn" onclick="location.reload()" style="margin-top: 30px;">
            🔄 Jouer à nouveau
        </button>
    `;
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
 * Gestionnaire d'erreur global pour les images
 */
document.addEventListener('DOMContentLoaded', function() {
    // Gérer les erreurs de chargement d'images
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && e.target.id === 'current-photo') {
            console.error('Erreur de chargement de l\'image:', e.target.src);
            e.target.alt = '❌ Erreur de chargement de l\'image';
            e.target.style.display = 'flex';
            e.target.style.alignItems = 'center';
            e.target.style.justifyContent = 'center';
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.color = '#6c757d';
            e.target.style.fontSize = '1.2rem';
        }
    }, true);
});