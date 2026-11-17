export const usersData = {
  username: "standard_user",
  password: "secret_sauce",

  invalidUsername: "invalid_user",
  invalidPassword: "invalid_password",
};

export const defaultUsers = {
  standard: {
    id: 1,
    username: "standard_user",
    password: "secret_sauce",
    locked: false,
    expected: undefined,
  },
  invalid: {
    id: 2,
    username: "invalid_user",
    password: "invalid_password",
    locked: false,
    expected:
      "Epic sadface: Username and password do not match any user in this service",
  },
} satisfies Record<string, TestUser>;

// to test using type utils

export function createUser(overrides: Partial<TestUser>): TestUser {
  return {
    ...defaultUsers.standard,
    ...overrides,
  };
}

type TestUser = {
  id: number;
  username: string;
  password: string;
  locked: boolean;
  expected?: string;
};
