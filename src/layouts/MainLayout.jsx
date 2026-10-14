import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import InstallAppBanner from '../components/InstallAppBanner';

const MainLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-[#FAF9FC] text-slate-800">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar />
                {/* Extra bottom padding on mobile so content isn't hidden behind the bottom nav */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
                    <Outlet />
                </main>
            </div>
            {/* Native-like mobile bottom navigation */}
            <MobileBottomNav />
            {/* PWA Install floating banner */}
            <InstallAppBanner />
        </div>
    );
};

export default MainLayout;

