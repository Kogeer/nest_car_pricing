import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Creates a new user with a salted and hased password', async () => {
    const user = await service.signup('asdf@example.com', 'asdf');
    const [salt, hash] = user.password.split('.');

    expect(user.password).not.toEqual('asdf');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('Throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@example.com', 'asdf');

    await expect(service.signup('asdf@example.com', 'asdf')).rejects.toThrow(
      'Email in use',
    );
  });

  it('Throws if signin is called with an unused email', async () => {
    await expect(service.signin('asdf@example.com', 'asdf')).rejects.toThrow(
      'User not found',
    );
  });

  it('Throws if an invalid password is provided', async () => {
    await service.signup('asdf@example.com', 'another_password');

    expect(service.signin('asdf@example.com', 'password')).rejects.toThrow(
      'Bad credentials',
    );
  });

  it('Returns a user if correct password is provided', async () => {
    await service.signup('mock@mock.com', 'asdf');

    const user = await service.signin('mock@mock.com', 'asdf');
    expect(user).toBeDefined();
  });
});
