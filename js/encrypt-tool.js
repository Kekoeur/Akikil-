/**
 * Logique principale pour le générateur d'images chiffrées
 */

// Variables globales
let gameData = [];
let selectedImages = new Map();

/**
 * Remplit le champ JSON avec un exemple
 */
function fillExample() {
    const exampleData = [
        {
            "name": "Christopher",
            "photos": [
                "/images/images/images.webp"
            ]
        },
        {
            "name": "Théo",
            "photos": [
                "/images/images/images-2.webp"
            ]
        },
        {
            "name": "Ioann",
            "photos": [
                "/images/images/images-3.webp"
            ]
        },
        {
            "name": "Nathan",
            "photos": [
                "/images/images/images-4.webp"
            ]
        },
        {
            "name": "Bryan",
            "photos": [
                "/images/images/images-5.webp"
            ]
        }
    ];
    
    document.getElementById('json-input').value = JSON.stringify(exampleData, null, 4);
    validateJSON();
}

/**
 * Valide le JSON saisi par l'utilisateur
 */
function validateJSON() {
    const input = document.getElementById('json-input').value.trim();
    const status = document.getElementById('json-status');
    
    if (!input) {
        status.innerHTML = '';
        gameData = [];
        checkGenerateButton();
        return false;
    }
    
    try {
        const data = JSON.parse(input);
        
        if (!Array.isArray(data)) {
            throw new Error('Le JSON doit être un tableau');
        }

        let totalPeople = 0;
        let totalPhotos = 0;
        const requiredImages = new Set();

        data.forEach(person => {
            if (!person.name || !person.photos || !Array.isArray(person.photos)) {
                throw new Error(`Format invalide pour la personne: ${JSON.stringify(person)}`);
            }

            totalPeople++;
            person.photos.forEach(photo => {
                totalPhotos++;
                // Extraire le nom de fichier du chemin
                const filename = photo.split('/').pop();
                requiredImages.add(filename);
            });
        });

        gameData = data;

        const statsHtml = `
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${totalPeople}</div>
                    <div class="stat-label">Personnes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalPhotos}</div>
                    <div class="stat-label">Photos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${requiredImages.size}</div>
                    <div class="stat-label">Fichiers requis</div>
                </div>
            </div>
        `;

        status.innerHTML = `
            <div class="status status-success">
                ✅ JSON valide !
            </div>
            ${statsHtml}
            <div class="info">
                <strong>Fichiers d'images requis :</strong><br>
                ${Array.from(requiredImages).join(', ')}
            </div>
        `;

        checkGenerateButton();
        return true;

    } catch (error) {
        status.innerHTML = `<div class="status status-error">❌ Erreur: ${error.message}</div>`;
        gameData = [];
        checkGenerateButton();
        return false;
    }
}

/**
 * Gère la sélection des fichiers images
 */
function handleImageSelection() {
    const fileInput = document.getElementById('image-files');
    const status = document.getElementById('image-status');
    const files = fileInput.files;

    selectedImages.clear();

    if (files.length === 0) {
        status.innerHTML = '';
        checkGenerateButton();
        return;
    }

    // Créer une map des fichiers sélectionnés
    for (let file of files) {
        selectedImages.set(file.name, file);
    }

    // Vérifier la correspondance avec le JSON
    if (gameData.length > 0) {
        const requiredImages = new Set();
        gameData.forEach(person => {
            person.photos.forEach(photo => {
                const filename = photo.split('/').pop();
                requiredImages.add(filename);
            });
        });

        const selectedFileNames = new Set(selectedImages.keys());
        const missing = Array.from(requiredImages).filter(img => !selectedFileNames.has(img));
        const extra = Array.from(selectedFileNames).filter(img => !requiredImages.has(img));

        let statusHtml = `
            <div class="status ${missing.length === 0 ? 'status-success' : 'status-warning'}">
                📁 ${files.length} fichiers sélectionnés
            </div>
        `;

        if (missing.length > 0) {
            statusHtml += `
                <div class="status status-error">
                    ❌ Fichiers manquants : ${missing.join(', ')}
                </div>
            `;
        }

        if (extra.length > 0) {
            statusHtml += `
                <div class="status status-warning">
                    ⚠️ Fichiers non utilisés : ${extra.join(', ')}
                </div>
            `;
        }

        status.innerHTML = statusHtml;
    } else {
        status.innerHTML = `
            <div class="status status-success">
                📁 ${files.length} fichiers sélectionnés
            </div>
        `;
    }

    checkGenerateButton();
}

/**
 * Vérifie si le bouton de génération peut être activé
 */
function checkGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    const hasValidJSON = gameData.length > 0;
    const hasImages = selectedImages.size > 0;
    const passwordInput = document.getElementById('password-input').value.trim();

    generateBtn.disabled = !(hasValidJSON && hasImages && passwordInput.length >= 6);
}

/**
 * Génère le jeu complet avec images chiffrées
 */
