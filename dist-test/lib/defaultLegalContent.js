"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ABOUT_HTML = exports.DEFAULT_NOTICE_HTML = exports.DEFAULT_REPORT_REMOVAL_HTML = exports.DEFAULT_RESPONSIBILITY_HTML = exports.DEFAULT_TERMS_HTML = exports.DEFAULT_PRIVACY_HTML = exports.DEFAULT_ETHICS_HTML = exports.DEFAULT_DISCLAIMER_HTML = void 0;
exports.ensureDefaultSettings = ensureDefaultSettings;
exports.DEFAULT_DISCLAIMER_HTML = "";
exports.DEFAULT_ETHICS_HTML = "";
exports.DEFAULT_PRIVACY_HTML = "";
exports.DEFAULT_TERMS_HTML = "";
exports.DEFAULT_RESPONSIBILITY_HTML = "";
exports.DEFAULT_REPORT_REMOVAL_HTML = "";
exports.DEFAULT_NOTICE_HTML = "";
exports.DEFAULT_ABOUT_HTML = "";
function ensureDefaultSettings(settings) {
    if (settings === void 0) { settings = {}; }
    var s = __assign({}, settings);
    if (s.disclaimer_text === undefined)
        s.disclaimer_text = "";
    if (s.ethics_discrimination_text === undefined)
        s.ethics_discrimination_text = "";
    if (s.privacy_content === undefined)
        s.privacy_content = "";
    if (s.terms_content === undefined)
        s.terms_content = "";
    if (s.responsibility_content === undefined)
        s.responsibility_content = "";
    if (s.report_removal_content === undefined)
        s.report_removal_content = "";
    if (s.important_notice === undefined)
        s.important_notice = "";
    if (s.about_content === undefined)
        s.about_content = "";
    if (s.disclaimer_heading === undefined)
        s.disclaimer_heading = "";
    if (s.ethics_heading === undefined)
        s.ethics_heading = "";
    if (s.portal_heading === undefined)
        s.portal_heading = "";
    if (s.important_notice_heading === undefined)
        s.important_notice_heading = "";
    return s;
}
