import { OnRpcRequestHandler } from '@metamask/snap-types';

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

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
      return new Promise((resolve) => {
        resolve({ hash: 'tx hash from hello' });
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
    default:
      throw new Error('Method not found.');
  }
};
