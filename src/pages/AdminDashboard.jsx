import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiBook, FiTag, FiSend, FiTrash2, FiShield } from 'react-icons/fi';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const statCards = [
    { label: 'Total Students', icon: FiUsers, field: 'users', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
    { label: 'Total Events', icon: FiCalendar, field: 'events', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
    { label: 'Notes Shared', icon: FiBook, field: 'notes', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
    { label: 'Lost & Found Posts', icon: FiTag, field: 'lostfound', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
];

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const { docs: users } = useFirestore('users');
    const { docs: notes } = useFirestore('notes');
    const { docs: events } = useFirestore('events');
    const { docs: lostItems } = useFirestore('lostfound');

    const [announcement, setAnnouncement] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    const counts = { users: users.length, events: events.length, notes: notes.length, lostfound: lostItems.length };

    const handleDelete = async (collection, id, successMsg) => {
        if (!confirm(`Delete this ${collection.slice(0, -1)}?`)) return;
        try { 
            await deleteDoc(doc(db, collection, id)); 
            toast.success(successMsg); 
        }
        catch { toast.error('Failed to delete'); }
    };

    const handleMakeAdmin = async (uid) => {
        try {
            await setDoc(doc(db, 'users', uid), { role: 'admin' }, { merge: true });
            toast.success('User promoted to admin!');
        } catch { toast.error('Failed to update role'); }
    };

    const handleAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcement.trim()) return toast.error('Enter an announcement');
        try {
            await addDoc(collection(db, 'notifications'), {
                message: announcement,
                type: 'announcement',
                userId: 'all',
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
            });
            toast.success('Announcement sent to all users!');
            setAnnouncement('');
        } catch { toast.error('Failed to send announcement'); }
    };

    const tabs = ['users', 'notes', 'events', 'lostfound'];

    // --- Data Table Columns ---
    const userColumns = [
        { 
            header: 'User', 
            accessor: 'name',
            render: (u) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                </div>
            )
        },
        { header: 'Department', accessor: 'department' },
        { 
            header: 'Role', 
            accessor: 'role',
            render: (u) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role || 'student'}
                </span>
            )
        }
    ];

    const noteColumns = [
        { header: 'Title', accessor: 'title', render: n => <span className="font-semibold">{n.title}</span> },
        { header: 'Subject', accessor: 'subject' },
        { header: 'Dept / Sem', accessor: 'department', render: n => `${n.department} • Sem ${n.semester}` }
    ];

    const eventColumns = [
        { header: 'Event Title', accessor: 'title', render: e => <span className="font-semibold">{e.title}</span> },
        { header: 'Category', accessor: 'category' },
        { header: 'Venue', accessor: 'venue' },
        { header: 'Date', accessor: 'date' }
    ];

    const lostFoundColumns = [
        { header: 'Item Name', accessor: 'itemName', render: i => <span className="font-semibold">{i.itemName}</span> },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (i) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    i.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                    i.status === 'found' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                    {i.status || 'lost'}
                </span>
            )
        },
        { header: 'Contact', accessor: 'contact' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
                    <FiShield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Admin Panel</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Rajalakshmi Engineering College (REC) Campus Management</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(s => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{counts[s.field]}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Announcement */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <FiSend className="w-4 h-4 text-blue-500" /> Send Announcement
                </h2>
                <form onSubmit={handleAnnouncement} className="flex gap-3">
                    <input value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Type an announcement for all students..."
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                    <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="px-5 py-3 gradient-brand text-white rounded-xl text-sm font-bold shadow-md">
                        Send
                    </motion.button>
                </form>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`flex-1 py-3 px-4 text-sm font-semibold capitalize transition-all whitespace-nowrap ${activeTab === t ? 'gradient-brand text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            {t === 'lostfound' ? 'Lost & Found' : t} ({counts[t]})
                        </button>
                    ))}
                </div>
                <div className="p-4">
                    {activeTab === 'users' && (
                        <DataTable 
                            data={users}
                            columns={userColumns}
                            searchKey="name"
                            searchPlaceholder="Search users by name..."
                            itemsPerPage={10}
                            actions={(u) => (
                                <>
                                    {u.role !== 'admin' && (
                                        <button onClick={() => handleMakeAdmin(u.uid || u.id)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title="Make Admin">
                                            <FiShield className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete('users', u.id, 'User removed')} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Remove User">
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        />
                    )}

                    {activeTab === 'notes' && (
                        <DataTable 
                            data={notes}
                            columns={noteColumns}
                            searchKey="title"
                            searchPlaceholder="Search notes by title..."
                            itemsPerPage={10}
                            actions={(n) => (
                                <button onClick={() => handleDelete('notes', n.id, 'Note deleted')} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete Note">
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            )}
                        />
                    )}

                    {activeTab === 'events' && (
                        <DataTable 
                            data={events}
                            columns={eventColumns}
                            searchKey="title"
                            searchPlaceholder="Search events by title..."
                            itemsPerPage={10}
                            actions={(ev) => (
                                <button onClick={() => handleDelete('events', ev.id, 'Event deleted')} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete Event">
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            )}
                        />
                    )}

                    {activeTab === 'lostfound' && (
                        <DataTable 
                            data={lostItems}
                            columns={lostFoundColumns}
                            searchKey="itemName"
                            searchPlaceholder="Search lost & found items..."
                            itemsPerPage={10}
                            actions={(i) => (
                                <button onClick={() => handleDelete('lostfound', i.id, 'Post deleted')} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete Post">
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            )}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
