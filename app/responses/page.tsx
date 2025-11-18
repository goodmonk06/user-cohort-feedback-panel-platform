"use client";

import { useState, useEffect } from "react";

interface FeedbackResponse {
  id: string;
  responseJson: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  campaign: {
    id: string;
    name: string;
    type: string;
    cohort: {
      id: string;
      name: string;
    };
  };
}

interface Campaign {
  id: string;
  name: string;
}

interface PanelUser {
  id: string;
  name: string;
  email: string;
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<PanelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    campaignId: "",
    userId: "",
    response: "{}",
  });

  useEffect(() => {
    fetchResponses();
    fetchCampaigns();
    fetchUsers();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch("/api/responses");
      const data = await res.json();
      setResponses(data);
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const responseJson = JSON.parse(formData.response);
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: formData.campaignId,
          userId: formData.userId,
          responseJson,
        }),
      });

      if (res.ok) {
        setFormData({ campaignId: "", userId: "", response: "{}" });
        setShowForm(false);
        fetchResponses();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create response");
      }
    } catch (error) {
      console.error("Error creating response:", error);
      alert("Invalid JSON in response");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this response?")) return;

    try {
      const res = await fetch(`/api/responses/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchResponses();
      }
    } catch (error) {
      console.error("Error deleting response:", error);
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
            Feedback Responses
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all feedback responses
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          {showForm ? "Cancel" : "Add Response"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Response</h2>
          <p className="text-sm text-gray-600 mb-4">
            This form simulates a user submitting feedback. In production, this
            would typically come from external survey/interview tools.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Campaign
              </label>
              <select
                required
                value={formData.campaignId}
                onChange={(e) =>
                  setFormData({ ...formData, campaignId: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
              >
                <option value="">Select a campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User
              </label>
              <select
                required
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Response Data (JSON)
              </label>
              <textarea
                value={formData.response}
                onChange={(e) =>
                  setFormData({ ...formData, response: e.target.value })
                }
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border font-mono text-sm"
                placeholder='{"rating": 5, "comment": "Great product!"}'
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Create Response
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            All Responses ({responses.length})
          </h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
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
                Response Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {responses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No responses yet. Responses will appear here when users submit
                  feedback.
                </td>
              </tr>
            ) : (
              responses.map((response) => (
                <tr key={response.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {response.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {response.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {response.campaign.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {response.campaign.cohort.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        response.campaign.type === "survey"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {response.campaign.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <pre className="text-xs max-w-md overflow-x-auto">
                      {JSON.stringify(response.responseJson, null, 2)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(response.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(response.id)}
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
