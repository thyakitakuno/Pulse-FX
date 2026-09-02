export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
}

export interface LoginInPort {
  execute(input: LoginInput): Promise<LoginOutput>;
}
