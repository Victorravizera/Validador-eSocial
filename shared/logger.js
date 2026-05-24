"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var pino_1 = require("pino");
var index_js_1 = require("../config/index.js");
exports.logger = (0, pino_1.default)({
    level: index_js_1.config.server.logLevel,
    redact: {
        paths: [
            "password", "senha", "token", "accessToken", "refreshToken",
            "apiKey", "authorization", "cookie",
            "*.password", "*.senha", "*.token", "*.cpf", "*.cpfTrab", "*.nmTrab",
            "req.headers.authorization", "req.headers.cookie",
        ],
        censor: "[REDACTED]",
    },
    transport: index_js_1.config.server.isDev
        ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
        : undefined,
    base: {
        service: "esocial-qa-api",
        env: index_js_1.config.server.env,
    },
    serializers: {
        err: function (err) { return ({
            type: err.constructor.name,
            message: err.message,
            stack: index_js_1.config.server.isDev ? err.stack : undefined,
        }); },
    },
});
