"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAPICorsHeaders = void 0;
var server_1 = require("next/server");
var handleAPICorsHeaders = function (url, origin) {
    if (url.pathname.startsWith('/api/')) {
        var response = server_1.NextResponse.next();
        if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        return response;
    }
    return null;
};
exports.handleAPICorsHeaders = handleAPICorsHeaders;
