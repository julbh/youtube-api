import React from 'react'
import Head from "next/head";
import styles from '../styles/Home.module.css'
import { Typography } from '@material-ui/core';

function Layout(props) {
    return(
        <>
            <Head>
                <title>YouTube video analytics</title>
                <link rel="icon" href="/youtube.png" />
            </Head>
            <header className={styles.header}>
                <img  src="/assets/images/logo.png" className={styles.logo}></img>
            </header>
            <main className={styles.main}>
                {props.children}
            </main>
            <footer className={styles.footer}>
                <a
                    href="#"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <img src="/vercel.svg" alt="Vercel Logo" className={styles.footerLogo} />
                </a>
            </footer>
        </>
    )
}
 export default Layout;
