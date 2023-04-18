import { IsEmail, Length } from "class-validator";

export class CreateCustomerInput {
  @IsEmail()
  email: string;

  @Length(6, 12)
  password: string;

  firstName: string;

  lastName: string;
}

export class UserLoginInput {
  @IsEmail()
  email: string;

  @Length(6, 12)
  password: string;
}

//interface
export interface CustomerPayload {
  _id: string;
  email: string;
}
