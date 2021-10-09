import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import myEpicNft from "./utils/MyEpicNFT.json";
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = "zouln96";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://testnets.opensea.io/assets/0x5949E10498Ef7d8bbB9FEE127343c7fbfDc4a294/";
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [mining, setMining] = useState(false);
  const [nft, setNft] = useState(null);
  const [total, setTotal] = useState(null);
  const CONTRACT_ADDRESS = "0x5949E10498Ef7d8bbB9FEE127343c7fbfDc4a294";

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: "eth_chainId" });

    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);

      setupEventListener(account);
    } else {
      console.log("No authorized account found");
    }
  };

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

  const setupEventListener = async (account) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          if (from.toLowerCase() === account) {
            setNft(tokenId.toNumber());
          }
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(async () => {
    checkIfWalletIsConnected();
    await getTotalMinting();
  }, []);

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMining(true);
        await nftTxn.wait();
        await getTotalMinting();
        setMining(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalMinting = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        let totalNtfs = await connectedContract.getTotalNFTsMintedSoFar();
        setTotal(totalNtfs.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <div className="container mx-auto">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text mb-5">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="header gradient-text mb-10">
            {total} / {TOTAL_MINT_COUNT}
          </p>
          {currentAccount === "" ? (
            <button
              onClick={connectWallet}
              className="cta-button connect-wallet-button"
            >
              Connect to Wallet
            </button>
          ) : mining === true ? (
            <button className="cta-button connect-wallet-button mt-5">
              Mining...
            </button>
          ) : (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button mt-5"
            >
              Mint NFT
            </button>
          )}
          <div className="mt-5">
            {nft ? (
              <a
                href={`${OPENSEA_LINK}/${nft}`}
                className="text-center p-3 gradient-text"
              >
                View your minted NFT Here
              </a>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
