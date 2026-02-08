import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsappOptIn: boolean;
}

export default function SendSMSPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [singlePhone, setSinglePhone] = useState("");

  useEffect(() => {
    // TODO: replace with API call
    setCustomers([
      {
        id: "1",
        name: "Rahim",
        phone: "8801712345678",
        whatsappOptIn: true,
      },
      {
        id: "2",
        name: "Karim",
        phone: "8801812345678",
        whatsappOptIn: true,
      },
    ]);
  }, []);

  const toggleCustomer = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const sendMessage = async () => {
    if (!message.trim()) return alert("Message is empty");

    const payload =
      mode === "single"
        ? { mode, phone: singlePhone, message }
        : { mode, customerIds: selected, message };

    // TODO: call backend API
    console.log("SEND", payload);

    alert("Message sent (mock)");
    setMessage("");
    setSelected([]);
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">📣 Marketing – WhatsApp</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-4">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              onClick={() => setMode("single")}
            >
              Single Message
            </Button>
            <Button
              variant={mode === "bulk" ? "default" : "outline"}
              onClick={() => setMode("bulk")}
            >
              Bulk Message
            </Button>
          </div>

          {mode === "single" && (
            <div className="space-y-2">
              <label className="text-sm">WhatsApp Number</label>
              <Input
                placeholder="8801XXXXXXXXX"
                value={singlePhone}
                onChange={(e) => setSinglePhone(e.target.value)}
              />
            </div>
          )}

          {mode === "bulk" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Customers</p>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-2 border-b"
                  >
                    {/* <Checkbox
                      checked={selected.includes(c.id)}
                      onCheckedChange={() => toggleCustomer(c.id)}
                      disabled={!c.whatsappOptIn}
                    /> */}
                    <input
                      type="checkbox"
                      name=""
                      checked={selected.includes(c.id)}
                      onChange={() => toggleCustomer(c.id)}
                      disabled={!c.whatsappOptIn}
                      id=""
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                    {!c.whatsappOptIn && (
                      <span className="text-xs text-red-500">Not Opted In</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm">Message</label>
            <Textarea
              rows={5}
              placeholder="Write your WhatsApp message here…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Only send messages to users who opted in and within 24h window.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={sendMessage} className="btn-bw-primary">
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
