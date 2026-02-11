import { LogOut, Menu, X } from "lucide-react";
import logo from "../../assets/images/candorworkslogo.png";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../utils/security";
import { showConfirmationDialog, showSuccessAlert } from "../../utils/swal.js";
import {
  Navbar as BSNavbar,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useAuthContext } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import "../../App.css";

const Navbar = ({ onToggle, sidebarOpen }) => {
  const { user } = useAuthContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    showConfirmationDialog("You will be logged out").then((result) => {
      if (result.isConfirmed) {
        showSuccessAlert("Logged Out! See you again!");
        setTimeout(() => {
          logout();
        }, 2000);
      }
    });
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <BSNavbar
      className="navbar-responsive fixed-top border-bottom bg-white"
      sticky="top"
    >
      <div className="d-flex align-items-center gap-2 gap-sm-3 w-100">
        <Button
          variant="light"
          className="btn-menu z-1031"
          onClick={handleMenuClick}
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Logo */}
        <Link to="/hr" className="navbar-brand d-flex align-items-center">
          <img
            src={logo}
            alt="CANDORWORKS Logo"
            className="img-fluid object-fit-contain logo-responsive navbar-logo"
          />
        </Link>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-2 gap-sm-3 ms-auto">
          {user && !isMobile && (
            <div className="text-muted me-1 user-info fs-85">
              <span className="fw-semibold">
                {user.first_name} ({user.role})
              </span>
            </div>
          )}
          {user && isMobile && (
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>{user.first_name}</Tooltip>}
            >
              <div className="text-muted user-name-mobile">
                <span className="fw-semibold">{user.first_name}</span>
              </div>
            </OverlayTrigger>
          )}
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Log Out</Tooltip>}
          >
            <Button
              variant="outline-warning"
              className="p-2 text-black"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </Button>
          </OverlayTrigger>
        </div>
      </div>
    </BSNavbar>
  );
};

export default Navbar;
