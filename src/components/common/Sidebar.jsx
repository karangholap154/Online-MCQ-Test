import { NavLink } from "react-router-dom";
import {
  Users,
  User,
  ShieldQuestionMark,
  BookOpenCheck,
  LayoutDashboard,
} from "lucide-react";
import "../../App.css";
import { Nav, OverlayTrigger, Tooltip } from "react-bootstrap";

const Sidebar = ({ isOpen, onCloseSidebar }) => {
  return (
    <aside
      className={`sidebar border-end flex-shrink-0 overflow-hidden bg-light py-4 px-2 ${isOpen ? "open" : "closed"}`}
    >
      <Nav className="flex-column gap-1">
        <SidebarItem
          to="/hr"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          end
          onItemClick={onCloseSidebar}
        />
        <SidebarItem
          to="/hr/candidates"
          icon={<User size={20} />}
          label="Candidates"
          onItemClick={onCloseSidebar}
        />
        <SidebarItem
          to="/hr/questions"
          icon={<ShieldQuestionMark size={20} />}
          label="Questions"
          onItemClick={onCloseSidebar}
        />
        <SidebarItem
          to="/hr/results"
          icon={<BookOpenCheck size={20} />}
          label="Results"
          onItemClick={onCloseSidebar}
        />
        <SidebarItem
          to="/hr/users"
          icon={<Users size={20} />}
          label="User Management"
          onItemClick={onCloseSidebar}
        />
      </Nav>
    </aside>
  );
};
const SidebarItem = ({ to, icon, label, end, onItemClick }) => (
  <Nav.Item>
    <OverlayTrigger
      placement="right"
      overlay={<Tooltip id={`tooltip-${label}`}>{label}</Tooltip>}
    >
      <div className="tooltip-wrapper">
        <NavLink
          to={to}
          end={end}
          onClick={onItemClick}
          className={({ isActive }) =>
            `nav-link d-flex align-items-center gap-2 sidebar-link px-3 py-3 rounded-4 ${isActive ? "active fw-bold text-dark bg-primary-subtle" : "text-secondary"}`
          }
        >
          {icon}
          <span className="sidebar-label">{label}</span>
        </NavLink>
      </div>
    </OverlayTrigger>
  </Nav.Item>
);

export default Sidebar;
