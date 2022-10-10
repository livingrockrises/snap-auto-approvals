import { ethers, Signer, BigNumber } from 'ethers';
import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { JsonRpcProvider } from '@ethersproject/providers';
import { configInfo as config } from '.';

export const EIP_DOMAIN = {
  EIP712Domain: [
    { type: 'uint256', name: 'chainId' },
    { type: 'address', name: 'verifyingContract' },
  ],
};
export type SessionTransaction = {
  to: string;
  amount: string | number | BigNumber;
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
  // todo: Remove hard coded session timestamp
  const sessionParam = {
    startTimestamp: '1665350119',
    endTimestamp: '1665436509',
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
    tokenAmount: ethers.utils.parseEther('1000').toString(),
  };
  return permissionParams;
};

export const Erc20 = [
  'function transfer(address _receiver, uint256 _value) public returns (bool success)',
  'function transferFrom(address, address, uint) public returns (bool)',
  'function approve(address _spender, uint256 _value) public returns (bool success)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
  'function balanceOf(address _owner) public view returns (uint256 balance)',
  'event Approval(address indexed _owner, address indexed _spender, uint256 _value)',
];

export const Erc20Interface = new ethers.utils.Interface(Erc20);

export const encodeTransfer = (
  target: string,
  amount: string | number,
): string => {
  return Erc20Interface.encodeFunctionData('transfer', [target, amount]);
};

const rpcURL =
  'https://eth-goerli.alchemyapi.io/v2/lmW2og_aq-OXWKYRoRu-X6Yl6wDQYt_2';
const goerliProvider: JsonRpcProvider = new ethers.providers.JsonRpcProvider(
  rpcURL,
);

let id = 0;

export const getNonceForSessionKey = async (
  sessionKey: string,
): Promise<number> => {
  // const sessionKeyModuleContract = new ethers.Contract(
  //   config.sessionKeyModule.address,
  //   config.sessionKeyModule.abi,
  //   goerliProvider,
  // );
  // const nonce = (
  //   await sessionKeyModuleContract.getSessionInfo(sessionKey)
  // ).nonce.toNumber();
  // return nonce;

  console.log('Session key', sessionKey);
  const iface = new ethers.utils.Interface(config.sessionKeyModule.abi);
  const _params: any = iface.encodeFunctionData('getSessionInfo', [sessionKey]);
  console.log('Params ', _params);
  id += 1;
  const body = {
    method: 'eth_call',
    jsonrpc: '2.0',
    id,
    params: [
      {
        to: config.sessionKeyModule.address,
        data: _params,
      },
    ],
  };
  const result = await fetch(rpcURL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await result.json();
  console.log('result', json);
  console.log(json.result);
  const decodedResult = iface.decodeFunctionResult(
    'getSessionInfo',
    json.result,
  );
  if (decodedResult?.sessionInfo?.nonce !== undefined) {
    return decodedResult.sessionInfo.nonce.toNumber();
  }
  throw new Error(`Could not get nonce for session key ${sessionKey}`);
};

export const isModuleEnabled = async (
  smartAccountAddress: string,
  module: string,
): Promise<boolean> => {
  console.log('Smart account addresss', smartAccountAddress);
  console.log('module address ', module);
  const iface = new ethers.utils.Interface(config.scwContract.abi);
  const _params: any = iface.encodeFunctionData('isModuleEnabled', [module]);
  console.log('Params ', _params);
  id += 1;
  const body = {
    method: 'eth_call',
    jsonrpc: '2.0',
    id,
    params: [
      {
        to: smartAccountAddress,
        data: _params,
      },
    ],
  };
  const result = await fetch(rpcURL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await result.json();
  console.log('result', json);
  if (json.result === '0x') {
    return false;
  }
  // console.log('result from contract', result);
  return true;
};

export const getEnabledSessionSig = async (
  signer: Signer & TypedDataSigner,
  sessionKeyModuleAddress: string,
  authorizedTx: SessionTransaction,
  chainId: number,
): Promise<string> => {
  if (!chainId && !signer.provider) {
    throw Error('Provider required to retrieve chainId');
  }
  // const cid = chainId || (await signer.provider!.getNetwork()).chainId;
  const cid = chainId;
  // const signerAddress = await signer.getAddress();

  const signature = await signer._signTypedData(
    { verifyingContract: sessionKeyModuleAddress, chainId: cid },
    SESSION_TX_TYPE,
    authorizedTx,
  );
  return signature;
};
