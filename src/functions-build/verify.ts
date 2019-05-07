import { Handler, Context, Callback } from "aws-lambda";
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

const BEARER = 'Bearer'
const AUTHORIZATION = 'Authorization'

dotenv.config() 
// dotenv.config() extracts secret constants from .env file as fields of the global `process.env` object

export const handler: Handler = ( event: Event, context: Context, callback: Callback) => {
  switch (event.httpMethod.toUpperCase()) {
    case "GET": handleGet(event, callback); break; 
    default: callback(null, buildResponse( `Method ${event.httpMethod} not supported`, 405)); break;
  }
};

const handleGet = (event:Event, callback:Callback) => {
  //const hasAuthHeader = hasHeader(event.headers, AUTHORIZATION) 
  const isBearer = hasBearerAuth(event.headers)

  if (!isBearer) callback(null, buildResponse( `Unauthenticated`, 401 ))
  else {
    const authHeaderValue = getHeaderValue(event.headers, AUTHORIZATION)
    const token = getToken(authHeaderValue)

    try {
      callback(null, buildResponse(JSON.stringify(jwt.verify(token, process.env.JWT_SECRET)), 200))
    } catch (error) {
      callback(null, buildResponse(error.message, 500))
    }
  }
}

const getHeader = (headers:{[header:string]:string}, header:string) => Object.keys(headers).find(h => h.toLowerCase() === header.toLowerCase())
const hasHeader = (headers:{[header:string]:string}, header:string) => Object.keys(headers).some(h => h.toLowerCase() === header.toLowerCase() && headers[h] !== undefined);
const getHeaderValue = (headers:{[header:string]:string}, header:string) => headers[getHeader(headers, header)] 
const hasBearerAuth = (headers:{[header:string]:string}, parse?:{scheme:string, credentials:string}) => parse === undefined? hasHeader(headers, AUTHORIZATION)? hasBearerAuth(headers, parseAuthHeaderValue(getHeaderValue(headers, AUTHORIZATION))) : false : parse.scheme.toLowerCase() === BEARER.toLowerCase() 
const buildResponse = ( message: string, statusCode: number = 200) => ({ statusCode, body: JSON.stringify({ message }) });
const parseAuthHeaderValue = (authHeaderValue:string, spaceIndex?:number):{scheme:string, credentials:string} => spaceIndex === undefined? parseAuthHeaderValue(authHeaderValue, authHeaderValue.indexOf(' ')):({scheme:authHeaderValue.slice(0, spaceIndex), credentials:authHeaderValue.slice(spaceIndex + 1)})
const getToken = (authHeaderValue:string) => parseAuthHeaderValue(authHeaderValue).credentials

interface Event {
    path: string;
    httpMethod: string;
    queryStringParameters: {[parameter:string]:string};
    headers: {[header:string]:string};
    body: string;
    isBase64Encoded: boolean;
}