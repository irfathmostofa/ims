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
import SupplierPage from "./pages/Suppliers/SupplierPage";
import PurchaseOrderPage from "./pages/Procurement/PurchaseOrderPage";
import GRNPage from "./pages/Procurement/GRNPage";
import StockLedgerPage from "./pages/Inventory/StockLedgerPage";
import BranchPage from "./pages/Setup/BranchPage";
import StockTransferPage from "./pages/Procurement/StockTransferPage";
import AdjustmentsPage from "./pages/Inventory/AdjustmentsPage";
import SaleListPage from "./pages/POS/SaleListPage";
import ReturnsListPage from "./pages/POS/ReturnsListPage";
import HoldSalesPage from "./pages/POS/HoldSalesPage";
import DiscountPage from "./pages/POS/DiscountPage";
import CustomersPage from "./pages/Customers/CustomersPage";
import ReceivablesPage from "./pages/Customers/ReceivablesPage";
import SuppliersPayPage from "./pages/Suppliers/SuppliersPayPage";
import RolesPage from "./pages/Setup/RolesPage";
import CompanyPage from "./pages/Setup/CompanyPage";
import UsersPage from "./pages/Setup/UsersPage";
import JournalsPage from "./pages/Accounts/JournalsPage";
import TransactionsPage from "./pages/Accounts/TransactionsPage";
import SalesReportPage from "./pages/Reports/SalesReportPage";
import StockReportPage from "./pages/Reports/StockReportPage";
import ProfitabilityReportPage from "./pages/Reports/ProfitabilityReportPage";
import PurchaseReportPage from "./pages/Reports/PurchaseReportPage";
import LoginPage from "./pages/Auth/LoginPage";
import AuthLayout from "./layouts/AuthLayout";
import SetupWizard from "./pages/Setup/SetupWizard";
import { Toaster } from "sonner";
import { PrivateRoute } from "./hook/PrivateRoute";
import ConfigPage from "./pages/Website/configpage";
import { OrderList } from "./pages/Orders/OrderList";
import { OrderPayment } from "./pages/Orders/OrderPayment";
import { OrderTracking } from "./pages/Orders/OrderTracking";
import { OrderReturn } from "./pages/Orders/OrderReturn";
import { Logistics } from "./pages/Orders/Logistics";
import { CouponMgmt } from "./pages/Orders/CouponMgmt";
import { Requisition } from "./pages/Procurement/Requisition";
import { RequisitionView } from "./pages/Procurement/RequisitionView";
import { OrderDetails } from "./pages/Orders/OrderDetails";
import StockRecordPage from "./pages/Procurement/StockRecordPage";
import { SimpleNetworkStatusToast } from "./components/ui/NetworkStatusToast";
import AccountHeadpage from "./pages/Accounts/AccountHeadpage";
import AccountPage from "./pages/Accounts/AccountPage";
import AccountingPeriodPage from "./pages/Accounts/AccountingPeriodPage";
import BulkProductUpload from "./pages/Inventory/BulkProductUpload";
import ThemePage from "./pages/Website/ThemePage";
import DeliveryMethodPage from "./pages/Setup/DeliveryMethodPage";
import PaymentMethodPage from "./pages/Setup/PaymentMethodPage";
import { PartyViewPage } from "./pages/Profile/PartyViewPage";
import UnauthorizedPage from "./pages/Others/UnauthorizedPage";
import { RoleBasedRoute } from "./hook/RoleBasedRoute";

import CampaignPage from "./pages/Marketing/CampaignPage";
import SendMessagePage from "./pages/Marketing/SendMessagePage";
import SendMobileMessagePage from "./pages/Marketing/SendMobileMessagePage";
import WebsiteSetupPage from "./pages/Website/websiteSetupPage";


