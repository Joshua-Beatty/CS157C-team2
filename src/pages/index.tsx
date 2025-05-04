import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
// import dynamic from "next/dynamic";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

// const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>Type99</title>
                <meta name="description" content="Type99 Project." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}
            style={{
                textAlign: 'center',
                marginTop: '100px'
            }}>
                {/* <AppWithoutSSR /> */}
                <h1> Welcome to Type99 </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                    <Link href="/login"><button>Login</button></Link>
                    <Link href="/register"><button>Register</button></Link>
                </div>
                
            </main>
        </>
    );
}
