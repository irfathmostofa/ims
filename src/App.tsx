import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import InventoryPage from "./pages/InventoryPage";
import ProductsPage from "./pages/ProductsPage";
import PosLayout from "./layouts/PosLayout";
import SpecialLayout from "./layouts/SpecialLayout";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import NotFoundPage from "./pages/NotFoundPage";
import POSPage from "./pages/PosPage";
import ReturnPage from "./pages/ReturnPage";
import ProductAddPage from "./pages/ProductAddPage";
import ProductViewPage from "./pages/ProductViewPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Main Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/inventory/products" element={<ProductsPage />} />
          <Route path="/inventory/products/add" element={<ProductAddPage />} />
          <Route path="/inventory/products/:id" element={<ProductViewPage />} />
        </Route>

        {/* ✅ POS Layout Route */}
        <Route element={<PosLayout />}>
          <Route path="/pos" element={<POSPage />} />
          <Route path="/return" element={<ReturnPage />} />
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
