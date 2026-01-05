
/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { sidebarMenu } from "../static-data/data.jsx";
import { userContext } from "../context/UserContext";

const Sidebar = ({ collapsed, isMobile }) => {
  const { user } = useContext(userContext);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [openInnerSubmenu, setOpenInnerSubmenu] = useState(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const navigate = useNavigate();
  const submenuTimeoutRef = useRef(null);
  const sidebarRef = useRef(null);

  const handleMouseEnter = (index) => {
    if (collapsed && !isMobile) {
      if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
      setHoveredSubmenu(index);
    }
  };

  const handleMouseLeave = () => {
    if (collapsed && !isMobile) {
      submenuTimeoutRef.current = setTimeout(() => {
        setHoveredSubmenu(null);
      }, 300);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenSubmenu(null);
        setOpenInnerSubmenu(null);
        setActiveTab(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
    };
  }, []);

  if (!user) return null;

  const filteredSidebarMenu = sidebarMenu.filter((item) => {
    const { user_type_id } = user;
    if (user_type_id === 1) return true;
    if (user_type_id === 2) return item.title !== "User Management";
    if (user_type_id === 3) return item.title !== "User Management" && item.title !== "Settings";
    if (user_type_id === 4) return item.title === "Main Dashboard" || item.title === "PoP Dashboard";
    return false;
  });

  const renderSubmenu = (items, parentKey = "", level = 1) => (
    <ul className="submenu" style={{ marginLeft: `${level * 8}px` }}>
      {items.map((item, index) => {
        const uniqueKey = `${parentKey}-${item.title}`;
        return (
          <li key={uniqueKey}>
            {item.submenu ? (
              <>
                <div
                  className="menu-item cursor-pointer"
                  onClick={() =>
                    setOpenInnerSubmenu(openInnerSubmenu === uniqueKey ? null : uniqueKey)
                  }
                >
                  {item.title}
                  <span className="arrow">
                    {openInnerSubmenu === uniqueKey ? "▼" : "▶"}
                  </span>
                </div>
                {openInnerSubmenu === uniqueKey && renderSubmenu(item.submenu, uniqueKey)}
              </>
            ) : (
              <Link
                to={item.path}
                onClick={() => {
                  setOpenSubmenu(null);
                  setOpenInnerSubmenu(null);
                }}
              >
                {item.title}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""} ${isMobile ? "mobile" : ""}`}
      ref={sidebarRef}
    >
      <nav>
        {!isMobile && (
          <div className="mt-1 mb-5">
            <img src={logo} alt="Logo" width="60%" height="auto" />
          </div>
        )}

        {!isMobile ? (
          collapsed ? (
            <div className="sidebar-icons">
              <ul>
                {filteredSidebarMenu.map((item, index) => (
                  <li key={index}>
                    {item.submenu ? (
                      <div
                        className="submenu-parent"
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          className="icon-button"
                          onClick={() => {
                            setOpenSubmenu(openSubmenu === item.title ? null : item.title);
                            setOpenInnerSubmenu(null);
                          }}
                        >
                          {item.icon}
                        </button>
                        {(hoveredSubmenu === index || openSubmenu === item.title) && (
                          <ul
                            className="submenu-collapsed"
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {renderSubmenu(item.submenu, item.title)}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <button
                        className="icon-button"
                        onClick={() => {
                          navigate(item.path);
                          setOpenSubmenu(null);
                          setOpenInnerSubmenu(null);
                        }}
                      >
                        {item.icon}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul>
              {filteredSidebarMenu.map((item, index) => (
                <li key={index}>
                  {item.submenu ? (
                    <>
                      <div
                        className="menu-item"
                        onClick={() => {
                          setOpenSubmenu(openSubmenu === item.title ? null : item.title);
                          setOpenInnerSubmenu(null);
                        }}
                      >
                        {item.title}
                        <span className="arrow">
                          {openSubmenu === item.title ? "▼" : "▶"}
                        </span>
                      </div>
                      {openSubmenu === item.title && renderSubmenu(item.submenu, item.title)}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => {
                        setOpenSubmenu(null);
                        setOpenInnerSubmenu(null);
                      }}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )
        ) : null}

        {/* ✅ MOBILE VIEW ONLY */}
       {isMobile && (
  <>
    {/* DCIM logo */}
    <div className="mobile-logo">
      <img src={logo} alt="DCIM" className="mobile-logo-img" />
    </div>

    {/* Recursive Mobile Submenu Popup */}
    {activeTab && activeTab.submenu && (
      <div className="mobile-submenu-popup">
        {activeTab.submenu.map((item, idx) => (
          <div key={idx} className="popup-item-wrapper">
            {item.submenu ? (
              <>
                <button
                  className="popup-item"
                  onClick={() =>
                    setOpenInnerSubmenu(openInnerSubmenu === item.title ? null : item.title)
                  }
                >
                  {item.title} {openInnerSubmenu === item.title ? "▲" : "▼"}
                </button>
                {openInnerSubmenu === item.title && (
                  <div className="popup-submenu">
                    {item.submenu.map((sub, subIdx) => (
                      <button
                        key={subIdx}
                        className="popup-subitem"
                        onClick={() => {
                          if (sub.path) {
                            navigate(sub.path);
                            setActiveTab(null);
                            setOpenInnerSubmenu(null);
                          }
                        }}
                      >
                        {sub.title}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
                className="popup-item"
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                    setActiveTab(null);
                  }
                }}
              >
                {item.title}
              </button>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Bottom Tab Bar */}
    <div className="mobile-tabbar">
      {filteredSidebarMenu.map((item, index) => (
        <button
          key={index}
          className="tabbar-icon"
          onClick={() => {
            if (item.submenu) {
              setActiveTab(activeTab?.title === item.title ? null : item);
              setOpenInnerSubmenu(null); // reset any open inner
            } else if (item.path) {
              navigate(item.path);
              setActiveTab(null);
              setOpenInnerSubmenu(null);
            }
          }}
        >
          {item.icon}
        </button>
      ))}
    </div>
  </>
)}

      </nav>
    </aside>
  );
};

export default Sidebar;
