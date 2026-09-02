/**
 * Deliberately memory-only token storage.
 *
 * Tokens are not written to localStorage or sessionStorage. A full page reload
 * ends the frontend session. If persistence is added later, it must remain
 * isolated here and document that Web Storage is readable by injected scripts
 * and is not equivalent to an HttpOnly cookie.
 */
let accessToken: string | null = null

export const authStorage = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token
  },
  clear: () => {
    accessToken = null
  },
}
