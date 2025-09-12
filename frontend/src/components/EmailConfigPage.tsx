import React, { useState, useEffect } from 'react';

interface EmailConfig {
  provider: 'gmail' | 'outlook' | 'sendgrid' | 'smtp';
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

interface EmailStatus {
  enabled: boolean;
  provider?: string;
  from?: string;
}

export const EmailConfigPage: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig>({
    provider: 'gmail',
    auth: { user: '', pass: '' },
    from: ''
  });
  
  const [status, setStatus] = useState<EmailStatus>({ enabled: false });
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchEmailStatus();
  }, []);

  const fetchEmailStatus = async () => {
    try {
      const response = await fetch('/api/email/status');
      const data = await response.json();
      
      if (data.success && data.data) {
        // Map backend status format to frontend format
        const backendStatus = data.data;
        setStatus({
          enabled: backendStatus.status === 'ready' || backendStatus.hasTransporter,
          provider: backendStatus.provider,
          from: backendStatus.from
        });
      }
    } catch (error) {
      console.error('Failed to fetch email status:', error);
      setStatus({ enabled: false });
    }
  };

  const handleConfigChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EmailConfig] as any),
          [child]: value
        }
      }));
    } else {
      setConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle HTTP error status codes
        const errorMessage = data.error?.message || data.error || `HTTP ${response.status}: Failed to save email configuration`;
        setMessage({ type: 'error', text: errorMessage });
        return;
      }
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Email configuration saved successfully!' });
        fetchEmailStatus();
      } else {
        const errorMessage = data.error?.message || data.error || 'Failed to configure email';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Email configuration error:', error);
      setMessage({ type: 'error', text: 'Network error: Failed to save email configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address for testing' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail })
      });

      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || `HTTP ${response.status}: Test email failed`;
        setMessage({ type: 'error', text: errorMessage });
        return;
      }
      
      if (data.success && data.data.sent) {
        setMessage({ type: 'success', text: `Test email sent successfully to ${testEmail}!` });
      } else {
        setMessage({ type: 'error', text: 'Test email failed. Please check your configuration.' });
      }
    } catch (error) {
      console.error('Test email error:', error);
      setMessage({ type: 'error', text: 'Network error: Failed to send test email' });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email/test-connection');
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || `HTTP ${response.status}: Connection test failed`;
        setMessage({ type: 'error', text: errorMessage });
        return;
      }
      
      if (data.success && data.data.connected) {
        setMessage({ type: 'success', text: 'Email connection test successful!' });
      } else {
        setMessage({ type: 'error', text: 'Email connection test failed. Please check your configuration.' });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setMessage({ type: 'error', text: 'Network error: Failed to test email connection' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Email Configuration</h1>
          <p className="text-gray-600 mt-1">Configure email settings for design token notifications</p>
        </div>

        <div className="p-6">
          {/* Current Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Current Status</h3>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                status.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {status.enabled ? 'Email Enabled' : 'Email Disabled'}
              </div>
              {status.provider && (
                <div className="text-sm text-gray-600">
                  Provider: <span className="font-medium capitalize">{status.provider}</span>
                </div>
              )}
              {status.from && (
                <div className="text-sm text-gray-600">
                  From: <span className="font-medium">{status.from}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Provider
              </label>
              <select
                value={config.provider}
                onChange={(e) => handleConfigChange('provider', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook/Hotmail</option>
                <option value="sendgrid">SendGrid</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>

            {config.provider === 'smtp' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={config.host || ''}
                      onChange={(e) => handleConfigChange('host', e.target.value)}
                      placeholder="smtp.example.com"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port
                    </label>
                    <input
                      type="number"
                      value={config.port || 587}
                      onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.secure || false}
                      onChange={(e) => handleConfigChange('secure', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Use SSL/TLS</span>
                  </label>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {config.provider === 'sendgrid' ? 'API Key' : 'Username/Email'}
                </label>
                <input
                  type="text"
                  value={config.auth.user}
                  onChange={(e) => handleConfigChange('auth.user', e.target.value)}
                  placeholder={config.provider === 'sendgrid' ? 'apikey' : 'your-email@example.com'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {config.provider === 'gmail' ? 'App Password' : 'Password'}
                </label>
                <input
                  type="password"
                  value={config.auth.pass}
                  onChange={(e) => handleConfigChange('auth.pass', e.target.value)}
                  placeholder={config.provider === 'gmail' ? 'App Password (not regular password)' : 'Password'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email Address
              </label>
              <input
                type="email"
                value={config.from}
                onChange={(e) => handleConfigChange('from', e.target.value)}
                placeholder="noreply@yourcompany.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
              
              <button
                type="button"
                onClick={testConnection}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Test Connection
              </button>
            </div>
          </form>

          {/* Test Email Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test Email</h3>
            <div className="flex space-x-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleTestEmail}
                disabled={loading || !status.enabled}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Send Test Email
              </button>
            </div>
            {!status.enabled && (
              <p className="mt-2 text-sm text-gray-500">
                Configure and save email settings first to enable testing
              </p>
            )}
          </div>

          {/* Provider Setup Instructions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Instructions</h3>
            
            {config.provider === 'gmail' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Gmail Setup</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Enable 2-factor authentication on your Gmail account</li>
                  <li>Go to Google Account settings → Security → App passwords</li>
                  <li>Generate an app password for "Mail"</li>
                  <li>Use your Gmail address as username and the app password (not your regular password)</li>
                </ol>
              </div>
            )}

            {config.provider === 'sendgrid' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">SendGrid Setup</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Sign up for a SendGrid account</li>
                  <li>Go to Settings → API Keys</li>
                  <li>Create a new API key with "Mail Send" permissions</li>
                  <li>Use "apikey" as username and your API key as password</li>
                </ol>
              </div>
            )}

            {config.provider === 'outlook' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Outlook/Hotmail Setup</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Use your Outlook/Hotmail email address as username</li>
                  <li>Use your regular account password</li>
                  <li>If you have 2FA enabled, you may need an app password</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
