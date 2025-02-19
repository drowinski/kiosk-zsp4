import { userRepository, UserRepository } from '@/features/users/users.repository';
import { User } from '@/features/users/users.validation';
import { hashPassword, verifyPassword } from '@/lib/crypto';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(email: string, password: string): Promise<User | null> {
    const passwordHash = await hashPassword(password);
    return await this.userRepository.createUser({
      email: email,
      passwordHash: passwordHash
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
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
