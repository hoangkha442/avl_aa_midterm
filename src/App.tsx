import { Navigate, Route, Routes } from "react-router-dom";
import InsertTutor from "./pages/InsertTutor";
import BalanceTutor from "./pages/BalanceTutor";
import Footer from "./components/footer";
export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/insert" replace />} />
      <Route path="/insert" element={<InsertTutor />} />
      <Route path="/balance" element={<BalanceTutor />} />
      <Route path="*" element={<Navigate to="/insert" replace />} />

    </Routes>
    <Footer />
    </>
  );
}
