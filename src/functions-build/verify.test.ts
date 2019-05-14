import * as http from "http"
import * as dotenv from 'dotenv'
import * as jwt from 'jsonwebtoken'

const VERIFY_ENDPOINT = "http://localhost:9000/.netlify/functions/verify"

dotenv.config() 
const getVerify = () =>
    new Promise<http.IncomingMessage>((resolve, reject) => {
      http.get(VERIFY_ENDPOINT, res => resolve(res))
    })


const sendAuth = ( token:string = process.env.TEST_USER_BEARER_TOKEN) =>
    new Promise<http.IncomingMessage>((resolve, reject) => {
      const options: http.RequestOptions = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      http.get(VERIFY_ENDPOINT, options, resolve)
    })

describe("'verify' API endpoint", () => {
    test(`'verify' endpoint ${VERIFY_ENDPOINT} with no Bearer returns 401`, done =>
      getVerify().then((res) => {
        expect(res.statusCode).toBe(401)
        done();
      }));

  test(`'verify' with valid token returns 200`, done =>
    sendAuth().then((res) => {
      expect(res.statusCode).toBe(200)
      done()
    }))

  test(`'verify' rejects an expired token`, done => {
      const token = jwt.sign({user:"user", exp:(new Date(0).valueOf())}, process.env.JWT_SECRET)

      sendAuth(token).then((res) => {
        expect(res.statusCode).toBe(403)
        done()
      })

  })
})
