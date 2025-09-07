import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import InventoryPage from "./pages/InventoryPage";
import ProductsPage from "./pages/ProductsPage";
import PosLayout from "./layouts/PosLayout";
import SpecialLayout from "./layouts/SpecialLayout";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import NotFoundPage from "./pages/NotFoundPage";
import POSPage from "./pages/PosPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Main Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Route>

        {/* ✅ POS Layout Route */}
        <Route element={<PosLayout />}>
          <Route path="/pos" element={<POSPage />} />
        </Route>

        {/* ✅ Special Layout Routes */}
        <Route element={<SpecialLayout />}>
          <Route
            path="/under-construction"
            element={<UnderConstructionPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
