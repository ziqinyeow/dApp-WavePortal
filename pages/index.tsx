import Head from "next/head";
import { motion } from "framer-motion";

export default function Home() {
  const wave = () => {};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Wave Portal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full gap-5 px-20 text-center">
        <motion.div
          animate={{ rotate: 20 }}
          transition={{
            repeat: Infinity,
            from: 0,
            duration: 0.2,
            ease: "easeInOut",
            type: "tween",
          }}
          className="text-2xl font-bold"
        >
          👋
        </motion.div>
        <div className="text-2xl font-bold">Hey there!</div>
        <div className="w-80">
          I am ziqin and I worked on Deep Learning and web so that's pretty cool
          right? Connect your Ethereum wallet and wave at me!
        </div>

        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          className="px-6 py-2 text-xs rounded-md bg-gradient-to-br from-blue-100 to-red-100 hover:shadow-md"
          onClick={wave}
        >
          Wave at Me
        </motion.button>
      </main>
    </div>
  );
}
