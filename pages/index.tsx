import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/WavePortal.json";

export default function Home() {
  const contractAddress = "0x452361792825eEE0AFBEc243a226F49C3e6a4584";
  const contractABI = abi.abi;
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

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

        {currentAccount && (
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            className="px-6 py-2 text-xs rounded-md bg-gradient-to-br from-blue-100 to-red-100 hover:shadow-md"
            onClick={wave}
          >
            Wave at Me
          </motion.button>
        )}
        {!currentAccount && (
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            className="px-6 py-2 text-xs rounded-md bg-gradient-to-br from-blue-100 to-red-100 hover:shadow-md"
            onClick={connectWallet}
          >
            Connect Wallet
          </motion.button>
        )}
      </main>
    </div>
  );
}
