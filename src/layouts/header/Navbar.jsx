import React, { useEffect, useRef, useState } from 'react';
import styles from './navbar.module.css';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
// import logo from '../../assets/ys_logo_green.png';
import {
    FaUserCircle,
    FaBars,
  
} from "react-icons/fa";
import { Drawer } from 'antd';
import { Modal, Input, Button } from "antd";
import { CiLogout } from "react-icons/ci";
import { HiTemplate } from "react-icons/hi";

import { HiOutlineLogout } from "react-icons/hi";

const Navbar = () => {
    const [isLogOpen, setLogIsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const logoutRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();
    const toggleSidebar = () => setIsOpen(!isOpen);
    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userid")
        setLogoutModalOpen(true)
        setOpen(false);
    };
    useEffect(() => {
        function handleClickOutside(e) {
            if (logoutRef.current && !logoutRef.current.contains(e.target)) {
                setLogIsOpen(false);
            }
        }

        if (isLogOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isLogOpen]);
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    useEffect(() => {
        return () => {
            sessionStorage.removeItem("adminTab");
        };
    }, []);
    const menuItems = [
        {
            icon: <HiTemplate />
            , label: "Template", path: "template"
        },
        // { icon: <FaUser />, label: "Master", path: "master" },
        // { icon: <FaBox />, label: "Products", path: "product" },
        // { icon: <FaDatabase />, label: "Stock management", path: "stock" },
        // { icon: <FaGift />, label: "Coupon", path: "coupon" },
        // { icon: <FaUsers />, label: "Customers", path: "customers" },
        // { icon: <FaFileAlt />, label: "Order Details", path: "order" },
        // { icon: <FaCog />, label: "Settings", path: "settings" },
        // { icon: <FaSignOutAlt />, label: "Logout", },

    ];

    return (
        <>
            <div className={styles.navbar}>
                <div className={styles.navbarcontainer}>
                    <div>
                        <div className={styles.logo}>
                            <Link to='/'>
                                {/* <img src={logo} alt="logo" /> */}
                            </Link>
                        </div>
                    </div>
                    <div className={styles.user} ref={logoutRef}>
                        <FaUserCircle
                            style={{ fontSize: '19px', cursor: 'pointer' }}
                            title='Admin'
                            onClick={() => { setLogIsOpen(!isLogOpen) }}
                        />
                        {/* <HiOutlineLogout style={{ fontSize: '19px',fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => { setLogoutModalOpen(true) }} /> */}


                        {isLogOpen && (
                            <div className={styles.logoutdiv}>
                                <p
                                    onClick={() => { setLogoutModalOpen(true); setLogIsOpen(false) }}
                                    className={styles.logout}
                                >Logout</p>
                            </div>
                        )}
                    </div>
                    <div className={styles.menusm}>
                        <FaBars className={styles.menu_icon} onClick={showDrawer} />

                    </div>
                </div>
            </div>

            <div className={styles.layoutcontainer}>
                <div className={styles.navbarlayout}>
                    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}>
                        <ul className={styles.menu}>
                            <li className={styles.menu_item} onClick={toggleSidebar}>
                                <div className={styles.top_section}>
                                    <FaBars className={styles.menu_icon} />
                                </div>
                            </li>
                            {menuItems.map((item, index) => (
                                <NavLink
                                    key={index}
                                    to={item.path}
                                    end={item.path === ""}
                                    className={({ isActive }) =>
                                        isActive
                                            ? `${styles.menu_link} ${styles.active}`
                                            : styles.menu_link
                                    }
                                >
                                    <li className={styles.menu_item}>
                                        <span className={styles.icon}>{item.icon}</span>
                                        {isOpen && <span className={styles.label}>{item.label}</span>}
                                    </li>
                                </NavLink>
                            ))}


                        </ul>
                    </div>
                </div>
                <div className={`${isOpen ? styles.content : styles.collapsedContent}`}>
                    <Outlet />
                </div>
            </div>

            {/* <Modal
                open={logoutModalOpen}
                footer={null}
                centered
                onCancel={() => setLogoutModalOpen(false)}
            >
                <p style={{ textAlign: 'center', marginBottom: '0px', fontSize: '16px' }}>Are you sure you want to logout?</p>

                <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "30px 0" }}>
                    <button
                        style={{
                            border: "1px solid #ccc",
                            background: "white",
                            color: "#333",
                            padding: "6px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                        onClick={() => setLogoutModalOpen(false)}
                    >
                        Cancel
                    </button>

                    <button
                        className="button"
                        onClick={() => {
                            sessionStorage.removeItem("isLoggedIn");
                            localStorage.removeItem("userid");
                            navigate("/");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </Modal> */}

            <div>

                <Drawer

                    closable={{ 'aria-label': 'Close Button' }}
                    onClose={onClose}
                    open={open}
                >
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            end={item.path === ""}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.menu_link} ${styles.active}`
                                    : styles.menu_link
                            }
                        >
                            <li className={styles.menu_item}>
                                <span className={styles.icon}>{item.icon}</span>
                                {isOpen && <span className={styles.label}>{item.label}</span>}
                            </li>
                        </NavLink>
                    ))}
                </Drawer>
            </div>
        </>
    );
};

export default Navbar;
