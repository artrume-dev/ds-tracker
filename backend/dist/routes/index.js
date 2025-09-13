"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tokens_1 = __importDefault(require("./tokens"));
const teams_1 = __importDefault(require("./teams"));
const applications_1 = __importDefault(require("./applications"));
const scans_1 = __importDefault(require("./scans"));
const dashboard_1 = __importDefault(require("./dashboard"));
const auth_1 = __importDefault(require("./auth"));
const notifications_1 = __importDefault(require("./notifications"));
const changeRequests_1 = __importDefault(require("./changeRequests"));
const email_1 = __importDefault(require("./email"));
const subscriptions_1 = __importDefault(require("./subscriptions"));
const router = (0, express_1.Router)();
// API Routes
router.use('/auth', auth_1.default);
router.use('/tokens', tokens_1.default);
router.use('/teams', teams_1.default);
router.use('/applications', applications_1.default);
router.use('/scans', scans_1.default);
router.use('/dashboard', dashboard_1.default);
router.use('/notifications', notifications_1.default);
router.use('/change-requests', changeRequests_1.default);
router.use('/email', email_1.default);
router.use('/subscriptions', subscriptions_1.default);
// API Info endpoint
router.get('/', (req, res) => {
    res.json({
        name: 'Design Tokens Usage Tracker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tokens: '/api/tokens',
            teams: '/api/teams',
            applications: '/api/applications',
            scans: '/api/scans',
            dashboard: '/api/dashboard',
            notifications: '/api/notifications',
            changeRequests: '/api/change-requests',
            email: '/api/email',
            subscriptions: '/api/subscriptions'
        }
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map