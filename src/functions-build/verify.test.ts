import * as http from "http";
// Jest 'async is complete' function

const VERIFY_ENDPOINT = "http://localhost:9000/.netlify/functions/verify";

describe("verify API endpoint", () => {
  const getVerify = () =>
    new Promise<http.IncomingMessage>((resolve, reject) => {
      http.get(VERIFY_ENDPOINT, res => resolve(res));
    });

  test(`verify endpoint is served at ${VERIFY_ENDPOINT}`, done =>
    getVerify().then(() => done()));

});
