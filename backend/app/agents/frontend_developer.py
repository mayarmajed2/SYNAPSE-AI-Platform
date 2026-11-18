"""Frontend Developer Agent: Generates modular React, TypeScript, and Tailwind UI components."""

from typing import Any, Dict, List
from sqlalchemy.orm import Session
from app.core.llm import llm_client


class FrontendDeveloperAgent:
    ROLE = "frontend_developer"
    NAME = "Elena Rostova"

    @classmethod
    def generate_frontend_code(cls, project_name: str, architecture: Dict[str, Any], db: Session = None, project_id: str = None) -> List[Dict[str, str]]:
        """Generate frontend codebase files."""
        component_code = f'''import React, {{ useState, useEffect }} from 'react';

interface Item {{
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}}

export const ProjectDashboard: React.FC = () => {{
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {{
    fetch('/api/v1/items')
      .then((res) => res.json())
      .then((data) => {{
        setItems(data || []);
        setLoading(false);
      }})
      .catch(() => setLoading(false));
  }}, []);

  const handleCreate = async (e: React.FormEvent) => {{
    e.preventDefault();
    if (!title.trim()) return;

    try {{
      const res = await fetch('/api/v1/items', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ title, description, status: 'active' }}),
      }});
      if (res.ok) {{
        const newItem = await res.json();
        setItems((prev) => [newItem, ...prev]);
        setTitle('');
        setDescription('');
      }}
    }} catch (err) {{
      console.error('Failed to create item', err);
    }}
  }};

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <header className="border-b border-[#E8EAED] pb-4">
        <h1 className="text-2xl font-bold text-[#17191C]">{project_name}</h1>
        <p className="text-sm text-[#747B86]">Autonomous Frontend Interface</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E8EAED] rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#17191C] mb-4">Create Record</h2>
          <form onSubmit={{handleCreate}} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#747B86] mb-1">Title</label>
              <input
                type="text"
                value={{title}}
                onChange={{(e) => setTitle(e.target.value)}}
                className="w-full px-3 py-2 border border-[#E8EAED] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#315EFB]"
                placeholder="Enter title..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#747B86] mb-1">Description</label>
              <textarea
                value={{description}}
                onChange={{(e) => setDescription(e.target.value)}}
                className="w-full px-3 py-2 border border-[#E8EAED] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#315EFB]"
                rows={{3}}
                placeholder="Enter description..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#315EFB] hover:bg-blue-600 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Add Record
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white border border-[#E8EAED] rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#17191C] mb-4">Live Records</h2>
          {{loading ? (
            <p className="text-sm text-[#747B86]">Loading records...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#E8EAED] rounded-lg">
              <p className="text-sm text-[#747B86]">No records created yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8EAED]">
              {{items.map((item) => (
                <div key={{item.id}} className="py-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-[#17191C]">{{item.title}}</h3>
                    <p className="text-xs text-[#747B86]">{{item.description || 'No description'}}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#315EFB]">
                    {{item.status}}
                  </span>
                </div>
              ))}}
            </div>
          )}}
        </div>
      </div>
    </div>
  );
}};
'''

        types_code = f'''export interface Item {{
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'pending' | 'archived';
  created_at: string;
}}
'''

        return [
            {"path": "frontend/src/components/ProjectDashboard.tsx", "filename": "ProjectDashboard.tsx", "language": "typescript", "content": component_code, "type": "code_frontend"},
            {"path": "frontend/src/types/item.ts", "filename": "item.ts", "language": "typescript", "content": types_code, "type": "code_frontend"},
        ]

