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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GillieApi = void 0;
const crypto_1 = require("crypto");
const axios_1 = require("axios");
/**
 * GillieApi class
 */
class GillieApi {
    constructor(config) {
        this.config = config;
        /**
         * Create GillieApi with configuration
         * containing publicKey and privateKey
         * and optional host name
         *
         * @param config - configuration of the API
         */
        this.isBrowser = false; // Public just for testing
        if (!this.config.host) {
            this.config.host = "https://gillie.io";
        }
        if (!this.config.publicKey) {
            throw new Error("Configuration must contain at least public key");
        }
        this.isBrowser = (new Function("try {return this===window;}catch(e){ return false;}"))();
    }
    /**
     * Get data from gillie
     *
     * @param url - Url without host - example: "/api/datapoints"
     * @param params - Query parameters
     */
    get(url, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.execute({ url: url, params: params, method: 'get' });
        });
    }
    /**
     * Post data to gillie
     *
     * @param url
     * @param data
     * @param params
     */
    post(url, data, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.execute({ url: url, params: params, data: data, method: 'post' });
        });
    }
    /**
     * Call delete method in gillie
     *
     * @param url
     * @param params
     */
    delete(url, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.execute({ url: url, params: params, method: 'delete' });
        });
    }
    /**
     * Execute method with axios type parameters in one structure
     *
     * @param request
     */
    execute(request) {
        return __awaiter(this, void 0, void 0, function* () {
            request.url = this.config.host + request.url;
            request.params = this.addParams(request.params);
            request.paramsSerializer = {
                indexes: null // array indexes format (null - no brackets, false (default) - empty brackets, true - brackets with indexes)
            };
            if (request.method === "delete") {
                request.headers = {
                    'Access-Control-Allow-Origin': '*',
                    'X-Requested-With': 'XMLHttpRequest'
                };
            }
            else {
                request.headers = {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'X-Requested-With': 'XMLHttpRequest'
                };
            }
            return (yield (0, axios_1.default)(request)).data;
        });
    }
    hex(buff) {
        return [].map.call(new Uint8Array(buff), (b) => ('00' + b.toString(16)).slice(-2)).join('');
    }
    /**
     * Insert apikey to http parameters. Insert following parameters:
     * apisalt, apihash and apikey.
     *
     * This is an internal call, but if requests
     *
     * @param params : Url query parameters
     */
    addParams(params) {
        if (!params) {
            params = {};
        }
        // If no privatekey - dont use hashcodes
        if (!this.config.privateKey) {
            this.addParam(params, "apikey", this.config.publicKey);
            params.apikey = this.config.publicKey;
            return params;
        }
        params.apisalt = Math.round((new Date().getTime() / 1000)).toString(); // Unix time in seconds
        // node.js and browsers have different crypto apis
        if (this.isBrowser) {
            const encoder = new TextEncoder();
            const data = encoder.encode(this.config.privateKey + this.config.publicKey + params.apisalt);
            this.addParam(params, "apihash", this.hex(window.crypto.subtle.digest('SHA-256', data)));
        }
        else {
            this.addParam(params, "apihash", (0, crypto_1.createHash)('sha256')
                .update(this.config.privateKey + this.config.publicKey + params.apisalt)
                .digest('hex'));
        }
        this.addParam(params, "apikey", this.config.publicKey);
        return params;
    }
    addParam(params, name, value) {
        if (params instanceof URLSearchParams) {
            params.append(name, value);
        }
        else {
            params[name] = value;
        }
    }
}
exports.GillieApi = GillieApi;
