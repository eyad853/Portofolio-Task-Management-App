import React, { useState, useEffect } from 'react';
import { Bell, Users, Send, Inbox, Check, X, Clock, User, Calendar, Kanban, FileText, CheckSquare, Loader2 } from 'lucide-react';

const NotificationsPage = ({ socket }) => {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [processingInvites, setProcessingInvites] = useState(new Set());

  useEffect(() => {
    fetchInvites();
  }, [activeTab, filter]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for invite responses (when someone accepts/declines your invite)
    const handleInviteResponse = (data) => {
      const { invite, action, responder } = data;
      
      // Update sent invites list
      setSentInvites(prev => 
        prev.map(inv => 
          inv._id === invite._id 
            ? { ...inv, status: action === 'accept' ? 'accepted' : 'declined' }
            : inv
        )
      );

      // Show toast notification
      showToast(`${responder.username || responder.email} ${action === 'accept' ? 'accepted' : 'declined'} your invite`);
    };

    // Listen for cancelled invites (when sender cancels invite you received)
    const handleInviteCancelled = (data) => {
      const { invite } = data;
      
      // Update received invites list
      setReceivedInvites(prev => 
        prev.map(inv => 
          inv._id === invite._id 
            ? { ...inv, status: 'cancelled' }
            : inv
        )
      );

      // Show toast notification
      showToast('An invite was cancelled by the sender');
    };

    // Add event listeners
    socket.on('inviteResponse', handleInviteResponse);
    socket.on('inviteCancelled', handleInviteCancelled);

    // Cleanup function
    return () => {
      socket.off('inviteResponse', handleInviteResponse);
      socket.off('inviteCancelled', handleInviteCancelled);
    };
  }, [socket]);

  const showToast = (message) => {
    // Simple toast implementation - you can replace with your preferred toast library
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const fetchInvites = async () => {
    setLoading(true);
    try {
      if (activeTab === 'received') {
        const response = await fetch(`http://localhost:8000/invite/getReceivedInvites?status=${filter}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setReceivedInvites(data.invites);
        }
      } else {
        const response = await fetch(`http://localhost:8000/invite/getSentInvites?status=${filter}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setSentInvites(data.invites);
        }
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteResponse = async (inviteId, action) => {
    setProcessingInvites(prev => new Set(prev).add(inviteId));
    
    try {
      const response = await fetch(`http://localhost:8000/invite/respondToInvite/${inviteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update the specific invite in the list immediately
        setReceivedInvites(prev => 
          prev.map(invite => 
            invite._id === inviteId 
              ? { ...invite, status: action === 'accept' ? 'accepted' : 'declined' }
              : invite
          )
        );
        
        showToast(`Invite ${action === 'accept' ? 'accepted' : 'declined'} successfully`);
      }
    } catch (error) {
      console.error('Error responding to invite:', error);
      showToast('Error processing invite response');
    } finally {
      setProcessingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(inviteId);
        return newSet;
      });
    }
  };

  const handleCancelInvite = async (inviteId) => {
    setProcessingInvites(prev => new Set(prev).add(inviteId));
    
    try {
      const response = await fetch(`http://localhost:8000/invite/cancelInvite/${inviteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      if (data.success) {
        // Update the specific invite in the list immediately
        setSentInvites(prev => 
          prev.map(invite => 
            invite._id === inviteId 
              ? { ...invite, status: 'cancelled' }
              : invite
          )
        );
        
        showToast('Invite cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
      showToast('Error cancelling invite');
    } finally {
      setProcessingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(inviteId);
        return newSet;
      });
    }
  };

  const getPageTypeIcon = (type) => {
    switch (type) {
      case 'todo': return <CheckSquare className="w-4 h-4" />;
      case 'calendar': return <Calendar className="w-4 h-4" />;
      case 'kanban': return <Kanban className="w-4 h-4" />;
      case 'notes': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'declined': return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInviteCardStyle = (invite) => {
    const isProcessing = processingInvites.has(invite._id);
    const baseStyle = "bg-white rounded-lg shadow-sm border p-6 transition-all duration-300";
    
    if (isProcessing) {
      return `${baseStyle} border-blue-300 bg-blue-50 transform scale-[0.98] opacity-75`;
    }
    
    switch (invite.status) {
      case 'pending':
        return `${baseStyle} border-yellow-200 hover:shadow-md`;
      case 'accepted':
        return `${baseStyle} border-green-200 bg-green-50 shadow-green-100`;
      case 'declined':
        return `${baseStyle} border-red-200 bg-red-50 shadow-red-100`;
      case 'cancelled':
        return `${baseStyle} border-gray-200 bg-gray-50 opacity-75`;
      default:
        return `${baseStyle} border-gray-200`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentInvites = activeTab === 'received' ? receivedInvites : sentInvites;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-gray-600">Manage your collaboration invites</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Received Invites
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Send className="w-4 h-4" />
              Sent Invites
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All Status</option>
          </select>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading invites...</p>
            </div>
          ) : currentInvites.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invites found</h3>
              <p className="text-gray-500">
                {activeTab === 'received' 
                  ? "You don't have any received invites yet." 
                  : "You haven't sent any invites yet."}
              </p>
            </div>
          ) : (
            currentInvites.map((invite) => {
              const isProcessing = processingInvites.has(invite._id);
              
              return (
                <div key={invite._id} className={getInviteCardStyle(invite)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPageTypeIcon(invite.pageId?.type)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invite.pageId?.name || 'Unknown Page'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(invite.status)}`}>
                          {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                        </span>
                        {isProcessing && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        {activeTab === 'received' ? (
                          <span>From: {invite.senderId?.username || invite.senderId?.email}</span>
                        ) : (
                          <span>To: {invite.receiverId?.username || invite.receiverId?.email}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(invite.createdAt)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {activeTab === 'received' && invite.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleInviteResponse(invite._id, 'accept')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleInviteResponse(invite._id, 'decline')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Decline
                          </button>
                        </>
                      )}
                      
                      {activeTab === 'sent' && invite.status === 'pending' && (
                        <button
                          onClick={() => handleCancelInvite(invite._id)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;