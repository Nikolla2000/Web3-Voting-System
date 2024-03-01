import 'animate.css';
import Link from 'next/link';


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center lg:h-screen p-15 relative animate__animated animate__fadeIn">
      <div>
        <img src="/heading-img2.png" alt="heading image" className='w-80 mb-10' />
      </div>
      <div>
        <h1 className="text-blue-700 text-5xl font-bold  mb-6">Welcome to Web3!</h1>
        <h3 className='text-purple-700 text-center text-xl'>The Future of the Web</h3>
      </div>
      <div>
        <Link href="/login">
        <div className="relative inline-flex  group mt-10">
          <div
              className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt">
          </div>
          <a href="#" title="Get quote now"
              className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              role="button">Sign in To Vote
          </a>
        </div>
        {/* <button type="button" className="mt-10 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Sign In To Vote</button> */}
        </Link>
      </div>
      <Link 
          href='/register'
          className="mt-2">
          <p className="text-blue-700 text-center mt-2 text-md hover:font-bold transition-all duration-200 underline">
              Or <span className='font-bold'>Register</span> from here
          </p>
      </Link>
      {/* <div className='w-5 h-5 bg-red-400 absolute top-50 shadow-md left-10 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-20 shadow-md right-10 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-30 shadow-md left-50 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-50 shadow-md left-40 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-70 shadow-md left-10 rounded-xl'></div> */}
    </main>
  );
}
