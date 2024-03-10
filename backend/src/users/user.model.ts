import { Prisma } from "@prisma/client";

export class User implements Prisma.UserCreateInput {
  id: number;
  username: string;
  email: string;
  password: string;
  country: string;
}
