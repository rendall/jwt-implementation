# jwt-implementation

This is an example implementation of JSON Web Tokens (JWT) using the [auth0](https://github.com/auth0/node-jsonwebtoken) library. It can be used to experiment with JWTs or as the basis of a more robust authentication server.

It is comprised of an API server written in Node, and a simple HTML/javascript client

The API is comprised of two endpoints:

* `auth/` accepts a Basic Authorization header and returns a JWT if the username / password combination is valid. The JWT simply claims `{user:<username>}` and expires in 24 hours
* `verify/` accepts a Bearer Authorization header with the token as credential, and returns a `200 OK` response if the token is valid

The client is simply designed to send a Basic authorization request header to the auth endpoint, and then use the retrieved token in a Bearer authorization header to the verify endpoint.

## Development instructions

Development files are in `./src` of the form `<filename>.ts`. Their corresponding test ([jest](https://jestjs.io/)) files are named `<filename>.test.ts`