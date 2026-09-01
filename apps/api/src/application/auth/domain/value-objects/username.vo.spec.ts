import { BadRequestException } from '@nestjs/common';
import { Username } from './username.vo';

describe('Username', () => {
  it('deve criar um Username válido normalizado em minúsculas', () => {
    const username = Username.create('  Paul  ');

    expect(username.getValue()).toBe('paul');
  });

  it('deve lançar erro quando o username é menor que 3 caracteres', () => {
    expect(() => Username.create('ab')).toThrow(BadRequestException);
  });

  it('deve lançar erro quando o username contém caracteres inválidos', () => {
    expect(() => Username.create('paul reuter')).toThrow(BadRequestException);
  });

  it('deve lançar erro quando o username é vazio', () => {
    expect(() => Username.create('')).toThrow(BadRequestException);
  });
});
