import { Handler, Context, Callback } from "aws-lambda";
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'

const AUTHORIZATION = 'Authorization'

dotenv.config() 
// dotenv.config() extracts secret constants from .env file as fields of the global `process.env` object


export const handler: Handler = ( event: Event, context: Context, callback: Callback) => {
  switch (event.httpMethod.toUpperCase()) {
    case "GET": handleGet(event, callback); break; 
    default: callback(null, buildResponse( `Method ${event.httpMethod} not supported`, 405)); break;
  }
};

export const decodeAuthHeader = (authHeaderValue) => Buffer.from(authHeaderValue.slice(6), 'base64').toString()
/** decodeAuthHeader expects a string of the form `Basic someBase64String==` and returns its plaintext decode */
export const parseAuthHeader = (plainText:string, colonIndex?:number):{user:string, password:string} => colonIndex === undefined? parseAuthHeader(plainText, plainText.indexOf(':')) : ({user:plainText.slice(0,colonIndex),password:plainText.slice(colonIndex+1)}) 
/** parseAuthHeader expects a string of the form `user:password` and returns an object of the form {user, password} */
export const extractUser = (authHeaderValue) => [decodeAuthHeader, parseAuthHeader].reduce((acc,func) =>func(acc), authHeaderValue)['user']
/** extractUser expects a string of the form `Basic someBase64String==` and returns the user name */
const authenticateUser = ({ user, password }): boolean => user === process.env.TEST_USER_NAME && hash(password) === process.env.TEST_USER_HASHED_PASSWORD; 
/** authenticateUser expects an object {user, password} and returns true if the user exists and the password matches the user. */
export const isUserAuthentic = (authHeaderValue) => [decodeAuthHeader, parseAuthHeader, authenticateUser].reduce((acc,func) => func(acc), authHeaderValue)
/** isUserAuthentic expects authHeaderValue and returns true if the user exists and the password matches the user */

const handleGet = (event:Event, callback:Callback) => {

  const isBasicAuth = hasBasicAuth(event.headers) 

  if (!isBasicAuth) callback(null, buildResponse( `Unauthenticated`, 401, {...HEADERS, ...AUTHENTICATE_HEADER}))
  else {
    const authHeaderValue = getHeaderValue(event.headers, AUTHORIZATION)
    const isAuthentic = isUserAuthentic(authHeaderValue)

    if (isAuthentic) {
      const user = extractUser(authHeaderValue)
      const token = jwt.sign({user:user}, process.env.JWT_SECRET)
      callback(null, buildResponse(token))
    }
    else callback(null, buildResponse( `Invalid username / password combination`, 403, {...HEADERS, ...AUTHENTICATE_HEADER}))
  }
}

const hasHeader = (headers:{[header:string]:string}, header:string) => Object.keys(headers).some(h => h.toLowerCase() === header.toLowerCase() && headers[h] !== undefined);
const getHeader = (headers:{[header:string]:string}, header:string) => Object.keys(headers).find(h => h.toLowerCase() === header.toLowerCase())
const getHeaderValue = (headers:{[header:string]:string}, header:string) => headers[getHeader(headers, header)] 
const parseAuthHeaderValue = (authHeaderValue:string, spaceIndex?:number):{scheme:string, credentials:string} => spaceIndex === undefined? parseAuthHeaderValue(authHeaderValue, authHeaderValue.indexOf(' ')):({scheme:authHeaderValue.slice(0, spaceIndex), credentials:authHeaderValue.slice(spaceIndex + 1)})
const hasBasicAuth = (headers:{[header:string]:string}, parse?:{scheme:string, credentials:string}) => parse === undefined? hasHeader(headers, AUTHORIZATION)? hasBasicAuth(headers, parseAuthHeaderValue(getHeaderValue(headers, AUTHORIZATION))) : false : parse.scheme.toLowerCase() === 'basic'

const buildResponse = ( message: string, statusCode: number = 200, headers = HEADERS) => ({ statusCode, headers, body: JSON.stringify({ message }) });

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
};

const AUTHENTICATE_HEADER = { "WWW-Authenticate":'Basic realm="Access to restricted content", charset="UTF-8"' }

const hash = (password:string) => crypto.createHmac('sha256', process.env.HASH_KEY).update(password).digest('hex');

interface Event {
    path: string;
    httpMethod: string;
    queryStringParameters: {[parameter:string]:string};
    headers: {[header:string]:string};
    body: string;
    isBase64Encoded: boolean;
}
