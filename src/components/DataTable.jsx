import { useState, useMemo } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DataTable = ({ 
    data = [], 
    columns = [], 
    searchPlaceholder = "Search...", 
    searchKey = "",
    actions = null,
    itemsPerPage = 5
}) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filteredData = useMemo(() => {
        if (!search.trim() || !searchKey) return data;
        return data.filter(item => {
            const val = item[searchKey];
            if (!val) return false;
            return String(val).toLowerCase().includes(search.toLowerCase());
        });
    }, [data, search, searchKey]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleNext = () => setPage(p => Math.min(p + 1, totalPages));
    const handlePrev = () => setPage(p => Math.max(p - 1, 1));

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder={searchPlaceholder}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-4 py-3 font-semibold whitespace-nowrap">
                                    {col.header}
                                </th>
                            ))}
                            {actions && <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, idx) => (
                                <tr key={row.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    {columns.map((col, cIdx) => (
                                        <td key={cIdx} className="px-4 py-3 whitespace-nowrap">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">
                                    No data found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredData.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4 text-sm text-slate-500 dark:text-slate-400">
                    <p>Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredData.length)} of {filteredData.length} entries</p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrev} 
                            disabled={page === 1}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{page} / {totalPages}</span>
                        <button 
                            onClick={handleNext} 
                            disabled={page === totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
