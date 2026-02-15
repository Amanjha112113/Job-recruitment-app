import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const TestUpload = () => {
    const { user, token } = useAuth(); // Assuming AuthContext exposes token or we get it from localStorage
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runTests = async () => {
        setLogs([]);
        addLog('Starting Diagnostics...');

        // 1. Check Auth
        if (!user) {
            addLog('❌ User not logged in. Please login as Job Seeker.');
            return;
        }
        addLog(`✅ Logged in as: ${user.email} (${user.role})`);

        // 2. Ping Backend
        try {
            addLog(`Pinging Backend at ${API_BASE_URL.replace('/api', '')}...`);
            await axios.get(API_BASE_URL.replace('/api', ''));
            addLog('✅ Backend is reachable.');
        } catch (err) {
            addLog(`❌ Backend Ping Failed: ${err.message}`);
        }

        // 3. Test Resume Route Mounting
        // We might not have a GET /api/resume route that is public, but let's try a known 404 or auth error 
        // to confirm route exists.

        // 4. File Upload
        addLog('Attempting Resume Upload...');
        try {
            // Create dummy file
            const blob = new Blob(["Dummy PDF Content"], { type: 'application/pdf' });
            const file = new File([blob], "test_diag.pdf", { type: 'application/pdf' });

            const formData = new FormData();
            formData.append('resume', file);

            const storedToken = localStorage.getItem('token');

            const response = await axios.post(`${API_BASE_URL}/resume/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                    // Axios automatically sets Content-Type to multipart/form-data with boundary
                }
            });

            if (response.data.success || response.status === 201) {
                addLog('✅ Upload Success!');
                addLog(`Response: ${JSON.stringify(response.data)}`);

                // 5. Verify Fetch
                addLog('Verifying Fetch...');
                const fetchRes = await axios.get(`${API_BASE_URL}/resume/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });

                if (fetchRes.data.success) {
                    addLog('✅ Verify Fetch Success!');
                    addLog(`Resume URL: ${fetchRes.data.url}`);
                    // addLog('Click here to view: ' + fetchRes.data.url); // It's internal log
                } else {
                    addLog('❌ Verify Fetch Failed');
                }

            } else {
                addLog(`❌ Upload Failed with status ${response.status}`);
            }

        } catch (err) {
            addLog(`❌ Upload Error: ${err.message}`);
            if (err.response) {
                addLog(`Server Response: ${JSON.stringify(err.response.data)}`);
                addLog(`Status: ${err.response.status}`);
            }
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">System Diagnostics</h1>
            <div className="mb-4">
                <p>This page tests the connection to the backend and the file upload capability.</p>
                <p><strong>Current User:</strong> {user ? user.email : 'Not Logged In'}</p>
            </div>

            <button
                onClick={runTests}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Run Diagnostics
            </button>

            <div className="mt-6 bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                {logs.length === 0 ? <p className="text-gray-500">// Logs will appear here...</p> : logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    );
};
