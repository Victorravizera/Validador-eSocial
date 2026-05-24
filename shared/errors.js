"use strict";
/**
 * Hierarquia de erros de domínio.
 *
 * Regra: NUNCA retorne stack traces ou detalhes internos ao cliente.
 * O handler global do Fastify converte esses erros em respostas HTTP seguras.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BatchTooLargeError = exports.InvalidEventIdError = exports.ValidationError = exports.AppError = void 0;
exports.isOperationalError = isOperationalError;
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(message, code, statusCode) {
        var _this = _super.call(this, message) || this;
        _this.name = _this.constructor.name;
        _this.code = code;
        _this.statusCode = statusCode;
        _this.isOperational = true; // erros operacionais não crasham o processo
        Error.captureStackTrace(_this, _this.constructor);
        return _this;
    }
    return AppError;
}(Error));
exports.AppError = AppError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message) {
        return _super.call(this, message, "VALIDATION_ERROR", 422) || this;
    }
    return ValidationError;
}(AppError));
exports.ValidationError = ValidationError;
var InvalidEventIdError = /** @class */ (function (_super) {
    __extends(InvalidEventIdError, _super);
    function InvalidEventIdError(eventId) {
        return _super.call(this, "Evento n\u00E3o suportado: ".concat(eventId), "INVALID_EVENT_ID", 400) || this;
    }
    return InvalidEventIdError;
}(AppError));
exports.InvalidEventIdError = InvalidEventIdError;
var BatchTooLargeError = /** @class */ (function (_super) {
    __extends(BatchTooLargeError, _super);
    function BatchTooLargeError(max) {
        return _super.call(this, "Batch excede o limite de ".concat(max, " eventos por requisi\u00E7\u00E3o"), "BATCH_TOO_LARGE", 400) || this;
    }
    return BatchTooLargeError;
}(AppError));
exports.BatchTooLargeError = BatchTooLargeError;
var UnauthorizedError = /** @class */ (function (_super) {
    __extends(UnauthorizedError, _super);
    function UnauthorizedError(message) {
        if (message === void 0) { message = "Não autorizado"; }
        return _super.call(this, message, "UNAUTHORIZED", 401) || this;
    }
    return UnauthorizedError;
}(AppError));
exports.UnauthorizedError = UnauthorizedError;
var ForbiddenError = /** @class */ (function (_super) {
    __extends(ForbiddenError, _super);
    function ForbiddenError(message) {
        if (message === void 0) { message = "Acesso negado"; }
        return _super.call(this, message, "FORBIDDEN", 403) || this;
    }
    return ForbiddenError;
}(AppError));
exports.ForbiddenError = ForbiddenError;
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(resource) {
        return _super.call(this, "".concat(resource, " n\u00E3o encontrado"), "NOT_FOUND", 404) || this;
    }
    return NotFoundError;
}(AppError));
exports.NotFoundError = NotFoundError;
/**
 * Verifica se o erro é operacional (esperado) ou inesperado (bug).
 * Erros inesperados devem acionar alertas no Sentry/PagerDuty.
 */
function isOperationalError(err) {
    return err instanceof AppError && err.isOperational;
}
