import { Outlet } from 'react-router';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
