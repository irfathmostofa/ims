import { apiClient } from "@/hook/apiClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export const PartyViewPage = () => {
  const { type, id } = useParams();
  const [partyInfo, setPartyInfo] = useState([]);
  const getPartyInfo = async () => {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/party/get-party`,
        { method: "GET", tokenType: "jwt" },
      );

      setPartyInfo(response.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch branches");
    }
  };

  useEffect(() => {
    getPartyInfo();
  }, []);

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex max-w-full border-b pb-4">
          <div className="w-3/12">
            <img src="" alt="" />
          </div>
          <div className="grid grid-cols-2 gap-2 w-3/4">
            <p className="p-2  border-b border-gray">
              Name: Md: Irfath Chowdhury Joy
            </p>
            <p className="p-2  border-b border-gray">Phone: 01941637656</p>
            <p className="p-2  border-b border-gray">
              Email: irfathmostofa1@gmail.com
            </p>
            <p className="p-2  border-b border-gray">
              Address: Central Housing Society holding no 8, Chittagong
              University, Hathazari , Chattogram
            </p>
          </div>
        </div>
        <Tabs defaultValue="variants" className="space-y-6">
          <TabsList className="">
            {type === "Supplier" ? (
              <>
                {" "}
                <TabsTrigger value="purchase">Purchases History</TabsTrigger>
              </>
            ) : (
              <>
                {" "}
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="purchase" className="space-y-6">
            Purchase History
          </TabsContent>
          <TabsContent value="invoices" className="space-y-6">
            PurcInvoiceshase
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
