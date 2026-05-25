"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const index_js_1 = require("./config/index.js");
exports.logger = (0, pino_1.default)({
    level: "debug",
    redact: {
        paths: [
            "password", "senha", "token", "accessToken", "refreshToken",
            "apiKey", "authorization", "cookie",
            "*.password", "*.senha", "*.token", "*.cpf", "*.cpfTrab", "*.nmTrab",
            "req.headers.authorization", "req.headers.cookie",
        ],
        censor: "[REDACTED]",
    },
    base: {
        service: "esocial-qa-api",
        env: index_js_1.config.server.env,
    },
    serializers: {
        err: (err) => ({
            type: err.constructor.name,
            message: err.message,
            stack: err.stack,
        }),
    },
});
