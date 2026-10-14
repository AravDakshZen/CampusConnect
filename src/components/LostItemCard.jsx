import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiTag, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

const statusStyles = {
    lost: { label: 'Lost', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    found: { label: 'Found', cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    resolved: { label: 'Resolved', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
};

const LostItemCard = ({ item, onMarkResolved }) => {
    const status = statusStyles[item.status?.toLowerCase()] || statusStyles.lost;
    const date = item.createdAt?.toDate ? format(item.createdAt.toDate(), 'MMM d, yyyy') : '';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
        >
            {/* Image */}
            {item.imageURL ? (
                <div className="h-40 overflow-hidden">
                    <img src={item.imageURL} alt={item.itemName} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <FiTag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
            )}

            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.itemName}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${status.cls}`}>
                        {status.label}
                    </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>

                <div className="space-y-1.5">
                    {item.contact && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <FiPhone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span>{item.contact}</span>
                        </div>
                    )}
                    {date && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <FiCalendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{date}</span>
                        </div>
                    )}
                </div>

                {item.status !== 'resolved' && onMarkResolved && (
                    <button
                        onClick={() => onMarkResolved(item.id)}
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    >
                        Mark as Resolved
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default LostItemCard;
