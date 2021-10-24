import { useState, useEffect } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import Loader from "react-loader-spinner";

import abi from "./utils/WavePortal.json";
const Wrapper = styled.div`
  min-height: 100vh;
  background: rgb(36, 38, 59);
  color: white;
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
`;

const DescriptionWrapper = styled.div`
  margin-bottom: 32px;
`;

const ConnectWalletWrapper = styled.div`
  margin-bottom: 24px;
`;

const Button = styled.button`
  color: white;
  background: rgb(98, 126, 234);
  width: 100%;
  min-width: 44px;
  max-width: 140px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
  display: block;
  cursor: pointer;
  position: relative;
  transition: 100ms linear;
  border: 0;
  &[disabled] {
    opacity: 0.4;
    cursor: no-drop;
  }
`;

const TotalWavesWrapper = styled.div`
  margin-top: 24px;
`;

const WaveCardsWrapper = styled.div`
  margin-top: 24px;
`;

const WaveCard = styled.div`
  padding: 16px;
  background-color: #1f2039;
  border-radius: 8px;
  box-shadow: 0 2px 4px 1px rgb(0 0 0 / 10%);
  margin-bottom: 12px;
`;

const WaveCardLineItem = styled.div`
  margin: 4px;
`;

const StyledInput = styled.input`
  max-width: 360px;
  width: 100%;
  height: 46px;
  background-color: #efefef;
  border: 1px solid white;
  border-radius: 10px;
  padding-left: 16px;
  font-size: 16px;
  color: 1f2039;
  margin-bottom: 16px;
  &::placeholder {
    font-size: 16px;
    color: 1f2039;
  }
  &:focus {
    padding-left: 16px;
    font-size: 16px;
    border: 1px solid white;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 16px;
`;

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = "0x164a4F7F12B64BF0630118b90cCB05D419cCCe74";
const CONTRACT_ABI = abi.abi;

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [totalWaveCount, setTotalWaveCount] = useState<number | string>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [allWaves, setAllWaves] = useState<any>([]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

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
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setupContract = async () => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(wavePortalContract);
    }
  };

  const getAndSetTotalWaves = async () => {
    if (contract) {
      const count = (await contract.getTotalWaves()).toString();
      setTotalWaveCount(count);
    }
  };

  const getAndSetAllWaves = async () => {
    if (contract) {
      const waves = await contract.getAllWaves();
      const wavesFormatted = waves.map((wave: any) => ({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message,
      }));

      setAllWaves(wavesFormatted);

      contract.on("NewWave", (from, timestamp, message) => {
        setAllWaves((prevState: any) => [
          ...prevState,
          {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
          },
        ]);
      });
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    setupContract();
  }, []);

  useEffect(() => {
    getAndSetTotalWaves();
    getAndSetAllWaves();
    // eslint-disable-next-line
  }, [contract]);

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

      if (ethereum && contract) {
        setLoading(true);
        const waveTxn = await contract.wave(message, { gasLimit: 300000 });

        await waveTxn.wait();

        await getAndSetTotalWaves();
        await getAndSetAllWaves();
        setMessage("");
        setLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setError("Already waved! You must wait 15 minutes to wave again :)");
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <InnerWrapper>
        <h2>👋 Wave Zone</h2>

        <DescriptionWrapper>
          Connect your Ethereum wallet and wave at me!
        </DescriptionWrapper>

        {!currentAccount && (
          <ConnectWalletWrapper>
            <Button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </ConnectWalletWrapper>
        )}
        {loading ? (
          <Loader
            type="TailSpin"
            color="rgb(98, 126, 234"
            height={100}
            width={100}
            timeout={0}
          />
        ) : (
          <>
            <StyledInput
              placeholder="Enter a message"
              value={message}
              onChange={(e) => {
                setError("");
                setMessage(e.target.value);
              }}
            />
            <Button onClick={wave} disabled={!message.length}>
              Wave at Me
            </Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </>
        )}
        <TotalWavesWrapper>Total waves: {totalWaveCount}</TotalWavesWrapper>
        {!!allWaves.length && (
          <WaveCardsWrapper>
            {allWaves.map((wave: any, index: number) => {
              return (
                <WaveCard key={index}>
                  <WaveCardLineItem>Address: {wave.address}</WaveCardLineItem>
                  <WaveCardLineItem>
                    Time: {wave.timestamp.toString()}
                  </WaveCardLineItem>
                  <WaveCardLineItem>Message: {wave.message}</WaveCardLineItem>
                </WaveCard>
              );
            })}
          </WaveCardsWrapper>
        )}
      </InnerWrapper>
    </Wrapper>
  );
}
