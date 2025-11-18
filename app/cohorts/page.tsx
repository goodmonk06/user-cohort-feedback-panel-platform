"use client";

import { useState, useEffect } from "react";

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  ruleJson: any;
  createdAt: string;
  _count: {
    members: number;
    campaigns: number;
  };
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [materializing, setMaterializing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rule: "{}",
  });

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    try {
      const res = await fetch("/api/cohorts");
      const data = await res.json();
      setCohorts(data);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ruleJson = JSON.parse(formData.rule);
      const res = await fetch("/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          ruleJson,
        }),
      });

      if (res.ok) {
        setFormData({ name: "", description: "", rule: "{}" });
        setShowForm(false);
        fetchCohorts();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create cohort");
      }
    } catch (error) {
      console.error("Error creating cohort:", error);
      alert("Invalid JSON in rule");
    }
  };

  const handleMaterialize = async (id: string) => {
    setMaterializing(id);
    try {
      const res = await fetch(`/api/cohorts/${id}/materialize`, {
        method: "POST",
      });
      const result = await res.json();
      alert(
        `Materialized: ${result.added} members added, ${result.removed} removed`
      );
      fetchCohorts();
    } catch (error) {
      console.error("Error materializing cohort:", error);
      alert("Failed to materialize cohort");
    } finally {
      setMaterializing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cohort?")) return;

    try {
      const res = await fetch(`/api/cohorts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCohorts();
      }
    } catch (error) {
      console.error("Error deleting cohort:", error);
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
          <h1 className="text-3xl font-bold text-gray-900">Cohorts</h1>
          <p className="text-gray-600 mt-2">
            Define user cohorts with rules and materialize members
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {showForm ? "Cancel" : "Create Cohort"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Cohort</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rule (JSON)
              </label>
              <textarea
                value={formData.rule}
                onChange={(e) =>
                  setFormData({ ...formData, rule: e.target.value })
                }
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border font-mono text-sm"
                placeholder='{"country": "JP", "tag": "power-user"}'
              />
              <p className="mt-1 text-sm text-gray-500">
                Examples: Simple equality, array contains with $contains, numeric
                comparison with $gte/$lte
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Cohort
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cohorts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              No cohorts found. Create your first cohort to get started.
            </p>
          </div>
        ) : (
          cohorts.map((cohort) => (
            <div key={cohort.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {cohort.name}
              </h3>
              {cohort.description && (
                <p className="text-gray-600 mb-4">{cohort.description}</p>
              )}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Rule:</p>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(cohort.ruleJson, null, 2)}
                </pre>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>{cohort._count.members} members</span>
                <span>{cohort._count.campaigns} campaigns</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleMaterialize(cohort.id)}
                  disabled={materializing === cohort.id}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:bg-blue-300"
                >
                  {materializing === cohort.id ? "Processing..." : "Materialize"}
                </button>
                <button
                  onClick={() => handleDelete(cohort.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
