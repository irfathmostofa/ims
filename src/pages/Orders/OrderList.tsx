import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const OrderList = () => {
  return (
    <>
      <div className="p-6">
        <Breadcrumbs
          labelOverrides={{
            orders: "Orders",
            all: "All Orders",
          }}
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-bw-900">All Orders</h1>
        </div>
      </div>
    </>
  );
};
