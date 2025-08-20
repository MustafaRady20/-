import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'ljhdlcwhfuthkln-nmdsln', // better to use env
    });
  }

  async validate(payload: any) {
    // this will attach to req.user
    console.log('JWT Payload:', payload);
    return { userId: payload.sub, name: payload.name, role: payload.role };
  }
}
