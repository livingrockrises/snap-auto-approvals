import { createContext, Dispatch, ReactNode, Reducer, useReducer } from 'react';

export type SmartModule = {
  address: string;
  enabled: boolean;
  name: string;
};

export type SessionKey = {
  key: string;
  owner: string;
};
export type SmartAccountState = {
  isDeployed: boolean;
  address: string | undefined;
  owner: string | undefined;
  modules: SmartModule[];
  sessionModuleEnabled: boolean;
  sessionInfo: SessionKey[];
};

const initialState: SmartAccountState = {
  isDeployed: false,
  address: undefined,
  owner: undefined,
  modules: [],
  sessionModuleEnabled: false,
  sessionInfo: [],
};

type SmartAccountDispatch = { type: SmartAccountActions; payload: any };

export const SmartAccountContext = createContext<
  [SmartAccountState, Dispatch<SmartAccountDispatch>]
>([
  initialState,
  () => {
    /* no op */
  },
]);

export enum SmartAccountActions {
  SetModule = 'SetModule',
  SetSmartAccount = 'SetSmartAccount',
  SetSessionModuleEnabled = 'SetSessionModuleEnabled',
  SetSessionKey = 'SetSessionKey',
}

const reducer: Reducer<SmartAccountState, SmartAccountDispatch> = (
  state,
  action,
) => {
  switch (action.type) {
    case SmartAccountActions.SetSessionKey: {
      const _sessionInfo = action.payload;
      console.log('Set session key from action payload', action.payload);
      const _sessionArray: SessionKey[] = state.sessionInfo;
      const cloneCopy: SessionKey[] = JSON.parse(JSON.stringify(_sessionArray));
      cloneCopy.push(_sessionInfo);
      return {
        ...state,
        sessionInfo: [_sessionInfo],
      };
    }

    case SmartAccountActions.SetModule: {
      const _module: any = action.payload;
      const moduleArray: SmartModule[] = state.modules;
      moduleArray.push(_module);
      return {
        ...state,
        modules: moduleArray,
      };
    }

    case SmartAccountActions.SetSmartAccount: {
      console.log(
        'UPdating smart acconut state with payload: ',
        action.payload,
      );
      const { _smartAccount } = action.payload;
      return {
        ...state,
        address: _smartAccount.address,
        owner: _smartAccount.owner,
      };
    }

    case SmartAccountActions.SetSessionModuleEnabled: {
      return {
        ...state,
        sessionModuleEnabled: action.payload,
      };
    }
    default:
      return state;
  }
};

/**
 * MetaMask context provider to handle MetaMask and snap status.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX.
 */

export const SmartAccountProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  //   useEffect(() => {
  //     async function detectFlask() {
  //       const isFlaskDetected = await isFlask();

  //       dispatch({
  //         type: SmartAccountActions.SetFlaskDetected,
  //         payload: isFlaskDetected,
  //       });
  //     }

  //     async function detectSnapInstalled() {
  //       const installedSnap = await getSnap();
  //       dispatch({
  //         type: SmartAccountActions.SetInstalled,
  //         payload: installedSnap,
  //       });
  //     }

  //     detectFlask();

  //     if (state.isFlask) {
  //       detectSnapInstalled();
  //     }
  //   }, [state.isFlask, window.ethereum]);

  //   useEffect(() => {
  //     let timeoutId: number;

  //     if (state.error) {
  //       timeoutId = window.setTimeout(() => {
  //         dispatch({
  //           type: SmartAccountActions.SetError,
  //           payload: undefined,
  //         });
  //       }, 10000);
  //     }

  //     return () => {
  //       if (timeoutId) {
  //         window.clearTimeout(timeoutId);
  //       }
  //     };
  //   }, [state.error]);

  return (
    <SmartAccountContext.Provider value={[state, dispatch]}>
      {children}
    </SmartAccountContext.Provider>
  );
};
