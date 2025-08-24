import React, { useState, useEffect } from 'react';
import axios from '../../axios.js';

const TrainerInvites = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await axios.get('/auth/trainer-invites');
      setInvites(response.data.invites);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invites:', err);
      setLoading(false);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/send-trainer-invite', inviteData);
      alert('Trainer invite sent successfully!');
      setInviteData({ email: '', notes: '' });
      setShowInviteForm(false);
      fetchInvites(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invite');
    }
  };

  const resendInvite = async (inviteId) => {
    try {
      await axios.post(`/auth/resend-trainer-invite/${inviteId}`);
      alert('Invite resent successfully!');
      fetchInvites();
    } catch (err) {
      alert('Failed to resend invite');
    }
  };

  const revokeInvite = async (inviteId) => {
    if (!confirm('Are you sure you want to revoke this invite?')) return;
    
    try {
      await axios.delete(`/auth/trainer-invite/${inviteId}`);
      alert('Invite revoked successfully!');
      fetchInvites();
    } catch (err) {
      alert('Failed to revoke invite');
    }
  };

  if (loading) return <div>Loading trainer invites...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Trainer Invitations</h3>
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send New Invite
        </button>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Invite New Trainer</h3>
            <form onSubmit={sendInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={inviteData.notes}
                  onChange={(e) => setInviteData({...inviteData, notes: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Add any notes about this trainer invitation..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Send Invite
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invites List */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Sent</th>
              <th className="p-3 text-left">Expires</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite._id} className="border-t">
                <td className="p-3">{invite.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    invite.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invite.status}
                  </span>
                </td>
                <td className="p-3">{new Date(invite.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{new Date(invite.expiresAt).toLocaleDateString()}</td>
                <td className="p-3 space-x-2">
                  {invite.status === 'pending' && (
                    <>
                      <button
                        onClick={() => resendInvite(invite._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => revokeInvite(invite._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invites.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No trainer invites sent yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerInvites;