/** Claims stored in the access token. `sub` is the user id. */
export interface JwtPayload {
  sub: string;
  email: string;
}
