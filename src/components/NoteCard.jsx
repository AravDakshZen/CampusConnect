import { motion } from 'framer-motion';
import { FiDownload, FiHeart, FiBookmark, FiEye, FiFile, FiImage } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const fileIcons = {
    pdf: { icon: FiFile, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    image: { icon: FiImage, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    doc: { icon: FiFile, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    default: { icon: FiFile, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
};

const NoteCard = ({ note, onPreview, onLike, onSave, liked, saved }) => {
    const { isAdmin } = useAuth();
    const fileType = note.fileType?.toLowerCase() || 'default';
    const iconData = fileIcons[fileType] || fileIcons.default;
    const Icon = iconData.icon;

    const date = note.createdAt?.toDate ? format(note.createdAt.toDate(), 'MMM d, yyyy') : 'Recently';

    // Force real download using Cloudinary's fl_attachment transformation
    const handleDownload = () => {
        if (!note.fileURL) return toast.error('No file available');
        
        try {
            let url = note.fileURL;
            
            // Extract and clean the filename (remove extension and replace special characters)
            const baseName = (note.fileName || note.title || 'note')
                .replace(/\.[^/.]+$/, "") // strip extension if present
                .replace(/[^a-zA-Z0-9_-]/g, '_'); // sanitize special characters

            if (url.includes('cloudinary.com')) {
                // Ensure we use the delivery domain res.cloudinary.com
                if (url.includes('api.cloudinary.com')) {
                    url = url.replace('api.cloudinary.com/v1_1/', 'res.cloudinary.com/');
                }
                // Add the attachment transformation with custom filename
                url = url.replace('/upload/', `/upload/fl_attachment:${baseName}/`);
            }

            // Create temporary anchor to trigger browser download
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            toast.success('Download started!');
        } catch (err) {
            console.error(err);
            // Fallback: open attachment URL directly
            const fallbackUrl = note.fileURL.includes('cloudinary.com')
                ? note.fileURL.replace('/upload/', '/upload/fl_attachment/')
                : note.fileURL;
            window.open(fallbackUrl, '_blank');
            toast.error('Direct download failed — opened in new tab instead');
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col gap-4"
        >
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconData.bg}`}>
                    <Icon className={`w-5 h-5 ${iconData.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate">{note.title}</h3>
                        {isAdmin && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                            ADMIN
                          </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{note.subject}</p>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {note.department && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {note.department}
                    </span>
                )}
                {note.semester && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        Sem {note.semester}
                    </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                    {fileType}
                </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">{date}</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPreview?.(note)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        title="Preview"
                    >
                        <FiEye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onLike?.(note.id)}
                        className={`p-1.5 rounded-lg transition-all ${liked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                    >
                        <FiHeart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={() => onSave?.(note.id)}
                        className={`p-1.5 rounded-lg transition-all ${saved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                    >
                        <FiBookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                        title="Download"
                    >
                        <FiDownload className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default NoteCard;

