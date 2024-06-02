'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ZodType, z } from "zod";
import api from "../../../axios.config";
import { initWeb3 } from "../lib/actions";

export interface Inputs {
  name: string;
  description: string;
  mainImgURL: string;
  img1URL: string;
  img2URL: string;
  optionOneName: string;
  optionTwoName: string;
}

export default function CreatePoll() {
  const schema: ZodType<Inputs> = z.object({
    name: z.string().min(1),
    description: z.string(),
    mainImgURL: z.string(),
    img1URL: z.string(),
    img2URL: z.string(),
    optionOneName: z.string(),
    optionTwoName: z.string(),
  });

  type FormFields = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  const fetchCreatePoll: SubmitHandler<FormFields> = async (data) => {
    try {
      const { contract, account } = await initWeb3();
      if ((window as any).ethereum) {
        const { name, optionOneName, optionTwoName } = data;
        const option1Name = optionOneName;
        const option2Name = optionTwoName;

        await contract.methods.createPoll(name, option1Name, option2Name).send({ from: account });
        toast.success("Poll created successfully on the blockchain!");

      } else {
        toast.error("Please install MetaMask to create a poll on the blockchain.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An error occurred. Please try again later.");
    }

    try {
      const response = await api.post('polls', data);
      console.log(data, response);
      toast.success("Poll created successfully in the database!");
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An error occurred while saving to the database. Please try again later.");
    }
  };
  

  return (
    <div>
      <h1>Create Poll</h1>
      <form onSubmit={handleSubmit(fetchCreatePoll)} className="flex flex-col">
        <label htmlFor="name">Name</label>
        <input type="text" className="mb-5" id="name" {...register("name", { required: true })} />
        {errors.name && <p>{errors.name.message}</p>}

        <label htmlFor="description">Description</label>
        <input type="text" id="description" className="mb-5" {...register("description", { required: true })} />
        {errors.description && <p>{errors.description.message}</p>}

        <label htmlFor="mainImgURL">Main Image URL</label>
        <input type="text" id="mainImgURL" className="mb-5" {...register("mainImgURL", { required: true })} />
        {errors.mainImgURL && <p>{errors.mainImgURL.message}</p>}

        <label htmlFor="img1URL">Image 1 URL</label>
        <input type="text" id="img1URL" className="mb-5" {...register("img1URL", { required: true })} />
        {errors.img1URL && <p>{errors.img1URL.message}</p>}

        <label htmlFor="img2URL">Image 2 URL</label>
        <input type="text" id="img2URL" className="mb-5" {...register("img2URL", { required: true })} />
        {errors.img2URL && <p>{errors.img2URL.message}</p>}

        <label htmlFor="optionOneName">Option One Name</label>
        <input type="text" id="optionOneName" className="mb-5" {...register("optionOneName", { required: true })} />
        {errors.optionOneName && <p>{errors.optionOneName.message}</p>}

        <label htmlFor="optionTwoName">Option Two Name</label>
        <input type="text" id="optionTwoName" className="mb-5" {...register("optionTwoName", { required: true })} />
        {errors.optionTwoName && <p>{errors.optionTwoName.message}</p>}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
