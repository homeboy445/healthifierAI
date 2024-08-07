import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import ChatPage from "../chatPage/chatPage";
import MedicinePage from "../medicinePage/medicinePage";
import PlansPage from "../plansPage/plansPage";
import Menu from "./menu";

const MenuRouter = () => {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", width: "100%" }}>
        {/* Your Menu */}
        <Menu /> 
        <div style={{ marginLeft: "20%", width: "100%" }}>
        {/* Routes */}
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/medicine" element={<MedicinePage />} />
          <Route path="/plans" element={<PlansPage />} />
          {/* Redirect to home page if no route matches */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default MenuRouter;
