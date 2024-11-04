"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
var env_1 = require("@utils/env");
function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        fetch("".concat(env_1.NEXT_PUBLIC_BACKEND_URL, "/api/boot"));
    }
}
