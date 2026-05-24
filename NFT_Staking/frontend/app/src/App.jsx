import { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { Web3Provider, useWeb3 } from "./context/Web3Context";
import GalaxyBg  from "./components/GalaxyBg";
import Navbar    from "./components/Navbar";
import Toast     from "./components/Toast";
import Landing   from "./pages/Landing";
import Mint      from "./pages/Mint";
import Stake     from "./pages/Stake";
import Unstake   from "./pages/Unstake";
import Exchange  from "./pages/Exchange";

function PageTransition({ children }) {
  const ref      = useRef();
  const location = useLocation();

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
    );
  }, [location.pathname]);

  return <div ref={ref}>{children}</div>;
}

function Inner() {
  const { toast } = useWeb3();
  return (
    <>
      <GalaxyBg />
      <Navbar />
      <PageTransition>
        <Routes>
          <Route path="/"         element={<Landing  />} />
          <Route path="/mint"     element={<Mint     />} />
          <Route path="/stake"    element={<Stake    />} />
          <Route path="/unstake"  element={<Unstake  />} />
          <Route path="/exchange" element={<Exchange />} />
        </Routes>
      </PageTransition>
      <Toast toast={toast} />
    </>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <Inner />
    </Web3Provider>
  );
}
