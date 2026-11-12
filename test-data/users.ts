export const usersData = {
  username: "standard_user",
  password: "secret_sauce",

  invalidUsername: "invalid_user",
  invalidPassword: "invalid_password",
};

// to test using type utils

export function createUser(overrides: Partial<TestUser>): TestUser {
  const defaultUser: TestUser = {
    id: 1,
    username: "standard_user",
    password: "secret_sauce",
    locked: false,
  };

  return {
    ...defaultUser,
    ...overrides,
  };
}

type TestUser = {
  id: number;
  username: string;
  password: string;
  locked: boolean;
};
