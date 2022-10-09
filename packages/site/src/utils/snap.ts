import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  console.log('connect Snap...');
  const response = await window.ethereum.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: {
          [snapId]: {
            ...params,
          },
        },
      },
    ],
  });

  console.log('response... ');
  console.log(response);
};

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  console.log('Wallet . get snaps');
  // await connectSnap();
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    console.log('Tried to get snaps...');
    const snaps = await getSnaps();
    console.log('snaps...');
    console.log(snaps);

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */

export const sendHello = async () => {
  console.log('invoke Snap...');
  const helloResponse = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'sendSCWTransaction',
        params: ['First params'],
      },
    ],
  });

  console.log(helloResponse);

  // window.ethereum
  //   .request({ method: 'eth_requestAccounts' })
  //   .then((result) => {
  //     console.log(result);
  //   })
  //   .catch((error) => {
  //     if (error.code === 4001) {
  //       // EIP-1193 userRejectedRequest error
  //       console.log('Please connect to MetaMask.');
  //     } else {
  //       console.error(error);
  //     }
  //   });

  // const permission = await window.ethereum.request({
  //   method: 'wallet_getPermissions',
  // });

  // console.log(permission);

  // const requestPermission = await window.ethereum.request({
  //   method: 'wallet_requestPermissions',
  // params: [{ snap_manageState: {} }],
  //   params: [{ snap_getBip44Entropy_60: {} }],
  // params: [{ eth_accounts: {} }],
  // });

  // console.log('requested permissions.. ');
  // console.log(requestPermission);

  // // Saving and retreiving data from storage
  // await window.ethereum.request({
  //   method: 'snap_manageState',
  //   params: ['update', { scwAddress: '0xmySmartAccountAddress' }],
  // });

  // const persistedData = await window.ethereum.request({
  //   method: 'snap_manageState',
  //   params: ['get'],
  // });

  // console.log(persistedData);
  // const result = await window.ethereum.request({
  //   method: 'snap_getBip32Entropy',
  //   params: [
  //     defaultSnapOrigin,
  //     {
  //       path: ['m', '44', '60'],
  //       curve: 'ed25519',
  //     },
  //   ],
  // });

  // console.log(result);
};

export const showGasFees = async () => {
  console.log('invoke Snap...');
  const gasFeesResponse = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'fees',
        params: ['First params'],
      },
    ],
  });
  console.log(gasFeesResponse);
};

export const useSmartAccount = async () => {
  console.log('invoke Snap...');
  const smartAccountResponse = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'connect',
        params: ['First params'],
      },
    ],
  });
  console.log(smartAccountResponse);
};

export const enableSessionOnSmartAccount = async () => {
  console.log('invoke Snap...');
  const smartAccountResponse = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'enable_session_module',
        params: ['First params'],
      },
    ],
  });
  console.log(smartAccountResponse);
};

export const createSessionForSmartAccount = async () => {
  console.log('invoke Snap...');
  const smartAccountResponse = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'create_session',
        params: ['First params'],
      },
    ],
  });
  console.log(smartAccountResponse);
};

export const sendSessionTransaction = async () => {
  console.log('invoke Snap...');
  const smartAccountResponse = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'interact',
        params: ['First params'],
      },
    ],
  });
  console.log(smartAccountResponse);
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
