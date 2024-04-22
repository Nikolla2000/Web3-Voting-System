'use client'

import React from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { countries } from '../../../../utils/countries';
import { fetchRegisterUser } from '@/app/lib/data';
import { ZodType, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { redirect } from 'next/dist/server/api-utils';

export interface Inputs {
    email: string;
    name: string;
    country: string;
    password: string;
    confirmPass: string;
}

export default function RegisterForm() {

    const schema: ZodType<Inputs> = z.object({
        email: z.string().email(),
        name: z.string().min(3),
        country: z.string(),
        password: z.string().min(6).max(30),
        confirmPass: z.string()
    })
    .refine((data) => data.confirmPass === data.password, {
        message: "Passwords don\'t match",
        path:["confirmPass"]
    });
    
    type FormFields = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({ resolver: zodResolver(schema) })

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        await fetchRegisterUser(data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='text-center'>
            <label htmlFor="email" className="block text-center mb-2 text-black">Email</label>
            <input 
                type="email" 
                id="email" 
                {...register("email", { required: true })} 
                className="block mx-auto mb-4 border-b-2" 
                placeholder="johndoe@gmail.com"/>
            {errors.email && <div className='text-center text-sm text-red-500'><span>Email field is required</span></div>}

            <label htmlFor="name" className="block text-center mb-2 text-black">Name</label>
            <input 
                type="text" 
                id="name" 
                {...register("name", { required: true })} 
                className="block mx-auto mb-4 border-b-2 text-black" 
                placeholder="John Doe"
                minLength={3}
                maxLength={30}/>
            {errors.name && <div className='text-center text-sm text-red-500'><span>Name is required</span></div>}


            <label htmlFor="country" className="block text-center mb-2 text-black">Country</label>
            <select
                id="country"
                {...register('country', { required: true })}
                className="block mx-auto mb-4 border-b-2 text-black w-8"  style={{ width: '220px' }}
            >
                {countries.map((country) => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                ))}
            </select>

            <label htmlFor="password" className="block text-center mb-2 text-black">Password</label>
            <input 
                type="password" 
                id="password" {...register("password", { required: true })} 
                className="block mx-auto mb-4 border-b-2 text-black"
                minLength={6}
                maxLength={30}/>
            {errors.password && <div className='text-center text-sm text-red-500'><span>Password is required</span></div>}

            <label htmlFor="confirmPass" className="block text-center mb-2 text-black">Confirm Password</label>
            <input 
                type="password" 
                id="confirmPass" {...register("confirmPass", { required: true })} 
                className="block mx-auto mb-4 border-b-2 text-black"
                />
            {errors.confirmPass && <div className='text-center text-sm text-red-500'><span>Passwords should match</span></div>}

            <button type="submit" className="bg-blue-700 text-white font-bold px-8 py-3 mt-5 rounded-lg hover:bg-blue-500 transition-all duration-200">Register</button>
        </form>
    )
}