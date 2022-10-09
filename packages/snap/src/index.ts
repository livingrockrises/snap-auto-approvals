import { OnRpcRequestHandler } from '@metamask/snap-types';
import SmartAccount from '@biconomy-sdk/smart-account';
import { LocalRelayer } from '@biconomy-sdk/relayer';
import { ethers, Wallet as EOAWallet } from 'ethers';
import { configInfo as config } from './utils';
import {
  getSessionParams,
  getPermissionParams,
  getEnabledSessionSig,
  getNonceForSessionKey,
  encodeTransfer,
} from './utils/execution';

// TODO: Temp Goerli USDC
const usdcAddress = '0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF';
const receiver = '0x7306aC7A32eb690232De81a9FFB44Bb346026faB';
let smartAccount: SmartAccount;

const iFace = new ethers.utils.Interface(config.scwContract.abi);
const iFaceSessionModule = new ethers.utils.Interface(
  config.sessionKeyModule.abi,
);
/**
 *
 */
async function getFees() {
  console.log('wallet');
  console.log(wallet);
  console.log(window);
  const response = await fetch('https://www.etherchain.org/api/gasPriceOracle');
  return response.text();
}

wallet
  .request({
    method: 'wallet_requestPermissions',
    params: [{ eth_accounts: {} }],
  })
  .then((permissions) => {
    console.log('permissions granted..');
    console.log(permissions);
  })
  .catch((error) => {
    console.error(error);
  });

wallet.on('accountsChanged', async function (accounts: any) {
  console.log('updated accounts ');
  console.log(accounts[0]);
  await getsmartAccount();
  // await smartAccount.init();
});

/**
 *
 */
async function getsmartAccount(): Promise<SmartAccount> {
  // const ethersProvider = new ethers.providers.Web3Provider(wallet)
  // New instance, all config params are optional
  smartAccount = new SmartAccount(wallet, {
    activeNetworkId: Number(wallet.chainId),
    // supportedNetworksIds: supportedChains,
  });
  console.log('smart account  ');
  console.log(smartAccount);

  // TODO
  // reinit on accounts changed
  // eslint-disable-next-line require-atomic-updates
  smartAccount = await smartAccount.init();
  console.log('initialized');
  console.log(smartAccount);

  return smartAccount;
}

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

export const getEOAWallet = (privateKey: string) => {
  const providerUrl =
    'https://goerli.infura.io/v3/d126f392798444609246423b06116c77';

  const ethersWallet = new EOAWallet(privateKey);

  return ethersWallet.connect(
    new ethers.providers.JsonRpcProvider(providerUrl),
  );
};

export const promptUser = async (
  prompt: string,
  description: string,
  content: string,
): Promise<boolean> => {
  const response: any = await wallet.request({
    method: 'snap_confirm',
    params: [
      {
        prompt,
        description,
        textAreaContent: content,
      },
    ],
  });
  if (response) {
    return response;
  }
  return false;
};

export const getEOAAccount = async (): Promise<string> => {
  const accounts: any = await wallet.request({ method: 'eth_requestAccounts' });
  return accounts[0];
};

export type SCWStorage = {
  owner: string;
  scwAddress: string;
};

export type SessionKeyStorage = {
  owner: string;
  sessionKey: string;
  pk: string;
};

export type KeyPair = {
  address: string;
  pk: string;
};

export const saveSCWInfo = async (data: SCWStorage) => {
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', data],
  });
};

export const getSCWInfo = async () => {
  const result = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  return result;
};

export const clearSCWInfo = async () => {
  const result = await wallet.request({
    method: 'snap_manageState',
    params: ['clear'],
  });
  return result;
};

export const storeSessionInfo = async (data: SessionKeyStorage) => {
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', data],
  });
};

export const clearSessionInfo = async () => {
  const result = await wallet.request({
    method: 'snap_manageState',
    params: ['clear'],
  });
  return result;
};

