import { Skeleton } from "@mui/material";

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div className="w-72 border border-gray-100 rounded cursor-pointer">
      <Skeleton variant="rounded" height={220}  className="w-full"/>
      <Skeleton variant="rounded" width={210} height={60} className="mt-8 mx-auto"/>
      <Skeleton variant="text" sx={{ fontSize: 'rem' }} width={250} className="mx-auto mt-1"/>
      <Skeleton variant="text" sx={{ fontSize: 'rem' }} width={250} className="mx-auto"/>
      <Skeleton variant="text" sx={{ fontSize: 'rem' }} width={250} className="mx-auto"/>
      <Skeleton variant="rounded" height={70} className="mt-8 w-full"/>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export default function PollsSkeleton() {
  return (
    <main className="">
      <h1 className="text-blue-700 text-5xl font-bold">POLLS</h1>
      <div className="mt-16 grid gap-10 sm:grid-cols-1 md:grid-cols-2 md:gap-20 lg:grid-cols-3 2xl:grid-cols-4" >
        <CardsSkeleton/>
      </div>
   </main>
  )
}