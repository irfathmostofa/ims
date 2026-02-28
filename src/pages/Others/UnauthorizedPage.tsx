// pages/Others/UnauthorizedPage.tsx
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold  mb-2">Access Denied</h1>
        <p className=" mb-6">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        <div className="space-y-3">
          <a
            href="/dashboard"
            className="block w-full py-3 btn-bw-primary transition-colors font-medium"
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            className="block w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back to Login
          </a>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          Required permissions are not assigned to your role.
        </p>
      </div>
    </div>
  );
}
