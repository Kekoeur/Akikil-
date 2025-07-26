/**
 * Logique pour l'outil de chiffrement des données
 */

/**
 * Remplit le champ JSON avec un exemple
 */
function fillExample() {
    const exampleData = [
        {
            "name": "Alice Dupont",
            "photos": [
                "https://lh3.googleusercontent.com/d/1ABC123_EXEMPLE_ID_IMAGE_ALICE_1",
                "https://lh3.googleusercontent.com/d/1ABC123_EXEMPLE_ID_IMAGE_ALICE_2",
                "https://lh3.googleusercontent.com/d/1ABC123_EXEMPLE_ID_IMAGE_ALICE_3"
            ]
        },
        {
            "name": "Bob Martin",
            "photos": [
                "https://lh3.googleusercontent.com/d/1ABC123_EXEMPLE_ID_IMAGE_BOB_1",
                "https://lh3.googleusercontent.com/d/1ABC123_EXEMPLE_ID_IMAGE_BOB_2"
            ]
        },
        {
            "name": "Claire Moreau",
            "photos": [
                "https://lh3.googleusercontent.com/d/1ABC123_EXEMPLE_ID_IMAGE_CLAIRE_1",
                "https://lh3.googleusercontent.com/d/1ABC123_EXEMPLE_ID_IMAGE_CLAIRE_2",
                "https://lh3.googleusercontent.com/d/1ABC123_EXEMPLE_ID_IMAGE_CLAIRE_3"
            ]
        }
    ];
    
    document.getElementById('json-input').value = JSON.stringify(exampleData, null, 2);
    validateJSON();
}

/**
 * Valide le JSON saisi par l'utilisateur
 */
function validateJSON() {
    const jsonInput = document.getElementById('json-input').value.trim();
    const statusDiv = document.getElementById('json-status');
    
    if (!jsonInput) {
        statusDiv.innerHTML = '';
        return;
    }
    
    try {
        const data = JSON.parse(jsonInput);
        const validation = validateGameData(data);
        
        if (validation.valid) {
            statusDiv.innerHTML = `
                <div class="status-success">
                    ✅ JSON valide ! 
                    <strong>${validation.stats.totalPeople} personnes</strong>, 
                    <strong>${validation.stats.totalPhotos} photos</strong> au total.
                </div>
            `;
        } else {
            statusDiv.innerHTML = `
                <div class="status-error">
                    ❌ Erreurs détectées :<br>
                    ${validation.errors.map(error => `• ${error}`).join('<br>')}
                </div>
            `;
        }
        
    } catch (error) {
        statusDiv.innerHTML = `
            <div class="status-error">
                ❌ JSON invalide : ${error.message}
            </div>
        `;
    }
}

/**
 * Chiffre les données avec le mot de passe fourni
 */
function encryptData() {
    const jsonInput = document.getElementById('json-input').value.trim();
    const passwordInput = document.getElementById('password-input').value.trim();
    const outputTextarea = document.getElementById('encrypted-output');
    const copyBtn = document.getElementById('copy-btn');
    
    // Vérifications préliminaires
    if (!jsonInput) {
        alert('Veuillez saisir les données JSON à chiffrer');
        document.getElementById('json-input').focus();
        return;
    }
    
    if (!passwordInput) {
        alert('Veuillez saisir un mot de passe pour le chiffrement');
        document.getElementById('password-input').focus();
        return;
    }
    
    if (passwordInput.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères pour une sécurité minimale');
        document.getElementById('password-input').focus();
        return;
    }
    
    try {
        // Parser et valider les données JSON
        const data = JSON.parse(jsonInput);
        const validation = validateGameData(data);
        
        if (!validation.valid) {
            alert('Données invalides :\n' + validation.errors.join('\n'));
            return;
        }
        
        // Chiffrer les données
        const encryptedData = encrypt(data, passwordInput);
        
        // Générer le code JavaScript complet
        const jsCode = generateEncryptedDataFile(encryptedData, validation.stats);
        
        // Afficher le résultat
        outputTextarea.value = jsCode;
        copyBtn.style.display = 'block';
        
        // Scroll vers le résultat
        outputTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Message de succès
        showSuccessMessage(validation.stats);
        
    } catch (error) {
        alert('Erreur lors du chiffrement : ' + error.message);
        console.error('Erreur de chiffrement:', error);
    }
}

