import { useCallback, useEffect, useState } from 'react';
import { utils, BigNumber, ContractTransaction } from 'ethers';
import { useMoralis, useWeb3ExecuteFunction } from 'react-moralis';
import { useNotification, Icon, Loading } from 'web3uikit';
import type { TIconType } from 'web3uikit/dist/components/Icon/collection';
import type {
  IPosition,
  notifyType,
} from 'web3uikit/dist/components/Notification/types';

import ABI from '../config/abi.json';
import contractConfig from '../config/contract-config.json';
import { getContractAddress, checkChainIdIncluded } from '../utils/chain';
import { getProof, checkAllowlisted } from '../utils/allowlist';

type CustomErrors = {
  [key: string]: string;
};

export default function Mint() {
  const { maxSupply, saleType, gasToken, customErrors } = contractConfig;

  const { isWeb3Enabled, account, chainId: chainIdHex } = useMoralis();

  const proof = getProof(account);
  const isAllowlisted = checkAllowlisted(account);
  const contractAddress = getContractAddress(chainIdHex);
  const isChainIdIncluded = checkChainIdIncluded(chainIdHex);

  const [saleState, setSaleState] = useState(0);
  const [mintPrice, setMintPrice] = useState(BigNumber.from(0));
  const [maxMintAmountPerTx, setMaxMintAmountPerTx] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [mintAmount, setMintAmount] = useState(1);

  const dispatch = useNotification();

  // allowlistMint() function
  const {
    fetch: allowlistMint,
    isFetching: isFetchingAM,
    isLoading: isLoadingAM,
  } = useWeb3ExecuteFunction({
    abi: ABI,
    contractAddress: contractAddress,
    functionName: 'allowlistMint',
    params: {
      _mintAmount: mintAmount,
      _merkleProof: proof,
    },
    msgValue: utils
      .parseEther(saleType.allowlistSale.mintPrice)
      .mul(mintAmount)
      .toString(),
  });

  // publicMint() function
  const {
    fetch: publicMint,
    isFetching: isFetchingPM,
    isLoading: isLoadingPM,
  } = useWeb3ExecuteFunction({
    abi: ABI,
    contractAddress: contractAddress,
    functionName: 'publicMint',
    params: {
      _mintAmount: mintAmount,
    },
    msgValue: utils
      .parseEther(saleType.publicSale.mintPrice)
      .mul(mintAmount)
      .toString(),
  });

  const { fetch: getSaleState } = useWeb3ExecuteFunction({
    abi: ABI,
    contractAddress: contractAddress,
    functionName: 'getSaleState',
  });

  const { fetch: getMintPrice } = useWeb3ExecuteFunction({
    abi: ABI,
    contractAddress: contractAddress,
    functionName: 'getMintPrice',
  });

  const { fetch: getMaxMintAmountPerTx } = useWeb3ExecuteFunction({
    abi: ABI,
    contractAddress: contractAddress,
    functionName: 'getMaxMintAmountPerTx',
  });

  const { fetch: getTotalSupply } = useWeb3ExecuteFunction({
    abi: ABI,
    contractAddress: contractAddress,
    functionName: 'totalSupply',
  });

  const updateUiValues = useCallback(async () => {
    const saleStateFromCall = (await getSaleState()) as number;
    const mintPriceFromCall = (await getMintPrice()) as BigNumber;
    const maxMintAmountPerTxFromCall =
      (await getMaxMintAmountPerTx()) as BigNumber;
    const totalSupplyFromCall = (await getTotalSupply()) as BigNumber;
    setSaleState(saleStateFromCall);
    setMintPrice(mintPriceFromCall);
    setMaxMintAmountPerTx(maxMintAmountPerTxFromCall.toNumber());
    setTotalSupply(totalSupplyFromCall.toNumber());
  }, [getMaxMintAmountPerTx, getMintPrice, getSaleState, getTotalSupply]);

  useEffect(() => {
    if (isWeb3Enabled && isChainIdIncluded) {
      updateUiValues();

      // cleanup
      return () => {
        setSaleState(0);
        setMintPrice(BigNumber.from(0));
        setMaxMintAmountPerTx(0);
        setTotalSupply(0);
      };
    }
  }, [isChainIdIncluded, isWeb3Enabled, updateUiValues]);

  function decrementMintAmount() {
    setMintAmount(Math.max(1, mintAmount - 1));
  }

  function incrementMintAmount() {
    setMintAmount(Math.min(maxMintAmountPerTx, mintAmount + 1));
  }

  function handleNotification(
    type: notifyType,
    message?: string,
    title?: string,
    icon?: TIconType,
    position?: IPosition
  ) {
    dispatch({
      type,
      message,
      title,
      icon,
      position: position || 'bottomR',
    });
  }

  async function handleOnSuccess(tx: ContractTransaction) {
    await tx.wait(1);
    updateUiValues();
    handleNotification(
      'success',
      'Successfully minted!',
      'Transaction Notification',
      'checkmark'
    );
  }

  function handleErrorMessage(error: Error) {
    const errNames = Object.keys(customErrors);
    const filtered = errNames.filter((errName) =>
      error.message.includes(errName)
    );
    return filtered[0] in customErrors
      ? (customErrors as CustomErrors)[filtered[0]]
      : error.message;
  }

  function handleOnError(error: Error) {
    handleNotification(
      'error',
      handleErrorMessage(error),
      'Transaction Notification',
      'xCircle'
    );
  }

  async function mint() {
    if (saleState === 0) return;
    if (saleState === 1) {
      await allowlistMint({
        onSuccess: async (tx) =>
          await handleOnSuccess(tx as ContractTransaction),
        onError: (error) => handleOnError(error),
      });
    }
    if (saleState === 2) {
      await publicMint({
        onSuccess: async (tx) =>
          await handleOnSuccess(tx as ContractTransaction),
        onError: (error) => handleOnError(error),
      });
    }
  }

  return (
    <>
      <h2 className="text-4xl mb-8">Mint</h2>

      <div className="border border-t-red-300 border-r-blue-300 border-b-green-300 border-l-yellow-300 rounded p-8">
        <div className="flex justify-around border-b border-gray-700 pb-8">
          <div className="space-y-1">
            <div className="text-gray-400">Supply:</div>
            <div className="text-lg sm:text-2xl">
              <span className="text-pink-500">{totalSupply}</span> / {maxSupply}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-400">Sale:</div>
            <div className="text-lg sm:text-2xl">
              {saleState === 0 && 'Closed'}
              {saleState === 1 && 'Allowlist Only'}
              {saleState === 2 && 'Public Open'}
            </div>
          </div>
        </div>

        {saleState === 0 || (saleState === 1 && !isAllowlisted) ? (
          <div className="mt-8">
            <Icon fill="#fff" size={64} svg="lockClosed" />
          </div>
        ) : (
          <div className="pt-8 space-y-4">
            <div className="flex justify-center items-center space-x-8">
              <button
                type="button"
                className={`rounded-full p-2 ${
                  mintAmount <= 1 ? 'bg-gray-800 cursor-default' : 'bg-gray-600'
                }`}
                onClick={decrementMintAmount}
              >
                <Icon fill="#fff" svg="minus" />
              </button>

              <span className="text-xl">{mintAmount}</span>

              <button
                type="button"
                className={`rounded-full p-2 ${
                  mintAmount >= maxMintAmountPerTx
                    ? 'bg-gray-800 cursor-default'
                    : 'bg-gray-600'
                }`}
                onClick={incrementMintAmount}
              >
                <Icon fill="#fff" svg="plus" />
              </button>
            </div>

            <div className="text-center text-lg">
              <span className="text-gray-400">Total Price:</span>{' '}
              {utils.formatEther(mintPrice.mul(mintAmount))} {gasToken}
            </div>

            <div>
              {isFetchingAM || isLoadingAM || isFetchingPM || isLoadingPM ? (
                <button
                  type="button"
                  className="flex justify-center rounded px-4 py-2 w-full bg-blue-800 cursor-not-allowed"
                  disabled
                >
                  <Loading size={24} spinnerColor="#fff" />
                </button>
              ) : (
                <button
                  type="button"
                  className={`rounded px-4 py-2 font-bold w-full ${
                    !isWeb3Enabled || !isChainIdIncluded
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-600'
                  }`}
                  disabled={!isWeb3Enabled || !isChainIdIncluded}
                  onClick={mint}
                >
                  Mint
                </button>
              )}
            </div>
          </div>
        )}
        {!isWeb3Enabled && (
          <div className="text-red-500 text-center mt-4">
            Not connected to your wallet!
          </div>
        )}
        {isWeb3Enabled && !isChainIdIncluded && (
          <div className="text-red-500 text-center mt-4">
            Switch to {process.env.NEXT_PUBLIC_NETWORK_NAME}
          </div>
        )}
        {isWeb3Enabled && isChainIdIncluded && saleState === 0 && (
          <div className="text-red-500 text-center mt-4">
            Sales are closed now.
          </div>
        )}
        {isWeb3Enabled &&
          isChainIdIncluded &&
          saleState === 1 &&
          !isAllowlisted && (
            <div className="text-red-500 text-center mt-4">
              Address is not allowlisted.
            </div>
          )}
      </div>
    </>
  );
}
