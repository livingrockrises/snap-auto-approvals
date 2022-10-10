/* eslint-disable import/no-extraneous-dependencies */
import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import Notify from 'bnc-notify';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ToastContainer, toast } from 'react-toastify';
import { MetamaskActions, MetaMaskContext } from '../hooks';
// eslint-disable-next-line import/no-unassigned-import, import/no-extraneous-dependencies
import 'react-toastify/dist/ReactToastify.css';
import {
  SmartAccountActions,
  SmartAccountContext,
} from '../hooks/SmartAccountContext';
import {
  connectSnap,
  getSnap,
  shouldDisplayReconnectButton,
  // sendHello,
  // showGasFees,
  enableSessionOnSmartAccount,
  createSessionForSmartAccount,
  sendSessionTransaction,
  useSmartAccount,
  isSessionModuleEnabled,
  getSessionInfo,
} from '../utils';

import {
  ConnectButton,
  InstallFlaskButton,
  // ReconnectButton,
  SendHelloButton,
  EnableModuleButton,
  InteractSessionButton,
} from './Buttons';
import { Card } from './Card';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 1rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

// const Heading = styled.h1`
//   margin-top: 0;
//   margin-bottom: 2.4rem;
//   text-align: center;
// `;

// const Span = styled.span`
//   color: ${(props) => props.theme.colors.primary.default};
// `;

// const Subtitle = styled.p`
//   font-size: ${({ theme }) => theme.fontSizes.large};
//   font-weight: 500;
//   margin-top: 0;
//   margin-bottom: 0;
//   ${({ theme }) => theme.mediaQueries.small} {
//     font-size: ${({ theme }) => theme.fontSizes.text};
//   }
// `;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 100.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 10px;
  width: 100%;
`;

const ContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  margin: 5px;
  padding: 10px;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const SessionBody = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 20px 0px 10px 0px;
`;

const SessionRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 5px;
  padding: 2px;
`;

const SessionsCard = styled.div<{ disabled: boolean }>`
  display: flex;
  flex-direction: column;
  width: 500px;
  background-color: ${({ theme }) => theme.colors.card.default};
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
  padding: 2.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
`;

const SessionOverviewMessage = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin-top: 40px;
  padding: 10px;
`;

const SessionHeader = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const bncNotify = Notify({
  dappId: '7c78f803-504b-41a4-a84e-9dcca3271a75', // [String] The API key created by step one above
  networkId: 5, // [Integer] The Ethereum network ID your Dapp uses.
});

