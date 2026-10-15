import { Injectable } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

/** Emails are case-insensitive identifiers: always store and look them up normalized. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
  }

  create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizeEmail(data.email),
        passwordHash: data.passwordHash,
      },
    });
  }
}
