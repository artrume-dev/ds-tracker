import React, { useState, useEffect } from 'react';
import { Users, Mail, Settings, Save, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface TeamSubscription {
  teamName: string;
  email?: string;
  slack?: string;
  preferences: {
    tokenChanges: boolean;
    patternUpdates: boolean;
    scanResults: boolean;
    approvalRequests: boolean;
  };
}

interface TeamSubscriptionData {
  [teamName: string]: TeamSubscription;
}

export const TeamSubscriptionPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<TeamSubscriptionData>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      if (data.success) {
        // Convert array to object with teamName as key
        const subscriptionsObject: TeamSubscriptionData = {};
        if (Array.isArray(data.subscriptions)) {
          data.subscriptions.forEach((subscription: TeamSubscription) => {
            subscriptionsObject[subscription.teamName] = subscription;
          });
        }
        setSubscriptions(subscriptionsObject);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      setMessage({ type: 'error', text: 'Failed to load team subscriptions' });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (teamName: string, updates: Partial<TeamSubscription>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${teamName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.success) {
        setSubscriptions(prev => ({
          ...prev,
          [teamName]: { ...prev[teamName], ...updates }
        }));
        setMessage({ type: 'success', text: `${teamName} subscription updated successfully!` });
      } else {
        const errorMessage = data.error?.message || data.error || 'Failed to update subscription';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update subscription' });
    } finally {
      setLoading(false);
    }
  };

  const addNewTeam = async () => {
    if (!newTeamName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a team name' });
      return;
    }

    const newTeam: TeamSubscription = {
      teamName: newTeamName,
      email: '',
      slack: '',
      preferences: {
        tokenChanges: true,
        patternUpdates: true,
        scanResults: true,
        approvalRequests: true
      }
    };

    await updateSubscription(newTeamName, newTeam);
    setNewTeamName('');
  };

  const removeTeam = async (teamName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${teamName} team subscription?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${teamName}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setSubscriptions(prev => {
          const updated = { ...prev };
          delete updated[teamName];
          return updated;
        });
        setMessage({ type: 'success', text: `${teamName} subscription removed successfully!` });
      } else {
        const errorMessage = data.error?.message || data.error || 'Failed to remove subscription';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove subscription' });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async (teamName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${teamName}/test`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Test notification sent to ${teamName}!` });
      } else {
        const errorMessage = data.error?.message || data.error || 'Failed to send test notification';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test notification' });
    } finally {
      setLoading(false);
    }
  };

  const updateTeamEmail = (teamName: string, email: string) => {
    setSubscriptions(prev => ({
      ...prev,
      [teamName]: { ...prev[teamName], email }
    }));
  };

  const updateTeamSlack = (teamName: string, slack: string) => {
    setSubscriptions(prev => ({
      ...prev,
      [teamName]: { ...prev[teamName], slack }
    }));
  };

  const updatePreference = (teamName: string, key: keyof TeamSubscription['preferences'], value: boolean) => {
    setSubscriptions(prev => ({
      ...prev,
      [teamName]: {
        ...prev[teamName],
        preferences: { ...(prev[teamName]?.preferences || {}), [key]: value }
      }
    }));
  };

  const teams = Object.keys(subscriptions || {});

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Team Subscriptions</h1>
            </div>
            <div className="text-sm text-gray-500">
              Configure email notifications for design system changes
            </div>
          </div>
        </div>

        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Add New Team */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Team
            </h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name (e.g., UX Research)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addNewTeam}
                disabled={loading || !newTeamName.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Add Team
              </button>
            </div>
          </div>

          {/* Teams List */}
          <div className="space-y-4">
            {teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No team subscriptions configured yet.</p>
                <p className="text-sm">Add your first team above to get started.</p>
              </div>
            ) : (
              teams.map((teamName) => {
                const subscription = subscriptions[teamName];
                const isExpanded = expandedTeam === teamName;

                // Skip if subscription is undefined
                if (!subscription) {
                  return null;
                }

                return (
                  <div key={teamName} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-gray-600" />
                          <h3 className="text-lg font-medium text-gray-900">{teamName}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscription.email ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subscription.email ? 'Configured' : 'Needs Setup'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => sendTestNotification(teamName)}
                            disabled={loading || !subscription.email}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => setExpandedTeam(isExpanded ? null : teamName)}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            {isExpanded ? 'Collapse' : 'Configure'}
                          </button>
                          <button
                            onClick={() => removeTeam(teamName)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-6 space-y-6">
                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Mail className="h-4 w-4 inline mr-1" />
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={subscription.email || ''}
                              onChange={(e) => updateTeamEmail(teamName, e.target.value)}
                              placeholder="team@company.com"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Settings className="h-4 w-4 inline mr-1" />
                              Slack Channel (Optional)
                            </label>
                            <input
                              type="text"
                              value={subscription.slack || ''}
                              onChange={(e) => updateTeamSlack(teamName, e.target.value)}
                              placeholder="#design-system"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Notification Preferences */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Preferences</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'tokenChanges', label: 'Token Changes', description: 'Get notified when design tokens are modified' },
                              { key: 'patternUpdates', label: 'Pattern Updates', description: 'Get notified when UI patterns are updated' },
                              { key: 'scanResults', label: 'Scan Results', description: 'Get notified about token usage scan results' },
                              { key: 'approvalRequests', label: 'Approval Requests', description: 'Get notified when changes need approval' }
                            ].map(({ key, label, description }) => (
                              <div key={key} className="flex items-start">
                                <div className="flex items-center h-5">
                                  <input
                                    id={`${teamName}-${key}`}
                                    type="checkbox"
                                    checked={subscription.preferences?.[key as keyof TeamSubscription['preferences']] || false}
                                    onChange={(e) => updatePreference(teamName, key as keyof TeamSubscription['preferences'], e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label htmlFor={`${teamName}-${key}`} className="font-medium text-gray-700 cursor-pointer">
                                    {label}
                                  </label>
                                  <p className="text-gray-500 text-xs">{description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                          <button
                            onClick={() => updateSubscription(teamName, subscription)}
                            disabled={loading}
                            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Configuration
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