export const Home = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [smartAccount, saDispatch] = useContext(SmartAccountContext);

  async function _getAndSaveSessionInfo() {
    if (smartAccount.sessionModuleEnabled) {
      const sessionInfo: any = await getSessionInfo();
      console.log('Session info is : ', sessionInfo);
      if (sessionInfo) {
        saDispatch({
          type: SmartAccountActions.SetSessionKey,
          payload: {
            key: sessionInfo.sessionKey,
            owner: sessionInfo.owner,
          },
        });
      }
    }
  }

  const notify = (message: string, options?: any) => toast(message, options);

  useEffect(() => {
    console.log('State udpated for session', smartAccount.sessionInfo);
  }, [smartAccount.sessionInfo]);

  useEffect(() => {
    _getAndSaveSessionInfo();
  }, [smartAccount.sessionModuleEnabled]);

  useEffect(() => {
    async function checkSessionModue() {
      if (smartAccount.address) {
        const isSessinoModuleEnabled = await isSessionModuleEnabled(
          smartAccount.address,
        );
        if (isSessinoModuleEnabled) {
          saDispatch({
            type: SmartAccountActions.SetSessionModuleEnabled,
            payload: true,
          });

          saDispatch({
            type: SmartAccountActions.SetModule,
            payload: {
              address: '0x2b5Dca28Ad0b7301b78ee1218b1bFC4A7B22E3bC',
              enabled: true,
              name: 'Session Module',
            },
          });
        }
      }
    }
    checkSessionModue();
  }, [smartAccount.address]);

  useEffect(() => {
    async function checkSessionModue() {
      if (smartAccount.sessionModuleEnabled) {
        const sessionInfo = await getSessionInfo();
        if (sessionInfo) {
          saDispatch({
            type: SmartAccountActions.SetSessionModuleEnabled,
            payload: true,
          });
        }
      }
    }
    checkSessionModue();
  }, [smartAccount.sessionModuleEnabled]);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleEnableSmartAccountClick = async () => {
    try {
      notify('Setting up your Smart Account', {
        autoClose: 1500,
      });
      console.log('Sending useSmart Account event');
      setTimeout(() => {
        notify(
          'When prompted, allow metamask snap to manage your smart account via session keys',
        );
      }, 1500);
      const _smartAccount: any = await useSmartAccount();
      console.log('got smart account', _smartAccount);
      if (_smartAccount) {
        saDispatch({
          type: SmartAccountActions.SetSmartAccount,
          payload: {
            _smartAccount,
          },
        });
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleEnableSessionClick = async () => {
    try {
      // const response = await sendHello();
      // console.log('app key', response);
      // await showGasFees();
      // await useSmartAccount();
      await enableSessionOnSmartAccount();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleCreateSessionClick = async () => {
    try {
      notify('Creating new session key in snap', {
        autoClose: 1500,
      });

      setTimeout(() => {
        notify(
          'Session key generated. Give your signature when prompted to add the session on your wallet on-chain',
        );
      }, 1500);
      const txHash: any = await createSessionForSmartAccount();
      if (txHash) {
        const { emitter } = bncNotify.hash(txHash);
        emitter.on('txConfirmed', () => {
          notify(
            'Session key added on chain. Now you can initiate transactions on your contract without needing to sign every interaction',
          );
        });
      }
      _getAndSaveSessionInfo();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSessionInteractonClick = async () => {
    try {
      // const response = await sendHello();
      // console.log('app key', response);
      // await showGasFees();
      // await useSmartAccount();
      await sendSessionTransaction();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      {/* <Heading>
        Welcome to <Span>SCW Session keys Snap</Span>
      </Heading> */}

      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {/* {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )} */}

        <MainContainer>
          <ContainerRow>
            <div>
              {smartAccount?.address === undefined && (
                <Card
                  content={{
                    title: 'Discover Smart Accounts',
                    description:
                      'Explore more benefits (social recovery and session keys) with smart accounts',
                    button: (
                      <SendHelloButton
                        onClick={handleEnableSmartAccountClick}
                        disabled={!state.installedSnap}
                      />
                    ),
                  }}
                  disabled={!state.installedSnap}
                  fullWidth={false}
                />
              )}

              {smartAccount?.address !== undefined && (
                <Card
                  content={{
                    title: 'Discover Smart Accounts',
                    description: `Smart Account: ${smartAccount.address}`,
                  }}
                  disabled={!state.installedSnap}
                  fullWidth={false}
                />
              )}

              {!smartAccount.sessionModuleEnabled && (
                <Card
                  content={{
                    title: 'Enable Session Module',
                    description: 'Set up temporary session for auto approvals',
                    button: (
                      <EnableModuleButton
                        onClick={handleEnableSessionClick}
                        disabled={!state.installedSnap}
                      />
                    ),
                  }}
                  disabled={!smartAccount.address}
                  fullWidth={false}
                />
              )}

              {smartAccount.sessionModuleEnabled && (
                <Card
                  content={{
                    title: 'Enable Session Module',
                    description:
                      '✅ Session Module is already enabled on your smart account',
                  }}
                  disabled={!smartAccount.address}
                  fullWidth={false}
                />
              )}
            </div>
            <SessionsCard disabled={!smartAccount.sessionModuleEnabled}>
              <SessionHeader>
                <Title>Sessions</Title>
                <button
                  onClick={handleCreateSessionClick}
                  disabled={!smartAccount.sessionModuleEnabled}
                >
                  + Create Session
                </button>
              </SessionHeader>
              <SessionBody>
                {smartAccount.sessionInfo &&
                  smartAccount.sessionInfo.length > 0 && (
                    <SessionRow>
                      <div>{`${smartAccount.sessionInfo[0].key}`}</div>
                      <div>Active</div>
                    </SessionRow>
                  )}

                {smartAccount.sessionInfo &&
                  smartAccount.sessionInfo.length === 0 && (
                    <SessionOverviewMessage>
                      You have not created any sessions. Click + Create Session
                      button to create your session.
                    </SessionOverviewMessage>
                  )}
              </SessionBody>
            </SessionsCard>
          </ContainerRow>
          <ContainerRow>
            <Card
              content={{
                title: 'Auto approvals',
                description: 'Session approved actions: USDC transfer',
                button: (
                  <InteractSessionButton
                    onClick={handleSessionInteractonClick}
                    disabled={!state.installedSnap}
                  />
                ),
              }}
              disabled={!state.installedSnap}
              fullWidth={
                state.isFlask &&
                Boolean(state.installedSnap) &&
                !shouldDisplayReconnectButton(state.installedSnap)
              }
            />
          </ContainerRow>
        </MainContainer>

        {/* <Card
          content={{
            title: 'Create Session',
            description: 'Create a session on your enabled Smart Account',
            button: (
              <CreateSessionButton
                onClick={handleCreateSessionClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        /> */}

        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
      <ToastContainer position="bottom-right" />
    </Container>
  );
};
