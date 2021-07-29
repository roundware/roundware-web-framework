export type IUserResponse = {
  username: string;
  token: string;
};
export interface IUser {
  toString(): string;
  connect(): Promise<IUserResponse | {}>;
}