async function generateGame() {
    const password = document.getElementById('password-input').value.trim();
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const status = document.getElementById('generation-status');
    const generateBtn = document.getElementById('generate-btn');

    // Vérifications préliminaires
    if (!validateJSON()) {
        status.innerHTML = '<div class="status status-error">❌ JSON invalide</div>';
        return;
    }

    if (selectedImages.size === 0) {
        status.innerHTML = '<div class="status status-error">❌ Aucune image sélectionnée</div>';
        return;
    }

    if (password.length < 6) {
        status.innerHTML = '<div class="status status-error">❌ Mot de passe trop court (minimum 6 caractères)</div>';
        return;
    }

    // Vérifier que toutes les images requises sont présentes
    const requiredImages = new Set();
    gameData.forEach(person => {
        person.photos.forEach(photo => {
            const filename = photo.split('/').pop();
            requiredImages.add(filename);
        });
    });

    const missingImages = Array.from(requiredImages).filter(img => !selectedImages.has(img));
    if (missingImages.length > 0) {
        status.innerHTML = `<div class="status status-error">❌ Images manquantes: ${missingImages.join(', ')}</div>`;
        return;
    }

    // Désactiver le bouton et afficher la progression
    generateBtn.disabled = true;
    progressContainer.style.display = 'block';
    
    try {
        // Étape 1: Préparer les données
        progressFill.style.width = '10%';
        progressText.textContent = 'Préparation des données...';
        await new Promise(resolve => setTimeout(resolve, 500));

        // Créer les données avec images chiffrées
        const gameDataWithImages = [];
        let processedImages = 0;
        const totalImages = gameData.reduce((sum, person) => sum + person.photos.length, 0);

        for (const person of gameData) {
            const personData = {
                name: person.name,
                photos: []
            };

            for (const photoPath of person.photos) {
                const filename = photoPath.split('/').pop();
                const imageFile = selectedImages.get(filename);

                if (!imageFile) {
                    throw new Error(`Image manquante: ${filename}`);
                }

                // Lire l'image et la convertir en base64
                const base64Image = await fileToBase64(imageFile);
                
                // Chiffrer l'image
                const encryptedImage = encrypt(base64Image, password);
                
                personData.photos.push(encryptedImage);
                processedImages++;

                // Mettre à jour la progression
                const progress = 10 + (processedImages / totalImages) * 70;
                progressFill.style.width = progress + '%';
                progressText.textContent = `Traitement des images... ${processedImages}/${totalImages}`;
                
                // Petit délai pour la fluidité de l'interface
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            gameDataWithImages.push(personData);
        }

        // Étape 2: Chiffrer les données complètes
        progressFill.style.width = '85%';
        progressText.textContent = 'Chiffrement final...';
        await new Promise(resolve => setTimeout(resolve, 500));

        const encryptedGameData = encrypt(gameDataWithImages, password);

        // Étape 3: Générer le code JavaScript
        progressFill.style.width = '95%';
        progressText.textContent = 'Génération du code...';
        await new Promise(resolve => setTimeout(resolve, 300));

        const jsCode = generateJavaScriptCode(encryptedGameData, {
            totalPeople: gameData.length,
            totalPhotos: totalImages
        });

        // Afficher le résultat
        document.getElementById('output-data').value = jsCode;
        document.getElementById('copy-btn').style.display = 'block';

        progressFill.style.width = '100%';
        progressText.textContent = 'Terminé !';

        status.innerHTML = `
            <div class="status status-success">
                ✅ Jeu généré avec succès !<br>
                <small>Toutes les images sont maintenant chiffrées et intégrées dans le code.</small>
            </div>
        `;

        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 2000);

    } catch (error) {
        status.innerHTML = `<div class="status status-error">❌ Erreur: ${error.message}</div>`;
        progressContainer.style.display = 'none';
    } finally {
        generateBtn.disabled = false;
    }
}

/**
 * Génère le code JavaScript complet avec les données chiffrées
 */
function generateJavaScriptCode(encryptedData, stats) {
    const timestamp = new Date().toISOString();
    
    return `/**
 * Données chiffrées pour le jeu "Qui est-ce ?" avec images intégrées
 * 
 * Généré le: ${timestamp}
 * Personnes: ${stats.totalPeople}
 * Photos: ${stats.totalPhotos}
 * 
 * IMPORTANT: Ne partagez jamais ce fichier avec le mot de passe !
 * Les images sont chiffrées et intégrées - aucun fichier externe requis.
 */

// Données du jeu chiffrées (avec images)
const ENCRYPTED_GAME_DATA = "${encryptedData}";

// Informations sur les données (non sensibles)
const GAME_INFO = {
    totalPeople: ${stats.totalPeople},
    totalPhotos: ${stats.totalPhotos},
    generatedAt: "${timestamp}",
    version: "2.0",
    hasEmbeddedImages: true
};

// Vérification de l'intégrité
if (typeof ENCRYPTED_GAME_DATA === 'undefined') {
    console.error('Erreur: Données du jeu non trouvées.');
}`;
}

/**
 * Copie le contenu dans le presse-papiers
 */
async function copyToClipboard() {
    const output = document.getElementById('output-data');
    const copyBtn = document.getElementById('copy-btn');
    
    try {
        await navigator.clipboard.writeText(output.value);
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copié !';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#28a745';
        }, 2000);
        
    } catch (error) {
        output.select();
        document.execCommand('copy');
        
        copyBtn.textContent = '✅ Copié !';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copier';
        }, 2000);
    }
}

// Événements et initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Validation en temps réel du JSON
    const jsonInput = document.getElementById('json-input');
    if (jsonInput) {
        let validationTimeout;
        jsonInput.addEventListener('input', function() {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(validateJSON, 500);
        });

        // Auto-validation lors du collage
        jsonInput.addEventListener('paste', function() {
            setTimeout(validateJSON, 100);
        });
    }

    // Validation du mot de passe en temps réel
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkGenerateButton();
            
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