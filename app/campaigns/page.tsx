"use client";

import { useState, useEffect } from "react";

interface Campaign {
  id: string;
  name: string;
  type: "survey" | "interview";
  payloadJson: any;
  createdAt: string;
  cohort: {
    id: string;
    name: string;
  };
  _count: {
    responses: number;
  };
}

interface Cohort {
  id: string;
  name: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cohortId: "",
    name: "",
    type: "survey" as "survey" | "interview",
    payload: "{}",
  });

  useEffect(() => {
    fetchCampaigns();
    fetchCohorts();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCohorts = async () => {
    try {
      const res = await fetch("/api/cohorts");
      const data = await res.json();
      setCohorts(data);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payloadJson = JSON.parse(formData.payload);
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohortId: formData.cohortId,
          name: formData.name,
          type: formData.type,
          payloadJson,
        }),
      });

      if (res.ok) {
        setFormData({ cohortId: "", name: "", type: "survey", payload: "{}" });
        setShowForm(false);
        fetchCampaigns();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Invalid JSON in payload");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Feedback Campaigns
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage feedback campaigns for cohorts
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          {showForm ? "Cancel" : "Create Campaign"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cohort
              </label>
              <select
                required
                value={formData.cohortId}
                onChange={(e) =>
                  setFormData({ ...formData, cohortId: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 border"
              >
                <option value="">Select a cohort</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Campaign Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "survey" | "interview",
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 border"
              >
                <option value="survey">Survey</option>
                <option value="interview">Interview</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payload (JSON)
              </label>
              <textarea
                value={formData.payload}
                onChange={(e) =>
                  setFormData({ ...formData, payload: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 border font-mono text-sm"
                placeholder='{"surveyUrl": "https://example.com/survey"}'
              />
              <p className="mt-1 text-sm text-gray-500">
                For surveys, include surveyUrl. For interviews, include meeting
                details.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Create Campaign
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cohort
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payload
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No campaigns found. Create your first campaign to get started.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.cohort.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.type === "survey"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {campaign.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <pre className="text-xs max-w-xs overflow-x-auto">
                      {JSON.stringify(campaign.payloadJson, null, 2)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign._count.responses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
