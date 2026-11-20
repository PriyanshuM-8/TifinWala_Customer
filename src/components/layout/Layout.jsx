import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import BottomNav from '../common/BottomNav';
import Footer from '../common/Footer';
import LocationModal from '../common/LocationModal';
import MixedChefModal from '../common/MixedChefModal';
import { useLocation } from '../../context/LocationContext';

export const Layout = () => {
  const { isLocationModalOpen, openLocationModal, closeLocationModal } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#27352F]">
      {/* Top Navbar */}
      <Navbar onOpenLocationModal={openLocationModal} />

      {/* Main Page Content */}
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Informational Footer */}
      <Footer />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav />

      {/* Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
      />
      <MixedChefModal />
    </div>
  );
};

export default Layout;
