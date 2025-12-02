import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLog, setEditingLog] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    fetchLogs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter(log =>
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  }, [searchTerm, logs]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
      }
    } catch (error) {
      alert('Error fetching logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const response = await fetch(`/api/logs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchLogs();
        alert('Log deleted successfully');
      } else {
        alert('Error deleting log');
      }
    } catch (error) {
      alert('Error deleting log');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/logs/${editingLog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLog)
      });

      if (response.ok) {
        fetchLogs();
        setEditingLog(null);
        alert('Log updated successfully');
      } else {
        alert('Error updating log');
      }
    } catch (error) {
      alert('Error updating log');
    }
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Visitor Logbook Report</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 15mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #4F46E5;
              padding-bottom: 20px;
            }
            
            .header h1 {
              color: #1F2937;
              font-size: 28px;
              margin-bottom: 5px;
            }
            
            .header p {
              color: #6B7280;
              font-size: 14px;
            }
            
            .meta-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding: 15px;
              background: #F3F4F6;
              border-radius: 8px;
            }
            
            .meta-info div {
              font-size: 13px;
            }
            
            .meta-info strong {
              color: #374151;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            
            thead {
              background: #4F46E5;
              color: white;
            }
            
            th {
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #E5E7EB;
              color: #374151;
            }
            
            tbody tr:nth-child(even) {
              background: #F9FAFB;
            }
            
            tbody tr:hover {
              background: #F3F4F6;
            }
            
            .signature-cell {
              max-width: 80px;
            }
            
            .signature-cell img {
              max-width: 80px;
              max-height: 40px;
              border: 1px solid #D1D5DB;
              border-radius: 4px;
            }
            
            .purpose-cell {
              max-width: 150px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .footer {
              margin-top: 30px;
              text-align: center;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              font-size: 11px;
              color: #6B7280;
            }
            
            .no-data {
              text-align: center;
              padding: 40px;
              color: #9CA3AF;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Visitor Logbook Report</h1>
            <p>Complete visitor logs and information</p>
          </div>
          
          <div class="meta-info">
            <div>
              <strong>Total Entries:</strong> ${filteredLogs.length}
            </div>
            <div>
              <strong>Generated:</strong> ${new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div>
              <strong>Date Range:</strong> ${filteredLogs.length > 0 
                ? `${filteredLogs[filteredLogs.length - 1].date} - ${filteredLogs[0].date}`
                : 'N/A'}
            </div>
          </div>
          
          ${filteredLogs.length === 0 ? `
            <div class="no-data">
              <p>No visitor logs available to display.</p>
            </div>
          ` : `
            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 15%;">Name</th>
                  <th style="width: 15%;">Address</th>
                  <th style="width: 10%;">Date</th>
                  <th style="width: 8%;">Gender</th>
                  <th style="width: 5%;">Age</th>
                  <th style="width: 12%;">Organization</th>
                  <th style="width: 20%;">Purpose</th>
                  <th style="width: 10%;">Signature</th>
                </tr>
              </thead>
              <tbody>
                ${filteredLogs.map((log, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${log.name}</strong></td>
                    <td>${log.address}</td>
                    <td>${log.date}</td>
                    <td>${log.gender}</td>
                    <td>${log.age}</td>
                    <td>${log.organization || 'N/A'}</td>
                    <td class="purpose-cell" title="${log.purpose}">${log.purpose}</td>
                    <td class="signature-cell">
                      <img src="${log.signature}" alt="Signature" />
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
          
          <div class="footer">
            <p>This is an official document generated from the Visitor Logbook System</p>
            <p>Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage visitor logs</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Visitor Form
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search, Stats, and Export */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search by name, organization, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="ml-4 flex items-center space-x-3">
            <div className="px-6 py-3 bg-indigo-100 rounded-lg">
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-indigo-600">{filteredLogs.length}</p>
            </div>
            <button
              onClick={handlePrintPDF}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.name}</div>
                        <div className="text-sm text-gray-500">{log.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.organization || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{log.purpose}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setViewingLog(log)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setEditingLog(log)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
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
      </main>

      {/* View Modal */}
      {viewingLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Visitor Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Name</p>
                  <p className="text-lg text-gray-900">{viewingLog.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Address</p>
                  <p className="text-lg text-gray-900">{viewingLog.address}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Date</p>
                  <p className="text-lg text-gray-900">{viewingLog.date}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Gender</p>
                  <p className="text-lg text-gray-900">{viewingLog.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Age</p>
                  <p className="text-lg text-gray-900">{viewingLog.age}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Organization</p>
                  <p className="text-lg text-gray-900">{viewingLog.organization || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Purpose</p>
                <p className="text-lg text-gray-900">{viewingLog.purpose}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Signature</p>
                <img src={viewingLog.signature} alt="Signature" className="border border-gray-300 rounded-lg max-w-full" />
              </div>
            </div>
            <button
              onClick={() => setViewingLog(null)}
              className="mt-6 w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Visitor Log</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={editingLog.name}
                    onChange={(e) => setEditingLog({ ...editingLog, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    required
                    value={editingLog.address}
                    onChange={(e) => setEditingLog({ ...editingLog, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={editingLog.date}
                    onChange={(e) => setEditingLog({ ...editingLog, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    required
                    value={editingLog.gender}
                    onChange={(e) => setEditingLog({ ...editingLog, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    required
                    value={editingLog.age}
                    onChange={(e) => setEditingLog({ ...editingLog, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                  <input
                    type="text"
                    value={editingLog.organization}
                    onChange={(e) => setEditingLog({ ...editingLog, organization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
                <textarea
                  required
                  rows="3"
                  value={editingLog.purpose}
                  onChange={(e) => setEditingLog({ ...editingLog, purpose: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}