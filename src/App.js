import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useEffect, useState } from "react";

import "./App.css";

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.MATIC_MUMBAI,
};

// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [showMoreWallet, setShowMoreWallet] = useState(false);
  const [blockNumber, setBlockNumber] = useState();
  const [finalBlocksState, setFinalBlockState] = useState({
    finalBlocks: [],
    selected: null,
  });
  const [moreInfoSelectedBlock, setMoreInfoSelectedBlock] = useState();
  const [showTransaction, setShowTransaction] = useState();
  const [totalBalance, setTotalBalance] = useState(0);

  const handleSelectBlock = async (block) => {
    let moreInfoAboutBlock = await alchemy.core.getBlockWithTransactions(block);
    setMoreInfoSelectedBlock(moreInfoAboutBlock);
    setFinalBlockState({ ...finalBlocksState, selected: block });
  };

  const handleGetBalance = async (e) => {
    e.preventDefault();
    try {
      let getBalance = await alchemy.core.getBalance(
        e.target[0].value,
        "latest"
      );
      setTotalBalance(Utils.formatUnits(getBalance));
    } catch (error) {
      console.log(error);
      setTotalBalance(0);
      alert("Insert a correct address.");
    }
    console.log(e.target[0].value);
  };

  useEffect(() => {
    async function getBlockNumber() {
      let lastBlockNumber = await alchemy.core.getBlockNumber();
      setBlockNumber(lastBlockNumber);
      let arrTotalBlocks = [];
      for (let i = lastBlockNumber; i >= lastBlockNumber - 9; i--) {
        arrTotalBlocks.push(i);
      }
      setFinalBlockState({ ...finalBlocksState, finalBlocks: arrTotalBlocks });
    }

    getBlockNumber();
  }, []);

  return (
    <div className="App">
      {showMoreWallet ? (
        <button onClick={() => setShowMoreWallet(!showMoreWallet)}>
          More info about blocks and transactions
        </button>
      ) : (
        <button onClick={() => setShowMoreWallet(!showMoreWallet)}>
          Info about an especific wallet
        </button>
      )}
      {showMoreWallet ? (
        <div>
          <h1>Get your balance</h1>
          <p>Introduce an address</p>
          <form onSubmit={(e) => handleGetBalance(e)}>
            <input type={"text"} />
            <input type={"submit"} />
          </form>
          {totalBalance !== 0 && <h4>Total Balance : {totalBalance} ETH</h4>}
        </div>
      ) : (
        <div>
          <div>
            <h1>Last Block Number: {blockNumber}</h1>
            <h3>Select any of the last 10 blocks mined</h3>
            <div>
              {finalBlocksState.finalBlocks.map((block) => {
                return (
                  <div onClick={(e) => handleSelectBlock(block)} key={block}>
                    {block}
                  </div>
                );
              })}
            </div>
            {finalBlocksState.selected !== null && (
              <div>
                <h4>Block selected: {finalBlocksState.selected}</h4>
                <div>
                  <p>Hash: {moreInfoSelectedBlock.hash}</p>
                  <p>Miner: {moreInfoSelectedBlock.miner}</p>
                  <p>Parent hash: {moreInfoSelectedBlock.parentHash}</p>
                  <p>Timestamp: {moreInfoSelectedBlock.timestamp}</p>
                  <p>
                    Gas used: {Utils.formatUnits(moreInfoSelectedBlock.gasUsed)}
                  </p>
                  <div>
                    <h4>Transactions</h4>
                    {moreInfoSelectedBlock.transactions.map((transaction) => {
                      return (
                        <div
                          onClick={() => setShowTransaction(transaction.hash)}
                        >
                          <p key={transaction.hash}>{transaction.hash}</p>
                          {showTransaction === transaction.hash && (
                            <div>
                              <p>Block Number: {transaction.blockNumber}</p>
                              <p>Chain ID: {transaction.chainId}</p>
                              <p>Confirmations: {transaction.confirmations}</p>
                              <p>From: {transaction.from}</p>
                              <p>To: {transaction.to}</p>
                              <p>
                                Value: {Utils.formatUnits(transaction.value)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
