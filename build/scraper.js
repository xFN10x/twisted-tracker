"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = twistedGetDocument;
const ky_1 = __importDefault(require("ky"));
const node_html_parser_1 = __importDefault(require("node-html-parser"));
async function twistedGetDocument(path) {
    const resolved = `${process.env.TWISTED_URL}${path}`;
    try {
        const response = await (0, ky_1.default)(resolved, {
            headers: {
                Cookie: process.env.TWISTED_COOKIE,
            },
        }).text();
        return node_html_parser_1.default.parse(response);
    }
    catch (error) {
        console.log(`Failed to get web-page from ${resolved}. `, error);
        return undefined;
    }
}
