import 'animate.css';
import SignInButton from './ui/login/SignInButton';
import RegisterButton from './ui/login/RegisterButton';
import MetamaskButton from './ui/metamask/MetamaskButton';
import ViewPollsButton from './ui/votingPolls/ViewPollsButton';
import MetamaskAccount from './ui/metamask/MetamaskAccount';
import { TypewriterEffect } from './ui/typeWriterEffects/MainTypewriterEffect';
import { shapesData } from '../../utils/shapesData';
import "./ui/shapes.css";
import { mainPageStrings } from './ui/typeWriterEffects/typewriterStrings';


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen p-15 relative animate__animated animate__fadeIn">
      <MetamaskAccount/>
      <div>
      <video className='w-96' muted autoPlay loop>
      <source src="/web3-logo-video.webm" type="video/webm" />
      Sorry, your browser doesn't support videos.
    </video>
      </div>
      <div>
        <h1 className="text-blue-700 text-5xl font-bold mb-6 text-center">
          Welcome to Web3
        </h1>
        <h3 className='text-purple-700 text-center text-2xl h-6'>
          <TypewriterEffect strings={mainPageStrings}/>
        </h3>
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
      </div>
      <RegisterButton/>
      {/* <div>
        {shapesData.map((shape, i) => (
            <div className={`shape shape${i + 1}`} key={i + 1}>
              <img src={shape.imgSrc}  alt="Geometrical shape"/>
            </div>
        ))}
      </div> */}
    </main>
  );
}
