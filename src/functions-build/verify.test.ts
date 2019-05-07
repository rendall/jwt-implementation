import * as http from "http";
import * as dotenv from 'dotenv'

const VERIFY_ENDPOINT = "http://localhost:9000/.netlify/functions/verify";

dotenv.config() 
const getVerify = () =>
    new Promise<http.IncomingMessage>((resolve, reject) => {
      http.get(VERIFY_ENDPOINT, res => resolve(res));
    });


const sendAuth = () =>
    new Promise<http.IncomingMessage>((resolve, reject) => {
      const options: http.RequestOptions = {
        headers: {
          Authorization: `Bearer ${process.env.TEST_USER_BEARER_TOKEN}`
        }
      };

      http.get(VERIFY_ENDPOINT, options, res => resolve(res));
    });

describe("'verify' API endpoint", () => {
    test(`'verify' endpoint is served at ${VERIFY_ENDPOINT}`, done =>
    getVerify().then(() => done()));

  test(`'verify' with token returns 200`, done =>
    sendAuth().then((res) => {
      expect(res.statusCode).toBe(200)
      done();
    }));
});
