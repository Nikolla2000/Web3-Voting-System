import { Prisma } from "@prisma/client";

export class Poll implements Prisma.PollCreateInput{
    id: number;
    name: string;
    description: string;
    votes1?: number;
    votes2?: number;
}
