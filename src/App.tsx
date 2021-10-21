import styled from "styled-components";
// import { ethers } from "ethers";

const Wrapper = styled.div`
  min-height: 100vh;
  background: rgb(36, 38, 59);
  color: white;
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
`;

export default function App() {
  const wave = () => {};

  return (
    <Wrapper>
      <InnerWrapper>
        <h2>👋 Wave Zone</h2>

        <div>Connect your Ethereum wallet and wave at me!</div>

        <button onClick={wave}>Wave at Me</button>
      </InnerWrapper>
    </Wrapper>
  );
}
