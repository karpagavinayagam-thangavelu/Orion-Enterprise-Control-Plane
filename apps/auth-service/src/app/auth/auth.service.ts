import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService
    ) { }

    async googleLogin(credential: string): Promise<AuthResponse> {
        try {
            console.log('AuthService: Starting Google login verification (Stateless)');
            // Decode Google JWT (in production, verify with Google's public keys)
            const parts = credential.split('.');
            if (parts.length !== 3) {
              console.error('AuthService: Invalid JWT structure', parts.length);
              throw new Error('Invalid JWT structure');
            }
            
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
            
            console.log('AuthService: Decoded Payload:', jsonPayload);
            const googleUser = JSON.parse(jsonPayload);

            if (!googleUser.email) {
                console.error('AuthService: Missing email in Google payload');
                throw new Error('Missing email in Google payload');
            }

            // Create user object directly from Google info - no DB involved
            const user = {
                id: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name || googleUser.email.split('@')[0],
                roles: ['ADMIN'], // Default role for authenticated users
                permissions: ['VIEW_BILLING', 'VIEW_ANALYTICS', 'VIEW_COMPLIANCE'],
            };

            console.log('AuthService: Google Login Success (Stateless)', user.email);

            // Generate our own JWT token
            const payload = { sub: user.id, email: user.email, roles: user.roles };
            return {
                accessToken: this.jwtService.sign(payload),
                user: user as any,
            };
        } catch (error) {
            console.error('AuthService: Google Login Error:', error);
            throw new UnauthorizedException(`Invalid Google credential: ${error.message}`);
        }
    }

    async validateUser(payload: any) {
        return { id: payload.sub, email: payload.email, roles: payload.roles };
    }
}
