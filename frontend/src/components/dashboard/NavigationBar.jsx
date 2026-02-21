// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Sparkles,
  // TODO: remove unused icon imports to keep bundle/code clean.
  Users,
  ClipboardCheck,
  Calendar,
  Shield,
  BookOpen,
  ChevronDown,
} from "lucide-react";

 function NavigationBar({onLogout}) {
  const [studentsOpen, setStudentsOpen] = useState(true);

  const linkClass = ({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">🚀</div>
        <div className="brand-text">
          {/* TODO: replace placeholder brand text with final product name. */}
          <div className="brand-title">Individual Educational System</div>
          <div className="brand-subtitle">IEP</div>
        </div>
      </div>

      <div className="section-label">PORTAL</div>

      <nav className="nav">
        <NavLink to="/dashboard" className={linkClass}>
          <Home size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* TODO: keep route naming consistent with App.jsx (likely "/ieps"). */}
        <NavLink to="/ieps" className={linkClass}>
          <Sparkles size={18} />
          <span>IEP List</span>
        </NavLink>

      

        {/* Collapsible group */}
        <button
          type="button"
          className={`nav-item nav-group ${studentsOpen ? "open" : ""}`}
          onClick={() => setStudentsOpen((v) => !v)}
        >
          <Users size={18} />
          <span>Students</span>
          <ChevronDown className="chev" size={18} />
        </button>

        {studentsOpen && (
          <div className="subnav">
            <NavLink to="/students" className={linkClass}>
              <span className="dot" />
              <span>All Students</span>
            </NavLink>
            <NavLink to="/students/new" className={linkClass}>
              <span className="dot" />
              <span>Add Student</span>
            </NavLink>
          </div>
        )}

        <NavLink to="/accommodations" className={linkClass}>
          <ClipboardCheck size={18} />
          <span>Testing Accommodations</span>
        </NavLink>


        <NavLink to="/meeting" className={linkClass}>
          <Calendar size={18} />
          <span>IEP/Events Scheduler</span>
        </NavLink>

        <div className="divider" />

        <NavLink to="/privacy" className={linkClass}>
          <Shield size={18} />
          <span>Privacy Permissions</span>
        </NavLink>

        <NavLink to="/team" className={linkClass}>
          <BookOpen size={18} />
          <span>Contact</span>
        </NavLink>

        <button onClick={onLogout}>
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default NavigationBar;