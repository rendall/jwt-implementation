import { Handler, Context, Callback } from "aws-lambda";
import { JWK } from '@panva/jose'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'

dotenv.config()


export const handler: Handler = ( event: Event, context: Context, callback: Callback) => {
  switch (event.httpMethod.toUpperCase()) {
    case "GET": handleGet(event, callback); break; 
    default: callback(null, buildResponse( `Method ${event.httpMethod} not supported`, 405)); break;
  }
};

const getSecretTokenKey = () => {
  const newKey = JWK.generate("EC")
  console.log('key', newKey)
}

const decodeAuthHeader = (authHeaderValue) => Buffer.from(authHeaderValue.slice(6), 'base64').toString()
/** decodeAuthHeader expects a string of the form `Basic someBase64String==` and returns its plaintext decode */
const parseAuthHeader = (plainText:string, colonIndex?:number):{user:string, password:string} => colonIndex === undefined? parseAuthHeader(plainText, plainText.indexOf(':')) : ({user:plainText.slice(0,colonIndex),password:plainText.slice(colonIndex+1)}) 
/** parseAuthHeader expects a string of the form `user:password` and returns an object of the form {user, password} */
const authenticateUser = ({ user, password }): boolean => user === "abc" && hash(password) === process.env.ABC_USER_HASHED_PASSWORD; 
/** authenticateUser expects an object {user, password} and returns true if the user exists and the password matches the user */
const isUserAuthentic = (authHeaderValue) => [decodeAuthHeader, parseAuthHeader, authenticateUser].reduce((acc,func) => func(acc), authHeaderValue)
/** isUserAuthentic expects authHeaderValue and returns true if the user exists and the password matches the user */

const handleGet = (event:Event, callback:Callback) => {
  const AUTHORIZATION = 'Authorization'

  const hasBasicAuth = hasHeader(event.headers, AUTHORIZATION)

  if (!hasBasicAuth) callback(null, buildResponse( `Unauthenticated`, 401, {...HEADERS, ...AUTHENTICATE_HEADER}))
  else {
    const isAuthentic = isUserAuthentic(getHeaderValue(event.headers, AUTHORIZATION))
    if (isAuthentic) {
      getSecretTokenKey()
      callback(null, buildResponse('OK'))
    }
    else callback(null, buildResponse( `Invalid username / password combination`, 401, {...HEADERS, ...AUTHENTICATE_HEADER}))
  }
}

const hasHeader = (headers:{[header:string]:string}, header:string) => Object.keys(headers).some(h => h.toLowerCase() === header.toLowerCase() && headers[h] !== undefined);
const getHeader = (headers:{[header:string]:string}, header:string) => Object.keys(headers).find(h => h.toLowerCase() === header.toLowerCase())
const getHeaderValue = (headers:{[header:string]:string}, header:string) => headers[getHeader(headers, header)] 
const buildResponse = ( message: string, statusCode: number = 200, headers = HEADERS) => ({ statusCode, headers, body: JSON.stringify({ message }) });

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
};

const AUTHENTICATE_HEADER = { "WWW-Authenticate":'Basic realm="foo", charset="UTF-8"' }

const hash = (password:string) => crypto.createHmac('sha256', process.env.HASH_KEY).update(password).digest('hex');

interface Event {
    path: string;
    httpMethod: string;
    queryStringParameters: {[parameter:string]:string};
    headers: {[header:string]:string};
    body: string;
    isBase64Encoded: boolean;
}
