"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUser = void 0;
const User_1 = require("../../../domain/entities/User");
const passwordValidator_1 = require("../../validators/passwordValidator");
class RegisterUser {
    constructor(userRepository, passwordHasher, tokenService, emailService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }
    async execute(data) {
        const passwordValidation = (0, passwordValidator_1.validatePassword)(data.password);
        if (!passwordValidation.isValid) {
            throw new Error(`Contraseña inválida: ${passwordValidation.errors.join(', ')}`);
        }
        this.validateApodo(data.apodo);
        const existingEmail = await this.userRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new Error('El email ya está registrado');
        }
        const existingApodo = await this.userRepository.findByApodo(data.apodo);
        if (existingApodo) {
            throw new Error('El apodo ya está en uso');
        }
        const hashedPassword = await this.passwordHasher.hash(data.password);
        const user = new User_1.User({
            nombres: data.nombres.trim(),
            apellidos: data.apellidos.trim(),
            email: data.email.toLowerCase().trim(),
            password: hashedPassword,
            apodo: data.apodo.trim(),
            avatar: data.avatar,
        });
        const savedUser = await this.userRepository.save(user);
        const token = this.tokenService.generate({
            userId: savedUser.id,
            email: savedUser.email,
            apodo: savedUser.apodo,
            rol: savedUser.rol,
        });
        this.emailService.sendConfirmation(savedUser.email).catch(err => {
            console.error('Error enviando email:', err);
        });
        return {
            user: savedUser.toPublic(),
            token,
        };
    }
    validateApodo(apodo) {
        const palabrasProhibidas = [
            'puto', 'puta', 'idiota', 'estupido', 'mierda', 'carajo',
            'messi', 'ronaldo', 'neymar', 'shakira',
            'trump', 'biden', 'putin', 'maduro', 'petro', 'uribe',
            'nike', 'adidas', 'apple', 'google', 'facebook', 'microsoft'
        ];
        const apodoLower = apodo.toLowerCase();
        for (const palabra of palabrasProhibidas) {
            if (apodoLower.includes(palabra)) {
                throw new Error('El apodo contiene palabras no permitidas');
            }
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(apodo)) {
            throw new Error('El apodo debe tener entre 3 y 20 caracteres alfanuméricos');
        }
    }
}
exports.RegisterUser = RegisterUser;
