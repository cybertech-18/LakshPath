"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("./config/env"));
const app_1 = __importDefault(require("./app"));
const server = app_1.default.listen(env_1.default.PORT, () => {
    console.log(`LakshPath API listening on port ${env_1.default.PORT}`);
});
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`⚠️  Port ${env_1.default.PORT} is already in use. Please stop the other process or set PORT to a different value.`);
        process.exit(1);
    }
    console.error('Server error:', error);
    process.exit(1);
});
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        process.exit(0);
    });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
