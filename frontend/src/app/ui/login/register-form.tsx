'use client'

import React from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { countries } from '../../../../utils/countries';
import { fetchRegister } from '@/app/lib/data';

export interface Inputs {
    email: string;
    name: string;
    country: string;
    password: string;
    confirmPass: string;
}


export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        fetchRegister(data);
        // console.log(data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email" className="block text-center mb-2 text-black">Email</label>
            <input 
                type="email" 
                id="email" 
                {...register("email", { required: true })} 
                className="block mx-auto mb-4 border-b-2" 
                placeholder="johndoe@gmail.com"/>
            {errors.email && <span>This field is required</span>}

            <label htmlFor="name" className="block text-center mb-2 text-black">Name</label>
            <input 
                type="text" 
                id="name" 
                {...register("name", { required: true })} 
                className="block mx-auto mb-4 border-b-2 text-black" 
                placeholder="John Doe"
                minLength={3}
                maxLength={30}/>

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
            {errors.country && <span>This field is required</span>}

            <label htmlFor="password" className="block text-center mb-2 text-black">Password</label>
            <input 
                type="password" 
                id="password" {...register("password", { required: true })} 
                className="block mx-auto mb-4 border-b-2 text-black"
                minLength={6}
                maxLength={30}/>

            <label htmlFor="conf-password" className="block text-center mb-2 text-black">Confirm Password</label>
            <input 
                type="password" 
                id="confirmPass" {...register("confirmPass", { required: true })} 
                className="block mx-auto mb-4 border-b-2 text-black"
                />

            <button type="submit" className="bg-blue-700 text-white font-bold px-8 py-3 mt-10 rounded-lg hover:bg-blue-500 transition-all duration-200">Register</button>
        </form>
    )
}