import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "../chatPage/chatPage";
import MedicinePage from "../medicinePage/medicinePage";
import PlansPage from "../plansPage/plansPage";

const Menu = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/medicine" element={<MedicinePage />} />
        <Route path="/plans" element={<PlansPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Menu;
