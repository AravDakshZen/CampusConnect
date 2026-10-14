import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiImage, FiX, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { getDatabase, ref as dbRef, set, push, onValue, serverTimestamp, onDisconnect } from 'firebase/database';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import useStorage from '../hooks/useStorage';
import ChatBubble from '../components/ChatBubble';
import toast from 'react-hot-toast';
import app from '../firebase';

const rtdb = getDatabase(app);

const getDMRoomId = (uid1, uid2) => [uid1, uid2].sort().join('__');

const sendMessage = async (roomId, payload) => {
    const messagesRef = dbRef(rtdb, `chats/${roomId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, {
        ...payload,
        timestamp: serverTimestamp(),
    });
};

const subscribeToMessages = (roomId, onUpdate) => {
    const messagesRef = dbRef(rtdb, `chats/${roomId}/messages`);
    return onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        const messages = data
            ? Object.entries(data).map(([id, message]) => ({ id, ...message }))
            : [];
        onUpdate(messages);
    });
};

const setTyping = (roomId, uid, isTyping) => {
    set(dbRef(rtdb, `typing/${roomId}/${uid}`), isTyping);
};

const subscribeToTyping = (roomId, onUpdate) => {
    const typingRef = dbRef(rtdb, `typing/${roomId}`);
    return onValue(typingRef, (snapshot) => {
        onUpdate(snapshot.val() || {});
    });
};

const setUserPresence = (uid) => {
    const presenceRef = dbRef(rtdb, `presence/${uid}`);
    set(presenceRef, { online: true, lastSeen: serverTimestamp() });
    onDisconnect(presenceRef).set({ online: false, lastSeen: serverTimestamp() });
};

const Chat = () => {
    const { currentUser, userProfile } = useAuth();
    const { docs: users } = useFirestore('users');
    const { upload, uploading } = useStorage();

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [typing, setTypingState] = useState({});
    const messagesEndRef = useRef(null);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 1,
        noClick: true,
        onDrop: (f) => setImageFile(f[0]),
    });

    useEffect(() => {
        if (!currentUser?.uid) return;
        setUserPresence(currentUser.uid);
    }, [currentUser?.uid]);

    useEffect(() => {
        if (!selectedRoom) return;
        const unsubMessages = subscribeToMessages(selectedRoom, setMessages);
        const unsubTyping = subscribeToTyping(selectedRoom, setTypingState);
        return () => {
            unsubMessages();
            unsubTyping();
        };
    }, [selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleUserSelect = (user) => {
        const roomId = getDMRoomId(currentUser.uid, user.uid);
        setSelectedRoom(roomId);
        setIsGroup(false);
    };

    const handleGroupSelect = (dept) => {
        setSelectedRoom(`group_${dept.toLowerCase()}`);
        setIsGroup(true);
    };

    const handleTyping = (val) => {
        setText(val);
        if (selectedRoom) setTyping(selectedRoom, currentUser.uid, val.length > 0);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!selectedRoom) return;
        if (!text.trim() && !imageFile) return;

        try {
            let imageURL = '';
            if (imageFile) {
                imageURL = await upload(imageFile, `chat/${selectedRoom}/${Date.now()}_${imageFile.name}`);
                setImageFile(null);
            }

            await sendMessage(selectedRoom, {
                text: text.trim(),
                imageURL,
                senderId: currentUser.uid,
                senderName: userProfile?.name || 'Student',
                read: false,
            });

            setText('');
            setTyping(selectedRoom, currentUser.uid, false);
        } catch {
            toast.error('Failed to send message');
        }
    };

    const otherUsers = users.filter((u) => u.uid !== currentUser.uid);
    const departments = [...new Set(users.map((u) => u.department).filter(Boolean))];
    const someoneTyping = Object.entries(typing).some(([uid, isTyping]) => isTyping && uid !== currentUser.uid);

    return (
        <div className="flex h-[calc(100vh-5rem)] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden sm:flex">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <FiMessageSquare className="w-4 h-4 text-blue-500" /> Messages
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {departments.length > 0 && (
                        <div className="p-3">
                            <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1"><FiUsers className="w-3 h-3" /> Department Groups</p>
                            {departments.map((dept) => (
                                <button
                                    key={dept}
                                    onClick={() => handleGroupSelect(dept)}
                                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all mb-1 ${selectedRoom === `group_${dept.toLowerCase()}` ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                        {dept[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{dept} Group</p>
                                        <p className="text-xs text-slate-400">Department chat</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="p-3">
                        <p className="text-xs text-slate-400 font-medium mb-2">Direct Messages</p>
                        {otherUsers.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => handleUserSelect(u)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all mb-1 ${selectedRoom === getDMRoomId(currentUser.uid, u.uid) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <div className="relative">
                                    {u.profileImage ? (
                                        <img src={u.profileImage} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs">
                                            {u.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-900" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                                    <p className="text-xs text-slate-400">{u.department}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {!selectedRoom ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <FiMessageSquare className="w-16 h-16 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">Select a conversation</p>
                            <p className="text-sm mt-1">Choose a user or group from the sidebar</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
                                {isGroup ? 'G' : selectedRoom.replace(currentUser.uid, '').replace('_', '')[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                    {isGroup ? `${selectedRoom.replace('group_', '').toUpperCase()} Group` : 'Direct Message'}
                                </p>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </div>

                        <div {...getRootProps()} className="flex-1 overflow-y-auto p-4 space-y-1">
                            <input {...getInputProps()} />
                            {messages.length === 0 ? (
                                <div className="text-center text-slate-400 py-8 text-sm">Start the conversation!</div>
                            ) : (
                                messages.map((m) => (
                                    <ChatBubble key={m.id} message={m} isSelf={m.senderId === currentUser.uid} />
                                ))
                            )}
                            {someoneTyping && (
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [-2, 2, -2] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {imageFile && (
                            <div className="px-4 py-2 flex items-center gap-2">
                                <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                                <button onClick={() => setImageFile(null)} className="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200"><FiX className="w-3 h-3" /></button>
                            </div>
                        )}

                        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                            <label className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all">
                                <FiImage className="w-5 h-5" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
                            </label>
                            <input
                                value={text}
                                onChange={(e) => handleTyping(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm border border-transparent focus:border-blue-400 transition-all"
                            />
                            <motion.button
                                type="submit"
                                disabled={uploading || (!text.trim() && !imageFile)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2.5 rounded-xl gradient-brand text-white disabled:opacity-50 shadow-md"
                            >
                                <FiSend className="w-4 h-4" />
                            </motion.button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;
