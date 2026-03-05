"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmacValidator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../../config/index,");
class HmacValidator {
    constructor() {
        this.secret = index_1.config.HMAC_SECRET;
    }
    sign(payload) {
        const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
        return crypto_1.default
            .createHmac('sha256', this.secret)
            .update(data)
            .digest('hex');
    }
    validate(payload, signature) {
        const expectedSignature = this.sign(payload);
        const expectedBuffer = Buffer.from(expectedSignature);
        const signatureBuffer = Buffer.from(signature);
        if (expectedBuffer.length !== signatureBuffer.length) {
            return false;
        }
        try {
            return crypto_1.default.timingSafeEqual(expectedBuffer, signatureBuffer);
        }
        catch {
            return false;
        }
    }
    validateWithTimestamp(payload, signature, timestamp, maxAgeSeconds = 300) {
        const now = Math.floor(Date.now() / 1000);
        const age = now - timestamp;
        if (age > maxAgeSeconds || age < 0) {
            return false;
        }
        return this.validate(payload, signature);
    }
}
exports.HmacValidator = HmacValidator;
