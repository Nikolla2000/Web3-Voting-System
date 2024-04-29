import Link from "next/link";
import styles from './styles.module.css';

export default function ViewPollsButton() {
  return (
    <Link 
      href={'/votingPolls'}
      className={`${styles.viewPollsButton} w-52 relative inline-flex items-center justify-center px-6 py-2 text-lg font-bold text-white transition-all duration-200 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 no-underline`}>
      View Polls
    </Link>
  )
}