export default function App() {
  return (
    <>
      <Toaster richColors position="top-center" expand={true} />
      <SimpleNetworkStatusToast />
      <Router>
        <div className="print_section"></div>
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/setup-wizard" element={<SetupWizard />} />
          </Route>

          {/* ========== PROTECTED ROUTES ========== */}
          {/* First check authentication, then check roles */}

          {/* Admin Only Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<RoleBasedRoute allowedRoles={["Admin"]} />}>
              <Route element={<MainLayout />}>
                {/* Admin Only: Setup */}
                <Route path="/setup/roles" element={<RolesPage />} />
                <Route path="/setup/company" element={<CompanyPage />} />
                <Route path="/setup/users" element={<UsersPage />} />
                <Route path="/config" element={<ConfigPage />} />
                <Route path="/web-setting" element={<WebsiteSetupPage />} />
                <Route path="/theme" element={<ThemePage />} />

                {/* Admin Only: Accounts */}
                <Route
                  path="/accounts/account-head"
                  element={<AccountHeadpage />}
                />
                <Route path="/accounts/accounts" element={<AccountPage />} />
                <Route
                  path="/accounts/accounting-period"
                  element={<AccountingPeriodPage />}
                />
                <Route path="/accounts/journals" element={<JournalsPage />} />

                {/* Admin Only: Reports */}
                <Route
                  path="/reports/profitability"
                  element={<ProfitabilityReportPage />}
                />
              </Route>
            </Route>
          </Route>

          {/* Admin & Manager Routes */}
          <Route element={<PrivateRoute />}>
            <Route
              element={<RoleBasedRoute allowedRoles={["Admin", "Manager"]} />}
            >
              <Route element={<MainLayout />}>
                {/* Inventory Management - Advanced */}
                <Route
                  path="/inventory/products/bulk"
                  element={<BulkProductUpload />}
                />
                <Route
                  path="/inventory/adjustments"
                  element={<AdjustmentsPage />}
                />

                {/* Setup - Branch Management */}
                <Route path="/setup/branches" element={<BranchPage />} />

                {/* Procurement - Management */}
                <Route
                  path="/procurement/purchase-orders"
                  element={<PurchaseOrderPage />}
                />
                <Route
                  path="/procurement/stock-transfer"
                  element={<StockTransferPage />}
                />

                {/* Reports - Management */}
                <Route path="/reports/sales" element={<SalesReportPage />} />
                <Route path="/reports/stock" element={<StockReportPage />} />
                <Route
                  path="/reports/purchase"
                  element={<PurchaseReportPage />}
                />
                <Route path="/campaign" element={<CampaignPage />} />
                <Route
                  path="/send-whatsapp-sms"
                  element={<SendMessagePage />}
                />
                <Route
                  path="/send-mobile-sms"
                  element={<SendMobileMessagePage />}
                />
              </Route>
            </Route>
          </Route>

          {/* All Authenticated Users (Admin, Manager, Staff) */}
          <Route element={<PrivateRoute />}>
            <Route
              element={
                <RoleBasedRoute allowedRoles={["Admin", "Manager", "Staff"]} />
              }
            >
              <Route element={<MainLayout />}>
                {/* Dashboard */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Inventory - Basic Access */}
                <Route
                  path="/inventory/products"
                  element={<AllProductsPage />}
                />
                <Route
                  path="/inventory/products/add"
                  element={<ProductAddPage />}
                />
                <Route
                  path="/inventory/products/:id"
                  element={<ProductViewPage />}
                />
                <Route
                  path="/inventory/products/:id/edit"
                  element={<ProductEditPage />}
                />
                <Route
                  path="/inventory/categories"
                  element={<CategoryPage />}
                />
                <Route path="/inventory/units" element={<UnitPage />} />
                <Route
                  path="/inventory/stock-ledger"
                  element={<StockLedgerPage />}
                />

                {/* Setup - Basic */}
                <Route
                  path="/setup/payment-methods"
                  element={<PaymentMethodPage />}
                />
                <Route
                  path="/setup/delivery-methods"
                  element={<DeliveryMethodPage />}
                />

                {/* Sales */}
                <Route path="/sales/sale-list" element={<SaleListPage />} />
                <Route
                  path="/sales/returns-list"
                  element={<ReturnsListPage />}
                />
                <Route path="/sales/hold" element={<HoldSalesPage />} />
                <Route path="/sales/discounts" element={<DiscountPage />} />

                {/* Procurement - Basic */}
                <Route path="/procurement/grn" element={<GRNPage />} />
                <Route
                  path="/procurement/requisition"
                  element={<Requisition />}
                />
                <Route
                  path="/procurement/requisition-view/:id"
                  element={<RequisitionView />}
                />
                <Route
                  path="/procurement/stock-record"
                  element={<StockRecordPage />}
                />

                {/* Online Order */}
                <Route path="/order/list" element={<OrderList />} />
                <Route path="/order/:id" element={<OrderDetails />} />
                <Route path="/order/payment" element={<OrderPayment />} />
                <Route path="/order/tracking" element={<OrderTracking />} />
                <Route path="/order/return" element={<OrderReturn />} />
                <Route path="/order/coupon" element={<CouponMgmt />} />
                <Route path="/order/logistics" element={<Logistics />} />

                {/* Customers */}
                <Route
                  path="/customers/customer-list"
                  element={<CustomersPage />}
                />
                <Route
                  path="/customers/receivables"
                  element={<ReceivablesPage />}
                />

                {/* Suppliers */}
                <Route path="/suppliers/list" element={<SupplierPage />} />
                <Route
                  path="/suppliers/payables"
                  element={<SuppliersPayPage />}
                />
                <Route
                  path="/party/view/:type/:id"
                  element={<PartyViewPage />}
                />

                {/* Accounts - Basic */}
                <Route
                  path="/accounts/transactions"
                  element={<TransactionsPage />}
                />
              </Route>
            </Route>
          </Route>

          {/* Cashier Only Routes (POS System) */}
          <Route element={<PrivateRoute />}>
            <Route
              element={
                <RoleBasedRoute
                  allowedRoles={["Admin", "Manager", "Cashier"]}
                />
              }
            >
              <Route element={<PosLayout />}>
                <Route path="/pos" element={<POSPage />} />
                <Route path="/return" element={<ReturnPage />} />
              </Route>
            </Route>
          </Route>

          {/* ========== SPECIAL/ERROR ROUTES ========== */}
          <Route element={<SpecialLayout />}>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route
              path="/under-construction"
              element={<UnderConstructionPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}
