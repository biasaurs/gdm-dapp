import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

import allowlist from '../config/allowlist.json';

let merkleTree: MerkleTree;

function getMerkleTree() {
  if (!merkleTree) {
    const leaves = allowlist.map((address) => keccak256(address));
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  }
  return merkleTree;
}

export function getProof(address: string | null) {
  return getMerkleTree().getHexProof(keccak256(address ?? ''));
}

export function checkAllowlisted(address: string | null) {
  return (
    getMerkleTree().getLeafIndex(Buffer.from(keccak256(address ?? ''))) >= 0
  );
}
