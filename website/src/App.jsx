import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./utils/AuthContext";

import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";
import Security from "./pages/security/Security";
import Monitor from "./pages/monitor/Monitor";
import NF404 from "./pages/nf404/NF404";
import Navbar from "./components/navbar/Navbar";
import Loading from './components/loading/Loading';
import { useSpinner } from "./utils/SpinnerContext";

function App() {
  const { user } = useAuth();
  const {spinner} = useSpinner();
  return (
    <BrowserRouter>
    {spinner? <Loading message={spinner}/>: <></>}
    {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        {!user ? (
          <>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/profile" element={<Profile />} />

            {user.allowedTo?.includes("SETTING") && (
              <Route path="/settings" element={<Settings />} />
            )}
            {user.allowedTo?.includes("SECURITY") && (
              <Route path="/security" element={<Security />} />
            )}
            {user.allowedTo?.includes("MONITOR") && (
              <Route path="/monitor" element={<Monitor />} />
            )}
            
            <Route path="*" element={<NF404 />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
