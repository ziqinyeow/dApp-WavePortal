import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/WavePortal.json";
import { toast, Toaster } from "react-hot-toast";

export default function Home() {
  const contractAddress = "0x34940e89AC035BC284B25Ede602e0B6E93119a16";
  const contractABI = abi.abi;
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

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

  const getAllWaves = async () => {
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

        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map((wave: any) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
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

        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });
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
      throw new Error();
    }
    setMessage("");
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    let wavePortalContract: any;

    const onNewWave = (from: any, timestamp: any, message: any) => {
      console.log("NewWave", from, timestamp, message);
      // @ts-ignore
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <Head>
        <title>Wave Portal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full px-20 text-center">
        <div className="flex h-[60vh] flex-col justify-center space-y-5">
          <motion.div
            animate={{ rotate: 20 }}
            transition={{
              repeat: Infinity,
              from: 0,
              duration: 0.5,
              type: "spring",
            }}
            className="text-2xl font-bold"
          >
            👋
          </motion.div>
          <div className="text-2xl font-bold">Hey there!</div>
          <div className="w-80">
            I am ziqin and I worked on Deep Learning and web so that's pretty
            cool right? Connect your Ethereum wallet and wave at me!
          </div>

          {currentAccount && (
            <div className="flex justify-center gap-2">
              <input
                className="px-2 py-1 text-xs border rounded-md focus:outline-gray-300"
                type="text"
                placeholder="Message me"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              />
              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                className="px-6 py-2 text-xs rounded-md bg-gradient-to-br from-blue-100 to-red-100 hover:shadow-md"
                onClick={() => {
                  toast.promise(wave(), {
                    loading: "Waving...",
                    success: "Successfully waved!",
                    error: "Unable to wave!",
                  });
                }}
              >
                Wave at Me
              </motion.button>
            </div>
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
        </div>

        {allWaves.length !== 0 ? (
          <div className="grid w-full grid-cols-3 gap-2 p-2 mb-5 bg-gradient-to-br from-blue-50 to-red-50">
            <h2 className="text-xl font-medium">Address</h2>
            <h2 className="text-xl font-medium">Time</h2>
            <h2 className="text-xl font-medium">Message</h2>
          </div>
        ) : (
          <div>Make sure your are on Rinkeby Test Net</div>
        )}

        <div className="w-full mb-10">
          {[...allWaves].reverse().map((wave: any, index) => {
            return (
              <div
                key={index}
                className="grid w-full grid-cols-3 gap-2 p-2 break-words transition-all hover:bg-gray-100"
              >
                <div>{wave?.address}</div>
                <div>{wave?.timestamp.toString()}</div>
                <div>{wave?.message}</div>
              </div>
            );
          })}
        </div>
        <Toaster position="top-left" />
      </main>
    </div>
  );
}
