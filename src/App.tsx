import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import PosLayout from "./layouts/PosLayout";
import SpecialLayout from "./layouts/SpecialLayout";
import NotFoundPage from "./pages/Others/NotFoundPage";
import UnderConstructionPage from "./pages/Others/UnderConstructionPage";
import ReturnPage from "./pages/POS/ReturnPage";
import POSPage from "./pages/POS/PosPage";
import ProductViewPage from "./pages/Inventory/ProductViewPage";
import ProductAddPage from "./pages/Inventory/ProductAddPage";
import AllProductsPage from "./pages/Inventory/ProductsPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProductEditPage from "./pages/Inventory/ProductUpdatePage";
import CategoryPage from "./pages/Inventory/CategoryPage";

export default function App() {
  return (
    <Router>
      <div className="print_section"></div>
      <Routes>
        {/*  Main Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory/products" element={<AllProductsPage />} />
          <Route path="/inventory/products/add" element={<ProductAddPage />} />
          <Route path="/inventory/products/:id" element={<ProductViewPage />} />
          <Route
            path="/inventory/products/:id/edit"
            element={<ProductEditPage />}
          />
          <Route path="/inventory/categories" element={<CategoryPage />} />
        </Route>

        {/* POS Layout Route */}
        <Route element={<PosLayout />}>
          <Route path="/pos" element={<POSPage />} />
          <Route path="/return" element={<ReturnPage />} />
        </Route>

        {/* Special Layout Routes */}
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
