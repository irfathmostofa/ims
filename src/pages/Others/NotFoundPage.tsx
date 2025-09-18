import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const router = useNavigate();
  return (
    <>
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
      <p className="mt-2 text-gray-200">
        The page you are looking for doesn’t exist.
      </p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={() => router("/dashboard")}
      >
        Go Back Home
      </button>
    </>
  );
}