export const getSessionInfo = async () => {
  const result = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  return result;
};

export const generateKeyPair = () => {
  const keyPair = ethers.Wallet.createRandom();
  return {
    address: keyPair.address,
    pk: keyPair.privateKey,
  };
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      /* return new Promise((resolve) => {
        resolve({ hash: 'tx hash from hello' });
      });*/
      return wallet.request({
        method: 'snap_getAppKey',
      });
    // return wallet.request({
    //   method: 'snap_confirm',
    //   params: [
    //     {
    //       prompt: getMessage(origin),
    //       description: "If you're seeing this you are pretty cool!",
    //       textAreaContent: "Embrace what's next for you",
    //     },
    //   ],
    // });
    case 'sendSCWTransaction':
      console.log('inside snap. getting params from request', request.params);
      return new Promise((resolve) => {
        resolve({
          hash: 'hash from scw tx 0x87654678',
          params: request.params,
        });
      });
    case 'fees':
      return getFees().then((fees) => {
        const feesObject = JSON.parse(fees);
        const baseFee = parseFloat(feesObject.currentBaseFee);
        const safeLow = Math.ceil(baseFee + parseFloat(feesObject.safeLow));
        const standard = Math.ceil(baseFee + parseFloat(feesObject.standard));
        const fastest = Math.ceil(baseFee + parseFloat(feesObject.fastest));
        return wallet.request({
          method: 'snap_confirm',
          params: [
            {
              prompt: getMessage(origin),
              description: 'Current gas fees from etherchain.org:',
              textAreaContent:
                `Low: ${safeLow}\n` +
                `Average: ${standard}\n` +
                `High: ${fastest}\n`,
            },
          ],
        });
      });
    case 'connect':
      return new Promise((resolve, reject) => {
        getEOAAccount().then(async (eoa) => {
          // const storedValue: any = await getSCWInfo();
          await clearSCWInfo();
          /* if (storedValue && storedValue.owner === eoa) {
            resolve(storedValue.scwAddress);
          } else {*/
          getsmartAccount().then(async (_smartAccount) => {
            console.log('owner ', _smartAccount.owner);
            const addr = _smartAccount.address;
            promptUser(
              getMessage(origin),
              'Do you want to use Smart Account',
              `Your Smart Account Address is ${_smartAccount.address}`,
            ).then(async (approval) => {
              if (approval) {
                /* await saveSCWInfo({
                  owner: _smartAccount.owner,
                  scwAddress: _smartAccount.address,
                });*/
                resolve(addr);
              } else {
                reject(new Error('EOA user'));
              }
            });
          });
          // }
        });
      });
    case 'enable_session_module':
      return new Promise((resolve, reject) => {
        const relayer = new LocalRelayer(
          getEOAWallet(
            process.env.REACT_APP_PKEY ||
              '3ff26792ed7e1c706357a1565293371f2f479d331e6c718ac5c5445360e2cef8',
          ),
        );
        console.log('local relayer init..');
        console.log(relayer);
        smartAccount.setRelayer(relayer);
        console.log('relayer is set');

        const tx1 = {
          to: smartAccount.address,
          data: iFace.encodeFunctionData('enableModule', [
            config.sessionKeyModule.address,
          ]),
        };
        console.log('data for session module');
        console.log(tx1);

        smartAccount
          .createTransaction({
            transaction: tx1,
          })
          .then(async (walletTx) => {
            console.log('wallet txn crearted ');
            console.log(walletTx);
            const txHash = await smartAccount.sendTransaction({
              tx: walletTx,
              // gasLimit,
            });
            console.log(txHash);
            if (txHash) {
              resolve(txHash);
            } else {
              reject(new Error('reject txn failed'));
            }
          });

        /* const gasLimit: GasLimit = {
          hex: '0x1E8480',
          type: 'hex',
        };*/
      });
    case 'create_session':
      return new Promise((resolve, reject) => {
        const keyPair: KeyPair = generateKeyPair();
        console.log('keypair..', keyPair.address);
        const sessionParams = getSessionParams();
        console.log('session params ', sessionParams);
        const permissionParams = getPermissionParams(usdcAddress);
        console.log('permission params ', permissionParams);

        const relayer = new LocalRelayer(
          getEOAWallet(
            process.env.REACT_APP_PKEY ||
              '3ff26792ed7e1c706357a1565293371f2f479d331e6c718ac5c5445360e2cef8',
          ),
        );
        console.log('local relayer init..');
        console.log(relayer);
        smartAccount.setRelayer(relayer);
        console.log('relayer is set');

        getEOAAccount()
          .then(async (eoa) => {
            await storeSessionInfo({
              owner: eoa,
              sessionKey: keyPair.address,
              pk: keyPair.pk,
            });
          })
          .then(async () => {
            const tx2 = {
              to: config.sessionKeyModule.address,
              data: iFaceSessionModule.encodeFunctionData('createSession', [
                keyPair.address,
                [permissionParams],
                sessionParams,
              ]),
            };
            console.log('prepared txn for create session ');
            console.log(tx2);
            const scwTx = await smartAccount.createTransaction({
              transaction: tx2,
            });
            console.log('wallet txn crearted ');
            console.log(scwTx);
            const txHash = await smartAccount.sendTransaction({
              tx: scwTx,
              // gasLimit,
            });
            console.log(txHash);
            if (txHash) {
              resolve(txHash);
            } else {
              reject(new Error('reject txn failed'));
            }
          });
      });

    // TODO : Review error
    // Late promise received after Snap finished execution. Promise will be dropped.
    case 'interact':
      return new Promise((resolve, reject) => {
        console.log('inside interact');
        // TODO: get session transaction from params that eventually comes from UI

        const relayer = new LocalRelayer(
          getEOAWallet(
            process.env.REACT_APP_PKEY ||
              '3ff26792ed7e1c706357a1565293371f2f479d331e6c718ac5c5445360e2cef8',
          ),
        );
        console.log('local relayer init..');
        console.log(relayer);
        // prepare data or fetch from params
        getEOAAccount().then(async (eoa) => {
          const sessionInfo: any = await getSessionInfo();
          console.log('session info ');
          console.log(sessionInfo);

          const authorizedTx = {
            // sessionKey: sessionKey,
            to: usdcAddress,
            amount: 0,
            data: encodeTransfer(
              receiver,
              ethers.utils.parseEther('10').toString(),
            ),
            nonce: 0, // await getNonceForSessionKey(sessionInfo.sessionKey),
          };
          console.log('authorizedTx');
          console.log(authorizedTx);

          console.log(eoa);
          console.log('eoa');

          if (sessionInfo.owner === eoa) {
            const signer = new ethers.Wallet(sessionInfo.pk);
            const signature = await getEnabledSessionSig(
              signer,
              config.sessionKeyModule.address,
              authorizedTx,
              Number(wallet.chainId),
            );

            console.log('got signature');
            console.log(signature);

            const tx3 = {
              to: config.sessionKeyModule.address,
              value: 0,
              data: iFaceSessionModule.encodeFunctionData(
                'executeTransaction',
                [
                  sessionInfo.sessionKey,
                  authorizedTx.to,
                  authorizedTx.amount,
                  authorizedTx.data,
                  signature,
                ],
              ),
              chainId: Number(wallet.chainId),
            };

            console.log('module txn');
            console.log(tx3);

            const txHash = await relayer.relayAny(tx3);
            console.log(txHash);
            if (txHash) {
              resolve(txHash);
            } else {
              reject(new Error('reject txn failed'));
            }

            // relayer calls session module contract
          } else {
            reject(new Error('reject txn failed'));
          }
        });
      });
    default:
      throw new Error('Method not found.');
  }
};
