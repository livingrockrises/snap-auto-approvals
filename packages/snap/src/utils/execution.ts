import { ethers, Signer } from 'ethers';
import { TypedDataSigner } from '@ethersproject/abstract-signer';

export const EIP_DOMAIN = {
  EIP712Domain: [
    { type: 'uint256', name: 'chainId' },
    { type: 'address', name: 'verifyingContract' },
  ],
};

export type SessionTx = {
  to: string;
  amount: number;
  data: string;
  nonce: number;
};

export const SESSION_TX_TYPE = {
  // ALLOWANCE_TRANSFER_TYPEHASH = keccak256( "SessionTransaction(address to,uint256 amount,bytes data,uint256 nonce)" );
  SessionTransaction: [
    { type: 'address', name: 'to' },
    { type: 'uint256', name: 'amount' },
    { type: 'bytes', name: 'data' },
    { type: 'uint256', name: 'nonce' },
  ],
};

// TODO inputs and Date.now()
export const getSessionParams = (): any => {
  const sessionParam = {
    startTimestamp: '1665239610',
    endTimestamp: '1665326010',
    enable: true,
  };
  return sessionParam;
};

export const getPermissionParams = (tokenAddress: string): any => {
  const ABI = ['function transfer(address to, uint amount)'];
  const iface = new ethers.utils.Interface(ABI);
  const encodedData = iface.encodeFunctionData('transfer', [
    '0x1234567890123456789012345678901234567890',
    '10000000000',
  ]);

  const transferFunctionSignature = encodedData.slice(0, 10);

  const permissionParams = {
    whitelistDestination: tokenAddress,
    whitelistMethods: [transferFunctionSignature],
    tokenAmount: 100000000,
  };
  return permissionParams;
};

export const getEnabledSessionSig = async (
  signer: Signer & TypedDataSigner,
  chainId: number,
  scwAddress: string,
  authorizedTx: SessionTx,
): Promise<string> => {
  if (!chainId && !signer.provider) {
    throw Error('Provider required to retrieve chainId');
  }
  // const cid = chainId || (await signer.provider!.getNetwork()).chainId;
  const cid = chainId;
  // const signerAddress = await signer.getAddress();

  const signature = await signer._signTypedData(
    { verifyingContract: scwAddress, chainId: cid },
    SESSION_TX_TYPE,
    authorizedTx,
  );
  return signature;
};
