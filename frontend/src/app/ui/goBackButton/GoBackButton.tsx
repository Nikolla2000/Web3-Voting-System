import Link from "next/link";
import { ReactNode } from "react";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import styles from './styles.module.css';

export default function GoBackButton({ children, path } : { children : ReactNode, path: string }) {
  return (
    <Link href={path} className={styles.link}>
      <div className={styles.goBackButtonWrapper}>
        <div className={styles.text}>{children}</div>
        <div className={styles.icon}><ArrowBackIosIcon/></div>
      </div>
    </Link>
  )
}