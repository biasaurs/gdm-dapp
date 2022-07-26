import { Icon } from 'web3uikit';
import { useMoralis } from 'react-moralis';

import Container from './Container';
import contractConfig from '../config/contract-config.json';
import { parseChainId, getContractAddress } from '../utils/chain';

const getCurrentYear = () => new Date().getFullYear();

export default function Footer() {
  const { nftName } = contractConfig;
  const { chainId: chainIdHex } = useMoralis();
  const contractAddress = getContractAddress(chainIdHex);

  return (
    <footer className="border-t">
      <Container>
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center py-16">
          <div>
            © {getCurrentYear()} {nftName}
          </div>

          <div className="flex items-center space-x-2 mb-8 sm:mb-0">
            <a
              href={process.env.NEXT_PUBLIC_OPENSEA_COLLECTION_URL}
              aria-label={`${nftName} on OpenSea`}
              rel="noopener noreferrer"
              target="_blank"
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-2"
            >
              <Icon fill="#fff" svg="cart" />
            </a>
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_URL}
              aria-label={`${nftName} on Discord`}
              rel="noopener noreferrer"
              target="_blank"
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-2"
            >
              <Icon fill="#fff" svg="discord" />
            </a>
            <a
              href={process.env.NEXT_PUBLIC_TWITTER_URL}
              aria-label={`${nftName} on Twitter`}
              rel="noopener noreferrer"
              target="_blank"
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-2"
            >
              <Icon fill="#fff" svg="twitter" />
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}${
                parseChainId(chainIdHex) !==
                process.env.NEXT_PUBLIC_CHAIN_ID!.split(',')[1]
                  ? `/address/${contractAddress}`
                  : '/'
              }`}
              aria-label={`Contract of ${nftName}`}
              rel="noopener noreferrer"
              target="_blank"
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-2"
            >
              <Icon fill="#fff" svg="eth" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
