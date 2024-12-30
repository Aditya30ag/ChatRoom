import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import { Users, Send, LogOut } from 'lucide-react';

function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [activeUsers, setActiveUsers] = useState([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false // Don't connect automatically
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setReconnecting(false);
      if (isJoined && username) {
        socketRef.current.emit('join', username); // Rejoin on reconnect
      }
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('reconnecting', () => {
      setReconnecting(true);
    });

    socketRef.current.on('reconnect_failed', () => {
      setReconnecting(false);
      alert('Failed to connect to chat server. Please try again later.');
    });

    // Message and user event handlers
    socketRef.current.on('message', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'message' }]);
    });

    socketRef.current.on('userJoined', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'system' }]);
    });

    socketRef.current.on('userLeft', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'system' }]);
    });

    socketRef.current.on('activeUsers', (users) => {
      setActiveUsers(users);
    });

    socketRef.current.on('userTyping', ({ user, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(user);
        } else {
          newSet.delete(user);
        }
        return newSet;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Debounced typing indicator
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketRef.current?.emit('typing', true);
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', false);
    }, 1000);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      socketRef.current.connect();
      socketRef.current.emit('join', username);
      setIsJoined(true);
    } catch (error) {
      alert('Failed to join chat. Please try again.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit('message', message);
    setMessage('');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socketRef.current.emit('typing', false);
    }
  };

  const handleLeave = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('dis');
      socketRef.current.disconnect();
    }
    setIsJoined(false);
    setMessages([]);
    setUsername('');
    setTypingUsers(new Set());
    setActiveUsers([]);
    setIsConnected(false);
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 text-gray-200 rounded-xl shadow-lg w-full max-w-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Welcome to Chat</h2>
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-700 bg-gray-900 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                minLength={2}
                maxLength={20}
              />
            </div>
            <button
              type="submit"
              disabled={!username.trim() || reconnecting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reconnecting ? 'Connecting...' : 'Join Chat'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 h-screen flex flex-col bg-gray-900 text-gray-200">
      <div className="rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden">
        {/* Header with connection status */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Chat Room</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <p className="text-sm opacity-90">
                {isConnected ? `Connected as ${username}` : 'Disconnected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUsersList(!showUsersList)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Users size={18} />
              <span className="text-sm">Users ({activeUsers.length})</span>
            </button>
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Leave</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-800">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    msg.type === 'system' ? 'text-center text-gray-400 text-sm' : ''
                  }`}
                >
                  {msg.type === 'system' ? (
                    <p className="py-1 px-3 bg-gray-700 inline-block rounded-full text-xs">
                      {msg.message}
                    </p>
                  ) : (
                    <div
                      className={`flex ${
                        msg.user === username ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 ${
                          msg.user === username
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        {msg.user !== username && (
                          <p className="text-sm font-semibold mb-1">{msg.user}</p>
                        )}
                        <p className="leading-relaxed break-words">{msg.text}</p>
                        <p className="text-xs mt-2 opacity-75">
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="px-4 py-2 text-sm text-gray-400 bg-gray-800 border-t border-gray-700">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-3 border border-gray-700 bg-gray-900 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !message.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Users Sidebar */}
          <div
            className={`w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto transition-all duration-300 ${
              showUsersList ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Active Users</h3>
              <div className="space-y-2">
                {activeUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-900 shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">{user}</span>
                    {user === username && (
                      <span className="text-xs text-gray-500 ml-auto">(you)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;