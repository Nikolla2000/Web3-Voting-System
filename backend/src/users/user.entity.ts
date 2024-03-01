import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 50,
    })
    username: string;

    @Column({
        length:100,
    })
    email: string;

    @Column()
    country: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive: boolean;
}