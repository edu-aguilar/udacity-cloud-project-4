import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-0t584hj4.eu.auth0.com/.well-known/jwks.json'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken: JwtPayload = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

const fetchJWKS = async jwksUrl => {
  const result = await Axios.get(jwksUrl)
  return result.data.keys
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

const getJWKSSigningKey = (jwks, kid) => {

  const getJWKSSigningKeys = jwks => {

    const certToPEM = cert => {
      let pem = cert.match( /.{1,64}/g ).join( '\n' );
      pem = `-----BEGIN CERTIFICATE-----\n${ cert }\n-----END CERTIFICATE-----\n`;
      return pem;
    }

    return jwks
    .filter(
      ( key ) =>
        key.use === 'sig' && 
        key.kty === 'RSA' &&
        key.kid &&
        ( ( key.x5c && key.x5c.length ) || ( key.n && key.e ) ) // Has useful public keys
    )
    .map( ( key ) => ( { kid: key.kid, nbf: key.nbf, publicKey: certToPEM( key.x5c[ 0 ] ) } ) );
  }

  return getJWKSSigningKeys(jwks).find( key => key.kid === kid );
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {

  const jwks = await fetchJWKS(jwksUrl)
  const token = getToken(authHeader)
  const decodedToken: Jwt = decode(token, { complete: true }) as Jwt

  const { header } = decodedToken;
  if ( !header || header.alg !== 'RS256' ) {
    throw new Error( 'Token is not RS256 encoded' );
  }

  const key = getJWKSSigningKey(jwks, header.kid)
  const actualKey = key.publicKey || key.rsaPublicKey;

  return verify(token, actualKey, { algorithms: ['RS256'] }) as JwtPayload
}
