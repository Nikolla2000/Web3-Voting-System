import Link from "next/link";
import { ReactNode } from "react";
import styles from "./styles.module.css";

export default function ViewReadmeBtn({ children } : { children: ReactNode}) {
  return (
    <Link href='/readme' className={styles.link}>
      {children}
    </Link>
  )
}