import { TokenClaims } from 'rowantree.auth.typescript.sdk'

const headers: Record<string, string> = {}
let claims: TokenClaims

export function getHeaders (): Record<string, string> {
  return headers
}

export function setHeader (key: string, value: string): void {
  headers[key] = value
}

export function setClaims (newClaims: TokenClaims): void {
  claims = newClaims
}

export function getClaims (): TokenClaims {
  return claims
}
