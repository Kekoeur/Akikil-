/**
 * Fonctions de chiffrement et déchiffrement
 * Utilise un algorithme XOR simple avec encodage Base64
 */

/**
 * Chiffre des données JSON avec un mot de passe
 * @param {Object} data - Les données à chiffrer
 * @param {string} password - Le mot de passe de chiffrement
 * @returns {string} - Les données chiffrées en Base64
 */
function encrypt(data, password) {
    try {
        // Convertir les données en chaîne JSON
        const jsonString = JSON.stringify(data);
        let encrypted = '';
        
        // Chiffrement XOR avec le mot de passe
        for (let i = 0; i < jsonString.length; i++) {
            encrypted += String.fromCharCode(
                jsonString.charCodeAt(i) ^ password.charCodeAt(i % password.length)
            );
        }
        
        // Encoder en Base64
        return btoa(encrypted);
    } catch (error) {
        throw new Error('Erreur lors du chiffrement: ' + error.message);
    }
}

/**
 * Déchiffre des données avec un mot de passe
 * @param {string} encryptedData - Les données chiffrées en Base64
 * @param {string} password - Le mot de passe de déchiffrement
 * @returns {Object} - Les données déchiffrées
 */
function decrypt(encryptedData, password) {
    try {
        // Décoder de Base64
        const encrypted = atob(encryptedData);
        let decrypted = '';
        
        // Déchiffrement XOR avec le mot de passe
        for (let i = 0; i < encrypted.length; i++) {
            decrypted += String.fromCharCode(
                encrypted.charCodeAt(i) ^ password.charCodeAt(i % password.length)
            );
        }
        
        // Parser le JSON
        return JSON.parse(decrypted);
    } catch (error) {
        throw new Error('Déchiffrement échoué - mot de passe incorrect ou données corrompues');
    }
}

/**
 * Génère une clé de hachage simple pour validation
 * @param {string} password - Le mot de passe
 * @returns {string} - Hash simple du mot de passe
 */
function simpleHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir en 32-bit integer
    }
    return hash.toString(36);
}

/**
 * Valide le format des données avant chiffrement
 * @param {Array} data - Les données à valider
 * @returns {Object} - Résultat de la validation
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
                // Valider chaque URL de photo
                person.photos.forEach((photo, photoIndex) => {
                    if (typeof photo !== 'string' || photo.trim() === '') {
                        result.valid = false;
                        result.errors.push(`Personne ${index + 1}, photo ${photoIndex + 1}: URL invalide`);
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