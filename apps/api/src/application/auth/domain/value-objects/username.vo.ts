import { BadRequestException } from '@nestjs/common';

const USERNAME_REGEX = /^[a-z0-9_.-]{3,32}$/;

export class Username {
  constructor(private value: string) {}

  static create(value: string): Username {
    const normalized = value?.trim().toLowerCase();
    this.validate(normalized);
    return new Username(normalized);
  }

  private static validate(value: string): void {
    if (!value || !USERNAME_REGEX.test(value)) {
      throw new BadRequestException('Username inválido');
    }
  }

  getValue(): string {
    return this.value;
  }
}
