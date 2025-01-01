import React from 'react';
import { LogOut, Send } from 'lucide-react';

// Chat Header Component
const ChatHeader = ({ roomId, username, onLeave }) => (
  <div className="min-h-full bg-gray-900 p-4 border-b border-gray-700 rounded-t-md flex justify-between items-center">
    <div>
      <h2 className="text-lg font-semibold text-white">Room: {roomId}</h2>
      <p className="text-sm text-gray-400">Connected as {username}</p>
    </div>
    <button
      onClick={onLeave}
      className="flex items-center space-x-2 text-red-500 hover:text-red-600"
    >
      <LogOut size={16} />
      <span>Leave Room</span>
    </button>
  </div>
);

// Message Component
const Message = ({ message, isCurrentUser }) => (
  <div
    className={`flex flex-col ${
      isCurrentUser ? 'items-end' : 'items-start'
    }`}
  >
    <div
      className={`max-w-[70%] px-4 py-2 rounded-lg ${
        isCurrentUser
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-300'
      }`}
    >
      <p className="text-sm font-semibold">{message.user}</p>
      <p>{message.text}</p>
      <p className="text-xs text-gray-400">
        {new Date(message.timestamp).toLocaleTimeString()}
      </p>
    </div>
  </div>
);

// Message List Component
const MessageList = ({ messages, currentUser, typingUsers, messagesEndRef }) => (
  <div className="min-h-full bg-gray-900 flex-1 p-4 overflow-y-auto rounded-md border border-gray-700">
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <Message
          key={idx}
          message={msg}
          isCurrentUser={msg.user === currentUser}
        />
      ))}
      {typingUsers.size > 0 && (
        <div className="text-sm text-gray-400 italic">
          {Array.from(typingUsers).join(', ')} is typing...
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  </div>
);

// Active Users Component
const ActiveUsers = ({ users, currentUser }) => (
  <div className="min-h-full bg-gray-900 w-48 p-4 border-l border-gray-700 rounded-r-md">
    <h3 className="font-semibold text-gray-200 mb-2">Active Users</h3>
    <ul className="space-y-1">
      {users.map((user) => (
        <li
          key={user}
          className={`text-sm ${
            user === currentUser ? 'text-blue-500 font-semibold' : 'text-gray-300'
          }`}
        >
          {user}
        </li>
      ))}
    </ul>
  </div>
);

// Message Input Component
const MessageInput = ({ value, onChange, onSubmit }) => (
  <div className="min-h-full bg-gray-900 p-4 border-t border-gray-700 rounded-b-md">
    <form onSubmit={onSubmit} className="flex space-x-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Type a message..."
        className="flex-1 px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-300 placeholder-gray-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
      >
        <Send size={16} />
        <span>Send</span>
      </button>
    </form>
  </div>
);

// Main Chat Container Component
const ChatContainer = ({
  roomData,
  messages,
  newMessage,
  activeUsers,
  typingUsers,
  messagesEndRef,
  onLeaveRoom,
  onSendMessage,
  onTyping
}) => (
  <div className="min-h-screen bg-gray-900 flex flex-col">
    <ChatHeader
      roomId={roomData.roomId}
      username={roomData.username}
      onLeave={onLeaveRoom}
    />
    
    <div className="flex flex-1 overflow-hidden">
      <MessageList
        messages={messages}
        currentUser={roomData.username}
        typingUsers={typingUsers}
        messagesEndRef={messagesEndRef}
      />
      
      <ActiveUsers
        users={activeUsers}
        currentUser={roomData.username}
      />
    </div>

    <MessageInput
      value={newMessage}
      onChange={onTyping}
      onSubmit={onSendMessage}
    />
  </div>
);

export default ChatContainer;
