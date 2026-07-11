import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Task, ChatMessage } from './types';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { 
  saveSecureSession, 
  loadSecureSession, 
  clearSecureSession, 
  DecryptedSession 
} from './lib/security';

// Decoupled screens
import Homepage from './components/Homepage';
import Workspace from './components/Workspace';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

type Screen = 'home' | 'workspace' | 'privacy' | 'terms';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(3600); // Default 1 hour

  // Checklist State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Custom Gemini API Key State
  const [userGeminiApiKey, setUserGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('user_gemini_api_key') || '';
  });

  const handleSaveGeminiApiKey = (key: string) => {
    const trimmed = key.trim();
    setUserGeminiApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('user_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }
  };

  // 1. Check for pre-existing secure sessions on load
  useEffect(() => {
    const session: DecryptedSession = loadSecureSession();
    if (session.isValid && session.token && session.spreadsheetId) {
      setGoogleToken(session.token);
      setSpreadsheetId(session.spreadsheetId);
      setSessionTimeRemaining(session.timeRemainingSeconds);
      setUser({
        displayName: session.userEmail ? session.userEmail.split('@')[0] : 'App User',
        email: session.userEmail || 'user@example.com',
        photoURL: null,
      } as any);
      setCurrentScreen('workspace');
    }
  }, []);

  // 2. Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        // If we got a token from Firebase login pop-up, let's keep it
        if (token) {
          setGoogleToken(token);
        }
      },
      () => {
        // Only reset if we don't have a valid decrypted local session
        const session = loadSecureSession();
        if (!session.isValid) {
          setUser(null);
          setGoogleToken(null);
          setSpreadsheetId(null);
          setTasks([]);
          setChatMessages([]);
          if (currentScreen === 'workspace') {
            setCurrentScreen('home');
          }
        } else {
          // Keep/restore fallback user details using session metadata
          setUser((prev) => prev || ({
            displayName: session.userEmail ? session.userEmail.split('@')[0] : 'App User',
            email: session.userEmail || 'user@example.com',
            photoURL: null,
          } as any));
        }
      }
    );
    return () => unsubscribe();
  }, [currentScreen]);

  // 3. Keep secure session ticker updated (Enforcing 1-hour force expiry)
  useEffect(() => {
    if (!googleToken) return;

    const interval = setInterval(() => {
      setSessionTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSessionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [googleToken]);

  // 4. Fetch tasks when token and sheet are ready
  useEffect(() => {
    if (googleToken && spreadsheetId) {
      fetchTasks(googleToken, spreadsheetId);
    }
  }, [googleToken, spreadsheetId]);

  // Force Session expiry logout for anti-hack & defense-in-depth safety
  const handleAutoSessionTimeout = async () => {
    await logout();
    clearSecureSession();
    setSpreadsheetId(null);
    setGoogleToken(null);
    setUser(null);
    setTasks([]);
    setChatMessages([]);
    setCurrentScreen('home');
    alert('Security Alert: Your 1-hour secure session has expired to protect your Google account. Please log in again to continue.');
  };

  // Create or initialize Google Spreadsheet
  const initializeSpreadsheet = async (token: string, currentUserEmail: string) => {
    setIsLoadingTasks(true);
    try {
      let data;
      try {
        const res = await fetch('/api/sheets/init', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          data = await res.json();
        } else {
          console.warn('Server sheet init returned non-ok, trying client-side fallback...');
          const { initSpreadsheetClientSide } = await import('./lib/googleSheetsFallback');
          data = await initSpreadsheetClientSide(token);
        }
      } catch (err) {
        console.warn('Server sheet init failed, trying client-side fallback...', err);
        const { initSpreadsheetClientSide } = await import('./lib/googleSheetsFallback');
        data = await initSpreadsheetClientSide(token);
      }

      if (data && data.spreadsheetId) {
        setSpreadsheetId(data.spreadsheetId);
        // Save secure encrypted session on success
        saveSecureSession(token, data.spreadsheetId, currentUserEmail);
        setSessionTimeRemaining(3600); // Reset to 1 hour
      }
    } catch (err: any) {
      console.error('Spreadsheet Init Failed:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Fetch Tasks list from Google Sheet
  const fetchTasks = async (token: string, sheetId: string) => {
    setIsLoadingTasks(true);
    try {
      let data;
      try {
        const res = await fetch(`/api/tasks?spreadsheetId=${sheetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          data = await res.json();
        } else {
          console.warn('Server fetch tasks returned non-ok, trying client-side fallback...');
          const { fetchTasksClientSide } = await import('./lib/googleSheetsFallback');
          data = await fetchTasksClientSide(token, sheetId);
        }
      } catch (err) {
        console.warn('Server fetch tasks failed, trying client-side fallback...', err);
        const { fetchTasksClientSide } = await import('./lib/googleSheetsFallback');
        data = await fetchTasksClientSide(token, sheetId);
      }
      setTasks(data);
    } catch (err: any) {
      console.error('Fetch tasks failed:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Google Sign-In Action
  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setGoogleToken(result.accessToken);
        
        // Connect to spreadsheet
        await initializeSpreadsheet(result.accessToken, result.user.email || '');
        setCurrentScreen('workspace');
      }
    } catch (err) {
      console.error('Sign-in flow error:', err);
    }
  };

  // Add Task manually
  const handleAddTask = async (description: string) => {
    if (!googleToken || !spreadsheetId) return;
    setIsAddingTask(true);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

    try {
      let newTask;
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${googleToken}`,
          },
          body: JSON.stringify({
            spreadsheetId,
            description,
            date: dateStr,
            timestamp: timeStr,
          }),
        });

        if (res.ok) {
          newTask = await res.json();
        } else {
          console.warn('Server add task returned non-ok, trying client-side fallback...');
          const { addTaskClientSide } = await import('./lib/googleSheetsFallback');
          newTask = await addTaskClientSide(googleToken, spreadsheetId, description, dateStr, timeStr);
        }
      } catch (err) {
        console.warn('Server add task failed, trying client-side fallback...', err);
        const { addTaskClientSide } = await import('./lib/googleSheetsFallback');
        newTask = await addTaskClientSide(googleToken, spreadsheetId, description, dateStr, timeStr);
      }

      setTasks((prev) => [newTask, ...prev]);
    } catch (err: any) {
      console.error('Add task failed:', err);
    } finally {
      setIsAddingTask(false);
    }
  };

  // Update status manually
  const handleUpdateStatus = async (taskId: string, nextStatus: 'Pending' | 'Completed') => {
    if (!googleToken || !spreadsheetId) return;

    // Optimistically update the UI to feel lightning fast
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const lastUpdated = `${dateStr} ${timeStr}`;

    try {
      try {
        const res = await fetch('/api/tasks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${googleToken}`,
          },
          body: JSON.stringify({
            spreadsheetId,
            taskId,
            status: nextStatus,
            lastUpdated,
          }),
        });

        if (!res.ok) {
          console.warn('Server update task returned non-ok, trying client-side fallback...');
          const { updateTaskStatusClientSide } = await import('./lib/googleSheetsFallback');
          await updateTaskStatusClientSide(googleToken, spreadsheetId, taskId, nextStatus, lastUpdated);
        }
      } catch (err) {
        console.warn('Server update task failed, trying client-side fallback...', err);
        const { updateTaskStatusClientSide } = await import('./lib/googleSheetsFallback');
        await updateTaskStatusClientSide(googleToken, spreadsheetId, taskId, nextStatus, lastUpdated);
      }
    } catch (err: any) {
      console.error('Update task status failed:', err);
      // Revert optimistic update on failure
      setTasks(previousTasks);
    }
  };

  // Submit text or voice query to Gemini AI
  const handleSendAiMessage = async (queryText: string) => {
    if (!googleToken || !spreadsheetId) return;

    setAiError(null);
    const nowStr = new Date().toLocaleString();
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleToken}`,
          'X-Gemini-API-Key': userGeminiApiKey,
        },
        body: JSON.stringify({
          spreadsheetId,
          query: queryText,
          localTime: nowStr,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Daily AI query limit reached. You can still manage and view your tasks manually below!');
        }
        throw new Error(data.error || 'Failed to query AI workspace.');
      }

      if (data.addedTask) {
        setTasks((prev) => [data.addedTask, ...prev]);
      }

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI Query Failed:', err);
      setAiError(err.message || 'An error occurred during generative analysis.');

      const errorMsgBubble: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        text: 'Apologies, I encountered a rate limit or service interruption. You can continue managing your checklist manually!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setChatMessages((prev) => [...prev, errorMsgBubble]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await logout();
    clearSecureSession();
    setSpreadsheetId(null);
    setGoogleToken(null);
    setUser(null);
    setTasks([]);
    setChatMessages([]);
    setCurrentScreen('home');
  };

  const handleNavigate = (screen: Screen) => {
    if (screen === 'workspace' && (!googleToken || !spreadsheetId)) {
      // Don't navigate to workspace if unauthorized
      handleLogin();
      return;
    }
    setCurrentScreen(screen);
  };

  // Simple Router Switcher
  switch (currentScreen) {
    case 'privacy':
      return <PrivacyPolicy onBack={() => setCurrentScreen('home')} />;
    case 'terms':
      return <TermsOfService onBack={() => setCurrentScreen('home')} />;
    case 'workspace':
      if (user && googleToken) {
        return (
          <Workspace
            user={user}
            spreadsheetId={spreadsheetId}
            tasks={tasks}
            chatMessages={chatMessages}
            isAiLoading={isAiLoading}
            isLoadingTasks={isLoadingTasks}
            isAddingTask={isAddingTask}
            aiError={aiError}
            googleToken={googleToken}
            sessionTimeRemaining={sessionTimeRemaining}
            userGeminiApiKey={userGeminiApiKey}
            onSaveGeminiApiKey={handleSaveGeminiApiKey}
            onFetchTasks={() => fetchTasks(googleToken, spreadsheetId || '')}
            onAddTask={handleAddTask}
            onUpdateStatus={handleUpdateStatus}
            onSendAiMessage={handleSendAiMessage}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        );
      }
      // Fallback if not logged in
      return (
        <Homepage 
          onSignIn={handleLogin} 
          onNavigate={handleNavigate} 
          isLoggedIn={googleToken !== null} 
        />
      );
    case 'home':
    default:
      return (
        <Homepage 
          onSignIn={handleLogin} 
          onNavigate={handleNavigate} 
          isLoggedIn={googleToken !== null} 
        />
      );
  }
}
