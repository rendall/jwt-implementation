import { Handler, Context, Callback } from "aws-lambda";
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'

dotenv.config()

export const handler: Handler = ( event: Event, context: Context, callback: Callback) => {
  switch (event.httpMethod.toUpperCase()) {
    case "GET": handleGet(event, callback); break; 
    default: callback(null, buildResponse( `Method ${event.httpMethod} not supported`, 405)); break;
  }
};

const decodeAuthHeader = (headerValue) => Buffer.from(headerValue.slice(6), 'base64').toString()
const parseAuthHeader = (plainText:string, colonIndex?:number):{user:string, password:string} => colonIndex === undefined? parseAuthHeader(plainText, plainText.indexOf(':')) : ({user:plainText.slice(0,colonIndex),password:plainText.slice(colonIndex+1)})

const authenticateUser = (headerValue):boolean => {
    const plainText = decodeAuthHeader(headerValue)
    const {user, password} = parseAuthHeader(plainText)
    return user === 'abc' && hash(password) === process.env.ABC_USER_HASHED_PASSWORD 
}

const handleGet = (event:Event, callback:Callback) => {
  const AUTHORIZATION = 'Authorization'

  const hasBasicAuth = hasHeader(event.headers, AUTHORIZATION)

  if (!hasBasicAuth) callback(null, buildResponse( `Unauthenticated`, 401, {...HEADERS, ...AUTHENTICATE_HEADER}))
  else {
    const isAuthentic = authenticateUser(getHeaderValue(event.headers, AUTHORIZATION) )
    if (isAuthentic) callback(null, buildResponse('OK'))
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
