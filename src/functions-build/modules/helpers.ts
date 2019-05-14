const AUTHORIZATION_HEADER = 'Authorization'
const BEARER_SCHEME = 'Bearer'
const BASIC_SCHEME = 'Basic'
const hasHeader = (headers:{[header:string]:string}, header:string) => Object.keys(headers).some(h => h.toLowerCase() === header.toLowerCase() && headers[h] !== undefined)
const getHeader = (headers:{[header:string]:string}, header:string) => Object.keys(headers).find(h => h.toLowerCase() === header.toLowerCase())
const getHeaderValue = (headers:{[header:string]:string}, header:string) => headers[getHeader(headers, header)] 
const parseAuthHeaderValue = (authHeaderValue:string, spaceIndex?:number):{scheme:string, credentials:string} => spaceIndex === undefined? parseAuthHeaderValue(authHeaderValue, authHeaderValue.indexOf(' ')):({scheme:authHeaderValue.slice(0, spaceIndex), credentials:authHeaderValue.slice(spaceIndex + 1)})
export const REALM = "Access to restricted resources"
export const nowPlusMinutes = (minutes:number):number => new Date(new Date().valueOf() + minutes * 60 * 1000).valueOf()
/** nowPlusMinutes returns the numericDate `minutes` from now */
export const getAuthHeaderValue = (headers:{[header:string]:string}):string | undefined => getHeaderValue(headers, AUTHORIZATION_HEADER)
export const getAuthCredentials = (authHeaderValue:string) => parseAuthHeaderValue(authHeaderValue).credentials
export const hasBasicScheme = (headers:{[header:string]:string}, parse?:{scheme:string, credentials:string}) => parse === undefined? hasHeader(headers, AUTHORIZATION_HEADER)? hasBasicScheme(headers, parseAuthHeaderValue(getHeaderValue(headers, AUTHORIZATION_HEADER))) : false : parse.scheme.toLowerCase() === BASIC_SCHEME.toLowerCase()
export const hasBearerScheme = (headers:{[header:string]:string}, parse?:{scheme:string, credentials:string}) => parse === undefined? hasHeader(headers, AUTHORIZATION_HEADER)? hasBearerScheme(headers, parseAuthHeaderValue(getHeaderValue(headers, AUTHORIZATION_HEADER))) : false : parse.scheme.toLowerCase() === BEARER_SCHEME.toLowerCase() 
export interface Event {
    path: string
    httpMethod: string
    queryStringParameters: {[parameter:string]:string}
    headers: {[header:string]:string}
    body: string
    isBase64Encoded: boolean
}