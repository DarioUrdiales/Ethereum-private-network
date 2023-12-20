const crypto = require('crypto');

/**
 * Función para generar una contraseña aleatoria
 * @param {number} length Longitud de la contraseña resultante
 * @returns 
 */
const generatePassword = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let password = '';

    for (let i = 0; i < length; i++) {
    //Se podria usar Math.random() pero en teoria el modulo crypto es mejor
    const randomIndex = crypto.randomInt(charset.length);
    password += charset[randomIndex];
    }

    return password;
} 

/**
 * Genera una lista aleatoria de números IPs únicos del 10 al 255
 * @param {number} length Número de IPs ha generar
 * @returns Array de IPs    
 */
const generateIpList = (length) => {
    const ipList = []
    for (let i = 0; i < length; i++) {
        let randomIp
        do {
            randomIp = crypto.randomInt(10, 255)
        } while (ipList.includes(randomIp));    
        ipList.push(randomIp) 
    }
    return ipList
}

module.exports = {generatePassword, generateIpList}