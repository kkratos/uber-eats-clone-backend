import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {
    console.log(options);
  }
  sign(userId: number): string {
    console.log(userId)
    return jwt.sign({ id: userId }, this.options.privateKey)
  }
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey)
  }
}