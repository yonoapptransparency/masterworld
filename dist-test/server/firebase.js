"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRawFirebaseConfig = getRawFirebaseConfig;
exports.getAdminSdkDiagnostics = getAdminSdkDiagnostics;
exports.getFirebaseAdminDb = getFirebaseAdminDb;
exports.convertToFirestoreValue = convertToFirestoreValue;
exports.convertToFirestoreFields = convertToFirestoreFields;
exports.writeFirestoreRestDoc = writeFirestoreRestDoc;
exports.deleteFirestoreRestDoc = deleteFirestoreRestDoc;
exports.toFirestoreValue = toFirestoreValue;
exports.toFirestoreDocument = toFirestoreDocument;
exports.parseFirestoreValue = parseFirestoreValue;
exports.parseFirestoreFields = parseFirestoreFields;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var crypto_1 = require("./crypto");
// Service account parsing helper supporting raw JSON, base64, objects, double-escaped newlines, and quotes
function parseServiceAccount(rawInput) {
    if (!rawInput)
        return null;
    // If already parsed as object by runtime or framework
    if (typeof rawInput === 'object') {
        if (rawInput.private_key || rawInput.client_email || rawInput.project_id) {
            if (rawInput.private_key && typeof rawInput.private_key === 'string') {
                rawInput.private_key = rawInput.private_key.replace(/\\n/g, '\n');
            }
            return rawInput;
        }
    }
    if (typeof rawInput !== 'string')
        return null;
    var str = rawInput.trim();
    while ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        str = str.slice(1, -1).trim();
    }
    var tryValidate = function (obj) {
        if (typeof obj === 'string') {
            try {
                obj = JSON.parse(obj);
            }
            catch (e) { }
        }
        if (obj && typeof obj === 'object') {
            if (obj.private_key || obj.client_email || obj.project_id) {
                if (obj.private_key && typeof obj.private_key === 'string') {
                    obj.private_key = obj.private_key.replace(/\\n/g, '\n');
                }
                return obj;
            }
        }
        return null;
    };
    // 1. Direct JSON parse
    try {
        var parsed = tryValidate(JSON.parse(str));
        if (parsed)
            return parsed;
    }
    catch (e) { }
    // 2. Unescape newlines / escaped control characters
    try {
        var unescaped = str.replace(/\\n/g, '\n').replace(/\r/g, '');
        var parsed = tryValidate(JSON.parse(unescaped));
        if (parsed)
            return parsed;
    }
    catch (e) { }
    // 3. Replace literal raw newlines inside strings
    try {
        var sanitized = str.replace(/\n/g, '\\n').replace(/\r/g, '');
        var parsed = tryValidate(JSON.parse(sanitized));
        if (parsed)
            return parsed;
    }
    catch (e) { }
    // 4. Base64 decoded JSON parse
    try {
        var decoded = Buffer.from(str, 'base64').toString('utf8').trim();
        var parsed = tryValidate(JSON.parse(decoded));
        if (parsed)
            return parsed;
    }
    catch (e) { }
    throw new Error('Invalid JSON format in Service Account variable');
}
var cachedRawFirebaseConfig = null;
function getRawFirebaseConfig() {
    if (cachedRawFirebaseConfig) {
        return cachedRawFirebaseConfig;
    }
    var getValidEnv = function (val1, val2, val3) {
        for (var _i = 0, _a = [val1, val2, val3]; _i < _a.length; _i++) {
            var val = _a[_i];
            if ((0, crypto_1.isRealValue)(val))
                return val;
        }
        return "";
    };
    var envProjectId = getValidEnv(process.env.VITE_FIREBASE_PROJECT_ID, process.env.VITE_FIREBASE_JECT_ID, process.env.FIREBASE_PROJECT_ID);
    var envDbId = getValidEnv(process.env.VITE_FIREBASE_DATABASE_ID, process.env.VITE_FIREBASE_BASE_ID, process.env.FIREBASE_DATABASE_ID);
    var envApiKey = getValidEnv(process.env.VITE_FIREBASE_API_KEY, process.env.FIREBASE_API_KEY, process.env.API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    var envAuthDomain = getValidEnv(process.env.VITE_FIREBASE_AUTH_DOMAIN, process.env.VITE_FIREBASE_DOMAIN, process.env.FIREBASE_AUTH_DOMAIN);
    var envAppId = getValidEnv(process.env.VITE_FIREBASE_APP_ID, process.env.FIREBASE_APP_ID);
    var envStorageBucket = getValidEnv(process.env.VITE_FIREBASE_STORAGE_BUCKET, process.env.FIREBASE_STORAGE_BUCKET);
    var envMessagingSenderId = getValidEnv(process.env.VITE_FIREBASE_MESSAGING_ID, process.env.FIREBASE_MESSAGING_SENDER_ID);
    var fileConfig = {};
    try {
        fileConfig = require('../../firebase-applet-config.json');
    }
    catch (err) {
        // Proceed
    }
    var DEFAULT_FALLBACK_API_KEY = "AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok";
    var finalApiKey = envApiKey || fileConfig.apiKey || DEFAULT_FALLBACK_API_KEY;
    var resolveDbId = function (rawDbId, pId) {
        if (!rawDbId || !(0, crypto_1.isRealValue)(rawDbId) || rawDbId === pId || rawDbId === '(default)') {
            return '(default)';
        }
        return rawDbId;
    };
    // 1. Check environment variables first
    if (envProjectId) {
        cachedRawFirebaseConfig = {
            projectId: envProjectId,
            appId: envAppId || fileConfig.appId,
            apiKey: finalApiKey,
            authDomain: envAuthDomain || fileConfig.authDomain,
            firestoreDatabaseId: resolveDbId(envDbId || fileConfig.firestoreDatabaseId || fileConfig.databaseId, envProjectId),
            storageBucket: envStorageBucket || fileConfig.storageBucket,
            messagingSenderId: envMessagingSenderId || fileConfig.messagingSenderId
        };
        return cachedRawFirebaseConfig;
    }
    // 2. Try firebase-applet-config.json
    if (fileConfig.projectId && (0, crypto_1.isRealValue)(fileConfig.projectId)) {
        fileConfig.firestoreDatabaseId = resolveDbId(fileConfig.firestoreDatabaseId || fileConfig.databaseId || envDbId, fileConfig.projectId);
        fileConfig.apiKey = finalApiKey;
        cachedRawFirebaseConfig = fileConfig;
        return fileConfig;
    }
    // 3. Fallback configuration
    var defaultProjectId = "gen-lang-client-0825832493";
    var defaultDbId = "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";
    cachedRawFirebaseConfig = {
        projectId: defaultProjectId,
        appId: envAppId || "1:103973989874:web:733a6afd8e837224900f6b",
        apiKey: finalApiKey,
        authDomain: envAuthDomain || "gen-lang-client-0825832493.firebaseapp.com",
        firestoreDatabaseId: resolveDbId(envDbId || defaultDbId, defaultProjectId),
        storageBucket: envStorageBucket || "gen-lang-client-0825832493.firebasestorage.app",
        messagingSenderId: envMessagingSenderId || "103973989874"
    };
    return cachedRawFirebaseConfig;
}
var cachedAdminDb = null;
var lastAdminSdkStatusMsg = "";
function getAdminSdkDiagnostics() {
    if (cachedAdminDb) {
        return { active: true, message: lastAdminSdkStatusMsg || "Admin SDK initialized and active" };
    }
    return { active: false, message: lastAdminSdkStatusMsg || "Admin SDK inactive" };
}
function getFirebaseAdminDb() {
    var _a, _b;
    if (cachedAdminDb)
        return cachedAdminDb;
    try {
        var admin = require('firebase-admin');
        var config = getRawFirebaseConfig();
        if (admin.apps.length === 0) {
            var serviceAccountRaw = null;
            var detectedVarName = "";
            var possibleEnvVars = [
                'FIREBASE_SERVICE_ACCOUNT',
                'FIREBASE_ACCOUNT',
                'FIREBASE_SERVICE_ACCOUNT_JSON',
                'FIREBASE_CREDENTIALS',
                'FIREBASE_ADMIN_KEY',
                'FIREBASE_SECRET',
                'SERVICE_ACCOUNT_JSON',
                'SERVICE_ACCOUNT',
                'GCP_SERVICE_ACCOUNT',
                'GOOGLE_SERVICE_ACCOUNT'
            ];
            for (var _i = 0, possibleEnvVars_1 = possibleEnvVars; _i < possibleEnvVars_1.length; _i++) {
                var envName = possibleEnvVars_1[_i];
                if (process.env[envName] && String(process.env[envName]).trim() !== '') {
                    serviceAccountRaw = process.env[envName];
                    detectedVarName = envName;
                    break;
                }
            }
            // Fallback to local service-account.json file
            if (!serviceAccountRaw) {
                var localCredPath = path_1.default.join(process.cwd(), 'service-account.json');
                if (fs_1.default.existsSync(localCredPath)) {
                    serviceAccountRaw = fs_1.default.readFileSync(localCredPath, 'utf8');
                    detectedVarName = 'service-account.json (local)';
                }
            }
            if (serviceAccountRaw) {
                try {
                    var serviceAccount = parseServiceAccount(serviceAccountRaw);
                    if (!serviceAccount) {
                        lastAdminSdkStatusMsg = "Found ".concat(detectedVarName, ", but parsing returned null");
                        return null;
                    }
                    // CRITICAL: Always use the projectId from the service account if it exists
                    var targetProjectId = serviceAccount.project_id || (config === null || config === void 0 ? void 0 : config.projectId);
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        projectId: targetProjectId
                    });
                    lastAdminSdkStatusMsg = "Initialized successfully for project ".concat(targetProjectId, " using ").concat(detectedVarName);
                    console.log("[Admin SDK] Initialized for ".concat(targetProjectId, " using ").concat(detectedVarName));
                }
                catch (parseErr) {
                    lastAdminSdkStatusMsg = "Failed parsing ".concat(detectedVarName, ": ").concat(parseErr.message);
                    console.error("[Admin SDK] Failed to parse ".concat(detectedVarName, ":"), parseErr.message);
                    return null;
                }
            }
            else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                admin.initializeApp({ projectId: config === null || config === void 0 ? void 0 : config.projectId });
                lastAdminSdkStatusMsg = "Initialized using GOOGLE_APPLICATION_CREDENTIALS";
                console.log('[Admin SDK] Initialized with GOOGLE_APPLICATION_CREDENTIALS.');
            }
            else {
                lastAdminSdkStatusMsg = "No Service Account variable found on server. Looked for FIREBASE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT, etc.";
                console.warn('[Admin SDK] No service account env var found. Admin SDK in REST fallback mode.');
                return null;
            }
        }
        // Determine the correct Database ID
        var envDbId = (config === null || config === void 0 ? void 0 : config.firestoreDatabaseId) || (config === null || config === void 0 ? void 0 : config.databaseId) || process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID;
        var defaultAiStudioDbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
        var dbId = defaultAiStudioDbId;
        if (envDbId && envDbId.trim() !== '' && envDbId !== '(default)' && envDbId !== 'gen-lang-client-0825832493') {
            dbId = envDbId;
        }
        if (dbId && dbId !== '(default)') {
            var getFirestore = require('firebase-admin/firestore').getFirestore;
            cachedAdminDb = getFirestore(admin.apps[0], dbId);
        }
        else {
            cachedAdminDb = admin.firestore();
        }
        var activeProjectId = ((_b = (_a = admin.apps[0]) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.projectId) || 'gen-lang-client-0825832493';
        console.log("[Admin SDK] Firestore initialized for project: ".concat(activeProjectId, ", database: ").concat(dbId));
        return cachedAdminDb;
    }
    catch (err) {
        lastAdminSdkStatusMsg = "Initialization thrown exception: ".concat(err.message || err);
        console.warn('[Admin SDK] Initialization failed:', err.message || err);
        return null;
    }
}
function convertToFirestoreValue(val) {
    if (val === null || val === undefined)
        return { nullValue: null };
    if (typeof val === 'boolean')
        return { booleanValue: val };
    if (typeof val === 'number') {
        if (Number.isInteger(val))
            return { integerValue: String(val) };
        return { doubleValue: val };
    }
    if (typeof val === 'string')
        return { stringValue: val };
    if (Array.isArray(val)) {
        return {
            arrayValue: {
                values: val.map(function (item) { return convertToFirestoreValue(item); })
            }
        };
    }
    if (typeof val === 'object') {
        var fields = {};
        for (var _i = 0, _a = Object.entries(val); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            if (v !== undefined) {
                fields[k] = convertToFirestoreValue(v);
            }
        }
        return { mapValue: { fields: fields } };
    }
    return { stringValue: String(val) };
}
function convertToFirestoreFields(obj) {
    var fields = {};
    if (!obj || typeof obj !== 'object')
        return fields;
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], k = _b[0], v = _b[1];
        if (v !== undefined) {
            fields[k] = convertToFirestoreValue(v);
        }
    }
    return fields;
}
function writeFirestoreRestDoc(docId_1, data_1, authToken_1) {
    return __awaiter(this, arguments, void 0, function (docId, data, authToken, merge) {
        var config, dbId, queryParams_1, queryString, url, fields, headers, res, errText, err_1;
        if (merge === void 0) { merge = true; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    config = getRawFirebaseConfig();
                    if (!config || !config.projectId) {
                        console.warn("[SERVER] Cannot write REST doc ".concat(docId, ": Missing project ID"));
                        return [2 /*return*/, false];
                    }
                    dbId = config.firestoreDatabaseId || config.databaseId || '(default)';
                    queryParams_1 = [];
                    if (config.apiKey)
                        queryParams_1.push("key=".concat(encodeURIComponent(config.apiKey)));
                    if (merge && data && typeof data === 'object') {
                        Object.keys(data).forEach(function (key) {
                            queryParams_1.push("updateMask.fieldPaths=".concat(encodeURIComponent(key)));
                        });
                    }
                    queryString = queryParams_1.length > 0 ? "?".concat(queryParams_1.join('&')) : '';
                    url = "https://firestore.googleapis.com/v1/projects/".concat(config.projectId, "/databases/").concat(dbId, "/documents/store_data/").concat(docId).concat(queryString);
                    fields = convertToFirestoreFields(data);
                    headers = { 'Content-Type': 'application/json' };
                    if (authToken && authToken.trim() !== '') {
                        headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : "Bearer ".concat(authToken);
                    }
                    return [4 /*yield*/, fetch(url, {
                            method: 'PATCH',
                            headers: headers,
                            body: JSON.stringify({ fields: fields })
                        })];
                case 1:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.text()];
                case 2:
                    errText = _a.sent();
                    console.warn("[SERVER] writeFirestoreRestDoc failed for store_data/".concat(docId, " (HTTP ").concat(res.status, "):"), errText);
                    return [2 /*return*/, false];
                case 3:
                    console.log("[SERVER] writeFirestoreRestDoc successfully written store_data/".concat(docId));
                    return [2 /*return*/, true];
                case 4:
                    err_1 = _a.sent();
                    console.error("[SERVER] writeFirestoreRestDoc exception for ".concat(docId, ":"), err_1.message || err_1);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function deleteFirestoreRestDoc(docId, authToken) {
    return __awaiter(this, void 0, void 0, function () {
        var config, dbId, apiKeyParam, url, headers, res, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    config = getRawFirebaseConfig();
                    if (!config || !config.projectId)
                        return [2 /*return*/, false];
                    dbId = config.firestoreDatabaseId || config.databaseId || '(default)';
                    apiKeyParam = config.apiKey ? "?key=".concat(config.apiKey) : '';
                    url = "https://firestore.googleapis.com/v1/projects/".concat(config.projectId, "/databases/").concat(dbId, "/documents/store_data/").concat(docId).concat(apiKeyParam);
                    headers = {};
                    if (authToken && authToken.trim() !== '') {
                        headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : "Bearer ".concat(authToken);
                    }
                    return [4 /*yield*/, fetch(url, {
                            method: 'DELETE',
                            headers: headers
                        })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res.ok];
                case 2:
                    err_2 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function toFirestoreValue(val) {
    if (val === null || val === undefined)
        return { nullValue: null };
    if (typeof val === 'boolean')
        return { booleanValue: val };
    if (typeof val === 'number') {
        if (Number.isInteger(val))
            return { integerValue: val.toString() };
        return { doubleValue: val };
    }
    if (typeof val === 'string')
        return { stringValue: val };
    if (Array.isArray(val)) {
        return {
            arrayValue: {
                values: val.map(function (item) { return toFirestoreValue(item); })
            }
        };
    }
    if (typeof val === 'object') {
        var fields = {};
        for (var _i = 0, _a = Object.keys(val); _i < _a.length; _i++) {
            var k = _a[_i];
            fields[k] = toFirestoreValue(val[k]);
        }
        return { mapValue: { fields: fields } };
    }
    return { stringValue: String(val) };
}
function toFirestoreDocument(obj) {
    var fields = {};
    if (obj && typeof obj === 'object') {
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var k = _a[_i];
            fields[k] = toFirestoreValue(obj[k]);
        }
    }
    return { fields: fields };
}
function parseFirestoreValue(val) {
    var _a, _b;
    if (!val || typeof val !== 'object')
        return val !== null && val !== void 0 ? val : null;
    if ('stringValue' in val)
        return val.stringValue;
    if ('booleanValue' in val)
        return val.booleanValue;
    if ('integerValue' in val)
        return parseInt(val.integerValue, 10);
    if ('doubleValue' in val)
        return parseFloat(val.doubleValue);
    if ('timestampValue' in val)
        return val.timestampValue;
    if ('nullValue' in val)
        return null;
    if ('mapValue' in val) {
        var fields = ((_a = val.mapValue) === null || _a === void 0 ? void 0 : _a.fields) || {};
        var res = {};
        for (var _i = 0, _c = Object.keys(fields); _i < _c.length; _i++) {
            var key = _c[_i];
            res[key] = parseFirestoreValue(fields[key]);
        }
        return res;
    }
    if ('arrayValue' in val) {
        var values = ((_b = val.arrayValue) === null || _b === void 0 ? void 0 : _b.values) || [];
        return values.map(function (v) { return parseFirestoreValue(v); });
    }
    return null;
}
function parseFirestoreFields(fields) {
    if (!fields || typeof fields !== 'object')
        return {};
    var res = {};
    for (var _i = 0, _a = Object.keys(fields); _i < _a.length; _i++) {
        var key = _a[_i];
        res[key] = parseFirestoreValue(fields[key]);
    }
    return res;
}
