"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
var node_crypto_1 = require("node:crypto");
var index_js_1 = require("../../infra/db/index.js");
var tenant_repository_js_1 = require("../tenant/tenant.repository.js");
var apikey_repository_js_1 = require("./apikey.repository.js");
var index_js_2 = require("../../../../../config/index.js");
var errors_js_1 = require("../../../../../shared/errors.js");
var logger_js_1 = require("../../../../../shared/logger.js");
exports.AuthService = {
    register: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var db, existing, tenant, _a, hash, salt, plainKey;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        db = (0, index_js_1.getDb)();
                        return [4 /*yield*/, db(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      SELECT id FROM tenant_users WHERE email = ", " LIMIT 1\n    "], ["\n      SELECT id FROM tenant_users WHERE email = ", " LIMIT 1\n    "])), input.email)];
                    case 1:
                        existing = (_c.sent())[0];
                        if (existing)
                            throw new errors_js_1.AppError("E-mail já cadastrado", "VALIDATION_ERROR", 409);
                        return [4 /*yield*/, tenant_repository_js_1.TenantRepository.create({ name: input.tenantName, plan: (_b = input.plan) !== null && _b !== void 0 ? _b : "starter" })];
                    case 2:
                        tenant = _c.sent();
                        _a = hashPassword(input.password), hash = _a.hash, salt = _a.salt;
                        return [4 /*yield*/, db(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      INSERT INTO tenant_users (tenant_id, email, password_hash, password_salt)\n      VALUES (", ", ", ", ", ", ", ")\n    "], ["\n      INSERT INTO tenant_users (tenant_id, email, password_hash, password_salt)\n      VALUES (", ", ", ", ", ", ", ")\n    "])), tenant.id, input.email, hash, salt)];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, apikey_repository_js_1.ApiKeyRepository.create(tenant.id, "Default Key")];
                    case 4:
                        plainKey = (_c.sent()).plainKey;
                        logger_js_1.logger.info({ tenantId: tenant.id, plan: tenant.plan }, "auth:registered");
                        return [2 /*return*/, { tenantId: tenant.id, apiKey: plainKey }];
                }
            });
        });
    },
    login: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var db, user, dummySalt, candidateHash, storedHash, valid, _a, token, expiresIn;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        db = (0, index_js_1.getDb)();
                        return [4 /*yield*/, db(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      SELECT tenant_id AS \"tenantId\", password_hash AS \"passwordHash\", password_salt AS \"passwordSalt\"\n      FROM tenant_users WHERE email = ", " LIMIT 1\n    "], ["\n      SELECT tenant_id AS \"tenantId\", password_hash AS \"passwordHash\", password_salt AS \"passwordSalt\"\n      FROM tenant_users WHERE email = ", " LIMIT 1\n    "])), input.email)];
                    case 1:
                        user = (_d.sent())[0];
                        dummySalt = (0, node_crypto_1.randomBytes)(16).toString("hex");
                        candidateHash = deriveKey(input.password, (_b = user === null || user === void 0 ? void 0 : user.passwordSalt) !== null && _b !== void 0 ? _b : dummySalt);
                        storedHash = (_c = user === null || user === void 0 ? void 0 : user.passwordHash) !== null && _c !== void 0 ? _c : (0, node_crypto_1.randomBytes)(32).toString("hex");
                        valid = user !== undefined &&
                            (0, node_crypto_1.timingSafeEqual)(Buffer.from(candidateHash, "hex"), Buffer.from(storedHash, "hex"));
                        if (!valid)
                            throw new errors_js_1.UnauthorizedError("Credenciais inválidas");
                        _a = issueJwt(user.tenantId), token = _a.token, expiresIn = _a.expiresIn;
                        logger_js_1.logger.info({ tenantId: user.tenantId }, "auth:login");
                        return [2 /*return*/, { tenantId: user.tenantId, accessToken: token, expiresIn: expiresIn }];
                }
            });
        });
    },
};
function hashPassword(password) {
    var salt = (0, node_crypto_1.randomBytes)(16).toString("hex");
    return { hash: deriveKey(password, salt), salt: salt };
}
function deriveKey(password, salt) {
    return (0, node_crypto_1.pbkdf2Sync)(password, salt, 100000, 32, "sha256").toString("hex");
}
var JWT_EXPIRES_SECONDS = 15 * 60;
function issueJwt(tenantId) {
    var header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    var now = Math.floor(Date.now() / 1000);
    var payload = Buffer.from(JSON.stringify({ sub: tenantId, iat: now, exp: now + JWT_EXPIRES_SECONDS })).toString("base64url");
    var sig = (0, node_crypto_1.createHmac)("sha256", index_js_2.config.auth.jwtSecret).update("".concat(header, ".").concat(payload)).digest("base64url");
    return { token: "".concat(header, ".").concat(payload, ".").concat(sig), expiresIn: JWT_EXPIRES_SECONDS };
}
var templateObject_1, templateObject_2, templateObject_3;
