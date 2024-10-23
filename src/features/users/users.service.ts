import { userRepository, UserRepository } from '@/features/users/users.repository';
import bcrypt from 'bcrypt';
import { User } from '@/features/users/users.validation';

export class UserService {
  private readonly userRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async signUp(email: string, password: string): Promise<User | null> {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepository.createUser({
      email: email,
      passwordHash: passwordHash
    });
    return user;
  }
}

export const userService: Readonly<UserService> = Object.freeze(new UserService(userRepository));
