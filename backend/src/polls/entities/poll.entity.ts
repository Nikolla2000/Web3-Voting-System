import { Prisma } from "@prisma/client";

export class Poll implements Prisma.PollCreateInput{
    id: number;
    name: string;
    description: string;
    mainImgURL: string;
    img1URL: string;
    img2URL: string;
    votes1?: number;
    votes2?: number;
}
