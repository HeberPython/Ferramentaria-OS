import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

export async function criarToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret())
}

export async function verificarToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      id: payload.id as string,
      email: payload.email as string,
      nome: payload.nome as string,
      role: payload.role as JWTPayload['role'],
    }
  } catch {
    return null
  }
}
