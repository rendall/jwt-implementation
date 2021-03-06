# jwt-implementation

This is an example implementation of authentication by [JSON Web Tokens (JWT)](https://tools.ietf.org/html/rfc7519) using the <https://jwt.io> library.

The user submits a `username` and `password` and receives a token which is used as authentication elsewhere in the API to verify the claim that the user "is" `username`

The project is comprised of a backend API server written in Node, and a simple HTML/javascript frontend client. The implementation is live here: <https://festive-ritchie-baf641.netlify.com/>

The API is comprised of two endpoints:

* `auth/` accepts a [Basic Authorization](https://tools.ietf.org/html/rfc7617) header and returns a JWT if the username / password combination is valid. The JWT simply claims `{user:<username>}` and expires in 24 hours
* `verify/` accepts a [Bearer Authorization](https://tools.ietf.org/html/rfc6750) header with the token as credential, and returns a `200 OK` response if the token is valid

The client is minimally designed only to send a Basic authorization request header to the auth endpoint, and then use the retrieved token in a Bearer authorization header to the verify endpoint.

There is only one username / password combination implemented ('_abc_'/'_123_'), since a full [_identification_](https://itstillworks.com/difference-between-identification-authentication-3471.html) implementation is out of scope for the project.

## Development instructions

Development files are in `./src` and its directory structure mirrors the project folder: i.e. `functions-build` and `public`.

Files in `./src/functions-build` are the source for the serverless API endpoints `auth` and `verify`, and their corresponding test files. For more information about Netlify serverless functions, see <https://www.netlify.com/docs/functions/>

Any files in `./src/public` will be moved to `./public` on compile. They support the minimal frontend.

`.env.example` contains environmental variables that are significant to the project. Copy the file as a `.env` file, and add values to the right of each `=` symbol. See [the deployment section](#deployment-instructions) for more information about what each variable means.

## Installation instructions

For development, it's assumed that you have installed [Node.js](https://nodejs.org), [git](https://git-scm.com/), and optionally, [Yarn](https://yarnpkg.com)

Clone the repository, navigate to the newly created project directory (likely `./jwt-implementation`), and type `yarn install` or `npm install`

Remember to create an `.env` file as above. For more information about `.env` files and Node environmental variables, see <https://www.twilio.com/blog/2017/08/working-with-environment-variables-in-node-js.html>

(Each of these commands, `build`, `serve` and `test` should be prepended by `npm run` or `yarn run`. See more info here <https://yarnpkg.com/lang/en/docs/cli/run/>)

The `build` command will compile `.ts` files in `./src` into javascript, and then write them into their corresponding project directories. Then, `.js` files in `./functions-build` will be further processed and moved to `functions`, where they become the serverless endpoints for this project's API

To test, first serve the API locally by using the `serve` command, then in a separate terminal use the `test` command.

## Deployment instructions

This implementation is built with the expectation of deployment to [Netlify](https://netlify.com). First, [fork](https://help.github.com/en/articles/fork-a-repo) this repository, then create a new site in Netlify, linking your fork.

You will need these settings:

* Build & Deploy => Build settings
  * Build command: `yarn run build`
  * Publish directory: `public`
* Environment => Environment variables:
  * `REALM`: `Access to restricted resources`
  * `HASH_KEY`: _the `auth.ts` hash function uses this to encrypt passwords._ [qv. crypto hash](https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/#hashes)
  * `JWT_SECRET`: _the key that the jwt library uses to sign the token_
  * `TEST_USER_NAME`: _any user name_ e.g. 'abc'
  * `TEST_USER_PASSWORD`: _any password_ e.g. '123'
  * `TEST_USER_HASHED_PASSWORD`: _the output of `auth.hash(TEST_USER_PASSWORD)`_

Then deployment should be as easy as `git push`. For more information, see <https://www.netlify.com/docs/continuous-deployment/>