/**
 * Génère le fichier JavaScript complet avec les données chiffrées
 */
function generateEncryptedDataFile(encryptedData, stats) {
    const timestamp = new Date().toISOString();
    
    return `/**
 * Données chiffrées pour le jeu "Qui est-ce ?"
 * 
 * Généré le: ${timestamp}
 * Personnes: ${stats.totalPeople}
 * Photos: ${stats.totalPhotos}
 * 
 * IMPORTANT: Ne partagez jamais ce fichier avec le mot de passe !
 */

// Données du jeu chiffrées
const ENCRYPTED_GAME_DATA = "${encryptedData}";

// Informations sur les données (non sensibles)
const GAME_INFO = {
    totalPeople: ${stats.totalPeople},
    totalPhotos: ${stats.totalPhotos},
    generatedAt: "${timestamp}",
    version: "1.0"
};

// Vérification de l'intégrité (optionnel)
if (typeof decrypt === 'undefined') {
    console.error('Erreur: Fonctions de déchiffrement non trouvées. Vérifiez que crypto.js est bien chargé.');
}`;
}

/**
 * Affiche un message de succès après chiffrement
 */
function showSuccessMessage(stats) {
    // Créer un élément de notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        ✅ Données chiffrées avec succès !<br>
        <small>${stats.totalPeople} personnes • ${stats.totalPhotos} photos</small>
    `;
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Supprimer après 4 secondes
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }, 4000);
}

/**
 * Copie le contenu dans le presse-papiers
 */
async function copyToClipboard() {
    const outputTextarea = document.getElementById('encrypted-output');
    const copyBtn = document.getElementById('copy-btn');
    
    try {
        await navigator.clipboard.writeText(outputTextarea.value);
        
        // Feedback visuel
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copié !';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#28a745';
        }, 2000);
        
    } catch (error) {
        // Fallback pour les navigateurs plus anciens
        outputTextarea.select();
        document.execCommand('copy');
        
        copyBtn.textContent = '✅ Copié !';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copier';
        }, 2000);
    }
}

/**
 * Validation en temps réel du JSON
 */
document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('json-input');
    if (jsonInput) {
        // Validation automatique avec un délai pour éviter les validations trop fréquentes
        let validationTimeout;
        jsonInput.addEventListener('input', function() {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(validateJSON, 500);
        });
    }
    
    // Validation du mot de passe
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const minLength = 6;
            
            // Supprimer les indicateurs précédents
            let indicator = this.parentNode.querySelector('.password-strength');
            if (indicator) {
                indicator.remove();
            }
            
            if (password.length > 0) {
                indicator = document.createElement('div');
                indicator.className = 'password-strength';
                indicator.style.cssText = `
                    margin-top: 5px;
                    font-size: 0.8rem;
                    padding: 5px;
                    border-radius: 4px;
                `;
                
                if (password.length < minLength) {
                    indicator.style.background = '#fff3cd';
                    indicator.style.color = '#856404';
                    indicator.textContent = `⚠️ Mot de passe trop court (${password.length}/${minLength} caractères minimum)`;
                } else if (password.length < 10) {
                    indicator.style.background = '#d4edda';
                    indicator.style.color = '#155724';
                    indicator.textContent = '✅ Mot de passe acceptable';
                } else {
                    indicator.style.background = '#d1ecf1';
                    indicator.style.color = '#0c5460';
                    indicator.textContent = '🔒 Mot de passe fort';
                }
                
                this.parentNode.appendChild(indicator);
            }
        });
    }
});