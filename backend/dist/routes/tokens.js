"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// GET /api/tokens - Get all tokens with usage data
router.get('/', async (req, res) => {
    res.json({
        success: true,
        data: [],
        message: 'Token endpoints coming soon'
    });
});
exports.default = router;
//# sourceMappingURL=tokens.js.map