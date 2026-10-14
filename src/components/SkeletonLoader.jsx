const SkeletonLoader = ({ type = 'card', count = 3 }) => {
    const pulse = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl';

    const CardSkeleton = () => (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl ${pulse}`} />
                <div className="flex-1 space-y-2">
                    <div className={`h-4 rounded ${pulse}`} />
                    <div className={`h-3 w-2/3 rounded ${pulse}`} />
                </div>
            </div>
            <div className="flex gap-2">
                <div className={`h-6 w-16 rounded-full ${pulse}`} />
                <div className={`h-6 w-12 rounded-full ${pulse}`} />
            </div>
            <div className={`h-8 rounded-xl ${pulse}`} />
        </div>
    );

    const ListSkeleton = () => (
        <div className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-800">
            <div className={`w-9 h-9 rounded-full ${pulse}`} />
            <div className="flex-1 space-y-2">
                <div className={`h-3 w-3/4 rounded ${pulse}`} />
                <div className={`h-3 w-1/2 rounded ${pulse}`} />
            </div>
        </div>
    );

    const Skeleton = type === 'list' ? ListSkeleton : CardSkeleton;

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} />
            ))}
        </>
    );
};

export default SkeletonLoader;
