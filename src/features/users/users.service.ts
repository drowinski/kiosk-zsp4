import { userRepository, UserRepository } from '@/features/users/users.repository';
import { User } from '@/features/users/users.validation';
import { hashPassword, verifyPassword } from '@/lib/crypto';

export class UserService {
  private readonly userRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async signUp(email: string, password: string): Promise<User | null> {
    const passwordHash = await hashPassword(password);
    const user = await this.userRepository.createUser({
      email: email,
      passwordHash: passwordHash
    });
    return user;
  }

  async signIn(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.getUserWithPasswordHashByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}

export const userService: Readonly<UserService> = Object.freeze(new UserService(userRepository));
