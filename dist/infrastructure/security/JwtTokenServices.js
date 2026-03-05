"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtTokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../../config/index,");
class JwtTokenService {
    generate(payload) {
        const options = {
            expiresIn: index_1.config.JWT_EXPIRES_IN,
        };
        return jsonwebtoken_1.default.sign(payload, index_1.config.JWT_SECRET, options);
    }
    generateRefreshToken(payload) {
        const options = {
            expiresIn: index_1.config.JWT_REFRESH_EXPIRES_IN,
        };
        return jsonwebtoken_1.default.sign(payload, index_1.config.JWT_REFRESH_SECRET, options);
    }
    verify(token) {
        try {
            return jsonwebtoken_1.default.verify(token, index_1.config.JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, index_1.config.JWT_REFRESH_SECRET);
        }
        catch (error) {
            return null;
        }
    }
}
exports.JwtTokenService = JwtTokenService;
