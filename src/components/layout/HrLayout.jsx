import { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import Sidebar from "../common/Sidebar";
import { Outlet } from "react-router-dom";
import Footer from "../common/Footer";

const HrLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 992;
      setIsLargeScreen(isLarge);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar onToggle={handleToggleSidebar} sidebarOpen={sidebarOpen} />

      {sidebarOpen && !isLargeScreen && (
        <div className="sidebar-overlay" onClick={handleCloseSidebar} />
      )}

      <div className="layout-container flex-grow-1">
        <Sidebar isOpen={sidebarOpen} onCloseSidebar={handleCloseSidebar} />
        <main className="p-2 flex-grow-1 overflow-auto main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default HrLayout;
