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
import CategoryPage from "./pages/Setup/CategoryPage";
import UnitPage from "./pages/Setup/UnitPage";
import SupplierPage from "./pages/Setup/SupplierPage";
import PurchaseOrderPage from "./pages/Inventory/PurchaseOrderPage";
import GRNPage from "./pages/Inventory/GRNPage";
import StockLedgerPage from "./pages/Inventory/StockLedgerPage";
import BranchPage from "./pages/Setup/BranchPage";
import StockTransferPage from "./pages/Inventory/StockTransferPage";
import AdjustmentsPage from "./pages/Inventory/AdjustmentsPage";
import SaleListPage from "./pages/POS/SaleListPage";
import ReturnsListPage from "./pages/POS/ReturnsListPage";
import HoldSalesPage from "./pages/POS/HoldSalesPage";
import DiscountPage from "./pages/POS/DiscountPage";

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
          <Route
            path="/inventory/purchase-orders"
            element={<PurchaseOrderPage />}
          />
          <Route path="/inventory/grn" element={<GRNPage />} />
          <Route path="/inventory/stock-ledger" element={<StockLedgerPage />} />
          <Route
            path="/inventory/stock-transfer"
            element={<StockTransferPage />}
          />
          <Route path="/inventory/adjustments" element={<AdjustmentsPage />} />
          {/* setup */}
          <Route path="/setup/categories" element={<CategoryPage />} />
          <Route path="/setup/units" element={<UnitPage />} />
          <Route path="/setup/suppliers" element={<SupplierPage />} />
          <Route path="/setup/branches" element={<BranchPage />} />
          {/* Sale */}
          <Route path="/sales/sale-list" element={<SaleListPage />} />
          <Route path="/sales/returns-list" element={<ReturnsListPage />} />
          <Route path="/sales/hold" element={<HoldSalesPage />} />
          <Route path="/sales/discounts" element={<DiscountPage />} />
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
