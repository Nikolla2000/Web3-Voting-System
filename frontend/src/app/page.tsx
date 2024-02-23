import 'animate.css';
import Link from 'next/link';


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-15 relative animate__animated animate__fadeIn">
      <div>
        <img src="/heading-img2.png" alt="heading image" className='w-80 mb-10' />
      </div>
      <div>
        <h1 className="text-blue-700 text-5xl font-bold  mb-6">Welcome to Web3!</h1>
        <h3 className='text-purple-700 text-center text-xl'>The Future of the Web</h3>
      </div>
      <div>
        <Link href="/login">
          <button className='bg-blue-700 text-white font-bold px-8 py-3 mt-10 rounded-lg hover:bg-blue-500 transition-all duration-200'>
            Login to Vote
          </button>
        </Link>
      </div>
      {/* <div className='w-5 h-5 bg-red-400 absolute top-50 shadow-md left-10 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-20 shadow-md right-10 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-30 shadow-md left-50 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-50 shadow-md left-40 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-70 shadow-md left-10 rounded-xl'></div> */}
    </main>
  );
}
