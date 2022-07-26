import contractConfig from '../config/contract-config.json';

type ContractAddresses = {
  [key: string]: string[];
};

const { contractAddresses } = contractConfig;

export function parseChainId(chainIdHex: string | null) {
  return parseInt(chainIdHex ?? '').toString();
}

export function getContractAddress(chainIdHex: string | null) {
  const chainId = parseChainId(chainIdHex);
  return (contractAddresses as ContractAddresses)[chainId]?.at(-1);
}

export function checkChainIdIncluded(chainIdHex: string | null) {
  const chainId = parseChainId(chainIdHex);
  return process.env.NEXT_PUBLIC_CHAIN_ID!.split(',').includes(chainId);
}
