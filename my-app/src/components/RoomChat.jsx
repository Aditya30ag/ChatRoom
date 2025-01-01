import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import AuthForm from './AuthForm';
import ModeSelection from './ModeSelection';
import ChatContainer from './Chatcontainer';

const RoomChat = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [joinData, setJoinData] = useState({
    roomId: '',
    username: '',
    password: '',
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isJoined, setIsJoined] = useState(false);
  const [mode, setMode] = useState('select'); // 'select', 'create', or 'join'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('activeUsers', (users) => {
      setActiveUsers(users);
    });

    socket.on('joinSuccess', (data) => {
      setIsJoined(true);
      setError('');
      setMessages([]);
      setMode('select');
    });

    socket.on('joinError', (errorMessage) => {
      setError(errorMessage);
    });

    socket.on('userTyping', ({ user, isTyping }) => {
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
      socket.off('message');
      socket.off('activeUsers');
      socket.off('joinSuccess');
      socket.off('joinError');
      socket.off('userTyping');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit('joinRoom', joinData);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: joinData.roomId,
          username: joinData.username,
          password: joinData.password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // After creating room, automatically join it
        socket.emit('joinRoom', joinData);
      } else {
        setError(data.message || 'Failed to create room');
      }
    } catch (error) {
      setError('Server error occurred');
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leaveRoom');
      setIsJoined(false);
      setMessages([]);
      setActiveUsers([]);
      setMode('select');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket && newMessage.trim()) {
      socket.emit('message', newMessage);
      setNewMessage('');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing', e.target.value.length > 0);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <p className="text-lg">Connecting to chat server...</p>
        </div>
      </div>
    );
  }

  const renderAuthForm = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (mode === 'create') {
        handleCreateRoom(e);
      } else {
        handleJoinRoom(e);
      }
    };
  
    return (
      <AuthForm
        mode={mode}
        formData={joinData}
        onFormDataChange={setJoinData}
        onSubmit={handleSubmit}
        onBack={() => {
          setMode('select');
          setError('');
        }}
        error={error}
      />
    );
  };
  
  
    const renderModeSelection = () => {
        const createBtn = () => setMode('create');
        const joinBtn = () => setMode('join');
        return (
            <ModeSelection createBtn={createBtn} joinBtn={joinBtn}/>
        );
    }
    const renderChat = () => (
        <ChatContainer
          roomData={joinData}
          messages={messages}
          newMessage={newMessage}
          activeUsers={activeUsers}
          typingUsers={typingUsers}
          messagesEndRef={messagesEndRef}
          onLeaveRoom={handleLeaveRoom}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      );
  return (
    <>
        {!isJoined ? (
          mode === 'select' ? renderModeSelection(): renderAuthForm()
        ) : (
            renderChat()
        )}
    </>
  );
};

export default RoomChat;