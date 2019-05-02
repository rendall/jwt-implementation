import { Handler, Context, Callback } from "aws-lambda";
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

export const handler: Handler = ( event: Event, context: Context, callback: Callback) => {
  switch (event.httpMethod.toUpperCase()) {
    case "GET": handleGet(event, callback); break; 
    default: callback(null, buildResponse( `Method ${event.httpMethod} not supported`, 405)); break;
  }
};

const handleGet = (event:Event, callback:Callback) => {
  callback(null, buildResponse( `OK`, 200 ))
}

const buildResponse = ( message: string, statusCode: number = 200, headers = HEADERS) => ({ statusCode, headers, body: JSON.stringify({ message }) });

interface Event {
    path: string;
    httpMethod: string;
    queryStringParameters: {[parameter:string]:string};
    headers: {[header:string]:string};
    body: string;
    isBase64Encoded: boolean;
}