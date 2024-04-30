import 'animate.css';
import Link from 'next/link';
import SignInButton from './ui/login/SignInButton';
import RegisterButton from './ui/login/RegisterButton';
import MetamaskButton from './ui/metamask/MetamaskButton';
import ViewPollsButton from './ui/votingPolls/ViewPollsButton';
import MetamaskAccount from './ui/metamask/MetamaskAccount';


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center lg:h-screen p-15 relative animate__animated animate__fadeIn">
      <MetamaskAccount/>
      <div>
        <img src="/heading-img2.png" alt="heading image" className='w-72 mb-10' />
      </div>
      <div>
        <h1 className="text-blue-700 text-5xl font-bold mb-6 text-center">Welcome to Web3</h1>
        {/* <MetamaskButton/> */}
        <h3 className='text-purple-700 text-center text-xl'>The Future of the Web</h3>
      </div>
      <div className='ml-5  mt-4 flex flex-col sm:flex-row items-center gap-3'>
        <div className='inline xs:block'>
        <ViewPollsButton/>

        </div>
        <div className='inline xs:block'>
        <SignInButton/>

        </div>
        <div className='inline xs:block'>
        <MetamaskButton/>

        </div>
        {/* <button type="button" className="mt-10 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Sign In To Vote</button> */}
      </div>
      <RegisterButton/>
      {/* <div className='w-5 h-5 bg-red-400 absolute top-50 shadow-md left-10 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-20 shadow-md right-10 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-30 shadow-md left-50 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-50 shadow-md left-40 rounded-xl'></div>
      <div className='w-5 h-5 bg-red-400 absolute top-70 shadow-md left-10 rounded-xl'></div> */}
    </main>
  );
}
