import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiTag } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import useStorage from '../hooks/useStorage';
import { db } from '../firebase';
import LostItemCard from '../components/LostItemCard';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const statusFilters = ['All', 'Lost', 'Found', 'Resolved'];
const categories = ['All', 'Electronics', 'Books', 'Accessories', 'Clothing', 'ID Card', 'Other'];

const LostFound = () => {
    const { currentUser, userProfile } = useAuth();
    const { docs: items, loading } = useFirestore('lostfound', [], { field: 'createdAt', direction: 'desc' });
    const { upload, uploading, progress } = useStorage();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [cat, setCat] = useState('All');
    const [showPost, setShowPost] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [form, setForm] = useState({ itemName: '', description: '', contact: '', status: 'Lost', category: 'Other' });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] }, maxFiles: 1, onDrop: f => setImageFile(f[0]),
    });

    const filtered = items.filter(i => {
        const matchSearch = i.itemName?.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === 'All' || i.status?.toLowerCase() === status.toLowerCase();
        const matchCat = cat === 'All' || i.category === cat;
        return matchSearch && matchStatus && matchCat;
    });

    const handlePost = async (e) => {
        e.preventDefault();
        if (!form.itemName || !form.description || !form.contact) return toast.error('Fill all required fields');
        try {
            let imageURL = '';
            if (imageFile) {
                imageURL = await upload(imageFile, `lostfound/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
            }
            await addDoc(collection(db, 'lostfound'), {
                ...form,
                imageURL,
                uploadedBy: currentUser.uid,
                uploaderName: userProfile?.name || 'Student',
                createdAt: serverTimestamp(),
            });
            toast.success(`${form.status} item posted!`);
            setShowPost(false);
            setForm({ itemName: '', description: '', contact: '', status: 'Lost', category: 'Other' });
            setImageFile(null);
        } catch { toast.error('Failed to post item'); }
    };

    const handleResolve = async (id) => {
        try {
            await updateDoc(doc(db, 'lostfound', id), { status: 'resolved', updatedAt: serverTimestamp() });
            toast.success('Marked as resolved!');
        } catch { toast.error('Failed to update status'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Lost & Found</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Report or find lost items on campus</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPost(true)}
                    className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold shadow-lg">
                    <FiPlus className="w-4 h-4" /> Post Item
                </motion.button>
            </div>

            <SearchBar value={search} onChange={setSearch} placeholder="Search items..." />

            <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {statusFilters.map(s => (
                        <button key={s} onClick={() => setStatus(s)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${status === s ? 'gradient-brand text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {categories.map(c => (
                        <button key={c} onClick={() => setCat(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${cat === c ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"><SkeletonLoader count={6} /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <FiTag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No items found</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filtered.map(i => <LostItemCard key={i.id} item={i} onMarkResolved={handleResolve} />)}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {showPost && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={e => e.target === e.currentTarget && setShowPost(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Post Item</h2>
                                <button onClick={() => setShowPost(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><FiX /></button>
                            </div>
                            <form onSubmit={handlePost} className="space-y-3">
                                <div className="flex gap-2">
                                    {['Lost', 'Found'].map(s => (
                                        <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.status === s ? (s === 'Lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                <input placeholder="Item Name *" value={form.itemName} onChange={e => setForm(p => ({ ...p, itemName: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                                <textarea placeholder="Description *" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm resize-none" />
                                <input placeholder="Contact (phone/email) *" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm">
                                    {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                </select>
                                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                    <input {...getInputProps()} />
                                    {imageFile ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{imageFile.name}</p>
                                    ) : (
                                        <p className="text-sm text-slate-400">Drop item image (optional)</p>
                                    )}
                                </div>
                                {uploading && <div className="w-full bg-slate-100 rounded-full h-2"><div className="h-2 gradient-brand rounded-full" style={{ width: `${progress}%` }} /></div>}
                                <button type="submit" disabled={uploading} className="w-full py-3 gradient-brand text-white rounded-xl text-sm font-bold disabled:opacity-60">
                                    {uploading ? `Uploading ${progress}%...` : 'Post Item'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LostFound;
