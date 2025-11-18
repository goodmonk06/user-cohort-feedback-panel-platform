import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Feedback Panel Platform
          </h1>
          <p className="text-xl text-gray-600">
            Manage user cohorts and feedback campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/users"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              Users
            </h2>
            <p className="text-gray-600">
              Manage panel users and their attributes
            </p>
          </Link>

          <Link
            href="/cohorts"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-green-600 mb-2">
              Cohorts
            </h2>
            <p className="text-gray-600">
              Define and manage user cohorts with rules
            </p>
          </Link>

          <Link
            href="/campaigns"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-purple-600 mb-2">
              Campaigns
            </h2>
            <p className="text-gray-600">
              Create feedback campaigns for cohorts
            </p>
          </Link>

          <Link
            href="/responses"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-orange-600 mb-2">
              Responses
            </h2>
            <p className="text-gray-600">
              View and analyze feedback responses
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
