/**
 * Configuration for keys
 */
export interface GillieConfiguration {
    publicKey: string;  // Gillie public key
    privateKey: string; // Gillie private key
    host: string;       // Gillie host name
}

import { TextEncoder } from 'text-encoding';
import { createHash } from 'crypto';
import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';

/**
 * GillieApi class
 */
export class GillieApi {
    /**
     * Create GillieApi with configuration
     * containing publicKey and privateKey
     * and optional host name
     * 
     * @param config - configuration of the API
     */
    private isBrowser = false;

    constructor(private config: GillieConfiguration ) {
        if (!this.config.host) {
            this.config.host = "https://gillie.io";
        }
        if (!this.config.publicKey) {
            throw new Error("Configuration must contain at least public key");
        }

        this.isBrowser=(new Function("try {return this===window;}catch(e){ return false;}"))();
    }

    /**
     * Get data from gillie
     * 
     * @param url - Url without host - example: "/api/datapoints"
     * @param params - Query parameters
     */
    async get( url: string , params: any) {
        return await this.execute({url: url, params: params, method: 'get'});
    }
    /**
     * Post data to gillie
     * 
     * @param url 
     * @param data 
     * @param params 
     */

    async post( url: string ,  data:any,params: any) {
        return await this.execute({url:  url, params: params, data: data, method: 'post'});
    }
    /**
     * Call delete method in gillie
     * 
     * @param url 
     * @param params 
     */
    async delete( url: string ,params: any) {
        return await this.execute({url: url, params: params,  method: 'delete'});
    }

    /**
     * Execute method with axios type parameters in one structure 
     * 
     * @param request 
     */

    async execute(request:any) {
        request.url = this.config.host + request.url;
        request.params = this.addParams(request.params);

        request.headers = {
            'Content-Type': 'application/json;',
            'Access-Control-Allow-Origin': '*',
            'X-Requested-With': 'XMLHttpRequest'
        }
        return await axios(request);
    }


    hex (buff:any) {
        return [].map.call(new Uint8Array(buff), 
            (b:any) => ('00' + b.toString(16)).slice(-2)).join('');
    }

    /**
     * Insert apikey to http parameters. Insert following parameters:
     * apisalt, apihash and apikey.
     * 
     * This is an internal call, but if requests  
     * 
     * @param params : Url query parameters
     */
    public addParams(params:any) {
        if (!params) {
            params = {};
        }
        // If no privatekey - dont use hashcodes
        if (!this.config.privateKey) {
            params.apikey = this.config.publicKey;
            return params;
        }
        params.apisalt = Math.round((new Date().getTime() / 1000)).toString(); // Unix time in seconds
        // node.js and browsers have different crypto apis
        if (this.isBrowser) {
            const encoder = new TextEncoder();
            const data = encoder.encode(this.config.privateKey + this.config.publicKey + params.apisalt);
            params.apihash  = this.hex(window.crypto.subtle.digest('SHA-256', data));
        } else {
            params.apihash = createHash('sha256')
            .update(this.config.privateKey + this.config.publicKey + params.apisalt )
            .digest('hex');
        }
        params.apikey = this.config.publicKey;
        return params;
    }
}

