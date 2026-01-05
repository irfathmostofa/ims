import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Calculator,
  Navigation,
  Filter,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { redxApi } from "@/hook/RedXApi";
import type { Area } from "@/types/redx";

export const AreasTab = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [postalCode, setPostalCode] = useState<string>("");
  const [districtName, setDistrictName] = useState<string>("");
  const [searchType, setSearchType] = useState<"postal" | "district">("postal");

  const loadAreas = async () => {
    if (searchType === "postal" && !postalCode.trim()) {
      toast.error("Please enter a postal code");
      return;
    }

    if (searchType === "district" && !districtName.trim()) {
      toast.error("Please enter a district name");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (searchType === "postal") {
        const postCode = parseInt(postalCode);
        response = await redxApi.getAreasByPostCode(postCode);
      } else {
        response = await redxApi.getAreasByDistrict(districtName);
      }

      setAreas(response.areas || []);
      if (response.areas?.length === 0) {
        toast.info("No areas found for your search");
      } else {
        toast.success(`Found ${response.areas?.length || 0} areas`);
      }
    } catch (error: any) {
      console.error("Failed to load areas:", error);
      toast.error(error.message || "Failed to load areas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} />
            Search Delivery Areas
          </CardTitle>
          <CardDescription>
            Search areas by postal code or district name (No bulk loading for
            performance)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex flex-col gap-4">
              {/* Search Type Selector */}
              <div className="flex gap-4">
                <Button
                  variant={searchType === "postal" ? "default" : "outline"}
                  onClick={() => setSearchType("postal")}
                  className="flex-1 bg-white border data-[state=active]:bg-[#003333] data-[state=active]:text-white"
                >
                  Search by Postal Code
                </Button>
                <Button
                  variant={searchType === "district" ? "default" : "outline"}
                  onClick={() => setSearchType("district")}
                  className="flex-1 bg-white border data-[state=active]:bg-[#003333] data-[state=active]:text-white"
                >
                  Search by District
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {searchType === "postal" ? (
                      <Input
                        placeholder="Enter postal code (e.g., 1206, 1212)..."
                        className="pl-10 bg-white"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        type="number"
                      />
                    ) : (
                      <Input
                        placeholder="Enter district name (e.g., Dhaka, Chittagong)..."
                        className="pl-10 bg-white"
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                      />
                    )}
                  </div>
                </div>
                <Button
                  onClick={loadAreas}
                  disabled={loading}
                  className="bg-[#003333] hover:bg-[#002222] text-white"
                >
                  {loading ? "Searching..." : "Search Areas"}
                </Button>
              </div>

              {/* Quick Search Examples */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 mr-2">
                  Quick search:
                </span>
                {searchType === "postal" ? (
                  <>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setPostalCode("1206");
                        setTimeout(() => loadAreas(), 100);
                      }}
                    >
                      1206 (Dhanmondi)
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setPostalCode("1212");
                        setTimeout(() => loadAreas(), 100);
                      }}
                    >
                      1212 (Gulshan)
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setPostalCode("1207");
                        setTimeout(() => loadAreas(), 100);
                      }}
                    >
                      1207 (Mohammadpur)
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setDistrictName("Dhaka");
                        setTimeout(() => loadAreas(), 100);
                      }}
                    >
                      Dhaka
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setDistrictName("Chittagong");
                        setTimeout(() => loadAreas(), 100);
                      }}
                    >
                      Chittagong
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setDistrictName("Sylhet");
                        setTimeout(() => loadAreas(), 100);
                      }}
                    >
                      Sylhet
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 bg-white">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Searching areas...</p>
            </div>
          ) : areas.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-white">
              <MapPin className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">No areas found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchType === "postal"
                  ? "Enter a postal code and click Search"
                  : "Enter a district name and click Search"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Area Name</TableHead>
                      <TableHead>Postal Code</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Zone ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areas.map((area) => (
                      <TableRow key={area.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{area.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{area.name}</div>
                          <div className="text-xs text-gray-500">
                            Area #{area.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">{area.post_code}</div>
                        </TableCell>
                        <TableCell>{area.division_name}</TableCell>
                        <TableCell>
                          <div className="font-medium">Zone {area.zone_id}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            {areas.length > 0 && `Showing ${areas.length} areas`}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Areas Found</p>
                <p className="text-2xl font-bold">{areas.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Divisions</p>
                <p className="text-2xl font-bold">
                  {new Set(areas.map((a) => a.division_name)).size}
                </p>
              </div>
              <Navigation className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zones</p>
                <p className="text-2xl font-bold">
                  {new Set(areas.map((a) => a.zone_id)).size}
                </p>
              </div>
              <Filter className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Search Type</p>
                <p className="text-sm font-medium capitalize">
                  {searchType === "postal" ? "Postal Code" : "District"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
