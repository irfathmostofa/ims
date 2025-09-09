"use client";

export default function ReturnCustomerInfo({ customer }: { customer: any }) {
  return (
    <div className="bg-bw-50 p-4 rounded-md shadow-md">
      <h2 className="text-bw-900 font-bold mb-2">Customer Info</h2>
      <p className="text-bw-800">Name: {customer.name}</p>
      <p className="text-bw-800">Phone: {customer.phone}</p>
      <p className="text-bw-800">Address: {customer.address}</p>
    </div>
  );
}
