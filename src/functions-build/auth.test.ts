import {
  decodeAuthHeader,
  parseAuthHeader,
  extractUser,
  isUserAuthentic
} from "./auth"
import * as dotenv from "dotenv"
import * as http from "http"
import { getAuthHeaderValue, REALM } from "./modules/helpers";

dotenv.config()

const AUTH_ENDPOINT = "http://localhost:9000/.netlify/functions/auth"
const alphaNums =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
const randomString = (length?: number, str = "") =>
  length === undefined
    ? randomString(Math.floor(Math.random() * 60) + 4)
    : length === 0
    ? str
    : randomString(
        length - 1,
        `${str}${alphaNums.charAt(
          Math.floor(Math.random() * alphaNums.length)
        )}`
      )

const getAuthHeader = (
  user: string = randomString(),
  password: string = randomString()
) => {
  const encode = `${user}:${password}`
  const b64encode = Buffer.from(encode).toString("base64")
  const authHeaderValue = `Basic ${b64encode}`

  return authHeaderValue
}

describe("auth unit tests", () => {
  test("parseAuthHeader parses header", () => {
    const userIn = randomString()
    const passwordIn = randomString()
    const { user, password } = parseAuthHeader(`${userIn}:${passwordIn}`)
    expect(userIn).toBe(user)
    expect(passwordIn).toBe(password)
  })
  test("authenticate test user", () => {
    const user = process.env.TEST_USER_NAME
    const password = process.env.TEST_USER_PASSWORD
    const encode = `${user}:${password}`
    const b64encode = Buffer.from(encode).toString("base64")
    const authHeaderValue = `Basic ${b64encode}`

    const isAuth = isUserAuthentic(authHeaderValue)
    expect(isAuth).toBe(true)
  })
})

describe("decodeAuth", () => {
  const user = randomString()
  const password = randomString()
  const encode = `${user}:${password}`
  const b64encode = Buffer.from(encode).toString("base64")
  const authHeaderValue = `Basic ${b64encode}`
  test("decodeAuthHeader decodes auth header", () => {
    const decode = decodeAuthHeader(authHeaderValue)
    expect(decode).toBe(encode)
  })

  test("extractUser extracts user", () => {
    const userExtracted = extractUser(authHeaderValue)
    expect(userExtracted).toBe(user)
  })

  test("getAuthHeaderValue returns undefined with no Authorization header", () => {
    const emptyAuthValue = getAuthHeaderValue({})
    expect(emptyAuthValue).toBeUndefined()
  })
})

describe("auth API endpoint", () => {
  const getAuth = () =>
    new Promise<http.IncomingMessage>((resolve, reject) => {
      http.get(AUTH_ENDPOINT, res => resolve(res))
    })

  const sendAuth = (u: any, p: any) =>
    new Promise<http.IncomingMessage>((resolve, reject) => {
      const options: http.RequestOptions = {
        headers: {
          Authorization: getAuthHeader(u, p)
        }
      }

      http.get(AUTH_ENDPOINT, options, res => resolve(res))
    })

  test(`auth endpoint is served at ${AUTH_ENDPOINT}`, done =>
    getAuth().then(() => done()))

  test("auth endpoint serves www-authenticate header", done =>
    getAuth().then((res: http.IncomingMessage) => {
      expect(res.headers["www-authenticate"]).toBe(
        `Basic realm="${REALM}", charset="UTF-8"`
      )
      done()
    }))

  test("auth endpoint without Authorization returns 401", done =>
    getAuth().then(response => {
      expect(response.statusCode).toBe(401)
      done()
    }))

  test("auth endpoint with correct Authorization returns 200", done =>
    sendAuth(process.env.TEST_USER_NAME, process.env.TEST_USER_PASSWORD).then(
      resp => {
        expect(resp.statusCode).toBe(200)
        resp.on("data", () => {
          done()
        })
      }
    ))

  test("auth endpoint with incorrect Authorization returns 403", done =>
    sendAuth(randomString(), randomString()).then(resp => {
      expect(resp.statusCode).toBe(403)
      done()
    }))
})
