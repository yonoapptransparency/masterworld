"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRealValue = exports.B64_FALLBACK = void 0;
exports.getRawFirebaseConfig = getRawFirebaseConfig;
exports.parseFirestoreValue = parseFirestoreValue;
exports.parseFirestoreDoc = parseFirestoreDoc;
exports.getSafeFirebaseConfig = getSafeFirebaseConfig;
exports.B64_FALLBACK = "ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0K";
var cachedRawFirebaseConfig = null;
var isRealValue = function (id) {
    if (!id)
        return false;
    var clean = id.trim();
    if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY'))
        return false;
    if (clean.length > 20 && (clean.includes('#') || clean.includes('!') || clean.includes('@')))
        return false;
    return true;
};
exports.isRealValue = isRealValue;
function getRawFirebaseConfig() {
    if (cachedRawFirebaseConfig) {
        return cachedRawFirebaseConfig;
    }
    try {
        var config = require('../../firebase-applet-config.json');
        if (config.projectId && (0, exports.isRealValue)(config.projectId)) {
            config.firestoreDatabaseId = config.firestoreDatabaseId || config.databaseId || process.env.VITE_FIREBASE_DATABASE_ID;
            config.apiKey = config.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
            cachedRawFirebaseConfig = config;
            return config;
        }
    }
    catch (err) { }
    var envProjectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    var envDbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID;
    var envApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    if (envProjectId && (0, exports.isRealValue)(envProjectId)) {
        cachedRawFirebaseConfig = {
            projectId: envProjectId,
            appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
            apiKey: envApiKey,
            authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
            firestoreDatabaseId: envDbId || '(default)',
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID
        };
        return cachedRawFirebaseConfig;
    }
    try {
        var cleanB64 = exports.B64_FALLBACK.replace(/[^A-Za-z0-9+/=]/g, "");
        var fallbackConfig = JSON.parse(Buffer.from(cleanB64, 'base64').toString('utf8'));
        if (fallbackConfig && fallbackConfig.projectId && (0, exports.isRealValue)(fallbackConfig.projectId)) {
            cachedRawFirebaseConfig = fallbackConfig;
            return fallbackConfig;
        }
    }
    catch (_) { }
    throw new Error('Firebase configuration not found and no environment variables set.');
}
function parseFirestoreValue(value) {
    if (!value)
        return null;
    if ('stringValue' in value)
        return value.stringValue;
    if ('integerValue' in value)
        return parseInt(value.integerValue, 10);
    if ('doubleValue' in value)
        return parseFloat(value.doubleValue);
    if ('booleanValue' in value)
        return value.booleanValue;
    if ('arrayValue' in value) {
        var list = value.arrayValue.values || [];
        return list.map(function (item) { return parseFirestoreValue(item); });
    }
    if ('mapValue' in value) {
        var fields = value.mapValue.fields || {};
        var obj = {};
        for (var _i = 0, _a = Object.keys(fields); _i < _a.length; _i++) {
            var key = _a[_i];
            obj[key] = parseFirestoreValue(fields[key]);
        }
        return obj;
    }
    return null;
}
function parseFirestoreDoc(docFields) {
    if (!docFields)
        return {};
    var obj = {};
    for (var _i = 0, _a = Object.keys(docFields); _i < _a.length; _i++) {
        var key = _a[_i];
        obj[key] = parseFirestoreValue(docFields[key]);
    }
    return obj;
}
function getSafeFirebaseConfig() {
    try {
        var config = getRawFirebaseConfig();
        if (!config)
            return null;
        var isApiKeyEmptyOrPlaceholder = !config.apiKey || config.apiKey.trim() === "" || config.apiKey.includes("YOUR_API_KEY");
        if (isApiKeyEmptyOrPlaceholder) {
            return {
                projectId: "placeholder-project-id",
                appId: "placeholder-app-id",
                apiKey: "PLACEHOLDER",
                authDomain: "placeholder-project.firebaseapp.com",
                firestoreDatabaseId: "(default)",
                storageBucket: "placeholder-project.firebasestorage.app",
                messagingSenderId: "000000000",
                measurementId: ""
            };
        }
        return config;
    }
    catch (error) {
        return null;
    }
}
