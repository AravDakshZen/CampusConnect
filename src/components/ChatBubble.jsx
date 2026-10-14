import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';

const ChatBubble = ({ message, isSelf }) => {
    const time = message.timestamp
        ? format(new Date(message.timestamp), 'h:mm a')
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-3`}
        >
            {/* Avatar for others */}
            {!isSelf && (
                <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
                    {message.senderName?.[0]?.toUpperCase() || 'U'}
                </div>
            )}

            <div className={`max-w-[75%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {/* Sender name */}
                {!isSelf && message.senderName && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 px-2">{message.senderName}</span>
                )}

                {/* Message bubble */}
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm max-w-full break-words
            ${isSelf
                            ? 'gradient-brand text-white rounded-br-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm shadow-sm'
                        }`}
                >
                    {/* Image message */}
                    {message.imageURL && (
                        <img src={message.imageURL} alt="shared" className="rounded-lg mb-2 max-w-full max-h-48 object-cover" />
                    )}
                    {message.text && <p>{message.text}</p>}
                </div>

                {/* Time + read receipts */}
                <div className={`flex items-center gap-1 px-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-slate-400">{time}</span>
                    {isSelf && (
                        message.read
                            ? <span className="flex text-blue-400"><FiCheck className="w-3 h-3" /><FiCheck className="w-3 h-3 -ml-1.5" /></span>
                            : <FiCheck className="w-3 h-3 text-slate-400" />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ChatBubble;
