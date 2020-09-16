/**
 * Configuration for keys
 */
export interface GillieConfiguration {
    publicKey: string;
    privateKey: string;
    host: string;
}
import { AxiosResponse } from 'axios';
/**
 * GillieApi class
 */
export declare class GillieApi {
    private config;
    /**
     * Create GillieApi with configuration
     * containing publicKey and privateKey
     * and optional host name
     *
     * @param config - configuration of the API
     */
    private isBrowser;
    constructor(config: GillieConfiguration);
    /**
     * Get data from gillie
     *
     * @param url - Url without host - example: "/api/datapoints"
     * @param params - Query parameters
     */
    get(url: string, params: any): Promise<AxiosResponse<any>>;
    /**
     * Post data to gillie
     *
     * @param url
     * @param data
     * @param params
     */
    post(url: string, data: any, params: any): Promise<AxiosResponse<any>>;
    /**
     * Call delete method in gillie
     *
     * @param url
     * @param params
     */
    delete(url: string, params: any): Promise<AxiosResponse<any>>;
    /**
     * Execute method with axios type parameters in one structure
     *
     * @param request
     */
    execute(request: any): Promise<AxiosResponse<any>>;
    hex(buff: any): string;
    /**
     * Insert apikey to http parameters. Insert following parameters:
     * apisalt, apihash and apikey.
     *
     * This is an internal call, but if requests
     *
     * @param params : Url query parameters
     */
    addParams(params: any): any;
    private addParam;
}
