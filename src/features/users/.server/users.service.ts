import { userRepository, UserRepository } from '@/features/users/.server/users.repository';
import { UpdatedUser, User } from '@/features/users/users.validation';
import { hashPassword, verifyPassword } from '@/lib/.server/crypto';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(username: string, password: string, isSuperuser: boolean = false): Promise<User | null> {
    const passwordHash = await hashPassword(password);
    return await this.userRepository.createUser({
      username: username,
      passwordHash: passwordHash,
      isSuperuser: isSuperuser
    });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.getUserWithPasswordHashByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async updateUser(updatedUser: UpdatedUser): Promise<User | null> {
    const passwordHash = updatedUser.password ? await hashPassword(updatedUser.password) : null;
    return await this.userRepository.updateUser({
      ...updatedUser,
      ...(passwordHash && { passwordHash })
    });
  }
}

export const userService: Readonly<UserService> = Object.freeze(new UserService(userRepository));
