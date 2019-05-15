# jwt-implementation

This is an example implementation of JSON Web Tokens (JWT) using the [auth0](https://github.com/auth0/node-jsonwebtoken) library. It can be used to experiment with JWTs or as the basis of a more robust authentication server.

It is comprised of an API server written in Node, and a simple HTML/javascript client. The implementation is live here: <https://festive-ritchie-baf641.netlify.com/>

The API is comprised of two endpoints:

* `auth/` accepts a Basic Authorization header and returns a JWT if the username / password combination is valid. The JWT simply claims `{user:<username>}` and expires in 24 hours
* `verify/` accepts a Bearer Authorization header with the token as credential, and returns a `200 OK` response if the token is valid

The client is minimally designed only to send a Basic authorization request header to the auth endpoint, and then use the retrieved token in a Bearer authorization header to the verify endpoint.

## Development instructions

Development files are in `./src` of the form `<filename>.ts`. Their corresponding test ([jest](https://jestjs.io/)) files are named `<filename>.test.ts`

Create a file name `.env` copied from `.env.example`, and fill in the empty variables.

## Deployment instructions

This implementation is built with the expectation of deployment to [Netlify](https://netlify.com). You will need these settings:

* Build & Deploy => Build settings
  * Build command: `yarn run build`
  * Publish directory: `public`
* Environment => Environment variables:
  * `REALM`: `Access to restricted resources`
  * `HASH_KEY`: _the `auth.ts` hash function uses this to encrypt passwords._ [qv. crypto hash](https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/#hashes)
  * `JWT_SECRET`: _the key that the jwt library uses to sign the token_
  * `TEST_USER_NAME`: _any user name_ e.g. 'abc'
  * `TEST_USER_PASSWORD`: _any password_ e.g. '123'
  * `TEST_USER_HASHED_PASSWORD`: _the output of `auth.hash(password)`_