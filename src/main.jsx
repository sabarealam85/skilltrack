
import React, { useEffect, useMemo, useState } from "react";
import { createRoot,  } from "react-dom/client";
import { createPortal } from "react-dom";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BriefcaseBusiness,
  Target,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Sparkles,
  UserCheck,
  Building2,
  BrainCircuit,
  Send,
  Filter,
  Download
} from "lucide-react";

import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from "firebase/auth";

import { auth } from "./firebase";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
    Legend
} from "recharts";

import "./styles.css";

const API_URL = "http://localhost:5000";

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("skilltrack_token");

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
};
function AdminManagement({ currentUser }) {
    const isAdmin = currentUser?.role === "admin";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const [deleteUser, setDeleteUser] = useState(null);

    const loadUsers = async () => {
        try {
            setLoading(true);

            const response = await authFetch(
                `${API_URL}/api/admin/users`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to load users"
                );
            }

            setUsers(data);

        } catch (error) {
            console.error("Admin Management Error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="admin-access-denied">
                <div className="admin-access-icon">🔒</div>

                <h2>Admin Access Required</h2>

                <p>
                    You do not have permission to access
                    Admin Management.
                </p>
            </div>
        );
    }

    const filteredUsers = users.filter((user) => {
        const text = `
            ${user.name || ""}
            ${user.email || ""}
            ${user.role || ""}
            ${user.user_id || ""}
            ${user.trainee_id || ""}
            ${user.admin_id || ""}
        `.toLowerCase();

        return text.includes(search.toLowerCase());
    });

    const handleRoleChange = async (user) => {
        const newRole =
            user.role === "admin"
                ? "user"
                : "admin";

        const confirmed = window.confirm(
            `Change ${user.name}'s role to ${newRole === "admin" ? "Admin" : "Normal User"}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(user.user_id);

            const response = await authFetch(
                `${API_URL}/api/admin/users/${user.user_id}/role`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        role: newRole
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to update user role"
                );
            }

            setUsers((prev) =>
                prev.map((item) =>
                    item.user_id === user.user_id
                        ? data.user
                        : item
                )
            );

        } catch (error) {
            console.error(
                "Role update error:",
                error
            );

            alert(error.message);

        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteUser) {
            return;
        }

        try {
            setUpdatingId(deleteUser.user_id);

            const response = await authFetch(
                `${API_URL}/api/admin/users/${deleteUser.user_id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to delete user"
                );
            }

            setUsers((prev) =>
                prev.filter(
                    (item) =>
                        item.user_id !==
                        deleteUser.user_id
                )
            );

            setDeleteUser(null);

        } catch (error) {
            console.error(
                "Delete user error:",
                error
            );

            alert(error.message);

        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="admin-management">

            {/* HEADER */}
            <div className="admin-management-header">

                <div>
                    <div className="admin-title-row">
                        <div className="admin-page-icon">
                            👥
                        </div>

                        <div>
                            <h1>Admin Management</h1>

                            <p>
                                Manage SkillTrack user
                                accounts and access roles.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={loadUsers}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* SUMMARY CARDS */}
            <div className="admin-summary-grid">

                <div className="admin-summary-card">
                    <div className="admin-summary-icon">
                        👥
                    </div>

                    <div>
                        <span>Total Users</span>
                        <strong>{users.length}</strong>
                    </div>
                </div>


                <div className="admin-summary-card">
                    <div className="admin-summary-icon">
                        🛡️
                    </div>

                    <div>
                        <span>Administrators</span>
                        <strong>
                            {
                                users.filter(
                                    (u) =>
                                        u.role ===
                                        "admin"
                                ).length
                            }
                        </strong>
                    </div>
                </div>


                <div className="admin-summary-card">
                    <div className="admin-summary-icon">
                        👤
                    </div>

                    <div>
                        <span>Normal Users</span>
                        <strong>
                            {
                                users.filter(
                                    (u) =>
                                        u.role ===
                                        "user"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

            </div>


            {/* USER TABLE CARD */}
            <div className="admin-users-card">

                <div className="admin-users-toolbar">

                    <div>
                        <h2>User Accounts</h2>

                        <p>
                            {filteredUsers.length} account
                            {filteredUsers.length !== 1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>
                    </div>


                    <div className="admin-search-box">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                ×
                            </button>
                        )}

                    </div>

                </div>


                {loading ? (

                    <div className="admin-loading">
                        <div className="admin-spinner"></div>
                        <p>Loading users...</p>
                    </div>

                ) : filteredUsers.length === 0 ? (

                    <div className="admin-empty">
                        <div>🔎</div>

                        <h3>
                            No users found
                        </h3>

                        <p>
                            Try a different search
                            term.
                        </p>
                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-users-table">

                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Login ID</th>
                                    <th>Role</th>
                                    <th>Profile</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredUsers.map(
                                    (user) => (

                                        <tr
                                            key={
                                                user.user_id
                                            }
                                        >

                                            <td>
                                                <div className="admin-user-cell">

                                                    <div className="admin-avatar">
                                                        {(
                                                            user.name ||
                                                            "U"
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                user.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                user.email
                                                            }
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>


                                            <td>

                                                <span className="admin-login-id">
                                                    {user.role ===
                                                    "admin"
                                                        ? (
                                                              user.admin_id ||
                                                              "—"
                                                          )
                                                        : (
                                                              user.trainee_id ||
                                                              "—"
                                                          )}
                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        user.role ===
                                                        "admin"
                                                            ? "admin-role-badge admin-role"
                                                            : "admin-role-badge user-role"
                                                    }
                                                >
                                                    {user.role ===
                                                    "admin"
                                                        ? "Admin"
                                                        : "Normal User"}
                                                </span>

                                            </td>


                                            <td>

                                                {user.trainee_id ? (
                                                    <span className="admin-profile-linked">
                                                        Linked
                                                    </span>
                                                ) : (
                                                    <span className="admin-profile-none">
                                                        Not linked
                                                    </span>
                                                )}

                                            </td>


                                            <td>

                                                <div className="admin-action-buttons">

                                                    <button
                                                        className="admin-role-btn"
                                                        disabled={
                                                            updatingId ===
                                                            user.user_id
                                                        }
                                                        onClick={() =>
                                                            handleRoleChange(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        {updatingId ===
                                                        user.user_id
                                                            ? "Updating..."
                                                            : user.role ===
                                                              "admin"
                                                            ? "Make User"
                                                            : "Make Admin"}
                                                    </button>


                                                    <button
                                                        className="admin-delete-btn"
                                                        disabled={
                                                            updatingId ===
                                                            user.user_id
                                                        }
                                                        onClick={() =>
                                                            setDeleteUser(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* DELETE CONFIRMATION MODAL */}
            {deleteUser && (

                <div
                    className="admin-modal-overlay"
                    onClick={() =>
                        setDeleteUser(null)
                    }
                >

                    <div
                        className="admin-confirm-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="admin-warning-icon">
                            ⚠️
                        </div>

                        <h2>
                            Delete User?
                        </h2>

                        <p>
                            Are you sure you want to
                            delete{" "}
                            <strong>
                                {deleteUser.name}
                            </strong>
                            's account?
                        </p>

                        <p className="admin-delete-warning">
                            This action cannot be
                            undone.
                        </p>


                        <div className="admin-modal-actions">

                            <button
                                className="admin-cancel-btn"
                                onClick={() =>
                                    setDeleteUser(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="admin-confirm-delete-btn"
                                onClick={
                                    handleDeleteUser
                                }
                                disabled={
                                    updatingId ===
                                    deleteUser.user_id
                                }
                            >
                                {updatingId ===
                                deleteUser.user_id
                                    ? "Deleting..."
                                    : "Yes, Delete"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [page, setPage] = useState("Dashboard");
  const [settingsTab, setSettingsTab] = useState("Profile");

  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");

  const [trainees, setTrainees] = useState([]);
  const [training, setTraining] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [followups, setFollowups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminContact, setAdminContact] = useState(null);
  const [googleProfile, setGoogleProfile] = useState(null);

  /* =========================
     AUTH CHECK
  ========================= */

  useEffect(() => {
    const token = localStorage.getItem("skilltrack_token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Invalid saved user:", err);

        localStorage.removeItem("skilltrack_token");
        localStorage.removeItem("user");
        localStorage.removeItem("skilltrack_role");

        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }

    setLoading(false);
  }, []);
  useEffect(() => {
    const loadAdminContact = async () => {

        if (page !== "Help Centre") {
            return;
        }

        try {

            const response = await authFetch(
                `${API_URL}/api/admin/contact`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to load admin contact"
                );
            }

            setAdminContact(data);

        } catch (error) {

            console.error(
                "Admin Contact Error:",
                error
            );

            setAdminContact(null);
        }
    };

    loadAdminContact();

}, [page]);

  

  /* =========================
     FETCH TRAINEES
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchTrainees = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch(
          `${API_URL}/api/trainees`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch trainees");
        }

        const data = await response.json();

        setTrainees(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error("Trainees error:", err);

        setError(
          err.message ||
          "Unable to connect to backend"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrainees();
  }, [isLoggedIn]);

  /* =========================
     FETCH TRAINING
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchTraining = async () => {
      try {
        const response = await authFetch(
          `${API_URL}/api/training`
        );

        if (!response.ok) return;

        const data = await response.json();

        setTraining(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Training fetch error:",
          err
        );
      }
    };

    fetchTraining();
  }, [isLoggedIn]);

  /* =========================
     FETCH EMPLOYMENT
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchEmployment = async () => {
      try {
        const response = await authFetch(
          `${API_URL}/api/employment`
        );

        if (!response.ok) return;

        const data = await response.json();

        setEmployment(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Employment fetch error:",
          err
        );
      }
    };

    fetchEmployment();
  }, [isLoggedIn]);

  /* =========================
     FETCH EMPLOYERS
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchEmployers = async () => {
      try {
        const response = await authFetch(
          `${API_URL}/api/employers`
        );

        if (!response.ok) return;

        const data = await response.json();

        setEmployers(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Employers fetch error:",
          err
        );
      }
    };

    fetchEmployers();
  }, [isLoggedIn]);

  /* =========================
     FETCH SKILL GAPS
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchSkillGaps = async () => {
      try {
        const response = await authFetch(
          `${API_URL}/api/skill-gaps`
        );

        if (!response.ok) return;

        const data = await response.json();

        setSkillGaps(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Skill gaps fetch error:",
          err
        );
      }
    };

    fetchSkillGaps();
  }, [isLoggedIn]);

  /* =========================
     FETCH FOLLOWUPS
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchFollowups = async () => {
      try {
        const response = await authFetch(
          `${API_URL}/api/followups`
        );

        if (!response.ok) return;

        const data = await response.json();

        setFollowups(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Followups fetch error:",
          err
        );
      }
    };

    fetchFollowups();
  }, [isLoggedIn]);

  /* =========================
     FETCH NOTIFICATIONS
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchNotifications = async () => {
      try {
        const response = await authFetch(
          `${API_URL}/api/notifications`
        );

        if (!response.ok) return;

        const data = await response.json();

        setNotifications(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Notifications error:",
          err
        );
      }
    };
    

    fetchNotifications();
  }, [isLoggedIn]);

  /* =========================
     ADD / UPDATE TRAINEE
  ========================= */

  const handleTraineeAdded = (savedTrainee) => {
    if (!savedTrainee) return;

    const savedId =
      savedTrainee.trainee_id ||
      savedTrainee.id;

    setTrainees((previous) => {
      const exists = previous.some(
        (item) =>
          String(
            item.trainee_id ||
            item.id ||
            ""
          ) === String(savedId || "")
      );

      if (exists) {
        return previous.map((item) => {
          const itemId =
            item.trainee_id ||
            item.id;

          return String(itemId) ===
            String(savedId)
            ? {
                ...item,
                ...savedTrainee
              }
            : item;
        });
      }

      return [
        savedTrainee,
        ...previous
      ];
    });
  };

  /* =========================
     DELETE TRAINEE
  ========================= */

  const handleDeleteTrainee = async (trainee) => {
    if (currentUser?.role !== "admin") {
      alert(
        "Only Admin can delete trainees."
      );
      return;
    }

    const traineeId =
      trainee?.trainee_id ||
      trainee?.id;

    if (!traineeId) {
      alert(
        "Trainee ID not found."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${trainee?.name || "this trainee"}?`
    );

    if (!confirmed) return;

    try {
      const response = await authFetch(
        `${API_URL}/api/trainees/${encodeURIComponent(
          traineeId
        )}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Failed to delete trainee"
        );
      }

      setTrainees((previous) =>
        previous.filter((item) => {
          const itemId =
            item?.trainee_id ||
            item?.id;

          return String(itemId) !==
            String(traineeId);
        })
      );

      alert(
        "Trainee deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete trainee error:",
        err
      );

      alert(
        err?.message ||
        "Failed to delete trainee."
      );
    }
  };

  /* =========================
     NAVIGATION
  ========================= */

  const nav = [
    ["Dashboard", LayoutDashboard],
    ["Trainees", Users],
    ["Training", GraduationCap],
    [
      "Employment Outcomes",
      BriefcaseBusiness
    ],
    ["Skill Gaps", Target],
    ["Follow-up Center", Bell],
    ["Programme Impact", BarChart3],
    ["Policy Simulator", BrainCircuit],

    ...(currentUser?.role === "admin"
      ? [
          [
            "Admin Management",
            ShieldCheck
          ]
        ]
      : [])
  ];

  /* =========================
     LOGOUT
  ========================= */
const handleLogout = async () => {
  try {
    await authFetch(`${API_URL}/api/auth/logout`, {
      method: "POST"
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("skilltrack_token");
    localStorage.removeItem("user");
    localStorage.removeItem("skilltrack_role");

    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowUserMenu(false);
    setShowNotifications(false);
    setShowLogin(false);
    setShowSignup(false);
    setPage("Dashboard");
  }
};

  /* =========================
     LOGIN SUCCESS
  ========================= */

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "skilltrack_role",
      user?.role || "user"
    );

    setShowLogin(false);
    setShowSignup(false);
    setPage("Dashboard");
  };

  /* =========================
     SIGNUP SUCCESS
  ========================= */

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  /* =========================
     NOT LOGGED IN
  ========================= */

  if (!isLoggedIn) {
    return (
      <>
        {!showLogin &&
          !showSignup && (
            <LandingPage
              onLogin={() =>
                setShowLogin(true)
              }
              onSignup={() =>
                setShowSignup(true)
              }
            />
          )}
{showLogin && (
  <LoginPage
    onLogin={handleLoginSuccess}
    onBack={() =>
      setShowLogin(false)
    }
    onSignup={() => {
      setShowLogin(false);
      setShowSignup(true);
    }}
    onGoogleProfileRequired={(profile) => {
      setGoogleProfile(profile);
      setShowLogin(false);
      setShowSignup(true);
    }}
  />
)}
{showSignup && (
  <SignupPage
    googleProfile={googleProfile}
    onSignup={handleSignupSuccess}
    onBack={() => {
      setGoogleProfile(null);
      setShowSignup(false);
      setShowLogin(true);
    }}
  />
)}
      </>
    );
  }

  /* =========================
     MAIN APP
  ========================= */

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          mobile ? "open" : ""
        }`}
      >

        <div className="brand">

          <div className="brand-mark">
            <GraduationCap size={25} />
          </div>

          <div>
            <strong>
              SkillTrack
            </strong>

            <span>
              Skills • Outcomes • Impact
            </span>
          </div>

        </div>

        <div className="workspace">
          MAIN MENU
        </div>

        <nav>

          {nav.map(
            ([label, Icon]) => (
              <button
                key={label}
                className={
                  page === label
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setPage(label);
                  setMobile(false);
                }}
              >
                <Icon size={18} />
                <span>
                  {label}
                </span>
              </button>
            )
          )}

        </nav>

       <div className="side-bottom">

  <button
    className={
      page === "Help Centre"
        ? "active"
        : ""
    }
    onClick={() => {
      setPage("Help Centre");
      setMobile(false);
    }}
  >
    <FileText size={18} />
    <span>
      Help Centre
    </span>
  </button>

  <button
    className={
      page === "Settings"
        ? "active"
        : ""
    }
    onClick={() => {
      setPage("Settings");
      setMobile(false);
    }}
  >
    <Settings size={18} />
    <span>
      Settings
    </span>
  </button>

  <button
    onClick={handleLogout}
  >
    <LogOut size={18} />
    <span>
      Sign out
    </span>
  </button>

</div>

      </aside>

      {/* MAIN */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <button
            className="menu-btn"
            onClick={() =>
              setMobile(!mobile)
            }
          >
            <Menu size={22} />
          </button>

          <div className="topbar-left">

            <div className="search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search trainees, skills, training..."
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          <div className="top-actions">

            {/* NOTIFICATIONS */}

            <div className="notification-wrapper">

              <button
                className="icon-btn"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
              >

                <Bell size={19} />

                {notifications.length >
                  0 && (
                  <i>
                    {
                      notifications.length
                    }
                  </i>
                )}

              </button>

              {showNotifications && (
                <div className="notification-panel">

                  <div className="notification-header">
                    <strong>
                      Notifications
                    </strong>
                  </div>

                  {notifications.length ===
                  0 ? (
                    <div className="empty-notification">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(
                      (
                        notification,
                        index
                      ) => (
                        <div
                          className="notification-item"
                          key={
                            notification.id ||
                            notification.notification_id ||
                            index
                          }
                        >

                          <Bell size={15} />

                          <div>

                            <strong>
                              {
                                notification.title ||
                                "Notification"
                              }
                            </strong>

                            <p>
                              {
                                notification.message ||
                                notification.description ||
                                ""
                              }
                            </p>

                          </div>

                        </div>
                      )
                    )
                  )}

                </div>
              )}

            </div>

            {/* USER */}

            <div
              style={{
                position:
                  "relative"
              }}
            >

              <button
                className="avatar"
                onClick={() =>
                  setShowUserMenu(
                    !showUserMenu
                  )
                }
                title={
                  currentUser?.name ||
                  "User"
                }
              >
                {(
                  currentUser?.name ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </button>

              {showUserMenu && (
                <div className="user-menu">

                  <div
                    style={{
                      padding:
                        "14px 16px",
                      borderBottom:
                        "1px solid #e5e7eb"
                    }}
                  >

                    <strong>
                      {
                        currentUser?.name ||
                        "User"
                      }
                    </strong>

                    <span
                      style={{
                        display:
                          "block",
                        fontSize:
                          "12px",
                        color:
                          "#64748b",
                        marginTop:
                          "4px"
                      }}
                    >
                      {
                        currentUser?.email ||
                        ""
                      }
                    </span>

                    {currentUser?.role ===
                      "admin" && (
                      <small
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px",
                          color:
                            "#2563eb"
                        }}
                      >
                        Admin ID:{" "}
                        {
                          currentUser?.admin_id ||
                          "N/A"
                        }
                      </small>
                    )}

                  </div>

                  <button
                    onClick={() => {
                      setPage(
                        "Settings"
                      );
                      setShowUserMenu(
                        false
                      );
                    }}
                  >
                    <Settings
                      size={16}
                    />
                    Settings
                  </button>

                  <button
                    onClick={
                      handleLogout
                    }
                  >
                    <LogOut
                      size={16}
                    />
                    Sign out
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <section className="content">

          {loading && (
            <div className="loading-state">

              <div className="spinner"></div>

              <p>
                Loading SkillTrack...
              </p>

            </div>
          )}

          {!loading &&
            error && (
              <div className="error-state">

                <AlertTriangle
                  size={22}
                />

                <div>

                  <strong>
                    Unable to connect to
                    backend
                  </strong>

                  <p>
                    {error}
                  </p>

                </div>

              </div>
            )}
{/* DASHBOARD */}

{!loading &&
  !error &&
  page === "Dashboard" && (
    <Dashboard
      setPage={setPage}
      trainees={trainees}
      training={training}
      employment={employment}
      employers={employers}
      skillGaps={skillGaps}
      followups={followups}
      currentUser={currentUser}
      query={query}
    />
  )}

          {/* TRAINEES */}

          {!loading &&
            !error &&
            page === "Trainees" && (
              <Trainees
                query={query}
                trainees={trainees}
                training={training}
                employment={
                  employment
                }
                followups={
                  followups
                }
                skillGaps={
                  skillGaps
                }
                onTraineeAdded={
                  handleTraineeAdded
                }
                onDeleteTrainee={
                  handleDeleteTrainee
                }
                currentUser={
                  currentUser
                }
              />
            )}

          {/* TRAINING */}

          {!loading &&
            !error &&
            page === "Training" && (
              <Training
                training={training}
                setTraining={
                  setTraining
                }
                trainees={
                  trainees
                }
                currentUser={
                  currentUser
                }
              />
            )}

          {/* EMPLOYMENT */}

          {!loading &&
            !error &&
            page ===
              "Employment Outcomes" && (
              <Employment
                employment={
                  employment
                }
                setEmployment={
                  setEmployment
                }
                trainees={
                  trainees
                }
                currentUser={
                  currentUser
                }
                
              />
            )}

          {/* SKILL GAPS */}

          {!loading &&
            !error &&
            page === "Skill Gaps" && (
              <SkillGaps
                skillGaps={
                  skillGaps
                }
                setSkillGaps={
                  setSkillGaps
                }
                trainees={
                  trainees
                }
                currentUser={
                  currentUser
                }
              />
            )}

          {/* FOLLOW UPS */}

          {!loading &&
            !error &&
            page ===
              "Follow-up Center" && (
              <FollowUps
                followups={
                  followups
                }
                setFollowups={
                  setFollowups
                }
                trainees={
                  trainees
                }
                currentUser={
                  currentUser
                }
              />
            )}

          {/* PROGRAMME IMPACT */}

          {!loading &&
            !error &&
            page ===
              "Programme Impact" && (
              <Impact
                trainees={
                  trainees
                }
                employment={
                  employment
                }
              />
            )}

          {/* POLICY */}

          {!loading &&
            !error &&
            page ===
              "Policy Simulator" && (
             <Policy
  trainees={trainees}
  training={training}
  employment={employment}
  skillGaps={skillGaps}
  followups={followups}
/>
            )}

          {/* ADMIN MANAGEMENT */}

          {!loading &&
            !error &&
            page ===
              "Admin Management" &&
            currentUser?.role ===
              "admin" && (
              <AdminManagement
                currentUser={
                  currentUser
                }
              />
            )}
            {/* HELP CENTRE */}

{/* HELP CENTRE */}

{!loading &&
  !error &&
  page === "Help Centre" && (
    <div className="settings-page">

      <div className="settings-header">
        <div>
          <h1>Help Centre</h1>

          <p>
            Get help and support for your SkillTrack account.
          </p>
        </div>
      </div>

      <div className="settings-content">

        {/* ADMIN SUPPORT */}

        <div className="settings-card">

          <h2>Need Help?</h2>

          <p className="settings-subtitle">
            Contact your SkillTrack administrator for
            account, trainee data, security, or technical
            support.
          </p>

          <div className="security-status">

            <FileText size={24} />

            <div>
              <strong>
                Admin Support
              </strong>

              <span>
                Your administrator can help you resolve
                account access, trainee records, system
                issues, and other SkillTrack related
                problems.
              </span>
            </div>

          </div>

          {adminContact ? (

            <div
              className="settings-info-grid"
              style={{ marginTop: "24px" }}
            >

              <div className="settings-field">

                <label>
                  Administrator
                </label>

                <div>
                  {adminContact.name}
                </div>

              </div>

              <div className="settings-field">

                <label>
                  Email
                </label>

                <div>
                  {adminContact.email}
                </div>

              </div>

              <div className="settings-field">

                <label>
                  Support
                </label>

                <div>
                  Contact Admin for assistance
                </div>

              </div>

            </div>

          ) : (

            <div
              className="security-status"
              style={{ marginTop: "24px" }}
            >

              <AlertTriangle size={22} />

              <div>

                <strong>
                  Admin contact unavailable
                </strong>

                <span>
                  Administrator contact information
                  could not be loaded right now.
                </span>

              </div>

            </div>

          )}

          {adminContact?.email && (

            <button
  className="help-contact-btn"
  onClick={() => {
    window.location.href =
      `mailto:${adminContact.email}?subject=SkillTrack Support Request`;
  }}
>
  <Mail size={18} />
  <span>Contact Admin</span>
  <ChevronRight size={18} />
</button>

          )}

        </div>


        {/* ACCOUNT HELP */}

        <div className="settings-card">

          <h2>Account & Login Help</h2>

          <p className="settings-subtitle">
            Help with accessing and managing your SkillTrack
            account.
          </p>

          <div className="settings-info-grid">

            <div className="settings-field">

              <label>
                Login Problem
              </label>

              <div>
                Check your registered email, trainee ID,
                or admin ID and password.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Forgot Password
              </label>

              <div>
                Use the Forgot Password option on the
                login screen to reset your password.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Account Access
              </label>

              <div>
                Contact the Administrator if your account
                is locked or access is unavailable.
              </div>

            </div>

          </div>

        </div>


        {/* TRAINEE DATA HELP */}

        <div className="settings-card">

          <h2>Trainee & Data Help</h2>

          <p className="settings-subtitle">
            Guidance for trainee records and programme data.
          </p>

          <div className="settings-info-grid">

            <div className="settings-field">

              <label>
                Trainee Information
              </label>

              <div>
                Contact Admin if trainee information is
                incorrect or missing.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Training Records
              </label>

              <div>
                Report incorrect training, assessment,
                or certification information to Admin.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Employment Data
              </label>

              <div>
                Contact Admin if employment outcome
                information needs correction.
              </div>

            </div>

          </div>

        </div>


        {/* SECURITY HELP */}

        <div className="settings-card">

          <h2>Security & Password Help</h2>

          <p className="settings-subtitle">
            Keep your SkillTrack account secure.
          </p>

          <div className="settings-info-grid">

            <div className="settings-field">

              <label>
                Change Password
              </label>

              <div>
                You can change your password from
                Settings → Security.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Password Issue
              </label>

              <div>
                Contact Admin if you cannot access your
                account or reset your password.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Account Security
              </label>

              <div>
                Never share your password with another
                person.
              </div>

            </div>

          </div>

        </div>


        {/* TECHNICAL HELP */}

        <div className="settings-card">

          <h2>Technical & System Help</h2>

          <p className="settings-subtitle">
            For problems with SkillTrack functionality.
          </p>

          <div className="settings-info-grid">

            <div className="settings-field">

              <label>
                Page Not Loading
              </label>

              <div>
                Refresh the page. If the issue continues,
                contact your Administrator.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Data Not Appearing
              </label>

              <div>
                Report missing or unexpected data to
                the Administrator.
              </div>

            </div>

            <div className="settings-field">

              <label>
                System Error
              </label>

              <div>
                Note the page where the problem occurred
                and report it to Admin.
              </div>

            </div>

          </div>

        </div>


        {/* FAQ */}

        <div className="settings-card">

          <h2>Frequently Asked Questions</h2>

          <div className="settings-info-grid">

            <div className="settings-field">

              <label>
                Who can modify trainee data?
              </label>

              <div>
                Only authorized administrators can add,
                edit, or delete data.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Can normal users manage accounts?
              </label>

              <div>
                Normal users can view available data but
                cannot manage user roles or accounts.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Where can I change my password?
              </label>

              <div>
                Open Settings and select Security.
              </div>

            </div>

            <div className="settings-field">

              <label>
                Who should I contact for unresolved issues?
              </label>

              <div>
                Contact your SkillTrack Administrator
                using the Contact Admin button above.
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )}
          {/* SETTINGS */}

          {!loading &&
            !error &&
            page ===
              "Settings" && (

              <div className="settings-page">

                <div className="settings-header">

                  <div>

                    <h1>
                      Settings
                    </h1>

                    <p>
                      Manage your SkillTrack
                      account and
                      preferences.
                    </p>

                  </div>

                </div>

                <div className="settings-layout">

                  <div className="settings-menu">

                    {[
                      [
                        "Profile",
                        UserCheck
                      ],
                      [
                        "Security",
                        ShieldCheck
                      ],
                      [
                        "Notifications",
                        Bell
                      ],
                     
                    ].map(
                      ([label, Icon]) => (
                        <button
                          key={label}
                          className={
                            settingsTab ===
                            label
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setSettingsTab(
                              label
                            )
                          }
                        >
                          <Icon
                            size={18}
                          />
                          {label}
                        </button>
                      )
                    )}

                  </div>

                  <div className="settings-content">

                    {/* PROFILE */}

                    {settingsTab ===
                      "Profile" && (
                      <div className="settings-card">

                        <h2>
                          Profile
                        </h2>

                        <p className="settings-subtitle">
                          Your SkillTrack
                          account
                          information.
                        </p>

                        <div className="profile-avatar">
                          {(
                            currentUser?.name ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="settings-info-grid">

                          <div className="settings-field">

                            <label>
                              Name
                            </label>

                            <div>
                              {
                                currentUser?.name ||
                                "Not available"
                              }
                            </div>

                          </div>

                          <div className="settings-field">

                            <label>
                              Email
                            </label>

                            <div>
                              {
                                currentUser?.email ||
                                "Not available"
                              }
                            </div>

                          </div>

                          <div className="settings-field">

                            <label>
                              Role
                            </label>

                            <div>
                              {
                                currentUser?.role ===
                                "admin"
                                  ? "Administrator"
                                  : "Normal User"
                              }
                            </div>

                          </div>

                          {currentUser?.role ===
                            "admin" && (
                            <div className="settings-field">

                              <label>
                                Admin ID
                              </label>

                              <div>
                                {
                                  currentUser?.admin_id ||
                                  "N/A"
                                }
                              </div>

                            </div>
                          )}

                        </div>

                      </div>
                    )}

                 {/* SECURITY */}

{settingsTab ===
  "Security" && (
  <div className="settings-card">

    <h2>
      Security
    </h2>

    <p className="settings-subtitle">
      Manage your SkillTrack account password.
    </p>

    <div className="security-status">

      <ShieldCheck
        size={24}
      />

      <div>

        <strong>
          Account Security
        </strong>

        <span>
          Change your password securely.
        </span>

      </div>

    </div>

    <div
      style={{
        marginTop: "24px",
        maxWidth: "500px"
      }}
    >

      <div
        className="settings-field"
        style={{ marginBottom: "16px" }}
      >

        <label>
          Current Password
        </label>

        <input
          type="password"
          id="current-password"
          placeholder="Enter current password"
        />

      </div>

      <div
        className="settings-field"
        style={{ marginBottom: "16px" }}
      >

        <label>
          New Password
        </label>

        <input
          type="password"
          id="new-password"
          placeholder="Enter new password"
        />

      </div>

      <div
        className="settings-field"
        style={{ marginBottom: "20px" }}
      >

        <label>
          Confirm New Password
        </label>

        <input
          type="password"
          id="confirm-password"
          placeholder="Confirm new password"
        />

      </div>

      <button
        className="primary"
        onClick={async () => {

          const oldPassword =
            document.getElementById(
              "current-password"
            ).value;

          const newPassword =
            document.getElementById(
              "new-password"
            ).value;

          const confirmPassword =
            document.getElementById(
              "confirm-password"
            ).value;

          if (
            !oldPassword ||
            !newPassword ||
            !confirmPassword
          ) {
            alert(
              "Please fill all password fields."
            );
            return;
          }

          if (
            newPassword !==
            confirmPassword
          ) {
            alert(
              "New password and confirm password do not match."
            );
            return;
          }

          if (newPassword.length < 6) {
            alert(
              "New password must be at least 6 characters."
            );
            return;
          }

          if (
            oldPassword ===
            newPassword
          ) {
            alert(
              "New password must be different from current password."
            );
            return;
          }

          try {

            const response =
              await authFetch(
                `${API_URL}/api/auth/change-password`,
                {
                  method: "PUT",

                  headers: {
                    "Content-Type":
                      "application/json"
                  },

                  body: JSON.stringify({
                    oldPassword,
                    newPassword
                  })
                }
              );

            const data =
              await response.json();

            if (!response.ok) {
              throw new Error(
                data?.error ||
                data?.message ||
                "Failed to change password"
              );
            }

            document.getElementById(
              "current-password"
            ).value = "";

            document.getElementById(
              "new-password"
            ).value = "";

            document.getElementById(
              "confirm-password"
            ).value = "";

            alert(
              "Password changed successfully."
            );

          } catch (error) {

            console.error(
              "Password change error:",
              error
            );

            alert(
              error?.message ||
              "Failed to change password."
            );
          }

        }}
      >
        Change Password
      </button>

    </div>

  </div>
)}

                    {/* NOTIFICATIONS */}

                    {settingsTab ===
                      "Notifications" && (
                      <div className="settings-card">

                        <h2>
                          Notifications
                        </h2>

                        <p className="settings-subtitle">
                          View your latest
                          SkillTrack
                          notifications
                          from the
                          notification bell
                          in the top bar.
                        </p>

                        <div className="security-status">

                          <Bell size={24} />

                          <div>

                            <strong>
                              Notifications
                            </strong>

                            <span>
                              {
                                notifications.length
                              }{" "}
                              notification
                              {notifications.length ===
                              1
                                ? ""
                                : "s"}{" "}
                              available.
                            </span>

                          </div>

                        </div>

                      </div>
                    )}

                  

                  </div>

                </div>

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

function Dashboard({
  setPage,
  trainees,
  employment,
  skillGaps,
  followups,
  employers
}) {
  const employedCount = employment.filter(
    item => item.employer && item.employment_type
  ).length;

  const employmentRate = trainees.length
    ? ((employedCount / trainees.length) * 100).toFixed(1)
    : 0;

  const salaries = employment
    .filter(item => item.current_salary != null)
    .map(item => Number(item.current_salary));

  const avgMonthlyWage = salaries.length
    ? Math.round(
        salaries.reduce((sum, salary) => sum + salary, 0) /
          salaries.length
      )
    : 0;

  const skillGapsDetected = skillGaps.length;

  const monthly = Object.entries(
    employment.reduce((acc, item) => {
      if (!item.joining_date) return acc;

      const date = new Date(item.joining_date);

      const month = date.toLocaleString("en-IN", {
        month: "short"
      });

      const year = date.getFullYear();

      const key = `${year}-${date.getMonth()}`;

      if (!acc[key]) {
        acc[key] = {
          m: `${month} ${year}`,
          employed: 0,
          placed: 0
        };
      }

      acc[key].employed++;

      if (item.employment_type === "Full-time") {
        acc[key].placed++;
      }

      return acc;
    }, {})
  )
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([_, value]) => value);

  const highSkillGaps = skillGaps.filter(
    gap => Number(gap.gap_score) >= 70
  ).length;

  const followupDue = followups
    ? followups.filter(f => f.status !== "Completed").length
    : 0;

  const totalEmployers = employers.length;

  const verifiedEmployers = employers.filter(
    e => e.verification_status === "Verified"
  ).length;

  const verifiedEmployerRate = totalEmployers
    ? Math.round(
        (verifiedEmployers / totalEmployers) * 100
      )
    : 0;

  return (
    <div className="content dashboard-page">

      {/* HERO */}
      <section className="dashboard-hero">

        <div className="hero-decoration hero-decoration-one" />
        <div className="hero-decoration hero-decoration-two" />

        <div className="hero-content">
          <p className="eyebrow">GOOD MORNING, ADMIN</p>

          <h2>
            Track what happens
            <span> after training.</span>
          </h2>

          <p className="hero-description">
            Monitor placement, retention, wage growth and
            skill gaps across the trainee lifecycle.
          </p>

          <div className="hero-status">
            <span className="status-dot" />
            <span>System actively monitoring outcomes</span>
          </div>
        </div>

        <div className="welcome-actions">

          <button
            className="dashboard-primary-button"
            onClick={() => setPage("Trainees")}
          >
            <span className="button-icon">
              <Users size={17} />
            </span>

            View trainees

            <ChevronRight size={17} />
          </button>

          <button
            className="dashboard-secondary-button"
            onClick={() => setPage("Programme Impact")}
          >
            <TrendingUp size={16} />
            Programme impact
          </button>

        </div>
      </section>


      {/* STAT CARDS */}
      <section className="dashboard-stats">

        <div className="dashboard-stat-card">
          <div className="stat-icon-box blue-icon">
            <Users size={21} />
          </div>

          <div className="stat-content">
            <span>Active Trainees</span>
            <strong>{trainees.length}</strong>
            <small>↗ Active learner records</small>
          </div>

          <div className="stat-glow" />
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-icon-box green-icon">
            <UserCheck size={21} />
          </div>

          <div className="stat-content">
            <span>Employment Rate</span>
            <strong>{employmentRate}%</strong>
            <small>↗ Current placement signal</small>
          </div>

          <div className="stat-glow" />
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-icon-box purple-icon">
            <TrendingUp size={21} />
          </div>

          <div className="stat-content">
            <span>Avg. Monthly Wage</span>
            <strong>
              ₹{avgMonthlyWage.toLocaleString("en-IN")}
            </strong>
            <small>↗ Average reported wage</small>
          </div>

          <div className="stat-glow" />
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-icon-box orange-icon">
            <Target size={21} />
          </div>

          <div className="stat-content">
            <span>Skill Gaps Detected</span>
            <strong>{skillGapsDetected}</strong>
            <small>⚠ Requires attention</small>
          </div>

          <div className="stat-glow" />
        </div>

      </section>


      {/* CHART + HEALTH */}
      <section className="grid two dashboard-main-grid">

        <Card
          title="Outcome trend"
          subtitle="Placement and employment signals · last 6 months"
        >

          <div className="dashboard-section-label">
            <span className="mini-chart-icon">⌁</span>
            Outcome performance
          </div>

          <div className="chart dashboard-chart">
            <ResponsiveContainer
              width="100%"
              height={255}
            >
              <AreaChart data={monthly}>

                <defs>
                  <linearGradient
                    id="dashboardGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopOpacity=".28"
                    />

                    <stop
                      offset="100%"
                      stopOpacity=".01"
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="m" />

                <YAxis domain={[40, 100]} />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="employed"
                  stroke="#1769aa"
                  fill="url(#dashboardGradient)"
                  strokeWidth={3}
                />

                <Area
                  type="monotone"
                  dataKey="placed"
                  stroke="#21a179"
                  fill="none"
                  strokeWidth={2}
                />

              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-legend">
            <span>
              <i className="legend-dot employed-dot" />
              Employed
            </span>

            <span>
              <i className="legend-dot placed-dot" />
              Placed
            </span>
          </div>

        </Card>


        <Card
          title="Programme health"
          subtitle="Current cohort overview"
        >

          <div className="health dashboard-health">

            <div className="dashboard-donut">

              <ResponsiveContainer
                width="100%"
                height={190}
              >
                <PieChart>

                  <Pie
                    data={[
                      { v: Number(employmentRate) },
                      {
                        v:
                          100 -
                          Number(employmentRate)
                      }
                    ]}
                    dataKey="v"
                    innerRadius={55}
                    outerRadius={72}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                  >
                    <Cell fill="#1769aa" />
                    <Cell fill="#e8eef5" />
                  </Pie>

                </PieChart>
              </ResponsiveContainer>

              <div className="donut-center">
                <strong>{employmentRate}%</strong>
                <small>employment</small>
              </div>

            </div>


            <div className="health-list dashboard-health-list">

              <Row
                label="Placed"
                value={`${employmentRate}%`}
                icon={CheckCircle2}
              />

              <Row
                label="Follow-up due"
                value={`${followupDue}`}
                icon={Clock3}
              />

              <Row
                label="High skill gap"
                value={`${highSkillGaps}`}
                icon={AlertTriangle}
              />

              <Row
                label="Verified employers"
                value={`${verifiedEmployerRate}%`}
                icon={ShieldCheck}
              />

            </div>

          </div>

        </Card>

      </section>


      {/* RECENT + FOLLOW UPS */}
      <section className="grid two dashboard-main-grid">

        <Card
          title="Recent trainees"
          subtitle="Latest lifecycle activity"
          action={
            <button
              className="dashboard-view-button"
              onClick={() => setPage("Trainees")}
            >
              View all
              <ChevronRight size={15} />
            </button>
          }
        >

          <div className="recent-trainees-wrapper">
            <Table rows={trainees.slice(0, 4)} />
          </div>

        </Card>


        <Card
          title="Priority follow-ups"
          subtitle="Trainees needing an outcome update"
        >

          <div className="follow-list dashboard-follow-list">

            {followups
              .filter(f => f.status !== "Completed")
              .map(f => {

               const trainee = trainees.find(
  t => t.trainee_id === f.trainee_id
);

                return (
                  <div
                    className="follow dashboard-follow"
                    key={f.followup_id}
                  >

                    <div className="follow-indicator" />

                    <div className="avatar small dashboard-avatar">
                      {trainee
                        ? trainee.name
                            .split(" ")
                            .map(x => x[0])
                            .join("")
                        : f.trainee_id}
                    </div>

                    <div className="follow-info">

                      <b>
                        {trainee
                          ? trainee.name
                          : f.trainee_id}
                      </b>

                      <span>
                        {f.trainee_id} · {f.type}
                      </span>

                      <span className="follow-response">
                        {f.response}
                      </span>

                    </div>

                    <button className="dashboard-contact-button">
                      Contact
                    </button>

                  </div>
                );
              })}

          </div>

        </Card>

      </section>

    </div>
  );
}

function Stat({title,value,change,icon:Icon,down}){
 return <div className="stat card"><div className="stat-icon">{Icon &&<Icon size={19}/>}</div><div><span>{title}</span><strong>{value}</strong><small className={down?"down":""}>{down?<TrendingDown size={13}/>:<TrendingUp size={13}/>} {change} vs last month</small></div></div>
}

function Card({title,subtitle,action,children}){return <section className="card panel"><div className="panel-head"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>{children}</section>}
function Row({label,value,icon:Icon}){return <div className="row"><span><Icon size={15}/>{label}</span><b>{value}</b></div>}
function Table({
  rows,
  onEdit,
  onDelete,
  onSelect,
  employment = []
}) {
  const getTraineeId = (trainee) => {
    return (
      trainee?.trainee_id ||
      trainee?.id ||
      ""
    );
  };

  const getLocation = (trainee) => {
    return (
      trainee?.district ||
      trainee?.city ||
      trainee?.location ||
      trainee?.address ||
      "—"
    );
  };

  const getProgrammeStatus = (trainee) => {
    const traineeId = String(getTraineeId(trainee)).trim();

    if (!traineeId) {
      return "Outcome Pending";
    }

    const traineeEmployment = employment
      .filter((item) => {
        const employmentTraineeId = String(
          item?.trainee_id ||
          item?.traineeId ||
          item?.trainee ||
          ""
        ).trim();

        return (
          employmentTraineeId &&
          employmentTraineeId === traineeId
        );
      })
      .sort((a, b) => {
        const dateDiff =
          new Date(b?.joining_date || 0) -
          new Date(a?.joining_date || 0);

        if (dateDiff !== 0) {
          return dateDiff;
        }

        return (
          Number(b?.employment_id || 0) -
          Number(a?.employment_id || 0)
        );
      });

    if (traineeEmployment.length > 0) {
      return (
        traineeEmployment[0]?.outcome_status ||
        traineeEmployment[0]?.status ||
        "Outcome Pending"
      );
    }

    return "Outcome Pending";
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Trainee</th>
            <th>Programme</th>
            <th>Status</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((t) => {
            const traineeId = getTraineeId(t);
            const location = getLocation(t);
            const status = getProgrammeStatus(t);

            return (
              <tr
                key={traineeId || t.email || t.name}
                onClick={() =>
                  onSelect && onSelect(t)
                }
                style={{ cursor: "pointer" }}
              >

                {/* TRAINEE */}
                <td>
                  <div className="person">

                    <div className="avatar tiny">
                      {(t?.name || "T")
                        .split(" ")
                        .filter(Boolean)
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <span>
                      <b>{t?.name || "—"}</b>

                      <small>
                        {traineeId || "—"}
                      </small>
                    </span>

                  </div>
                </td>

                {/* PROGRAMME */}
                <td>
                  {t?.course || "—"}
                </td>

                {/* STATUS */}
                <td>
                  <Status s={status} />
                </td>

                {/* LOCATION */}
                <td>
                  {location}
                </td>

                {/* ACTIONS */}
               {/* ACTIONS */}
<td>
  <div
    className="trainee-actions"
    onClick={(e) => e.stopPropagation()}
  >

    {onEdit && (
      <button
        className="trainee-edit-button"
        onClick={() => onEdit(t)}
      >
        <span>✏</span>
        <span>Edit</span>
      </button>
    )}

    {onDelete && (
      <button
        className="trainee-delete-button"
        onClick={() => onDelete(t)}
      >
        <span>🗑</span>
        <span>Delete</span>
      </button>
    )}

  </div>
</td>

              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "30px"
                }}
              >
                No trainees found.
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );
}
function Status({s}) {
  const statusClass = s
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span className={`programme-status status-${statusClass}`}>
      <i />
      {s}
    </span>
  );
}

function Trainees({
  query,
  trainees,
  training,
  employment,
  followups,
  skillGaps,
  onTraineeAdded,
  onDeleteTrainee,
  currentUser
}) {
  const isAdmin = currentUser?.role === "admin";
  const myTrainee = !isAdmin
  ? trainees.find(
      t =>
        String(t?.trainee_id || t?.id || "").trim() ===
        String(currentUser?.trainee_id || "").trim()
    )
  : null;

  const [selectedTrainee, setSelectedTrainee] =
    React.useState(null);

  // =========================
  // FILTER STATES
  // =========================

  const [showFilters, setShowFilters] =
    React.useState(false);

  const [courseFilter, setCourseFilter] =
    React.useState("");

  const [districtFilter, setDistrictFilter] =
    React.useState("");

  const [statusFilter, setStatusFilter] =
    React.useState("");


  // =========================
  // FORM STATES
  // =========================

  const [showForm, setShowForm] =
    React.useState(false);

  const [editingTrainee, setEditingTrainee] =
    React.useState(null);

  const [traineeId, setTraineeId] =
    React.useState("");

  const [traineeName, setTraineeName] =
    React.useState("");

  const [traineeEmail, setTraineeEmail] =
    React.useState("");

  const [traineeDob, setTraineeDob] =
    React.useState("");

  const [traineeLocation, setTraineeLocation] =
    React.useState("");

  const [traineePhone, setTraineePhone] =
    React.useState("");

  const [traineeCourse, setTraineeCourse] =
    React.useState("");

  const [traineeDistrict, setTraineeDistrict] =
    React.useState("");

  const [traineeProvider, setTraineeProvider] =
    React.useState("");

  const [traineeGender, setTraineeGender] =
    React.useState("");

  const [traineeAge, setTraineeAge] =
    React.useState("");

  const [trainingYear, setTrainingYear] =
    React.useState("");

  const [traineeConfidence, setTraineeConfidence] =
    React.useState("");


  // =========================
  // EDIT TRAINEE
  // =========================

  React.useEffect(() => {

    if (!editingTrainee) {
      return;
    }

    setTraineeId(
      editingTrainee.trainee_id ||
      editingTrainee.id ||
      ""
    );

    setTraineeName(
      editingTrainee.name || ""
    );

    setTraineeEmail(
      editingTrainee.email || ""
    );

    setTraineeDob(
      editingTrainee.date_of_birth
        ? String(
            editingTrainee.date_of_birth
          ).slice(0, 10)
        : ""
    );

    setTraineeLocation(
      editingTrainee.location ||
      editingTrainee.city ||
      editingTrainee.district ||
      ""
    );

    setTraineePhone(
      editingTrainee.phone || ""
    );

    setTraineeCourse(
      editingTrainee.course || ""
    );

    setTraineeDistrict(
      editingTrainee.district ||
      editingTrainee.city ||
      ""
    );

    setTraineeProvider(
      editingTrainee.provider || ""
    );

    setTraineeGender(
      editingTrainee.gender || ""
    );

    setTraineeAge(
      editingTrainee.age || ""
    );

    setTrainingYear(
      editingTrainee.training_year ||
      editingTrainee.trainingYear ||
      ""
    );

    setTraineeConfidence(
      editingTrainee.confidence ||
      editingTrainee.progress ||
      ""
    );

  }, [editingTrainee]);


  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {

    setTraineeId("");
    setTraineeName("");
    setTraineeEmail("");
    setTraineeDob("");
    setTraineeLocation("");
    setTraineePhone("");
    setTraineeCourse("");
    setTraineeDistrict("");
    setTraineeProvider("");
    setTraineeGender("");
    setTraineeAge("");
    setTrainingYear("");
    setTraineeConfidence("");

  };


  // =========================
  // SAVE / UPDATE TRAINEE
  // =========================

  const handleSaveTrainee = async () => {

    try {

      if (!traineeName.trim()) {

        alert(
          "Please enter trainee name."
        );

        return;
      }


      if (!traineeEmail.trim()) {

        alert(
          "Please enter trainee email."
        );

        return;
      }


      const isEditing =
        editingTrainee !== null;


      if (!isEditing && !isAdmin) {

        alert(
          "Only admin can add trainees."
        );

        return;
      }


      if (!traineeId.trim()) {

        alert(
          "Please enter Trainee ID."
        );

        return;
      }


      const url = isEditing
        ? `${API_URL}/api/trainees/${encodeURIComponent(
            traineeId.trim()
          )}`
        : `${API_URL}/api/trainees`;


      const body = isAdmin
        ? {
            trainee_id:
              traineeId.trim(),

            name:
              traineeName.trim(),

            email:
              traineeEmail
                .trim()
                .toLowerCase(),

            date_of_birth:
              traineeDob || null,

            location:
              traineeLocation.trim() ||
              null,

            phone:
              traineePhone.trim() ||
              null,

            course:
              traineeCourse.trim(),

            district:
              traineeDistrict.trim(),

            provider:
              traineeProvider.trim(),

            gender:
              traineeGender.trim(),

            age:
              traineeAge
                ? Number(traineeAge)
                : null,

            training_year:
              trainingYear
                ? Number(trainingYear)
                : null,

            confidence:
              traineeConfidence
                ? Number(
                    traineeConfidence
                  )
                : null
          }
        : {
            trainee_id:
              traineeId.trim(),

            name:
              traineeName.trim(),

            email:
              traineeEmail
                .trim()
                .toLowerCase(),

            date_of_birth:
              traineeDob || null,

            location:
              traineeLocation.trim() ||
              null,

            phone:
              traineePhone.trim() ||
              null
          };


      const response = await authFetch(
        url,
        {
          method:
            isEditing
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(body)
        }
      );


      if (!response.ok) {

        let errorMessage =
          isEditing
            ? "Failed to update trainee"
            : "Failed to save trainee";


        try {

          const errorData =
            await response.json();


          if (errorData?.message) {

            errorMessage =
              errorData.message;
          }


          if (errorData?.error) {

            errorMessage =
              errorData.error;
          }

        } catch (error) {
          // Ignore JSON parsing error
        }


        throw new Error(
          errorMessage
        );
      }


      const savedTrainee =
        await response.json();


      onTraineeAdded(
        savedTrainee
      );


      alert(
        isEditing
          ? "Trainee successfully updated!"
          : "Trainee successfully added!"
      );


      setShowForm(false);

      setEditingTrainee(null);

      resetForm();

    } catch (error) {

      console.error(
        "Trainee save error:",
        error
      );


      alert(
        "ERROR: " +
        (
          error?.message ||
          "Something went wrong"
        )
      );
    }
  };


  // =========================
  // FILTER OPTIONS
  // =========================

  const courseOptions =
    React.useMemo(() => {

      return [
        ...new Set(
          trainees
            .map(
              t => t.course
            )
            .filter(Boolean)
        )
      ].sort();

    }, [trainees]);


  const districtOptions =
    React.useMemo(() => {

      return [
        ...new Set(
          trainees
            .map(
              t =>
                t.location ||
                t.city ||
                t.district
            )
            .filter(Boolean)
        )
      ].sort();

    }, [trainees]);


  const statusOptions =
    React.useMemo(() => {

      return [
        ...new Set(
          trainees
            .map(
              t => t.status
            )
            .filter(Boolean)
        )
      ].sort();

    }, [trainees]);


  // =========================
  // SEARCH + FILTER
  // =========================

  const filtered =
    React.useMemo(() => {

      const searchText =
        (query || "")
          .toLowerCase()
          .trim();


      return trainees.filter(
        t => {

          const searchableText = (

            (t.name || "") +
            " " +
            (t.id || "") +
            " " +
            (t.trainee_id || "") +
            " " +
            (t.email || "") +
            " " +
            (t.course || "") +
            " " +
            (t.location || "") +
            " " +
            (t.city || "") +
            " " +
            (t.district || "") +
            " " +
            (t.phone || "") +
            " " +
            (t.status || "")

          ).toLowerCase();


          const matchesSearch =
            !searchText ||
            searchableText.includes(
              searchText
            );


          const traineeLocationValue =
            t.location ||
            t.city ||
            t.district ||
            "";


          const matchesCourse =
            !courseFilter ||
            t.course === courseFilter;


          const matchesDistrict =
            !districtFilter ||
            traineeLocationValue ===
              districtFilter;


          const matchesStatus =
            !statusFilter ||
            t.status === statusFilter;


          return (
            matchesSearch &&
            matchesCourse &&
            matchesDistrict &&
            matchesStatus
          );
        }
      );

    }, [
      query,
      trainees,
      courseFilter,
      districtFilter,
      statusFilter
    ]);


  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {

    setCourseFilter("");

    setDistrictFilter("");

    setStatusFilter("");

  };


  // =========================
  // EXPORT
  // =========================

  const handleExport = () => {

    if (filtered.length === 0) {

      alert(
        "No trainee data available to export."
      );

      return;
    }


    const headers = [
      "Trainee ID",
      "Name",
      "Email",
      "Date of Birth",
      "Location",
      "Phone",
      "Course",
      "District",
      "Provider",
      "Gender",
      "Age",
      "Training Year",
      "Status",
      "Confidence"
    ];


    const rows =
      filtered.map(t => [

        t.trainee_id ||
        t.id ||
        "",

        t.name ||
        "",

        t.email ||
        "",

        t.date_of_birth ||
        "",

        t.location ||
        t.city ||
        "",

        t.phone ||
        "",

        t.course ||
        "",

        t.district ||
        "",

        t.provider ||
        "",

        t.gender ||
        "",

        t.age ||
        "",

        t.training_year ||
        t.trainingYear ||
        "",

        t.status ||
        "",

        t.confidence ||
        t.progress ||
        ""

      ]);


    const csvContent = [
      headers,
      ...rows
    ]
      .map(row =>
        row
          .map(value => {

            const text =
              String(
                value ?? ""
              );

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;

          })
          .join(",")
      )
      .join("\n");


    const blob =
      new Blob(
        [csvContent],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;


    link.download =
      `skilltrack-trainees-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );
  };


  // =========================
  // OPEN ADMIN EDIT
  // =========================

  const openAdminEdit = (
    trainee
  ) => {

    setEditingTrainee(
      trainee
    );

    setShowForm(
      true
    );
  };


  // =========================
  // OPEN MY PROFILE EDIT
  // =========================

  const openMyProfileEdit = (
    trainee
  ) => {

    if (!trainee) {
      return;
    }


    setEditingTrainee(
      trainee
    );

    setShowForm(
      true
    );
  };


  // =========================
  // RETURN
  // =========================

  return (
    <div className="content">

      <PageIntro
        title="Trainee digital twin"
        text="A consent-based longitudinal profile linking training, assessment, employment and follow-up."
      />
      {!isAdmin && myTrainee && (
  <Card
    title="My Basic Details"
    subtitle="Your personal profile information"
  >
    <div className="my-basic-details">

      <div className="basic-detail-item">
        <span className="basic-detail-label">
          Trainee ID
        </span>

        <span className="basic-detail-value">
          {myTrainee.trainee_id || "—"}
          <span className="basic-detail-lock">
            🔒
          </span>
        </span>
      </div>

      <div className="basic-detail-item">
        <span className="basic-detail-label">
          Full Name
        </span>

        <span className="basic-detail-value">
          {myTrainee.name || "—"}
        </span>
      </div>

      <div className="basic-detail-item">
        <span className="basic-detail-label">
          Email
        </span>

        <span className="basic-detail-value">
          {myTrainee.email || "—"}
        </span>
      </div>

      <div className="basic-detail-item">
        <span className="basic-detail-label">
          Date of Birth
        </span>

        <span className="basic-detail-value">
          {myTrainee.date_of_birth
            ? String(myTrainee.date_of_birth).slice(0, 10)
            : "—"}
        </span>
      </div>

      <div className="basic-detail-item">
        <span className="basic-detail-label">
          Phone Number
        </span>

        <span className="basic-detail-value">
          {myTrainee.phone || "—"}
        </span>
      </div>

      <div className="basic-detail-item">
        <span className="basic-detail-label">
          Location
        </span>

        <span className="basic-detail-value">
          {myTrainee.location ||
            myTrainee.city ||
            myTrainee.district ||
            "—"}
        </span>
      </div>

      <div className="basic-detail-actions">
        <button
          type="button"
          className="primary"
          onClick={() => openMyProfileEdit(myTrainee)}
        >
          Edit Basic Details
        </button>
      </div>

    </div>
  </Card>
)}


      {/* TOOLBAR */}

      <div className="toolbar">

        <button
          className="trainee-tool-button filter-button"
          onClick={() =>
            setShowFilters(
              prev => !prev
            )
          }
        >

          <span className="tool-icon">
            <Filter size={16} />
          </span>

          <span>
            Filters
          </span>

          <span className="tool-arrow">
            {
              showFilters
                ? "↑"
                : "↓"
            }
          </span>

        </button>


        <button
          className="trainee-tool-button export-button"
          onClick={
            handleExport
          }
        >

          <span className="tool-icon">
            <Download size={16} />
          </span>

          <span>
            Export
          </span>

        </button>


        {/* ADMIN ONLY */}

        {isAdmin && (
          <button
            className="trainee-add-button"
            onClick={() => {

              setEditingTrainee(
                null
              );

              resetForm();

              setShowForm(
                true
              );

            }}
          >

            <span className="trainee-add-icon">
              +
            </span>

            <span>
              Add Trainee
            </span>

          </button>
        )}


        <span className="count">
          {filtered.length} of{" "}
          {trainees.length} shown
        </span>

      </div>


      {/* FILTER PANEL */}

      {showFilters && (
        <div className="trainee-filter-panel">

          <div className="form-group">

            <label>
              Course
            </label>

            <select
              className="trainee-filter-select"
              value={
                courseFilter
              }
              onChange={e =>
                setCourseFilter(
                  e.target.value
                )
              }
            >

              <option value="">
                All Courses
              </option>

              {courseOptions.map(
                course => (
                  <option
                    key={course}
                    value={course}
                  >
                    {course}
                  </option>
                )
              )}

            </select>

          </div>


          <div className="form-group">

            <label>
              Location
            </label>

            <select
              className="trainee-filter-select"
              value={
                districtFilter
              }
              onChange={e =>
                setDistrictFilter(
                  e.target.value
                )
              }
            >

              <option value="">
                All Locations
              </option>

              {districtOptions.map(
                location => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                )
              )}

            </select>

          </div>


          <div className="form-group">

            <label>
              Status
            </label>

            <select
              className="trainee-filter-select"
              value={
                statusFilter
              }
              onChange={e =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="">
                All Status
              </option>

              {statusOptions.map(
                status => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>

          </div>


          <button
            className="secondary"
            onClick={
              clearFilters
            }
          >
            Clear Filters
          </button>

        </div>
      )}


      {/* ADD / EDIT FORM */}

      {showForm &&
        createPortal(
          <div className="training-modal-overlay">

            <div className="training-modal">

              <div className="training-modal-header">

                <div>

                  <div className="training-modal-title">

                    <span className="training-modal-icon">
                      ◉
                    </span>

                    <span>
                      {editingTrainee
                        ? isAdmin
                          ? "Edit Trainee"
                          : "My Profile"
                        : "Add New Trainee"}
                    </span>

                  </div>


                  <p>
                    {editingTrainee
                      ? isAdmin
                        ? "Update the trainee details below."
                        : "Update your basic profile details."
                      : "Enter the trainee details below."}
                  </p>

                </div>


                <button
                  type="button"
                  className="training-close-icon"
                  onClick={() => {

                    setShowForm(
                      false
                    );

                    setEditingTrainee(
                      null
                    );

                    resetForm();

                  }}
                  title="Close"
                >
                  ×
                </button>

              </div>


              {/* TRAINEE ID */}

              <div className="form-group">

                <label>
                  Trainee ID
                </label>

                <input
                  type="text"
                  value={
                    traineeId
                  }
                  disabled={
                    !isAdmin
                  }
                  onChange={e =>
                    setTraineeId(
                      e.target.value
                    )
                  }
                  placeholder="Example: ST10001"
                />

                {!isAdmin && (
                  <small>
                    Your Trainee ID is also your Login ID and cannot be changed.
                  </small>
                )}

              </div>


              {/* NAME */}

              <div className="form-group">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Enter trainee name"
                  value={
                    traineeName
                  }
                  onChange={e =>
                    setTraineeName(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="trainee@example.com"
                  value={
                    traineeEmail
                  }
                  onChange={e =>
                    setTraineeEmail(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* DATE OF BIRTH */}

              <div className="form-group">

                <label>
                  Date of Birth
                </label>

                <input
                  type="date"
                  value={
                    traineeDob
                  }
                  onChange={e =>
                    setTraineeDob(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* LOCATION */}

              <div className="form-group">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  placeholder="Enter city / location"
                  value={
                    traineeLocation
                  }
                  onChange={e =>
                    setTraineeLocation(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* PHONE */}

              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter phone number"
                  value={
                    traineePhone
                  }
                  onChange={e =>
                    setTraineePhone(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />

              </div>


              {/* ADMIN ONLY FIELDS */}

              {isAdmin && (
                <>

                  {/* COURSE */}

                  <div className="form-group">

                    <label>
                      Course
                    </label>

                    <input
                      type="text"
                      placeholder="Enter course name"
                      value={
                        traineeCourse
                      }
                      onChange={e =>
                        setTraineeCourse(
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* DISTRICT */}

                  <div className="form-group">

                    <label>
                      District
                    </label>

                    <input
                      type="text"
                      placeholder="Enter district"
                      value={
                        traineeDistrict
                      }
                      onChange={e =>
                        setTraineeDistrict(
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* PROVIDER */}

                  <div className="form-group">

                    <label>
                      Provider
                    </label>

                    <input
                      type="text"
                      placeholder="Enter training provider"
                      value={
                        traineeProvider
                      }
                      onChange={e =>
                        setTraineeProvider(
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* GENDER */}

                  <div className="form-group">

                    <label>
                      Gender
                    </label>

                    <input
                      type="text"
                      placeholder="Enter gender"
                      value={
                        traineeGender
                      }
                      onChange={e =>
                        setTraineeGender(
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* AGE */}

                  <div className="form-group">

                    <label>
                      Age
                    </label>

                    <input
                      type="number"
                      placeholder="Enter age"
                      value={
                        traineeAge
                      }
                      onChange={e =>
                        setTraineeAge(
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* TRAINING YEAR */}

                  <div className="form-group">

                    <label>
                      Training Year
                    </label>

                    <input
                      type="number"
                      placeholder="Example: 2026"
                      value={
                        trainingYear
                      }
                      onChange={e =>
                        setTrainingYear(
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* CONFIDENCE */}

                  <div className="form-group">

                    <label>
                      Confidence
                    </label>

                    <input
                      type="number"
                      placeholder="Example: 85"
                      value={
                        traineeConfidence
                      }
                      onChange={e =>
                        setTraineeConfidence(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </>
              )}


              {/* SAVE */}

              <button
                type="button"
                className="primary"
                onClick={
                  handleSaveTrainee
                }
              >
                {editingTrainee
                  ? "Save Changes"
                  : "Save Trainee"}
              </button>


              {/* CLOSE */}

              <button
                type="button"
                className="secondary"
                onClick={() => {

                  setShowForm(
                    false
                  );

                  setEditingTrainee(
                    null
                  );

                  resetForm();

                }}
              >
                Close
              </button>

            </div>

          </div>,
          document.body
        )}


      {/* TRAINEE DIRECTORY */}

      <div
        className={
          selectedTrainee
            ? "trainee-career-layout has-career"
            : "trainee-career-layout"
        }
      >

        {/* LEFT SIDE */}

        <div className="trainee-directory-section">

          <Card
            title="Trainee directory"
            subtitle="Unified identifiers across programmes"
          >

            <Table
              rows={
                filtered
              }

              employment={
                employment
              }

              onSelect={trainee =>
                setSelectedTrainee(
                  trainee
                )
              }

              onEdit={trainee => {

                if (
                  isAdmin
                ) {

                  openAdminEdit(
                    trainee
                  );

                } else {

                  openMyProfileEdit(
                    trainee
                  );

                }

              }}

              onDelete={
                isAdmin
                  ? onDeleteTrainee
                  : undefined
              }
            />

          </Card>

        </div>


        {/* CAREER JOURNEY POPUP */}

        {selectedTrainee && (

          <div
            className="career-modal-overlay"
            onClick={() =>
              setSelectedTrainee(
                null
              )
            }
          >

            <div
              className="career-modal-card"
              onClick={e =>
                e.stopPropagation()
              }
            >

              <div className="career-modal-header">

                <div className="career-modal-title">

                  <div className="career-modal-icon">
                    ◉
                  </div>

                  <div>

                    <h3>
                      Trainee Career Journey
                    </h3>

                    <p>
                      {
                        selectedTrainee.name ||
                        "Trainee Profile"
                      }
                    </p>

                  </div>

                </div>


                <button
                  className="career-close-btn"
                  onClick={() =>
                    setSelectedTrainee(
                      null
                    )
                  }
                  aria-label="Close Career Journey"
                  title="Close"
                >
                  ×
                </button>

              </div>


              <div className="career-modal-content">

                <CareerJourney
                  trainee={
                    selectedTrainee
                  }

                  training={
                    training
                  }

                  employment={
                    employment
                  }

                  followups={
                    followups
                  }

                  skillGaps={
                    skillGaps
                  }
                />

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}
function CareerJourney({
  trainee,
  training = [],
  employment = [],
  followups = [],
  skillGaps = []
}) {

  /* =========================
     TRAINEE TRAINING
  ========================= */

  const traineeTraining = training
    .filter(item => item.trainee_id === trainee.id)
    .sort(
      (a, b) =>
        new Date(a.start_date || 0) -
        new Date(b.start_date || 0)
    );


  /* =========================
     TRAINEE EMPLOYMENT
  ========================= */

  const traineeEmployment = employment
    .filter(item => item.trainee_id === trainee.id);


  /* =========================
     TRAINEE FOLLOW-UPS
  ========================= */

  const traineeFollowups = followups
    .filter(item => item.trainee_id === trainee.id)
    .sort(
      (a, b) =>
        new Date(a.followup_date || 0) -
        new Date(b.followup_date || 0)
    );


  /* =========================
     TRAINEE SKILL GAPS
  ========================= */

  const traineeSkillGaps = skillGaps.filter(
    item => item.trainee_id === trainee.id
  );


  /* =========================
     SKILL GAP TEXT
  ========================= */

  const skillGapText =
    traineeSkillGaps.length > 0
      ? traineeSkillGaps
          .map(item => item.required_skill)
          .filter(Boolean)
          .join(", ")
      : "No skill gap recorded";


  /* =========================
     RECOMMENDED SKILL
  ========================= */

  const recommendedSkill =
    traineeSkillGaps.length > 0
      ? traineeSkillGaps
          .map(item => item.recommendation)
          .filter(Boolean)
          .join(", ")
      : "Recommendation pending";


  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };


  /* =========================
     CURRENT SALARY
  ========================= */

  const currentSalary =
    traineeEmployment.length > 0
      ? traineeEmployment[0].salary ||
        traineeEmployment[0].current_salary ||
        "Not available"
      : "Not available";


  /* =====================================================
     CAREER JOURNEY
     
     IMPORTANT ORDER:
     
     1. Enrollment
     2. Training Started
     3. Assessment Passed
     4. Certified
     5. Employed
     6. Follow-up
     7. Current Salary
     8. Skill Gap
     9. Recommended Skill
  ===================================================== */

  const journey = [];


  /* =========================
     1. ENROLLMENT
  ========================= */

  journey.push({
    title: "Enrollment",

    date: trainee.trainingYear
      ? `Training year: ${trainee.trainingYear}`
      : "Profile created",

    detail:
      trainee.course ||
      "Programme enrolled"
  });


  /* =========================
     2. TRAINING
  ========================= */

  traineeTraining.forEach(item => {

    journey.push({
      title: "Training Started",

      date: formatDate(
        item.start_date
      ),

      detail:
        item.course ||
        trainee.course ||
        "Training programme"
    });


    /* =========================
       3. ASSESSMENT
    ========================= */

    if (
      item.assessment_score !== null &&
      item.assessment_score !== undefined &&
      item.assessment_score !== ""
    ) {

      journey.push({
        title: "Assessment Passed",

        date: formatDate(
          item.end_date
        ),

        detail:
          `Score: ${item.assessment_score}%`
      });


      /* =========================
         4. CERTIFIED
      ========================= */

      journey.push({
        title: "Certified",

        date: formatDate(
          item.end_date
        ),

        detail:
          "Training certification completed"
      });

    }

  });


  /* =========================
     5. EMPLOYMENT
  ========================= */

  traineeEmployment.forEach(item => {

    journey.push({
      title: "Employed",

      date: formatDate(
        item.start_date ||
        item.joining_date
      ),

      detail:
        `${item.employer || "Employer not specified"} • ${
          item.job_role || "Role not specified"
        }`
    });

  });


  /* =========================
     6. FOLLOW-UPS
  ========================= */

  traineeFollowups.forEach(item => {

    journey.push({
      title:
        item.type
          ? `${item.type} Follow-up`
          : "Follow-up",

      date:
        formatDate(
          item.followup_date
        ),

      detail:
        item.response ||
        item.status ||
        "Follow-up recorded"
    });

  });


  /* =========================
     7. CURRENT SALARY
  ========================= */

  journey.push({
    title: "Current Salary",

    date: "Current",

    detail: currentSalary
  });


  /* =========================
     8. SKILL GAP
  ========================= */

  journey.push({
    title: "Skill Gap",

    date: "Current",

    detail: skillGapText
  });


  /* =========================
     9. RECOMMENDED SKILL
  ========================= */

  journey.push({
    title: "Recommended Skill",

    date: "Recommended",

    detail: recommendedSkill
  });


  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="career-journey-new">


      {/* =========================
          HEADER
      ========================= */}

      <div className="career-journey-header-new">

        <h3>
          Career Journey
        </h3>


        <div className="career-trainee-name-new">

          {trainee.name} ({trainee.id})

        </div>

      </div>


      {/* =========================
          TIMELINE
      ========================= */}

      <div className="career-timeline-new">

        {journey.map(
          (event, index) => (

            <div
              className="career-event-new"
              key={
                `${event.title}-${event.date}-${index}`
              }
            >


              {/* VERTICAL LINE */}

              {index !== journey.length - 1 && (

                <div className="career-line-new"></div>

              )}


              {/* TIMELINE DOT */}

              <div className="career-dot-new"></div>


              {/* EVENT CARD */}

              <div className="career-event-card-new">


                {/* EVENT CONTENT */}

                <div className="career-event-content-new">

                  <div className="career-event-title-new">

                    {event.title}

                  </div>


                  <div className="career-event-detail-new">

                    {event.date}
                    {" • "}
                    {event.detail}

                  </div>

                </div>


                {/* VIEW BUTTON */}

                <button
                  type="button"
                  className="career-view-button-new"

                  onClick={() => {

                    alert(
                      `${event.title}\n\n${event.date}\n${event.detail}`
                    );

                  }}
                >

                  View

                </button>


              </div>

            </div>

          )
        )}

      </div>

    </div>

  );
}

function TraineeCard({t}){return <div className="card trainee-card"><div className="person"><div className="avatar">{t.name.split(" ").map(x=>x[0]).join("")}</div><div><b>{t.name}</b><small>{t.id}</small></div></div><hr/><div className="mini-grid"><span>Programme<b>{t.course}</b></span><span>Outcome<b>{t.status}</b></span><span>Skill gap<b>{t.gap}</b></span><span>Progress<b>{t.progress}%</b></span></div><div className="progress"><i style={{width:t.progress+"%"}}/></div></div>}

function PageIntro({title,text}){return <section className="page-intro"><div><p className="eyebrow">SKILLTRACK MODULE</p><h2>{title}</h2><p>{text}</p></div><div className="intro-icon"><Sparkles size={28}/></div></section>}
function Training({ trainees, training, setTraining, currentUser }) {
  const isAdmin = currentUser?.role === "admin";

  const [selectedTrainee, setSelectedTrainee] = React.useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    trainee_id: "",
    course: "",
    course_provider: "",
    start_date: "",
    end_date: "",
    assessment_score: ""
  });

  const resetForm = () => {
    setForm({
      trainee_id: "",
      course: "",
      course_provider: "",
      start_date: "",
      end_date: "",
      assessment_score: ""
    });

    setEditingId(null);
  };

  const handleClose = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="content training-page">

      <PageIntro
        title="Training & assessment"
        text="Track enrolment, attendance, assessment scores and certification in one lifecycle record."
      />

      {/* ADD TRAINING BUTTON */}
      {isAdmin && (
        <div className="training-add-wrapper">
          <button
            className="training-add-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <span className="training-add-icon">+</span>
            <span>Add Training</span>
          </button>
        </div>
      )}

      {/* POPUP */}
      {showForm && showForm && createPortal (
        <div className="training-modal-overlay">

          <div className="training-modal">

            <div className="training-modal-header">
              <div>
                <div className="training-modal-title">
                  <span className="training-modal-icon">▣</span>
                  <span>
                    {editingId
                      ? "Edit Training Record"
                      : "Add Training Record"}
                  </span>
                </div>

                <p>
                  {editingId
                    ? "Update the training details below."
                    : "Enter the training and assessment details below."}
                </p>
              </div>

              <button
                type="button"
                className="training-close-icon"
                onClick={handleClose}
                title="Close"
              >
                ×
              </button>
            </div>

            <Card
              title="Training Record"
              subtitle="Add or edit training details"
            >

              {/* CLOSE BUTTON */}
              <button
                type="button"
                className="training-close-button"
                onClick={handleClose}
              >
                <span>×</span>
                <span>Close</span>
              </button>

              {/* FORM */}
              <div className="training-form-grid">

                {/* TRAINEE */}
                <div className="training-field">
                  <label>
                    <span className="field-icon">♙</span>
                    Trainee
                  </label>

                  <select
                    value={form.trainee_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        trainee_id: e.target.value
                      })
                    }
                  >
                    <option value="">
                      Select Trainee
                    </option>

                    {trainees.map((trainee) => {
                      const traineeId =
                        trainee?.trainee_id ||
                        trainee?.id ||
                        "";

                      return (
                        <option
                          key={
                            traineeId ||
                            trainee?.email ||
                            trainee?.name
                          }
                          value={traineeId}
                        >
                          {traineeId || "No ID"} -{" "}
                          {trainee?.name ||
                            "Unknown Trainee"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* COURSE */}
                <div className="training-field">
                  <label>
                    <span className="field-icon">▣</span>
                    Course
                  </label>

                  <input
                    placeholder="Enter course name"
                    value={form.course}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        course: e.target.value
                      })
                    }
                  />
                </div>

                {/* COURSE PROVIDER */}
                <div className="training-field">
                  <label>
                    <span className="field-icon">▤</span>
                    Course Provider
                  </label>

                  <input
                    placeholder="Enter course provider"
                    value={form.course_provider}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        course_provider: e.target.value
                      })
                    }
                  />
                </div>

                {/* START DATE */}
                <div className="training-field">
                  <label>
                    <span className="field-icon">◷</span>
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        start_date: e.target.value
                      })
                    }
                  />
                </div>

                {/* END DATE */}
                <div className="training-field">
                  <label>
                    <span className="field-icon">◷</span>
                    End Date
                  </label>

                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        end_date: e.target.value
                      })
                    }
                  />
                </div>

                {/* ASSESSMENT SCORE */}
                <div className="training-field">
                  <label>
                    <span className="field-icon">★</span>
                    Assessment Score
                  </label>

                  <input
                    type="number"
                    placeholder="Enter score"
                    value={form.assessment_score}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        assessment_score: e.target.value
                      })
                    }
                  />
                </div>

              </div>

              {/* SAVE BUTTON */}
              <div className="training-save-wrapper">

                <button
                  type="button"
                  className="training-save-button"
                  onClick={async () => {
                    try {
                      if (!form.trainee_id) {
                        alert("Please select a trainee.");
                        return;
                      }

                      const response = await authFetch(
                        editingId
                          ? `${API_URL}/api/training/${editingId}`
                          : `${API_URL}/api/training`,
                        {
                          method: editingId
                            ? "PUT"
                            : "POST",

                          headers: {
                            "Content-Type":
                              "application/json"
                          },

                          body: JSON.stringify(form)
                        }
                      );

                      if (!response.ok) {
                        const errorData =
                          await response
                            .json()
                            .catch(() => ({}));

                        throw new Error(
                          errorData?.message ||
                            errorData?.error ||
                            "Failed to save training"
                        );
                      }

                      await response.json();

                      const updatedTraining =
                        await authFetch(
                          `${API_URL}/api/training`
                        ).then((res) =>
                          res.json()
                        );

                      setTraining(updatedTraining);

                      alert(
                        editingId
                          ? "Training record updated successfully!"
                          : "Training record added successfully!"
                      );

                      handleClose();

                    } catch (error) {
                      console.error(
                        "Training save error:",
                        error
                      );

                      alert(
                        "ERROR: " +
                          error.message
                      );
                    }
                  }}
                >
                  <span className="save-icon">
                    ✓
                  </span>

                  <span>
                    {editingId
                      ? "Update Training"
                      : "Save Training"}
                  </span>
                </button>

              </div>

            </Card>
          </div>
        </div>,
          document.body
      )}

      {/* STATS */}
      <div className="stats training-stats">

        <div className="stat card training-stat-card">
          <div className="training-stat-icon">
            ▣
          </div>

          <div>
            <span className="training-stat-label">
              Training Records
            </span>

            <strong>
              {training.length}
            </strong>
          </div>
        </div>

        <div className="stat card training-stat-card">
          <div className="training-stat-icon">
            ★
          </div>

          <div>
            <span className="training-stat-label">
              Average Score
            </span>

            <strong>
              {training.length
                ? (
                    training.reduce(
                      (sum, item) =>
                        sum +
                        Number(
                          item.assessment_score ||
                            0
                        ),
                      0
                    ) / training.length
                  ).toFixed(1)
                : 0}
            </strong>
          </div>
        </div>

        <div className="stat card training-stat-card">
          <div className="training-stat-icon">
            ↑
          </div>

          <div>
            <span className="training-stat-label">
              Highest Score
            </span>

            <strong>
              {training.length
                ? Math.max(
                    ...training.map(
                      (item) =>
                        Number(
                          item.assessment_score ||
                            0
                        )
                    )
                  )
                : 0}
            </strong>
          </div>
        </div>

        <div className="stat card training-stat-card">
          <div className="training-stat-icon">
            ↓
          </div>

          <div>
            <span className="training-stat-label">
              Lowest Score
            </span>

            <strong>
              {training.length
                ? Math.min(
                    ...training.map(
                      (item) =>
                        Number(
                          item.assessment_score ||
                            0
                        )
                    )
                  )
                : 0}
            </strong>
          </div>
        </div>

      </div>

      {/* TRAINING TABLE */}
      <Card
        title="Training Records"
        subtitle="Records loaded from PostgreSQL"
      >

        <div className="training-table-wrapper">

          <table className="training-table">

            <thead>
              <tr>
                <th>Training ID</th>
                <th>Trainee ID</th>
                <th>Trainee Name</th>
                <th>Course</th>
                <th>Provider</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Assessment Score</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {training.map((item) => {

                const traineeId =
                  item?.trainee_id ||
                  item?.traineeId ||
                  item?.trainee ||
                  "";

                return (
                  <tr
                    key={
                      item?.training_id ||
                      traineeId
                    }
                  >

                    <td>
                      <span className="training-id">
                        #{item?.training_id || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="trainee-id-badge">
                        ♙ {traineeId || "—"}
                      </span>
                    </td>

                    <td>
                      <div className="training-name">
                        <span className="training-avatar">
                          {(item?.trainee_name ||
                            "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <span>
                          {item?.trainee_name ||
                            "—"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="training-course">
                        <span className="course-icon">
                          ▣
                        </span>

                        <span>
                          {item?.course ||
                            "—"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="provider-badge">
                        {item?.course_provider ||
                          "—"}
                      </span>
                    </td>

                    <td>
                      <span className="date-badge">
                        ◷{" "}
                        {item?.start_date
                          ?.slice(0, 10) ||
                          "—"}
                      </span>
                    </td>

                    <td>
                      <span className="date-badge">
                        ◷{" "}
                        {item?.end_date
                          ?.slice(0, 10) ||
                          "—"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          Number(
                            item?.assessment_score ||
                              0
                          ) >= 70
                            ? "score-badge score-high"
                            : Number(
                                item?.assessment_score ||
                                  0
                              ) >= 40
                            ? "score-badge score-medium"
                            : "score-badge score-low"
                        }
                      >
                        ★{" "}
                        {item?.assessment_score ??
                          "—"}
                      </span>
                    </td>

                    <td>

                      {isAdmin && (
                        <div className="training-actions">

                          {/* EDIT */}
                          <button
                            className="training-edit-button"
                            onClick={() => {

                              setForm({
                                trainee_id:
                                  item?.trainee_id ||
                                  item?.traineeId ||
                                  item?.trainee ||
                                  "",

                                course:
                                  item?.course ||
                                  "",

                                course_provider:
                                  item?.course_provider ||
                                  "",

                                start_date:
                                  item?.start_date?.slice(
                                    0,
                                    10
                                  ) || "",

                                end_date:
                                  item?.end_date?.slice(
                                    0,
                                    10
                                  ) || "",

                                assessment_score:
                                  item?.assessment_score ??
                                  ""
                              });

                              setEditingId(
                                item?.training_id
                              );

                              setShowForm(true);
                            }}
                            title="Edit training"
                          >
                            <span>✎</span>
                            <span>Edit</span>
                          </button>

                          {/* DELETE */}
                          <button
                            className="training-delete-button"
                            onClick={async () => {

                              try {

                                const response =
                                  await authFetch(
                                    `${API_URL}/api/training/${item.training_id}`,
                                    {
                                      method:
                                        "DELETE"
                                    }
                                  );

                                if (!response.ok) {
                                  throw new Error(
                                    "Failed to delete training"
                                  );
                                }

                                alert(
                                  "Training record deleted successfully!"
                                );

                                setTraining(
                                  (prev) =>
                                    prev.filter(
                                      (t) =>
                                        t.training_id !==
                                        item.training_id
                                    )
                                );

                              } catch (error) {

                                console.error(
                                  error
                                );

                                alert(
                                  "ERROR: " +
                                    error.message
                                );
                              }
                            }}
                            title="Delete training"
                          >
                            <span>🗑</span>
                            <span>Delete</span>
                          </button>

                        </div>
                      )}

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}
function Employment({
  employment,
  setEmployment,
  currentUser,
  trainees
}) {
  const isAdmin = currentUser?.role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    trainee_id: "",
    employer: "",
    job_role: "",
    employment_type: "",
    outcome_status: "",
    joining_date: "",
    starting_salary: "",
    current_salary: "",
    retained: false,
    relevance: ""
  });

  const placed = employment.filter(
    item => item.employer
  ).length;

  const employed = employment.filter(
    item => item.employer && item.employment_type
  ).length;

  const retained = employment.filter(
    item => item.retained === true
  ).length;

  const retentionRate = employment.length
    ? ((retained / employment.length) * 100).toFixed(1)
    : 0;

  const verifiedEmployers = new Set(
    employment
      .filter(item => item.employer)
      .map(item => item.employer)
  ).size;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetForm = () => {
    setForm({
      trainee_id: "",
      employer: "",
      job_role: "",
      employment_type: "",
      outcome_status: "",
      joining_date: "",
      starting_salary: "",
      current_salary: "",
      retained: false,
      relevance: ""
    });

    setEditingId(null);
  };

  const handleEditEmployment = (item) => {
    setEditingId(item.employment_id);

    setForm({
      trainee_id: item.trainee_id || "",
      employer: item.employer || "",
      job_role: item.job_role || "",
      employment_type: item.employment_type || "",
      outcome_status: item.outcome_status || "",
      joining_date: item.joining_date
        ? String(item.joining_date).substring(0, 10)
        : "",
      starting_salary: item.starting_salary ?? "",
      current_salary: item.current_salary ?? "",
      retained: item.retained === true,
      relevance: item.relevance || ""
    });

    setShowForm(true);
  };

  const handleDeleteEmployment = async (item) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employment record?"
    );

    if (!confirmDelete) return;

    try {
      const response = await authFetch(
        `${API_URL}/api/employment/${item.employment_id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete employment");
      }

      setEmployment(prev =>
        prev.filter(
          record =>
            record.employment_id !== item.employment_id
        )
      );

      alert("Employment record deleted successfully!");

    } catch (error) {
      console.error(error);
      alert("ERROR: " + error.message);
    }
  };

  const handleSaveEmployment = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${API_URL}/api/employment/${editingId}`
        : `${API_URL}/api/employment`;

      const method = editingId ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          trainee_id: form.trainee_id,
          employer: form.employer,
          job_role: form.job_role,
          employment_type: form.employment_type,
          outcome_status: form.outcome_status,
          joining_date: form.joining_date,

          starting_salary: form.starting_salary
            ? Number(form.starting_salary)
            : null,

          current_salary: form.current_salary
            ? Number(form.current_salary)
            : null,

          retained: form.retained,

          relevance: form.relevance || null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Employment API Error:",
          response.status,
          errorText
        );

        throw new Error(
          errorText || "Failed to save employment"
        );
      }

      const result = await response.json();

      if (editingId) {
        setEmployment(prev =>
          prev.map(item =>
            item.employment_id === editingId
              ? result.employment
              : item
          )
        );

        alert("Employment record updated successfully!");
      } else {
        setEmployment(prev => [
          result.employment,
          ...prev
        ]);

        alert("Employment record added successfully!");
      }

      resetForm();
      setShowForm(false);

    } catch (error) {
      console.error("Employment Save Error:", error);
      alert("ERROR: " + error.message);
    }
  };

  return (
    <div className="content employment-page">

      <PageIntro
        title="Employment outcomes"
        text="Follow placement, employer verification, retention and wage progression after certification."
      />

      <div className="employment-toolbar">
       {isAdmin && (
  <button
    className="employment-add-button"
    onClick={() => {
      resetForm();
      setShowForm(true);
    }}
  >
    <span className="employment-add-icon">+</span>
    <span>Add Employment</span>
  </button>
)}
      </div>

      <div className="stats employment-stats">

        <Stat
          title="Placed"
          value={placed}
        />

        <Stat
          title="Employed"
          value={employed}
        />

        <Stat
          title="12-mo retention"
          value={`${retentionRate}%`}
        />

        <Stat
          title="Verified employers"
          value={verifiedEmployers}
        />

      </div>

      <Card
        title="Employment and wage progression"
        subtitle="Real employment data from database"
      >

        <div className="employment-chart">

          <ResponsiveContainer width="100%" height={310}>

            <BarChart
              data={employment.filter(
                item => item.employer
              )}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="trainee_id" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="starting_salary"
                name="Starting Salary"
                fill="#1769aa"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="current_salary"
                name="Current Salary"
                fill="#21a179"
                radius={[5, 5, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </Card>

      {isAdmin && showForm && createPortal (

        <div className="employment-modal-overlay">

          <div className="employment-modal">

            <div className="employment-modal-header">

              <div className="employment-modal-title">

                <div className="employment-modal-icon">
                  {editingId ? "✎" : "+"}
                </div>

                <div>
                  <h2>
                    {editingId
                      ? "Edit Employment Record"
                      : "Add Employment Record"}
                  </h2>

                  <p>
                    Enter employment outcome details
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="employment-close-button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSaveEmployment}>

              <div className="employment-form-grid">

                <div className="employment-field">

                  <label>
                    <span>♙</span>
                    Trainee
                  </label>

                  <select
                    name="trainee_id"
                    value={form.trainee_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Trainee
                    </option>

                    {trainees.map((trainee) => {
                      const traineeId =
                        trainee?.trainee_id ||
                        trainee?.id ||
                        "";

                      return (
                        <option
                          key={
                            traineeId ||
                            trainee?.email ||
                            trainee?.name
                          }
                          value={traineeId}
                        >
                          {trainee?.name || "Unknown Trainee"}{" "}
                          ({traineeId || "No ID"})
                        </option>
                      );
                    })}

                  </select>

                </div>

                <div className="employment-field">

                  <label>
                    <span>▣</span>
                    Employer
                  </label>

                  <input
                    name="employer"
                    placeholder="Enter employer name"
                    value={form.employer}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="employment-field">

                  <label>
                    <span>▤</span>
                    Job Role
                  </label>

                  <input
                    name="job_role"
                    placeholder="Enter job role"
                    value={form.job_role}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="employment-field">

                  <label>
                    <span>◈</span>
                    Employment Type
                  </label>

                  <select
                    name="employment_type"
                    value={form.employment_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Employment Type
                    </option>

                    <option value="Full-time">
                      Full-time
                    </option>

                    <option value="Part-time">
                      Part-time
                    </option>

                    <option value="Internship">
                      Internship
                    </option>

                    <option value="Apprenticeship">
                      Apprenticeship
                    </option>

                    <option value="Contract">
                      Contract
                    </option>

                  </select>

                </div>

                <div className="employment-field">

                  <label>
                    <span>✓</span>
                    Outcome Status
                  </label>

                  <select
                    name="outcome_status"
                    value={form.outcome_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Outcome Status
                    </option>

                    <option value="Employed">
                      Employed
                    </option>

                    <option value="Self-Employed">
                      Self-Employed
                    </option>

                    <option value="Unemployed">
                      Unemployed
                    </option>

                    <option value="Job Seeking">
                      Job Seeking
                    </option>

                    <option value="Higher Studies">
                      Higher Studies
                    </option>

                    <option value="Not Looking for Work">
                      Not Looking for Work
                    </option>

                    <option value="Training">
                      Training
                    </option>

                  </select>

                </div>

                <div className="employment-field">

                  <label>
                    <span>◷</span>
                    Joining Date
                  </label>

                  <input
                    type="date"
                    name="joining_date"
                    value={form.joining_date}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="employment-field">

                  <label>
                    <span>₹</span>
                    Starting Salary
                  </label>

                  <input
                    type="number"
                    name="starting_salary"
                    placeholder="Starting Salary"
                    value={form.starting_salary}
                    onChange={handleChange}
                  />

                </div>

                <div className="employment-field">

                  <label>
                    <span>₹</span>
                    Current Salary
                  </label>

                  <input
                    type="number"
                    name="current_salary"
                    placeholder="Current Salary"
                    value={form.current_salary}
                    onChange={handleChange}
                  />

                </div>

                <div className="employment-field">

                  <label>
                    <span>★</span>
                    Training Relevance
                  </label>

                  <select
                    name="relevance"
                    value={form.relevance}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Relevance
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>

                    <option value="Not Relevant">
                      Not Relevant
                    </option>

                    <option value="Not Assessed">
                      Not Assessed
                    </option>

                  </select>

                </div>

                <label className="employment-retained">

                  <input
                    type="checkbox"
                    name="retained"
                    checked={form.retained}
                    onChange={handleChange}
                  />

                  <span className="employment-checkbox">
                    ✓
                  </span>

                  <span>
                    Retained
                  </span>

                </label>

              </div>

              <div className="employment-form-actions">

                <button
                  type="submit"
                  className="employment-save-button"
                >
                  <span>✓</span>

                  {editingId
                    ? "Update Employment"
                    : "Save Employment"}
                </button>

                <button
                  type="button"
                  className="employment-cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <span>×</span>
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>,
         document.body

      )}

      <Card
        title="Employment records"
        subtitle="Records fetched from the employment database"
      >

        <div className="table-wrap employment-table-wrap">

          <table className="data-table employment-table">

            <thead>

              <tr>
              
                <th>Trainee ID</th>
                <th>Trainee Name</th>
                <th>Employer</th>
                <th>Job Role</th>
                <th>Employment Type</th>
                <th>Starting Salary</th>
                <th>Current Salary</th>
                <th>Retained</th>
                <th>Relevance</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {employment.map(item => (

               <tr key={item.employment_id}>

  <td>
    <span className="employment-trainee-id">
      ♙ {item.trainee_id || "—"}
    </span>
  </td>

  <td>
    <span className="employment-trainee-name">
      {(() => {
        const trainee = trainees.find(
          t =>
            String(t?.trainee_id || t?.id || "").trim() ===
            String(item?.trainee_id || "").trim()
        );

        return trainee?.name || "—";
      })()}
    </span>
  </td>

  <td>
    <div className="employment-employer">
      <span className="employment-company-icon">
        ▣
      </span>
      <span>
        {item.employer || "—"}
      </span>
    </div>
  </td>
                  <td>
                    {item.job_role || "—"}
                  </td>

                  <td>
                    <span className="employment-type-badge">
                      {item.employment_type || "—"}
                    </span>
                  </td>

                  <td>
                    {item.starting_salary
                      ? `₹${Number(
                          item.starting_salary
                        ).toLocaleString("en-IN")}`
                      : "—"}
                  </td>

                  <td>
                    {item.current_salary
                      ? `₹${Number(
                          item.current_salary
                        ).toLocaleString("en-IN")}`
                      : "—"}
                  </td>

                  <td>

                    <span
                      className={
                        item.retained
                          ? "retained-badge yes"
                          : "retained-badge no"
                      }
                    >
                      {item.retained ? "✓ Yes" : "× No"}
                    </span>

                  </td>

                  <td>

                    <span
                      className={`relevance-badge ${
                        item.relevance
                          ? item.relevance
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                          : "not-assessed"
                      }`}
                    >
                      {item.relevance || "Not Assessed"}
                    </span>

                  </td>

                  <td>

                    {isAdmin && (

                      <div className="employment-actions">

                        <button
                          className="employment-edit-button"
                          onClick={() =>
                            handleEditEmployment(item)
                          }
                        >
                          <span>✎</span>
                          <span>Edit</span>
                        </button>

                        <button
                          className="employment-delete-button"
                          onClick={() =>
                            handleDeleteEmployment(item)
                          }
                        >
                          <span>🗑</span>
                          <span>Delete</span>
                        </button>

                      </div>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}

function SkillGaps({
  trainees = [],
  skillGaps = [],
  setSkillGaps,
  currentUser
}) {
  const isAdmin = currentUser?.role === "admin";

  const userTraineeId =
    currentUser?.trainee_id ||
    currentUser?.traineeId ||
    "";

  const [showIntervention, setShowIntervention] = useState(false);
  const [showCohort, setShowCohort] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [editingIntervention, setEditingIntervention] = useState(null);

  const [showSkillForm, setShowSkillForm] = useState(false);

  const [recommendationData, setRecommendationData] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [selectedRecommendationTrainee, setSelectedRecommendationTrainee] =
    useState("");

  const [form, setForm] = useState({
    trainee_id: ""
  });

  useEffect(() => {
    authFetch(`${API_URL}/api/interventions`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch interventions");
        }

        return res.json();
      })
      .then(data => {
        setInterventions(data);
      })
      .catch(error => {
        console.error("Intervention fetch error:", error);
      });
  }, []);

  const skills = skillGaps.map(item => [
    item.required_skill,
    Number(item.gap_score),
    item.recommendation
  ]);

  const cloudGapCount = skillGaps.filter(
    gap => gap.required_skill === "Cloud"
  ).length;

  const communicationGapCount = skillGaps.filter(
    gap => gap.required_skill === "Communication"
  ).length;

  const resetForm = () => {
    setForm({
      trainee_id: ""
    });

    setShowSkillForm(false);
  };

  const handleGenerateSkillGap = async () => {
    if (!form.trainee_id) {
      alert("Please select a trainee");
      return;
    }

    try {
      const response = await authFetch(
        `${API_URL}/api/skill-gaps/generate/${form.trainee_id}`,
        {
          method: "POST"
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to generate AI skill gap"
        );
      }

      setSkillGaps(result.skillGaps || []);

      alert("AI skill gap generated successfully!");

      resetForm();
    } catch (error) {
      console.error("AI Skill Gap Error:", error);
      alert("ERROR: " + error.message);
    }
  };

  const handleGenerateRecommendations = async () => {
    const traineeId = isAdmin
      ? selectedRecommendationTrainee
      : userTraineeId;

    if (!traineeId) {
      alert(
        isAdmin
          ? "Please select a trainee"
          : "Your account is not linked to a trainee record"
      );
      return;
    }

    try {
      setRecommendationLoading(true);
      setRecommendationData(null);

      const response = await authFetch(
        `${API_URL}/api/skill-gaps/recommendations/${traineeId}`,
        {
          method: "POST"
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          "Failed to generate future skill recommendations"
        );
      }

      setRecommendationData(result);

    } catch (error) {
      console.error(
        "Future Skill Recommendation Error:",
        error
      );

      alert("ERROR: " + error.message);

    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleDeleteSkillGap = async gap => {
    const confirmDelete = window.confirm(
      `Delete skill gap for ${gap.trainee_id}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_URL}/api/skill-gaps/${gap.gap_id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete skill gap");
      }

      setSkillGaps(prev =>
        prev.filter(g => g.gap_id !== gap.gap_id)
      );

      alert("Skill gap deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("ERROR: " + error.message);
    }
  };

  return (
    <div className="content">

      <PageIntro
        title="Skill gap intelligence"
        text="Combine assessment results and employer signals to identify training gaps and remedial actions."
      />

      <Card
        title="Skill gap records"
        subtitle="AI-powered skill gap analysis"
      >

        <div style={{ marginBottom: "15px" }}>
          {isAdmin && (
            <button
  className="ai-skill-gap-button"
  onClick={() => {
    setForm({
      trainee_id: ""
    });

    setShowSkillForm(true);
  }}
>
  <span className="ai-skill-icon">✦</span>
  <span>Generate AI Skill Gap</span>
  <span className="ai-skill-arrow">→</span>
</button>
          )}
        </div>

        {isAdmin && showSkillForm && createPortal (
          <div className="modal-overlay">

            <div className="modal">

              <div className="modal-header">

                <h3>
                  Generate AI Skill Gap
                </h3>

                <button
                  className="modal-close"
                  onClick={resetForm}
                >
                  ×
                </button>

              </div>

              <div>

                <div>
                  <label>Trainee</label>

                  <select
                    value={form.trainee_id}
                    onChange={e =>
                      setForm({
                        trainee_id: e.target.value
                      })
                    }
                  >

                    <option value="">
                      Select trainee
                    </option>

                    {trainees.map(t => {
                      const traineeId =
                        t?.trainee_id ||
                        t?.id ||
                        "";

                      return (
                        <option
                          key={
                            traineeId ||
                            t?.email ||
                            t?.name
                          }
                          value={traineeId}
                        >
                          {traineeId} -{" "}
                          {t?.name || "Unknown Trainee"}
                        </option>
                      );
                    })}

                  </select>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >

                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "8px"
                    }}
                  >
                    AI Skill Gap Analysis
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Required skill, current level, required
                    level, gap score and recommendation will
                    be automatically calculated from the
                    trainee's existing skills and job
                    requirements.
                  </p>

                </div>

              </div>

              <div style={{ marginTop: "15px" }}>
<button
  className="ai-future-button"
  onClick={handleGenerateSkillGap}
>
  <span className="ai-button-icon">✦</span>
  <span>Generate AI Skill Gap</span>
</button>

                <button
                  className="secondary"
                  style={{ marginLeft: "10px" }}
                  onClick={resetForm}
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>,
          document.body
        )}

        <div className="table-wrap">

          <table className="data-table">

            <thead>
              <tr>
                <th>Gap ID</th>
                <th>Trainee ID</th>
                <th>Trainee Name</th>
                <th>Required Skill</th>
                <th>Current Level</th>
                <th>Required Level</th>
                <th>Gap Score</th>
                <th>Recommendation</th>
                <th>Actions</th>
              </tr>
            </thead>
<tbody>
  {skillGaps.length === 0 ? (
    <tr>
      <td colSpan="9">
        No skill gap records found.
      </td>
    </tr>
  ) : (
    Object.values(
      skillGaps.reduce((groups, gap) => {
        const traineeId = String(
          gap?.trainee_id || ""
        ).trim();

        if (!groups[traineeId]) {
          groups[traineeId] = [];
        }

        groups[traineeId].push(gap);

        return groups;
      }, {})
    ).map(traineeGaps => {
      const firstGap = traineeGaps[0];

      const gapTraineeId = String(
        firstGap?.trainee_id || ""
      ).trim();

      const trainee = trainees.find(t => {
        const traineeId = String(
          t?.trainee_id ||
          t?.id ||
          ""
        ).trim();

        return traineeId === gapTraineeId;
      });

      return (
        <tr key={gapTraineeId}>
          <td>
            <div className="skill-gap-group">
              {traineeGaps.map(gap => (
                <div
                  key={gap.gap_id}
                  className="skill-gap-item"
                >
                  {gap.gap_id}
                </div>
              ))}
            </div>
          </td>

          <td>
            {firstGap.trainee_id}
          </td>

          <td>
            {trainee?.name || "—"}
          </td>
          <td>{trainee?.name || "—"}</td>

          <td>
            <div className="skill-gap-group">
              {traineeGaps.map(gap => (
                <div
                  key={gap.gap_id}
                  className="skill-gap-item"
                >
                  {gap.required_skill || "—"}
                </div>
              ))}
            </div>
          </td>

          <td>
            <div className="skill-gap-group">
              {traineeGaps.map(gap => (
                <div
                  key={gap.gap_id}
                  className="skill-gap-item"
                >
                  {gap.current_level || "—"}
                </div>
              ))}
            </div>
          </td>

          <td>
            <div className="skill-gap-group">
              {traineeGaps.map(gap => (
                <div
                  key={gap.gap_id}
                  className="skill-gap-item"
                >
                  {gap.required_level || "—"}
                </div>
              ))}
            </div>
          </td>

          <td>
            <div className="skill-gap-group">
              {traineeGaps.map(gap => (
                <div
                  key={gap.gap_id}
                  className="skill-gap-item"
                >
                  {Number(gap.gap_score)}%
                </div>
              ))}
            </div>
          </td>

          <td>
            <div className="skill-gap-group recommendation-group">
              {traineeGaps.map(gap => (
                <div
                  key={gap.gap_id}
                  className="skill-gap-item"
                >
                  {gap.recommendation || "—"}
                </div>
              ))}
            </div>
          </td>

          <td>
            <div className="skill-gap-group">
              {isAdmin &&
                traineeGaps.map(gap => (
                  <div
                    key={gap.gap_id}
                    className="skill-gap-item"
                  >
                    <button
                      className="outline"
                      onClick={() =>
                        handleDeleteSkillGap(gap)
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          </td>
        </tr>
      );
    })
  )}
</tbody>

          </table>

        </div>

      </Card>


      <Card
        title="AI Future Skill Recommendations"
        subtitle={
          isAdmin
            ? "Personalized future skills based on trainee skills, skill gaps and market demand"
            : "Your personalized future skills based on your skills, skill gaps and market demand"
        }
      >

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "20px"
          }}
        >

          {isAdmin ? (

            <select
              value={selectedRecommendationTrainee}
              onChange={e => {
                setSelectedRecommendationTrainee(
                  e.target.value
                );

                setRecommendationData(null);
              }}
              style={{
                minWidth: "280px"
              }}
            >

              <option value="">
                Select trainee
              </option>

              {trainees.map(t => {

                const traineeId =
                  t?.trainee_id ||
                  t?.id ||
                  "";

                return (
                  <option
                    key={
                      traineeId ||
                      t?.email ||
                      t?.name
                    }
                    value={traineeId}
                  >
                    {traineeId} -{" "}
                    {t?.name || "Unknown Trainee"}
                  </option>
                );

              })}

            </select>

          ) : (

            <div
              style={{
                minWidth: "280px",
                padding: "11px 14px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "#f8fafc"
              }}
            >
              My Future Skill Recommendations
            </div>

          )}

  <button
  className="ai-future-button"
  onClick={handleGenerateRecommendations}
  disabled={
    recommendationLoading ||
    (!isAdmin && !userTraineeId)
  }
>
  <span className="ai-button-icon">✦</span>
  <span>
    {recommendationLoading
      ? "Analysing..."
      : "Generate Future Skills"}
  </span>
</button>

        </div>


        {!isAdmin && !userTraineeId && (
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              marginBottom: "20px"
            }}
          >
            Your account is not currently linked to a trainee
            record. Please contact the Administrator.
          </div>
        )}


        {recommendationData && (

          <div>

            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                marginBottom: "20px"
              }}
            >

              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "8px"
                }}
              >
                {recommendationData.trainee?.name ||
                  "Trainee"}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Trainee ID:{" "}
                {recommendationData.trainee?.trainee_id ||
                  "—"}
                {" • "}
                Course:{" "}
                {recommendationData.trainee?.course ||
                  "—"}
              </p>

            </div>


            <div className="grid two">

              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}
              >

                <h4>
                  Current Skills
                </h4>

                {recommendationData.currentSkills?.length === 0 ? (

                  <p>
                    No current skills recorded.
                  </p>

                ) : (

                  <div>

                    {recommendationData.currentSkills.map(
                      skill => (

                        <div
                          key={
                            skill.skill_id ||
                            skill.skill_name
                          }
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px 0",
                            borderBottom:
                              "1px solid #e2e8f0"
                          }}
                        >

                          <span>
                            {skill.skill_name}
                          </span>

                          <b>
                            {skill.skill_level}
                          </b>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}
              >

                <h4>
                  Existing Skill Gaps
                </h4>

                {recommendationData.skillGaps?.length === 0 ? (

                  <p>
                    No skill gaps available.
                  </p>

                ) : (

                  <div>

                    {recommendationData.skillGaps
                      .slice(0, 5)
                      .map((gap, index) => (

                        <div
                          key={
                            `${gap.required_skill}-${index}`
                          }
                          style={{
                            padding: "10px 0",
                            borderBottom:
                              "1px solid #e2e8f0"
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between"
                            }}
                          >

                            <span>
                              {gap.required_skill}
                            </span>

                            <b>
                              {Number(
                                gap.gap_score
                              )}%
                            </b>

                          </div>

                          <small>
                            {gap.current_level} →{" "}
                            {gap.required_level}
                          </small>

                        </div>

                      ))}

                  </div>

                )}

              </div>

            </div>


            <div style={{ marginTop: "20px" }}>

              <h3>
                Recommended Future Skills
              </h3>

              {recommendationData.recommendations?.length === 0 ? (

                <div
                  style={{
                    padding: "18px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    color: "#64748b"
                  }}
                >
                  No future skill recommendations
                  available for this trainee yet.
                </div>

              ) : (

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "16px"
                  }}
                >

                  {recommendationData.recommendations.map(
                    (recommendation, index) => {

                      const priority =
                        recommendation.priority ||
                        "Medium";

                      return (
                        <div
                          key={
                            `${recommendation.skill}-${index}`
                          }
                          style={{
                            padding: "18px",
                            borderRadius: "14px",
                            border:
                              "1px solid #e2e8f0",
                            background: "#ffffff"
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px"
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: "8px"
                              }}
                            >

                              <BrainCircuit
                                size={20}
                              />

                              <strong>
                                {recommendation.skill}
                              </strong>

                            </div>

                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                padding:
                                  "5px 9px",
                                borderRadius:
                                  "999px",
                                background:
                                  "#eef2ff"
                              }}
                            >
                              {priority}
                            </span>

                          </div>

                          <p
                            style={{
                              color: "#64748b",
                              margin:
                                "8px 0"
                            }}
                          >
                            {recommendation.reason}
                          </p>

                          <div
                            style={{
                              padding: "10px",
                              borderRadius: "8px",
                              background:
                                "#f8fafc",
                              fontSize: "13px"
                            }}
                          >

                            <strong>
                              Learning path:
                            </strong>

                            <div
                              style={{
                                marginTop:
                                  "5px"
                              }}
                            >
                              {recommendation.learningPath}
                            </div>

                          </div>

                        </div>
                      );

                    }
                  )}

                </div>

              )}

            </div>

          </div>

        )}

      </Card>


      <div className="grid two">

        <Card
          title="Skill gap matrix"
          subtitle="Current cohort"
        >

          <div className="skill-bars">

            {skills.map(([name, val, label]) => (

              <div
                className="skill-row"
                key={`${name}-${val}-${label}`}
              >

                <div>
                  <span>{name}</span>
                  <b>{val}%</b>
                </div>

                <div className="bar">

                  <i
                    style={{
                      width: val + "%"
                    }}
                  />

                </div>

                <small>
                  {label}
                </small>

              </div>

            ))}

          </div>

        </Card>


        <Card
          title="Recommended actions"
          subtitle="Rule-based recommendations"
        >

          <div className="recommend">

            <div>

              <BrainCircuit />

              <b>
                Cloud fundamentals
              </b>

              <p>
                {cloudGapCount} trainees show a measurable gap.
              </p>

              {isAdmin && (
                <button
                  className="primary"
                  onClick={() =>
                    setShowIntervention(true)
                  }
                >
                  Create intervention
                </button>
              )}

            </div>


            <div>

              <Target />

              <b>
                Communication
              </b>

              <p>
                {communicationGapCount} trainees need targeted practice.
              </p>

              <button
                className="secondary"
                onClick={() =>
                  setShowCohort(true)
                }
              >
                View cohort
              </button>

            </div>

          </div>

        </Card>

      </div>


      <Card
        title="Interventions"
        subtitle="Training actions created from skill gaps"
      >

        <div className="table-wrap">

          {interventions.length === 0 ? (

            <p>
              No interventions found.
            </p>

          ) : (

            <table className="data-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Intervention</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {interventions.map(item => (

                  <tr key={item.intervention_id}>

                    <td>
                      {item.intervention_id}
                    </td>

                    <td>
                      {item.intervention_name}
                    </td>

                    <td>
                      {item.description || "—"}
                    </td>

                    <td>
                      {new Date(
                        item.created_at
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>

                      {isAdmin && (
                        <button
                          className="outline"
                          onClick={() => {
                            setEditingIntervention(item);
                            setShowIntervention(true);
                          }}
                        >
                          Edit
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          className="outline"
                          style={{
                            marginLeft: "6px"
                          }}
                          onClick={async () => {

                            const confirmDelete =
                              window.confirm(
                                `Delete "${item.intervention_name}"?`
                              );

                            if (!confirmDelete) {
                              return;
                            }

                            try {

                              const response =
                                await authFetch(
                                  `${API_URL}/api/interventions/${item.intervention_id}`,
                                  {
                                    method: "DELETE"
                                  }
                                );

                              if (!response.ok) {
                                throw new Error(
                                  "Failed to delete intervention"
                                );
                              }

                              setInterventions(prev =>
                                prev.filter(
                                  intervention =>
                                    intervention.intervention_id !==
                                    item.intervention_id
                                )
                              );

                              alert(
                                "Intervention deleted successfully!"
                              );

                            } catch (error) {

                              console.error(error);

                              alert(
                                "ERROR: " +
                                error.message
                              );

                            }

                          }}
                        >
                          Delete
                        </button>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </Card>


      {isAdmin && showIntervention && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h3>
                {editingIntervention
                  ? "Edit intervention"
                  : "Create intervention"}
              </h3>

              <button
                className="modal-close"
                onClick={() => {
                  setShowIntervention(false);
                  setEditingIntervention(null);
                }}
              >
                ×
              </button>

            </div>

            <input
              id="intervention-name"
              type="text"
              placeholder="Intervention name"
              defaultValue={
                editingIntervention
                  ? editingIntervention.intervention_name
                  : ""
              }
              style={{
                marginTop: "12px",
                width: "100%"
              }}
            />

            <textarea
              id="intervention-description"
              placeholder="Describe the training or action"
              defaultValue={
                editingIntervention
                  ? editingIntervention.description || ""
                  : ""
              }
              style={{
                marginTop: "12px",
                width: "100%",
                minHeight: "100px"
              }}
            />

            <div style={{ marginTop: "15px" }}>

              <button
                className="primary"
                onClick={async () => {

                  const name =
                    document.getElementById(
                      "intervention-name"
                    ).value;

                  const description =
                    document.getElementById(
                      "intervention-description"
                    ).value;

                  if (!name.trim()) {
                    alert(
                      "Please enter intervention name"
                    );
                    return;
                  }

                  try {

                    const response =
                      await authFetch(
                        editingIntervention
                          ? `${API_URL}/api/interventions/${editingIntervention.intervention_id}`
                          : `${API_URL}/api/interventions`,
                        {
                          method: editingIntervention
                            ? "PUT"
                            : "POST",

                          headers: {
                            "Content-Type":
                              "application/json"
                          },

                          body: JSON.stringify({
                            intervention_name: name,
                            description: description
                          })
                        }
                      );

                    if (!response.ok) {
                      throw new Error(
                        "Failed to save intervention"
                      );
                    }

                    const result =
                      await response.json();

                    setInterventions(prev => {

                      if (editingIntervention) {

                        return prev.map(item =>
                          item.intervention_id ===
                          result.intervention.intervention_id
                            ? result.intervention
                            : item
                        );

                      }

                      return [
                        result.intervention,
                        ...prev
                      ];

                    });

                    alert(
                      "Intervention saved successfully!"
                    );

                    setShowIntervention(false);
                    setEditingIntervention(null);

                  } catch (error) {

                    console.error(error);

                    alert(
                      "ERROR: " +
                      error.message
                    );

                  }

                }}
              >
                {editingIntervention
                  ? "Update intervention"
                  : "Save intervention"}
              </button>

              <button
                className="secondary"
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  setShowIntervention(false);
                  setEditingIntervention(null);
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}


      {showCohort && (

        <div
          className="card"
          style={{
            marginTop: "20px"
          }}
        >

          <h3>
            Communication skill cohort
          </h3>

          <p>
            Trainees who may need targeted communication practice.
          </p>

          <div className="table-wrap">

            <table className="data-table">

              <thead>

                <tr>
                  <th>Trainee ID</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>
{trainees
  .filter(t => {

    const traineeId =
      t?.trainee_id ||
      t?.id ||
      "";

    return skillGaps.some(
      gap => {

        const gapTraineeId =
          gap?.trainee_id ||
          "";

        const skill =
          String(
            gap?.skill ||
            gap?.skill_name ||
            ""
          )
            .trim()
            .toLowerCase();

        return (
          String(
            gapTraineeId
          ).trim() ===
            String(
              traineeId
            ).trim() &&
          skill.includes("communication")
        );
      }
    );

  })
  .map(t => (

                    <tr
                      key={
                        t?.trainee_id ||
                        t?.id ||
                        t?.email ||
                        t?.name
                      }
                    >

                      <td>
                        {t?.trainee_id ||
                          t?.id ||
                          "—"}
                      </td>

                      <td>
                        {t?.name || "—"}
                      </td>

                      <td>
                        {t?.course || "—"}
                      </td>

                      <td>
                        {t?.status || "—"}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

          <button
            className="secondary"
            style={{
              marginTop: "15px"
            }}
            onClick={() =>
              setShowCohort(false)
            }
          >
            Close cohort
          </button>

        </div>

      )}

    </div>
  );
}
function FollowUps({
  trainees = [],
  followups = [],
  setFollowups
}) {
  const [showForm, setShowForm] = React.useState(false);

  const [formData, setFormData] = React.useState({
    trainee_id: "",
    followup_date: "",
    type: "Employment",
    response: "",
    status: "Pending",
    source: ""
  });

  const [saving, setSaving] = React.useState(false);

  const isAdmin =
    localStorage.getItem("skilltrack_role") === "admin";

  const [editingFollowup, setEditingFollowup] =
    React.useState(null);

  const [showEditForm, setShowEditForm] =
    React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();

    if (
      !formData.trainee_id ||
      !formData.followup_date ||
      !formData.type
    ) {
      alert(
        "Please select trainee, date and follow-up type."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await authFetch(
        `${API_URL}/api/followups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to add follow-up"
        );
      }

      setFollowups((prev) => [
        result.followup,
        ...prev
      ]);

      setFormData({
        trainee_id: "",
        followup_date: "",
        type: "Employment",
        response: "",
        status: "Pending",
        source: ""
      });

      setShowForm(false);

      alert("Follow-up added successfully!");
    } catch (error) {
      console.error(
        "Add follow-up error:",
        error
      );

      alert("ERROR: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditFollowup = async (e) => {
    e.preventDefault();

    if (
      !editingFollowup?.trainee_id ||
      !editingFollowup?.followup_date ||
      !editingFollowup?.type
    ) {
      alert(
        "Please select trainee, date and follow-up type."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await authFetch(
        `${API_URL}/api/followups/${editingFollowup.followup_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(editingFollowup)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to update follow-up"
        );
      }

      setFollowups((prev) =>
        prev.map((item) =>
          item.followup_id ===
          result.followup.followup_id
            ? result.followup
            : item
        )
      );

      setEditingFollowup(null);
      setShowEditForm(false);

      alert("Follow-up updated successfully!");
    } catch (error) {
      console.error(
        "Edit follow-up error:",
        error
      );

      alert("ERROR: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFollowup = async (followupId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this follow-up?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_URL}/api/followups/${followupId}`,
        {
          method: "DELETE"
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to delete follow-up"
        );
      }

      setFollowups((prev) =>
        prev.filter(
          (item) =>
            item.followup_id !== followupId
        )
      );

      alert("Follow-up deleted successfully!");
    } catch (error) {
      console.error(
        "Delete follow-up error:",
        error
      );

      alert("ERROR: " + error.message);
    }
  };

  const getTraineeId = (trainee) =>
    trainee?.trainee_id ||
    trainee?.id ||
    "";

  const getTraineeName = (trainee) =>
    trainee?.name ||
    trainee?.full_name ||
    "Unknown trainee";

  return (
    <div className="content followups-page">

      <PageIntro
        title="Follow-up center"
        text="Track trainee outcomes through scheduled follow-ups at 3, 6 and 12 months."
      />

      {/* ADD BUTTON */}

      {isAdmin && (
        <div className="followup-toolbar">
          <button
            type="button"
            className="followup-add-button"
            onClick={() => setShowForm(true)}
          >
            <span className="followup-add-icon">
              +
            </span>

            <span>
              Add Follow-up
            </span>
          </button>
        </div>
      )}

      {/* ADD FOLLOW-UP MODAL */}

      {showForm && createPortal (
        <div
          className="followup-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="followup-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="followup-modal-header">

              <div>
                <h3>
                  Add new follow-up
                </h3>

                <p>
                  Record a trainee outcome follow-up
                </p>
              </div>

              <button
                type="button"
                className="followup-close-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleAddFollowup}
              className="followup-form"
            >

              <div>
                <label className="form-label">
                  Trainee *
                </label>

                <select
                  name="trainee_id"
                  value={formData.trainee_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">
                    Select trainee
                  </option>

                  {trainees.map((t) => {
                    const traineeId =
                      getTraineeId(t);

                    return (
                      <option
                        key={traineeId}
                        value={traineeId}
                      >
                        {getTraineeName(t)} (
                        {traineeId}
                        )
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Follow-up Date *
                </label>

                <input
                  type="date"
                  name="followup_date"
                  value={
                    formData.followup_date
                  }
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Follow-up Type *
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="Employment">
                    Employment
                  </option>

                  <option value="Self Employment">
                    Self Employment
                  </option>

                  <option value="Job Retention">
                    Job Retention
                  </option>

                  <option value="Wage Progression">
                    Wage Progression
                  </option>

                  <option value="Training Relevance">
                    Training Relevance
                  </option>

                  <option value="Support Needed">
                    Support Needed
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Source
                </label>

                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">
                    Select source
                  </option>

                  <option value="Email">
                    Email
                  </option>

                  <option value="Employer">
                    Employer
                  </option>

                  <option value="Trainee">
                    Trainee
                  </option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </div>

              <div className="followup-full-width">
                <label className="form-label">
                  Outcome / Response
                </label>

                <textarea
                  name="response"
                  value={formData.response}
                  onChange={handleChange}
                  className="form-input"
                  rows="4"
                  placeholder="Enter trainee's employment or outcome information..."
                />
              </div>

              <div className="followup-form-actions">

                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Follow-up"}
                </button>

              </div>

            </form>
          </div>
        </div>,
         document.body
      )}

      {/* EDIT FOLLOW-UP MODAL */}

      {showEditForm && editingFollowup && (
        <div
          className="followup-modal-overlay"
          onClick={() => {
            setShowEditForm(false);
            setEditingFollowup(null);
          }}
        >
          <div
            className="followup-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="followup-modal-header">

              <div>
                <h3>
                  Edit follow-up
                </h3>

                <p>
                  Update trainee outcome follow-up
                </p>
              </div>

              <button
                type="button"
                className="followup-close-button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingFollowup(null);
                }}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleEditFollowup}
              className="followup-form"
            >

              <div>
                <label className="form-label">
                  Trainee *
                </label>

                <select
                  value={
                    editingFollowup.trainee_id ||
                    ""
                  }
                  onChange={(e) =>
                    setEditingFollowup(
                      (prev) => ({
                        ...prev,
                        trainee_id:
                          e.target.value
                      })
                    )
                  }
                  className="form-input"
                  required
                >
                  <option value="">
                    Select trainee
                  </option>

                  {trainees.map((t) => {
                    const traineeId =
                      getTraineeId(t);

                    return (
                      <option
                        key={traineeId}
                        value={traineeId}
                      >
                        {getTraineeName(t)} (
                        {traineeId}
                        )
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Follow-up Date *
                </label>

                <input
                  type="date"
                  value={
                    editingFollowup.followup_date
                      ? String(
                          editingFollowup.followup_date
                        ).slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingFollowup(
                      (prev) => ({
                        ...prev,
                        followup_date:
                          e.target.value
                      })
                    )
                  }
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Follow-up Type *
                </label>

                <select
                  value={
                    editingFollowup.type ||
                    "Employment"
                  }
                  onChange={(e) =>
                    setEditingFollowup(
                      (prev) => ({
                        ...prev,
                        type: e.target.value
                      })
                    )
                  }
                  className="form-input"
                  required
                >
                  <option value="Employment">
                    Employment
                  </option>

                  <option value="Self Employment">
                    Self Employment
                  </option>

                  <option value="Job Retention">
                    Job Retention
                  </option>

                  <option value="Wage Progression">
                    Wage Progression
                  </option>

                  <option value="Training Relevance">
                    Training Relevance
                  </option>

                  <option value="Support Needed">
                    Support Needed
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Source
                </label>

                <select
                  value={
                    editingFollowup.source ||
                    ""
                  }
                  onChange={(e) =>
                    setEditingFollowup(
                      (prev) => ({
                        ...prev,
                        source: e.target.value
                      })
                    )
                  }
                  className="form-input"
                >
                  <option value="">
                    Select source
                  </option>

                  <option value="Email">
                    Email
                  </option>

                  <option value="Employer">
                    Employer
                  </option>

                  <option value="Trainee">
                    Trainee
                  </option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Status
                </label>

                <select
                  value={
                    editingFollowup.status ||
                    "Pending"
                  }
                  onChange={(e) =>
                    setEditingFollowup(
                      (prev) => ({
                        ...prev,
                        status: e.target.value
                      })
                    )
                  }
                  className="form-input"
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </div>

              <div className="followup-full-width">
                <label className="form-label">
                  Outcome / Response
                </label>

                <textarea
                  value={
                    editingFollowup.response ||
                    ""
                  }
                  onChange={(e) =>
                    setEditingFollowup(
                      (prev) => ({
                        ...prev,
                        response:
                          e.target.value
                      })
                    )
                  }
                  className="form-input"
                  rows="4"
                  placeholder="Enter trainee's employment or outcome information..."
                />
              </div>

              <div className="followup-form-actions">

                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingFollowup(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >
                  {saving
                    ? "Updating..."
                    : "Update Follow-up"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* FOLLOW-UP QUEUE */}

      <Card
        title="Follow-up queue"
        subtitle={`${followups.length} follow-up record${
          followups.length !== 1
            ? "s"
            : ""
        } from database`}
      >
        <div className="follow-list large">

          {followups.length === 0 ? (
            <p>
              No follow-up records found.
            </p>
          ) : (
            followups.map((f) => {

              const trainee =
                trainees.find(
                  (t) =>
                    String(
                      getTraineeId(t)
                    ) ===
                    String(
                      f.trainee_id
                    )
                );

              return (
                <div
                  className="follow followup-card"
                  key={f.followup_id}
                >

                  {/* AVATAR */}

                  <div className="avatar small">
                    {trainee
                      ? getTraineeName(
                          trainee
                        )
                          .split(" ")
                          .map(
                            (x) =>
                              x[0]
                          )
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : String(
                          f.trainee_id ||
                            "NA"
                        )
                          .slice(0, 2)
                          .toUpperCase()}
                  </div>

                  {/* DETAILS */}

                  <div className="followup-details">

                    <b className="followup-trainee-name">
                      {trainee
                        ? getTraineeName(
                            trainee
                          )
                        : "Trainee " +
                          f.trainee_id}
                    </b>

                    <span>
                      <strong>
                        Trainee ID:
                      </strong>{" "}
                      {f.trainee_id}
                    </span>

                    <span>
                      <strong>
                        Type:
                      </strong>{" "}
                      {f.type ||
                        "Not specified"}
                    </span>

                    <span>
                      <strong>
                        Follow-up Date:
                      </strong>{" "}
                      {f.followup_date
                        ? new Date(
                            f.followup_date
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }
                          )
                        : "Not specified"}
                    </span>

                    <span>
                      <strong>
                        Outcome:
                      </strong>{" "}
                      {f.response ||
                        "No response recorded"}
                    </span>

                    <span>
                      <strong>
                        Source:
                      </strong>{" "}
                      {f.source ||
                        "Not specified"}
                    </span>

                  </div>

                  {/* STATUS */}

                  <div className="followup-status">

                    <label>
                      Status
                    </label>

                    <select
                      value={
                        f.status || ""
                      }
                      onChange={async (
                        e
                      ) => {

                        const newStatus =
                          e.target.value;

                        try {
                          const response =
                            await authFetch(
                              `${API_URL}/api/followups/${f.followup_id}`,
                              {
                                method:
                                  "PUT",
                                headers: {
                                  "Content-Type":
                                    "application/json"
                                },
                                body: JSON.stringify(
                                  {
                                    status:
                                      newStatus
                                  }
                                )
                              }
                            );

                          const result =
                            await response.json();

                          if (
                            !response.ok
                          ) {
                            throw new Error(
                              result.error ||
                                "Failed to update follow-up"
                            );
                          }

                          setFollowups(
                            (prev) =>
                              prev.map(
                                (
                                  item
                                ) =>
                                  item.followup_id ===
                                  result
                                    .followup
                                    .followup_id
                                    ? result.followup
                                    : item
                              )
                          );
                        } catch (
                          error
                        ) {
                          console.error(
                            error
                          );

                          alert(
                            "ERROR: " +
                              error.message
                          );
                        }
                      }}
                    >
                      <option value="">
                        Select status
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Completed">
                        Completed
                      </option>
                    </select>

                  </div>

                  {/* ADMIN ACTIONS */}

                  {isAdmin && (
                    <div className="followup-actions">

                      <button
                        type="button"
                        className="followup-edit-button"
                        onClick={() => {
                          setEditingFollowup(
                            {
                              ...f
                            }
                          );

                          setShowEditForm(
                            true
                          );
                        }}
                      >
                        <span>✎</span>
                        <span>
                          Edit
                        </span>
                      </button>

                      <button
                        type="button"
                        className="followup-delete-button"
                        onClick={() =>
                          handleDeleteFollowup(
                            f.followup_id
                          )
                        }
                      >
                        <span>🗑</span>
                        <span>
                          Delete
                        </span>
                      </button>

                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>
      </Card>

    </div>
  );
}

function Impact({ trainees = [], employment = [] }) {

  const employedTraineeIds = new Set(
    employment
      .filter(e => e.employer && e.employment_type)
      .map(e => e.trainee_id)
  );

  const employmentRate = trainees.length
    ? ((employedTraineeIds.size / trainees.length) * 100).toFixed(1)
    : 0;

  const salaries = employment
    .filter(
      e =>
        e.current_salary !== null &&
        e.current_salary !== undefined &&
        Number(e.current_salary) > 0
    )
    .map(e => Number(e.current_salary));

  const avgMonthlyWage = salaries.length
    ? Math.round(
        salaries.reduce((sum, salary) => sum + salary, 0) /
        salaries.length
      )
    : 0;

  const retentionEligible = employment.filter(
    e => e.retained !== null && e.retained !== undefined
  );

  const retainedCount = retentionEligible.filter(
    e => e.retained === true || e.retained === "true"
  ).length;

  const retentionRate = retentionEligible.length
    ? ((retainedCount / retentionEligible.length) * 100).toFixed(1)
    : 0;

  const totalEmploymentRecords = employment.length;
const courseStats = {};

trainees.forEach(t => {
  const course = t.course || "Unknown";

  if (!courseStats[course]) {
    courseStats[course] = {
      total: 0,
      employed: new Set()
    };
  }

  courseStats[course].total++;
});

employment.forEach(e => {
const trainee = trainees.find(
  t => t.trainee_id === e.trainee_id
);
  const course = trainee?.course || "Unknown";

  if (
    e.employer &&
    e.employment_type &&
    courseStats[course]
  ) {
    courseStats[course].employed.add(e.trainee_id);
  }
});

const courseData = Object.entries(courseStats).map(
  ([course, data]) => {

    const employed = data.employed.size;
    const notEmployed = Math.max(
      data.total - employed,
      0
    );

    return {
      course,
      employed,
      notEmployed,
      total: data.total
    };
  }
);

  return (
    <div className="content">

      <PageIntro
        title="Programme impact"
        text="Compare cohorts, providers and districts using longitudinal outcome evidence."
      />

      <div className="stats-grid">

        <Stat
          title="Employment Rate"
          value={`${employmentRate}%`}
          icon={UserCheck}
        />

        <Stat
          title="Avg. Monthly Wage"
          value={`₹${avgMonthlyWage.toLocaleString("en-IN")}`}
          icon={TrendingUp}
        />

        <Stat
          title="Retention Rate"
          value={`${retentionRate}%`}
          icon={ShieldCheck}
        />

        <Stat
          title="Employment Records"
          value={totalEmploymentRecords}
          icon={BriefcaseBusiness}
        />

      </div>
<Card
  title="Course-wise employment"
  subtitle="Employed and not employed trainees by course"
>
<div className="impact-chart impact-course-chart">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={courseData}
      layout="vertical"
      margin={{
        top: 12,
        right: 45,
        left: 10,
        bottom: 20
      }}
      barCategoryGap="20%"
      barGap={4}
    >
      <CartesianGrid
        strokeDasharray="3 5"
        horizontal={false}
        stroke="#dbe5ee"
      />

      <XAxis
        type="number"
        allowDecimals={false}
        axisLine={false}
        tickLine={false}
        tick={{
          fontSize: 11,
          fill: "#718096"
        }}
      />

      <YAxis
        type="category"
        dataKey="course"
        width={155}
        axisLine={false}
        tickLine={false}
        tick={{
          fontSize: 11,
          fill: "#4a6072",
          fontWeight: 600
        }}
      />

      <Tooltip
        cursor={{
          fill: "rgba(23, 105, 170, 0.045)"
        }}
        contentStyle={{
          background: "#ffffff",
          border: "1px solid #dce7f0",
          borderRadius: "12px",
          boxShadow: "0 10px 28px rgba(30, 60, 90, 0.14)",
          padding: "10px 13px"
        }}
        labelStyle={{
          color: "#173b5f",
          fontWeight: 700,
          marginBottom: 6
        }}
      />

      <Legend
        verticalAlign="bottom"
        height={28}
        iconType="circle"
        wrapperStyle={{
          fontSize: "12px",
          fontWeight: 600
        }}
      />

      <Bar
        dataKey="employed"
        name="Employed"
        fill="#012cec"
        barSize={10}
        radius={[0, 6, 6, 0]}
        animationBegin={100}
        animationDuration={900}
        animationEasing="ease-out"
      />

      <Bar
        dataKey="notEmployed"
        name="Not Employed"
        fill="#a1d2e9"
        barSize={10}
        radius={[0, 6, 6, 0]}
        animationBegin={250}
        animationDuration={1100}
        animationEasing="ease-out"
      />
    </BarChart>
  </ResponsiveContainer>
</div>
</Card>

      <Card
        title="Employment records"
        subtitle="Real employment data from database"
      >

     <div className="table-wrap impact-table-wrap">

          <table className="data-table">

            <thead>
              <tr>
                <th>Trainee</th>
                <th>Employer</th>
                <th>Job Role</th>
                <th>Employment Type</th>
                <th>Current Salary</th>
                <th>Retained</th>
              </tr>
            </thead>

            <tbody>

              {employment.length === 0 ? (

                <tr>
                  <td colSpan="6">
                    No employment records found.
                  </td>
                </tr>

              ) : (

                employment.map(item => {
  const trainee = trainees.find(
    t =>
      String(t?.trainee_id || t?.id || "").trim() ===
      String(item?.trainee_id || "").trim()
  );

  return (
                  <tr key={item.employment_id}>

                    <td>
  <div className="impact-trainee-cell">
    <span className="impact-trainee-icon">♙</span>
    <span>{item.trainee_id}</span>
  </div>
</td>

                    <td>{item.employer}</td>

                    <td>{item.job_role}</td>

                    <td>{item.employment_type}</td>

                    <td>
  <span className="impact-salary">
    ₹{Number(
      item.current_salary || 0
    ).toLocaleString("en-IN")}
  </span>
</td>
<td>
  <span
    className={
      item.retained
        ? "impact-retained-badge yes"
        : "impact-retained-badge no"
    }
  >
    <span>{item.retained ? "✓" : "×"}</span>
    {item.retained ? "Yes" : "No"}
  </span>
</td>

                  </tr>

                );
})

              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}

function Policy({
  trainees = [],
  training = [],
  employment = [],
  skillGaps = [],
  followups = []
}) {
  const [investment, setInvestment] = useState(60);
  const [simulation, setSimulation] = useState(null);

  const totalTrainees = trainees.length;

  const employedTrainees = new Set(
    employment
      .filter(item => item.employer && item.employment_type)
      .map(item => String(item.trainee_id))
  );

  const employmentRate = totalTrainees
    ? (employedTrainees.size / totalTrainees) * 100
    : 0;

  const completedFollowups = followups.filter(
    item => String(item.status || "").toLowerCase() === "completed"
  ).length;

  const followupCoverage = totalTrainees
    ? Math.min((completedFollowups / totalTrainees) * 100, 100)
    : 0;

  const traineesWithSkillGaps = new Set(
    skillGaps.map(item => String(item.trainee_id))
  );

  const skillGapCoverage = totalTrainees
    ? Math.min(
        ((totalTrainees - traineesWithSkillGaps.size) /
          totalTrainees) *
          100,
        100
      )
    : 0;

  const trainedTrainees = new Set(
    training.map(item => String(item.trainee_id))
  );

  const trainingCoverage = totalTrainees
    ? Math.min((trainedTrainees.size / totalTrainees) * 100, 100)
    : 0;

  const runSimulation = () => {
    if (!totalTrainees) {
      setSimulation({
        targetTrainees: 0,
        targetSkillGaps: 0,
        targetFollowups: 0,
        employmentRate: 0,
        trainingCoverage: 0,
        dataConfidence: 0
      });

      return;
    }

    const targetTrainees = Math.round(
      (totalTrainees * investment) / 100
    );

    const targetTraineeIds = new Set(
      trainees
        .map(item => String(item.trainee_id || item.id))
        .filter(Boolean)
        .slice(0, targetTrainees)
    );

    const targetSkillGaps = skillGaps.filter(item =>
      targetTraineeIds.has(String(item.trainee_id))
    ).length;

    const targetFollowups = followups.filter(item =>
      targetTraineeIds.has(String(item.trainee_id))
    ).length;

    const targetEmploymentRecords = employment.filter(item =>
      targetTraineeIds.has(String(item.trainee_id))
    );

    const targetEmployed = new Set(
      targetEmploymentRecords
        .filter(item => item.employer && item.employment_type)
        .map(item => String(item.trainee_id))
    ).size;

    const targetEmploymentRate = targetTrainees
      ? (targetEmployed / targetTrainees) * 100
      : 0;

    const targetTraining = training.filter(item =>
      targetTraineeIds.has(String(item.trainee_id))
    ).length;

    const targetTrainingCoverage = targetTrainees
      ? Math.min((new Set(
          training
            .filter(item =>
              targetTraineeIds.has(String(item.trainee_id))
            )
            .map(item => String(item.trainee_id))
        ).size / targetTrainees) * 100, 100)
      : 0;

    const availableSignals = [
      totalTrainees > 0,
      training.length > 0,
      employment.length > 0,
      skillGaps.length > 0,
      followups.length > 0
    ].filter(Boolean).length;

    const dataConfidence = Math.round(
      (availableSignals / 5) * 100
    );

    setSimulation({
      targetTrainees,
      targetSkillGaps,
      targetFollowups,
      targetTraining,
      employmentRate: targetEmploymentRate,
      trainingCoverage: targetTrainingCoverage,
      dataConfidence
    });
  };

  return (
    <div className="content">
      <PageIntro
        title="Policy simulator"
        text="Explore how a selected share of trainees could be prioritised using existing SkillTrack data. Results are scenario signals, not predictions."
      />

      <div className="grid two">
        <Card
          title="Scenario controls"
          subtitle="Choose the share of trainees to prioritise"
        >
          <label className="range-label">
            Programme investment <b>{investment}%</b>
          </label>

          <input
            className="range"
            type="range"
            min="0"
            max="100"
            value={investment}
            onChange={e => {
              setInvestment(Number(e.target.value));
              setSimulation(null);
            }}
          />

          <div className="scenario">
            <span>Current employment rate</span>
            <b>{employmentRate.toFixed(1)}%</b>
          </div>

          <div className="scenario">
            <span>Current training coverage</span>
            <b>{trainingCoverage.toFixed(1)}%</b>
          </div>

          <div className="scenario">
            <span>Current follow-up coverage</span>
            <b>{followupCoverage.toFixed(1)}%</b>
          </div>

          <button
            className="primary full"
            onClick={runSimulation}
          >
            Run simulation
          </button>
        </Card>

        <Card
          title="Scenario outputs"
          subtitle="Based on the selected trainee share"
        >
          {!simulation ? (
            <div className="big-output">
              —
              <small>
                Run the simulation to view scenario signals
              </small>
            </div>
          ) : (
            <>
              <div className="big-output">
                {simulation.targetTrainees}
                <small>
                  trainees in selected scenario
                </small>
              </div>

              <div className="mini-grid">
                <span>
                  Baseline employment
                  <b>
                    {simulation.employmentRate.toFixed(1)}%
                  </b>
                </span>

                <span>
                  Skill gaps in scenario
                  <b>{simulation.targetSkillGaps}</b>
                </span>

                <span>
                  Follow-ups in scenario
                  <b>{simulation.targetFollowups}</b>
                </span>

                <span>
                  Training coverage
                  <b>
                    {simulation.trainingCoverage.toFixed(1)}%
                  </b>
                </span>

                <span>
                  Training records
                  <b>{simulation.targetTraining}</b>
                </span>

                <span>
                  Data confidence
                  <b>{simulation.dataConfidence}%</b>
                </span>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
function LandingPage({ onLogin }) {
  return (
    <div className="landing-page">

      <nav className="landing-nav">

        <div className="landing-logo">
          <div className="landing-logo-icon">
            <BrainCircuit size={24} />
          </div>

          <div>
            <strong>SkillTrack</strong>
            <span>Skilling Outcomes Intelligence</span>
          </div>
        </div>

        <div className="landing-nav-links">

          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Features
          </button>

          <button
            onClick={() =>
              document
                .querySelector(".landing-how")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            How it works
          </button>

          <button
            className="landing-login-button"
            onClick={onLogin}
          >
            Login
            <ChevronRight size={16} />
          </button>

        </div>

      </nav>


      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="landing-hero">

        <div className="landing-hero-content">

          <span className="landing-badge">
            <Sparkles size={15} />
            Intelligent skilling outcomes platform
          </span>

          <h1>
            Track what happens
            <em> after training.</em>
          </h1>

          <p>
            SkillTrack helps training programmes monitor employment,
            retention, wage progression and skill gaps across the complete
            trainee lifecycle.
          </p>

          <div className="landing-actions">

            <button
              className="primary"
              onClick={onLogin}
            >
              Get Started
              <ChevronRight size={18} />
            </button>

            <button
              className="secondary"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Features
            </button>

          </div>

        </div>


        {/* DASHBOARD PREVIEW */}

        <div className="landing-dashboard-preview">

  {/* DASHBOARD HEADER */}

  <div className="preview-dashboard-header">

    <div className="preview-brand">

      <div className="preview-brand-icon">
        <BarChart3 size={20} />
      </div>

      <div>
        <span>Programme Overview</span>
        <strong>SkillTrack Dashboard</strong>
      </div>

    </div>

    <div className="preview-live">
      <i></i>
      LIVE DATA
    </div>

  </div>


  {/* KPI CARDS */}

  <div className="preview-kpis">

    <div className="preview-kpi kpi-blue">

      <div className="kpi-top">
        <span>Active Trainees</span>
        <Users size={17} />
      </div>

      <strong>1,248</strong>

      <small>
        <b>↑ 12%</b> vs last period
      </small>

    </div>


    <div className="preview-kpi kpi-green">

      <div className="kpi-top">
        <span>Employment Rate</span>
        <BriefcaseBusiness size={17} />
      </div>

      <strong>72.4%</strong>

      <small>
        <b>↑ 8.2%</b> vs last period
      </small>

    </div>


    <div className="preview-kpi kpi-purple">

      <div className="kpi-top">
        <span>Skill Gaps</span>
        <Target size={17} />
      </div>

      <strong>186</strong>

      <small>
        <b>↓ 15%</b> improvement
      </small>

    </div>


    <div className="preview-kpi kpi-orange">

      <div className="kpi-top">
        <span>Programme Impact</span>
        <TrendingUp size={17} />
      </div>

      <strong>4.2/5</strong>

      <small>
        <b>↑ 0.6</b> vs last period
      </small>

    </div>

  </div>


  {/* MAIN GRAPH AREA */}

  <div className="preview-main-grid">

    {/* EMPLOYMENT GRAPH */}

    <div className="preview-panel employment-panel">

      <div className="panel-heading">

        <div>
          <strong>Employment Outcomes</strong>
          <span>Trainee placement trend over time</span>
        </div>

        <button>
          Last 12 Months
          <ChevronRight size={13} />
        </button>

      </div>


      <div className="employment-chart">

        <div className="chart-y-labels">
          <span>1000</span>
          <span>750</span>
          <span>500</span>
          <span>250</span>
          <span>0</span>
        </div>


        <div className="chart-area">

          <div className="chart-grid-line line-1"></div>
          <div className="chart-grid-line line-2"></div>
          <div className="chart-grid-line line-3"></div>
          <div className="chart-grid-line line-4"></div>


          {/* Animated bars */}

          <div className="chart-bars">

            <i style={{height:"35%"}}></i>
            <i style={{height:"42%"}}></i>
            <i style={{height:"48%"}}></i>
            <i style={{height:"55%"}}></i>
            <i style={{height:"53%"}}></i>
            <i style={{height:"64%"}}></i>
            <i style={{height:"69%"}}></i>
            <i style={{height:"75%"}}></i>
            <i style={{height:"71%"}}></i>
            <i style={{height:"83%"}}></i>
            <i style={{height:"91%"}}></i>

          </div>


          {/* Animated trend */}

          <div className="trend-line">
            <span></span>
          </div>

        </div>

      </div>


      <div className="chart-months">

        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
        <span>Jan</span>
        <span>Feb</span>

      </div>


      <div className="chart-legend">

        <span>
          <i className="legend-blue"></i>
          Employed
        </span>

        <span>
          <i className="legend-purple"></i>
          Self-employed
        </span>

        <span>
          <i className="legend-green"></i>
          Apprenticeship
        </span>

      </div>

    </div>


    {/* EMPLOYMENT DISTRIBUTION */}

    <div className="preview-panel distribution-panel">

      <div className="panel-heading">

        <div>
          <strong>Employment Distribution</strong>
          <span>Current cohort</span>
        </div>

        <Users size={17} />

      </div>


      <div className="donut-area">

        <div className="donut-chart">

          <div className="donut-center">
            <strong>1,248</strong>
            <span>Trainees</span>
          </div>

        </div>


        <div className="donut-list">

          <div>
            <i className="dot-blue"></i>
            <span>Employed</span>
            <b>72%</b>
          </div>

          <div>
            <i className="dot-purple"></i>
            <span>Self-employed</span>
            <b>12%</b>
          </div>

          <div>
            <i className="dot-green"></i>
            <span>Apprenticeship</span>
            <b>8%</b>
          </div>

          <div>
            <i className="dot-orange"></i>
            <span>Seeking</span>
            <b>8%</b>
          </div>

        </div>

      </div>

    </div>

  </div>


  {/* LOWER DASHBOARD */}

  <div className="preview-bottom-grid">


    {/* WAGE */}

    <div className="preview-panel wage-panel">

      <div className="panel-heading">

        <div>
          <strong>Wage Progression</strong>
          <span>Average monthly wage</span>
        </div>

        <TrendingUp size={17} />

      </div>


      <div className="wage-chart">

        <div className="wage-line"></div>

        <span className="wage-point point-1"></span>
        <span className="wage-point point-2"></span>
        <span className="wage-point point-3"></span>
        <span className="wage-point point-4"></span>
        <span className="wage-point point-5"></span>

      </div>


      <div className="wage-result">
        ₹22,500
      </div>

    </div>


    {/* SKILL GAPS */}

    <div className="preview-panel skill-panel">

      <div className="panel-heading">

        <div>
          <strong>Top Skill Gaps</strong>
          <span>Assessment & employer feedback</span>
        </div>

        <Target size={17} />

      </div>


      <div className="skill-progress-list">

        <div>
          <span>Communication <b>42</b></span>
          <i>
            <em style={{width:"84%"}}></em>
          </i>
        </div>

        <div>
          <span>Digital Literacy <b>34</b></span>
          <i>
            <em style={{width:"68%"}}></em>
          </i>
        </div>

        <div>
          <span>Problem Solving <b>28</b></span>
          <i>
            <em style={{width:"56%"}}></em>
          </i>
        </div>

        <div>
          <span>Teamwork <b>21</b></span>
          <i>
            <em style={{width:"42%"}}></em>
          </i>
        </div>

      </div>

    </div>


    {/* ACTIVITY */}

    <div className="preview-panel activity-panel">

      <div className="panel-heading">

        <div>
          <strong>Recent Activity</strong>
          <span>Latest programme updates</span>
        </div>

      </div>


      <div className="activity-list">

        <div>
          <i className="activity-blue">
            <Users size={13} />
          </i>

          <span>
            <b>New trainee enrolled</b>
            2 hours ago
          </span>
        </div>


        <div>
          <i className="activity-red">
            <BriefcaseBusiness size={13} />
          </i>

          <span>
            <b>Employment updated</b>
            5 hours ago
          </span>
        </div>


        <div>
          <i className="activity-purple">
            <Target size={13} />
          </i>

          <span>
            <b>Skill assessment completed</b>
            1 day ago
          </span>
        </div>


        <div>
          <i className="activity-green">
            <TrendingUp size={13} />
          </i>

          <span>
            <b>Follow-up submitted</b>
            1 day ago
          </span>
        </div>

      </div>

    </div>

  </div>


  {/* DASHBOARD FOOTER */}

  <div className="preview-insight">

    <div>
      <strong>
        Better data. Better decisions. Greater impact.
      </strong>

      <span>
        SkillTrack connects training with real-world outcomes.
      </span>
    </div>

    <div className="insight-arrow">
      <TrendingUp size={18} />
    </div>

  </div>

</div>

      </section>


      {/* =====================================================
          FEATURES
          ===================================================== */}

      <section
        id="features"
        className="landing-features"
      >

        <div className="landing-section-heading">

          <span>CORE CAPABILITIES</span>

          <h2>
            Everything after training, in one place.
          </h2>

          <p>
            Connect trainee data, employment outcomes and skill intelligence
            to understand the real impact of skilling programmes.
          </p>

        </div>

<div className="landing-feature-grid">

  {/* TRAINEE */}

  <div className="landing-feature-card feature-blue">

    <div className="feature-card-top">
      <div className="feature-icon">
        <Users size={25} />
      </div>

      <span className="feature-number">01</span>
    </div>

    <h3>Trainee Lifecycle</h3>

    <p>
      Track every trainee from enrolment and training
      to certification, employment and long-term outcomes.
    </p>

    <div className="feature-mini-data">
      <strong>1,248+</strong>
      <span>Trainees tracked</span>
    </div>

    <div className="feature-bottom">
      <span>Complete journey</span>
      <ChevronRight size={15} />
    </div>

  </div>


  {/* EMPLOYMENT */}

  <div className="landing-feature-card feature-green">

    <div className="feature-card-top">
      <div className="feature-icon">
        <BriefcaseBusiness size={25} />
      </div>

      <span className="feature-number">02</span>
    </div>

    <h3>Employment Outcomes</h3>

    <p>
      Monitor employment type, employers, joining dates,
      wages, retention and career progression.
    </p>

    <div className="feature-mini-data">
      <strong>72.4%</strong>
      <span>Employment rate</span>
    </div>

    <div className="feature-bottom">
      <span>Outcome tracking</span>
      <ChevronRight size={15} />
    </div>

  </div>


  {/* SKILL GAP */}

  <div className="landing-feature-card feature-purple">

    <div className="feature-card-top">
      <div className="feature-icon">
        <Target size={25} />
      </div>

      <span className="feature-number">03</span>
    </div>

    <h3>Skill Gap Intelligence</h3>

    <p>
      Identify missing skills and connect assessment
      results with targeted training interventions.
    </p>

    <div className="feature-mini-data">
      <strong>186</strong>
      <span>Skill gaps identified</span>
    </div>

    <div className="feature-bottom">
      <span>Skill intelligence</span>
      <ChevronRight size={15} />
    </div>

  </div>


  {/* PROGRAMME IMPACT */}

  <div className="landing-feature-card feature-orange">

    <div className="feature-card-top">
      <div className="feature-icon">
        <TrendingUp size={25} />
      </div>

      <span className="feature-number">04</span>
    </div>

    <h3>Programme Impact</h3>

    <p>
      Understand employment, wage and retention outcomes
      across different training programmes.
    </p>

    <div className="feature-mini-data">
      <strong>4.2/5</strong>
      <span>Impact score</span>
    </div>

    <div className="feature-bottom">
      <span>Impact intelligence</span>
      <ChevronRight size={15} />
    </div>

  </div>

</div>
      </section>


      {/* =====================================================
          OUTCOME INTELLIGENCE
          ===================================================== */}

      {/* =====================================================
    OUTCOME INTELLIGENCE
    ===================================================== */}

<section className="landing-impact">

  <div className="landing-impact-heading">
    <span>OUTCOME INTELLIGENCE</span>

    <h2>
      See what happens
      <em> after training.</em>
    </h2>

    <p>
      SkillTrack connects training, employment and skill data
      to create a clearer picture of long-term skilling outcomes.
    </p>
  </div>


  <div className="landing-outcome-dashboard">

    {/* LEFT SIDE */}

    <div className="outcome-summary">

      <div className="outcome-summary-top">
        <div>
          <span>Overall programme outcome</span>
          <strong>72.4%</strong>
        </div>

        <div className="outcome-growth">
          +8.2%
          <small>outcome trend</small>
        </div>
      </div>


      <div className="outcome-progress">

        <div className="progress-label">
          <span>Employment</span>
          <b>72.4%</b>
        </div>

        <div className="progress-track">
          <i style={{ width: "72.4%" }}></i>
        </div>

      </div>


      <div className="outcome-progress">

        <div className="progress-label">
          <span>Retention</span>
          <b>64%</b>
        </div>

        <div className="progress-track">
          <i style={{ width: "64%" }}></i>
        </div>

      </div>


      <div className="outcome-progress">

        <div className="progress-label">
          <span>Skill readiness</span>
          <b>69%</b>
        </div>

        <div className="progress-track">
          <i style={{ width: "69%" }}></i>
        </div>

      </div>


      <div className="outcome-mini-stats">

        <div>
          <Users size={18} />
          <strong>1,248+</strong>
          <span>Trainees</span>
        </div>

        <div>
          <Target size={18} />
          <strong>186</strong>
          <span>Skill gaps</span>
        </div>

      </div>

    </div>


    {/* RIGHT SIDE */}

    <div className="outcome-chart-panel">

      <div className="outcome-chart-header">

        <div>
          <span>Employment outcomes</span>
          <strong>Outcome distribution</strong>
        </div>

        <BarChart3 size={20} />

      </div>


      <div className="outcome-chart">

        <div className="outcome-y-axis">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>


        <div className="outcome-bars">

          <div className="outcome-bar-item">
            <div className="outcome-bar-value">72%</div>
            <div
              className="outcome-bar"
              style={{ height: "72%" }}
            ></div>
            <span>Employed</span>
          </div>


          <div className="outcome-bar-item">
            <div className="outcome-bar-value">12%</div>
            <div
              className="outcome-bar"
              style={{ height: "12%" }}
            ></div>
            <span>Self-employed</span>
          </div>


          <div className="outcome-bar-item">
            <div className="outcome-bar-value">8%</div>
            <div
              className="outcome-bar"
              style={{ height: "8%" }}
            ></div>
            <span>Apprenticeship</span>
          </div>


          <div className="outcome-bar-item">
            <div className="outcome-bar-value">8%</div>
            <div
              className="outcome-bar"
              style={{ height: "8%" }}
            ></div>
            <span>Seeking</span>
          </div>

        </div>

      </div>


      <div className="outcome-chart-footer">

        <span>
          <i></i>
          Current cohort
        </span>

        <span>
          Based on programme outcome indicators
        </span>

      </div>

    </div>

  </div>

</section>


      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}
{/* =====================================================
    HOW IT WORKS
    ===================================================== */}

<section className="landing-how">

  <div className="landing-section-heading how-heading">

    <span>HOW IT WORKS</span>

    <h2>
      From training data to
      <em> actionable insight.</em>
    </h2>

    <p>
      SkillTrack follows the trainee journey from training to
      real-world outcomes, turning disconnected records into
      useful intelligence.
    </p>

  </div>


  <div className="journey-track">


    {/* STEP 01 */}

    <div className="journey-item">

      <div className="journey-number">
        01
      </div>

      <div className="journey-icon">
        <Users size={24} />
      </div>

      <div className="journey-content">

        <span className="journey-label">
          DATA COLLECTION
        </span>

        <h3>
          Collect
        </h3>

        <p>
          Bring trainee, training, attendance and assessment
          information together in one connected record.
        </p>

        <div className="journey-tag">
          ✓ Unified trainee data
        </div>

      </div>

    </div>


    <div className="journey-connector">
      <span></span>
    </div>


    {/* STEP 02 */}

    <div className="journey-item">

      <div className="journey-number">
        02
      </div>

      <div className="journey-icon">
        <BriefcaseBusiness size={24} />
      </div>

      <div className="journey-content">

        <span className="journey-label">
          OUTCOME CONNECTION
        </span>

        <h3>
          Connect
        </h3>

        <p>
          Link training records with employment, employers,
          wages, retention and follow-up information.
        </p>

        <div className="journey-tag">
          ✓ Longitudinal outcomes
        </div>

      </div>

    </div>


    <div className="journey-connector">
      <span></span>
    </div>


    {/* STEP 03 */}

    <div className="journey-item">

      <div className="journey-number">
        03
      </div>

      <div className="journey-icon">
        <BrainCircuit size={24} />
      </div>

      <div className="journey-content">

        <span className="journey-label">
          INTELLIGENCE
        </span>

        <h3>
          Understand
        </h3>

        <p>
          Identify employment trends, skill gaps and programme
          performance using connected outcome information.
        </p>

        <div className="journey-tag">
          ✓ Actionable intelligence
        </div>

      </div>

    </div>


    <div className="journey-connector">
      <span></span>
    </div>


    {/* STEP 04 */}

    <div className="journey-item">

      <div className="journey-number">
        04
      </div>

      <div className="journey-icon">
        <Target size={24} />
      </div>

      <div className="journey-content">

        <span className="journey-label">
          ACTION
        </span>

        <h3>
          Act
        </h3>

        <p>
          Use insights to design targeted interventions,
          improve training and strengthen future outcomes.
        </p>

        <div className="journey-tag">
          ✓ Better interventions
        </div>

      </div>

    </div>

  </div>


  {/* BOTTOM JOURNEY MESSAGE */}

  <div className="journey-result">

    <div className="journey-result-icon">
      <TrendingUp size={22} />
    </div>

    <div>
      <strong>
        From fragmented records to outcome intelligence
      </strong>

      <span>
        One connected journey. Better visibility. Smarter action.
      </span>
    </div>

  </div>

</section>


      {/* =====================================================
          CTA
          ===================================================== */}

     {/* =====================================================
    FINAL CTA
    ===================================================== */}

<section className="landing-cta">

  <div className="cta-glow cta-glow-one"></div>
  <div className="cta-glow cta-glow-two"></div>

  <div className="cta-content">

    <span className="cta-label">
      READY TO GET STARTED?
    </span>

    <h2>
      Turn training data into
      <span> meaningful outcomes.</span>
    </h2>

    <p>
      Explore SkillTrack and see how connected trainee,
      employment and skill data can support better
      skilling decisions.
    </p>

    <div className="cta-actions">

      <button
        className="primary cta-main-button"
        onClick={onLogin}
      >
        Enter SkillTrack
        <ChevronRight size={18} />
      </button>

      <button
        className="cta-secondary-button"
        onClick={() =>
          document
            .getElementById("features")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        Explore capabilities
      </button>

    </div>

  </div>


  {/* CTA MINI INSIGHTS */}

  <div className="cta-insights">

    <div className="cta-insight-card">

      <div className="cta-insight-icon">
        <Users size={19} />
      </div>

      <div>
        <strong>1,248+</strong>
        <span>Trainees tracked</span>
      </div>

    </div>


    <div className="cta-insight-card">

      <div className="cta-insight-icon">
        <TrendingUp size={19} />
      </div>

      <div>
        <strong>72.4%</strong>
        <span>Employment outcome</span>
      </div>

    </div>


    <div className="cta-insight-card">

      <div className="cta-insight-icon">
        <BrainCircuit size={19} />
      </div>

      <div>
        <strong>186</strong>
        <span>Skill gaps identified</span>
      </div>

    </div>

  </div>

</section>


{/* =====================================================
    FOOTER
    ===================================================== */}

<footer className="landing-footer">

  <div className="footer-main">

    <div className="footer-brand-block">

      <div className="footer-brand-logo">
        <BrainCircuit size={20} />
      </div>

      <div>
        <strong>SkillTrack</strong>

        <span>
          Skilling Outcomes Intelligence
        </span>
      </div>

    </div>


    <p className="footer-description">
      A connected platform for understanding what happens
      after training — from employment and retention to
      skill gaps and programme impact.
    </p>


    <div className="footer-navigation">

      <button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          })
        }
      >
        Home
      </button>

      <button
        onClick={() =>
          document
            .getElementById("features")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        Features
      </button>

      <button
        onClick={() =>
          document
            .querySelector(".landing-how")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        How it works
      </button>

      <button onClick={onLogin}>
        Login
      </button>

    </div>

  </div>


  <div className="footer-bottom">

    <span>
      © 2026 SkillTrack
    </span>

    <span>
      Prototype • Fictional demo data
    </span>

    <span>
      Built for smarter skilling outcomes
    </span>

  </div>

</footer>

    </div>
  );
}
function SignupPage({
  onSignup,
  onBack,
  googleProfile
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [signupStep, setSignupStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const [resendTimer, setResendTimer] = React.useState(0);
  React.useEffect(() => {
  if (!googleProfile) {
    return;
  }

  if (googleProfile.name) {
    setName(googleProfile.name);
  }

  if (googleProfile.email) {
    setEmail(googleProfile.email);
  }
}, [googleProfile]);

  React.useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleBackToLogin = (e) => {
    if (e) {
      e.preventDefault();
    }

    setSignupStep(1);
    setOtp("");
    setEmailVerified(false);
    setResendTimer(0);

    if (typeof onBack === "function") {
      onBack();
    }
  };

  const handleSendOTP = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !dateOfBirth ||
      !location.trim() ||
      !phone.trim() ||
      !aadhaar.trim() ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    const emailValue = email.trim().toLowerCase();
    const phoneValue = phone.replace(/\D/g, "");
    const aadhaarValue = aadhaar.replace(/\D/g, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(phoneValue)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{12}$/.test(aadhaarValue)) {
      alert("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password and Confirm Password do not match.");
      return;
    }

    try {
      setSendingOtp(true);

      const response = await fetch(
        `${API_URL}/api/auth/send-email-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: emailValue
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to send verification OTP."
        );
        return;
      }

      setEmailVerified(false);
      setOtp("");
      setSignupStep(2);
      setResendTimer(60);

      alert(
        "A verification OTP has been sent to your email. Please check your inbox."
      );
    } catch (error) {
      console.error(
        "Send email OTP error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      alert("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setVerifyingOtp(true);

      const response = await fetch(
        `${API_URL}/api/auth/verify-email-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "OTP verification failed."
        );
        return;
      }

      setEmailVerified(true);
      setResendTimer(0);

      alert(
        "Email verified successfully. You can now create your account."
      );
    } catch (error) {
      console.error(
        "Verify email OTP error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      alert(
        "Please verify your email using the OTP first."
      );
      return;
    }

    if (
      !/^\d{12}$/.test(
        aadhaar.replace(/\D/g, "")
      )
    ) {
      alert(
        "Please enter a valid 12-digit Aadhaar number."
      );
      return;
    }

    try {
      setCreatingAccount(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            date_of_birth: dateOfBirth,
            location: location.trim(),
            phone: phone.replace(/\D/g, ""),
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Account creation failed."
        );
        return;
      }

      if (data.user?.loginId) {
        alert(
          `Account created successfully!\n\n` +
          `Your Login ID is: ${data.user.loginId}\n\n` +
          `Please save this Login ID. You will use it with your password to login.`
        );
      } else {
        alert(
          "Account created successfully!"
        );
      }

      setName("");
      setEmail("");
      setDateOfBirth("");
      setLocation("");
      setPhone("");
      setAadhaar("");
      setPassword("");
      setConfirmPassword("");
      setSignupStep(1);
      setOtp("");
      setEmailVerified(false);
      setResendTimer(0);

      /*
       * Account create hone ke baad user ko
       * automatically login nahi karna hai.
       * Direct Login Page par bhejna hai.
       */
      handleBackToLogin();

    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* BRAND */}

        <div className="login-brand">

          <div className="landing-logo-icon">
            <BrainCircuit size={25} />
          </div>

          <div>
            <strong>SkillTrack</strong>

            <span>
              Skilling Outcomes Intelligence
            </span>
          </div>

        </div>


        {/* BACK TO LOGIN */}

        <button
          type="button"
          className="login-back"
          onClick={handleBackToLogin}
        >
          ← Back to Login
        </button>


        {/* HEADING */}

        <div className="login-heading">

          <h1>
            Create trainee account
          </h1>

          <p>
            {signupStep === 1
              ? "Enter your details to create your SkillTrack account."
              : "Verify your email to complete account creation."}
          </p>

        </div>


        {/* STEP INDICATOR */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px"
          }}
        >

          <div
            style={{
              flex: 1,
              height: "6px",
              borderRadius: "10px",
              background:
                signupStep >= 1
                  ? "#1769aa"
                  : "#dbe5ee"
            }}
          />

          <div
            style={{
              flex: 1,
              height: "6px",
              borderRadius: "10px",
              background:
                signupStep >= 2
                  ? "#1769aa"
                  : "#dbe5ee"
            }}
          />

        </div>


        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#66788a",
            marginBottom: "20px"
          }}
        >

          <span
            style={{
              fontWeight:
                signupStep === 1
                  ? 700
                  : 500,
              color:
                signupStep === 1
                  ? "#1769aa"
                  : "#66788a"
            }}
          >
            1. Account Details
          </span>

          <span
            style={{
              fontWeight:
                signupStep === 2
                  ? 700
                  : 500,
              color:
                signupStep === 2
                  ? "#1769aa"
                  : "#66788a"
            }}
          >
            2. Email Verification
          </span>

        </div>


        {/* FORM */}

        <form
          onSubmit={
            signupStep === 1
              ? handleSendOTP
              : handleSignup
          }
        >

          {/* ==================================================
              STEP 1
          ================================================== */}

          {signupStep === 1 && (
            <>

              {/* NAME */}

              <label>
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                autoComplete="name"
              />


              {/* EMAIL */}

              <label>
                Email
              </label>

              <input
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
  autoComplete="email"
  readOnly={!!googleProfile}
  style={{
    background: googleProfile
      ? "#f3f6f9"
      : "#ffffff",
    cursor: googleProfile
      ? "not-allowed"
      : "text"
  }}
/>


              {/* DOB */}

              <label>
                Date of Birth
              </label>

              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) =>
                  setDateOfBirth(e.target.value)
                }
              />


              {/* LOCATION */}

              <label>
                Location
              </label>

              <input
                type="text"
                placeholder="Enter your city / district"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                autoComplete="address-level2"
              />


              {/* PHONE */}

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                autoComplete="tel"
              />


              {/* AADHAAR */}

              <label>
                Aadhaar Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="Enter 12-digit Aadhaar number"
                value={aadhaar}
                onChange={(e) =>
                  setAadhaar(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                autoComplete="off"
              />

              <div
                style={{
                  fontSize: "12px",
                  color: "#66788a",
                  marginTop: "-8px",
                  marginBottom: "16px",
                  lineHeight: "1.5"
                }}
              >
                Aadhaar is collected as an account detail.
                Real UIDAI verification is not being performed
                through this email OTP flow.
              </div>


              {/* PASSWORD */}

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
              />


              {/* CONFIRM PASSWORD */}

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
              />


              {confirmPassword &&
                password !== confirmPassword && (
                  <div
                    style={{
                      color: "#d93025",
                      fontSize: "13px",
                      marginTop: "-8px",
                      marginBottom: "12px"
                    }}
                  >
                    Passwords do not match.
                  </div>
                )}

              {confirmPassword &&
                password === confirmPassword && (
                  <div
                    style={{
                      color: "#188038",
                      fontSize: "13px",
                      marginTop: "-8px",
                      marginBottom: "12px"
                    }}
                  >
                    Passwords match.
                  </div>
                )}


              {/* SEND OTP */}

              <button
                className="primary login-button"
                type="submit"
                disabled={sendingOtp}
              >
                {sendingOtp
                  ? "Sending OTP..."
                  : "Send OTP to Email"}

                {!sendingOtp && (
                  <ChevronRight size={17} />
                )}
              </button>

            </>
          )}


          {/* ==================================================
              STEP 2
          ================================================== */}

          {signupStep === 2 && (
            <>

              <div
                style={{
                  padding: "18px",
                  marginBottom: "20px",
                  border: "1px solid #dbe5ee",
                  borderRadius: "14px",
                  background: "#f7fafc"
                }}
              >

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "#17324d",
                    marginBottom: "7px"
                  }}
                >
                  Email Verification
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#66788a",
                    lineHeight: "1.5"
                  }}
                >
                  A real 6-digit verification OTP
                  has been sent to:
                </p>

                <div
                  style={{
                    marginTop: "8px",
                    fontWeight: 700,
                    color: "#1769aa",
                    wordBreak: "break-word"
                  }}
                >
                  {email}
                </div>

              </div>


              {/* OTP */}

              <label>
                Email OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                autoComplete="one-time-code"
              />


              {/* VERIFY OTP */}

              {!emailVerified && (
                <button
                  type="button"
                  className="primary login-button"
                  onClick={handleVerifyOTP}
                  disabled={verifyingOtp}
                >
                  {verifyingOtp
                    ? "Verifying..."
                    : "Verify Email OTP"}

                  {!verifyingOtp && (
                    <ChevronRight size={17} />
                  )}
                </button>
              )}


              {/* RESEND OTP */}

              {!emailVerified && (
                <button
                  type="button"
                  className="login-back"
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    textAlign: "center",
                    cursor:
                      resendTimer > 0
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      resendTimer > 0
                        ? 0.6
                        : 1
                  }}
                  onClick={handleSendOTP}
                  disabled={
                    sendingOtp ||
                    resendTimer > 0
                  }
                >
                  {sendingOtp
                    ? "Sending OTP..."
                    : resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : "Resend OTP"}
                </button>
              )}


              {/* VERIFIED */}

              {emailVerified && (
                <div
                  style={{
                    padding: "12px 14px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#eaf7ee",
                    color: "#188038",
                    fontSize: "13px",
                    fontWeight: 600
                  }}
                >
                  ✓ Email verified successfully
                </div>
              )}


              {/* CREATE ACCOUNT */}

              {emailVerified && (
                <button
                  className="primary login-button"
                  type="submit"
                  disabled={creatingAccount}
                >
                  {creatingAccount
                    ? "Creating Account..."
                    : "Create Account"}

                  {!creatingAccount && (
                    <ChevronRight size={17} />
                  )}
                </button>
              )}


              {/* BACK TO ACCOUNT DETAILS */}

              <button
                type="button"
                className="login-back"
                style={{
                  marginTop: "14px"
                }}
                onClick={() =>
                  setSignupStep(1)
                }
              >
                ← Back to account details
              </button>

            </>
          )}

        </form>


        {/* SIGN IN */}

        <p className="login-demo">

          Already have an account?{" "}

          <button
            type="button"
            className="signup-link"
            onClick={handleBackToLogin}
          >
            Sign in
          </button>

        </p>

      </div>

    </div>
  );
}
function LoginPage({
  onLogin,
  onBack,
  onSignup,
  onGoogleProfileRequired
}) {
  
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // =========================
  // FORGOT PASSWORD STATES
  // =========================
  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [forgotStep, setForgotStep] = useState(1);

  const [forgotLoginId, setForgotLoginId] =
    useState("");

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [resetToken, setResetToken] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmNewPassword, setShowConfirmNewPassword] =
    useState(false);


  // ======================================================
  // LOGIN
  // ======================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId || !password) {
      alert("Please enter Login ID and password.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            loginId,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Login failed"
        );
        return;
      }

      localStorage.setItem(
        "skilltrack_token",
        data.token
      );

      localStorage.setItem(
        "skilltrack_role",
        data.user.role
      );

      alert("Login successful!");

      onLogin(data.user);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    }
  };


  // ======================================================
  // GOOGLE LOGIN
  // ======================================================
  const handleGoogleLogin = async () => {
  if (googleLoading) return;

  setGoogleLoading(true);

  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(
      auth,
      provider
    );

    const firebaseToken =
      await result.user.getIdToken();

    const response = await fetch(
      `${API_URL}/api/auth/social-login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firebaseToken
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message ||
        "Google login failed"
      );
      return;
    }

    // ============================================
    // EXISTING SKILLTRACK ACCOUNT
    // ============================================

    if (data.status === "LOGIN_SUCCESS") {
      localStorage.setItem(
        "skilltrack_token",
        data.token
      );

      localStorage.setItem(
        "skilltrack_role",
        data.user.role
      );

      alert(
        "Google login successful!"
      );

      onLogin(data.user);

      return;
    }

    // ============================================
    // NEW GOOGLE USER
    // ============================================

    if (
      data.status === "PROFILE_REQUIRED"
    ) {
      if (
        typeof onGoogleProfileRequired ===
        "function"
      ) {
        onGoogleProfileRequired(
          data.googleProfile
        );
      }

      return;
    }

    alert(
      "Unable to continue with Google."
    );

  } catch (error) {
    console.error(
      "Google login error:",
      error
    );

    if (
      error.code ===
      "auth/popup-closed-by-user"
    ) {
      return;
    }

    if (
      error.code ===
      "auth/popup-blocked"
    ) {
      alert(
        "Please allow popups for SkillTrack."
      );
      return;
    }

    alert(
      "Google login failed. Please try again."
    );

  } finally {
    setGoogleLoading(false);
  }
};

  // ======================================================
  // VERIFY FORGOT PASSWORD
  // ======================================================
  const handleForgotVerification =
    async (e) => {
      e.preventDefault();

      if (
        !forgotLoginId.trim() ||
        !forgotEmail.trim()
      ) {
        alert(
          "Please enter Login ID and registered email."
        );
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/forgot-password`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                loginId:
                  forgotLoginId.trim(),
                email:
                  forgotEmail.trim().toLowerCase()
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
            "Verification failed."
          );
          return;
        }

        setResetToken(
          data.resetToken
        );

        setForgotStep(2);

      } catch (error) {
        console.error(
          "Forgot password error:",
          error
        );

        alert(
          "Unable to connect to server."
        );
      }
    };


  // ======================================================
  // RESET PASSWORD
  // ======================================================
  const handleResetPassword =
    async (e) => {
      e.preventDefault();

      if (
        !newPassword ||
        !confirmNewPassword
      ) {
        alert(
          "Please enter new password and confirm password."
        );
        return;
      }

      if (newPassword.length < 6) {
        alert(
          "Password must be at least 6 characters long."
        );
        return;
      }

      if (
        newPassword !==
        confirmNewPassword
      ) {
        alert(
          "New Password and Confirm Password do not match."
        );
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/reset-password`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                resetToken,
                newPassword
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
            "Password reset failed."
          );
          return;
        }

        alert(
          "Password reset successfully! Please login with your new password."
        );

        setShowForgotPassword(false);
        setForgotStep(1);

        setForgotLoginId("");
        setForgotEmail("");
        setResetToken("");
        setNewPassword("");
        setConfirmNewPassword("");

      } catch (error) {
        console.error(
          "Reset password error:",
          error
        );

        alert(
          "Unable to connect to server."
        );
      }
    };


  // ======================================================
  // FORGOT PASSWORD SCREEN
  // ======================================================
  if (showForgotPassword) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-brand">

            <div className="login-brand-icon">
              <BrainCircuit size={27} />
            </div>

            <div>
              <strong>
                SkillTrack
              </strong>

              <span>
                Skilling Outcomes Intelligence
              </span>
            </div>

          </div>


          <button
            type="button"
            className="login-back"
            onClick={() => {
              setShowForgotPassword(false);
              setForgotStep(1);
            }}
          >
            ← Back to Login
          </button>


          <div className="login-heading">

            <div className="login-welcome">
              Account Recovery
            </div>

            <h1>
              Forgot password?
            </h1>

            <p>
              {forgotStep === 1
                ? "Verify your Login ID and registered email."
                : "Create a new password for your SkillTrack account."}
            </p>

          </div>


          {/* STEP 1 */}
          {forgotStep === 1 && (
            <form
              onSubmit={
                handleForgotVerification
              }
            >

              <div className="login-field">

                <label>
                  Login ID
                </label>

                <input
                  type="text"
                  placeholder="Enter your Login ID"
                  value={forgotLoginId}
                  onChange={(e) =>
                    setForgotLoginId(
                      e.target.value
                    )
                  }
                  autoComplete="username"
                />

              </div>


              <div className="login-field">

                <label>
                  Registered Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) =>
                    setForgotEmail(
                      e.target.value
                    )
                  }
                  autoComplete="email"
                />

              </div>


              <button
                className="primary login-button"
                type="submit"
              >
                <span>
                  Verify Account
                </span>

                <ChevronRight size={18} />
              </button>

            </form>
          )}


          {/* STEP 2 */}
          {forgotStep === 2 && (
            <form
              onSubmit={
                handleResetPassword
              }
            >

              <div className="login-field">

                <label>
                  New Password
                </label>

                <div className="password-input-wrap">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  >
                    {showNewPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              <div className="login-field">

                <label>
                  Confirm New Password
                </label>

                <div className="password-input-wrap">

                  <input
                    type={
                      showConfirmNewPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Re-enter new password"
                    value={
                      confirmNewPassword
                    }
                    onChange={(e) =>
                      setConfirmNewPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmNewPassword(
                        !showConfirmNewPassword
                      )
                    }
                  >
                    {showConfirmNewPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {confirmNewPassword &&
                newPassword !==
                  confirmNewPassword && (
                  <div
                    style={{
                      color: "#d93025",
                      fontSize: "13px",
                      marginTop: "-8px",
                      marginBottom: "12px"
                    }}
                  >
                    Passwords do not match.
                  </div>
                )}


              {confirmNewPassword &&
                newPassword ===
                  confirmNewPassword && (
                  <div
                    style={{
                      color: "#188038",
                      fontSize: "13px",
                      marginTop: "-8px",
                      marginBottom: "12px"
                    }}
                  >
                    Passwords match.
                  </div>
                )}


              <button
                className="primary login-button"
                type="submit"
              >
                <span>
                  Reset Password
                </span>

                <ChevronRight size={18} />
              </button>

            </form>
          )}

        </div>

      </div>
    );
  }


  // ======================================================
  // NORMAL LOGIN SCREEN
  // ======================================================
  return (
    <div className="login-page">

      <div className="login-card">

        {/* LOGO */}
        <div className="login-brand">

          <div className="login-brand-icon">
            <BrainCircuit size={27} />
          </div>

          <div>
            <strong>
              SkillTrack
            </strong>

            <span>
              Skilling Outcomes Intelligence
            </span>
          </div>

        </div>


        {/* HEADING */}
        <div className="login-heading">

          <div className="login-welcome">
            Welcome back
          </div>

          <h1>
            Sign in to SkillTrack
          </h1>

          <p>
            Access your skilling outcomes dashboard
            and continue where you left off.
          </p>

        </div>


        {/* LOGIN */}
        <form onSubmit={handleLogin}>

          <div className="login-field">

            <label>
              Login ID
            </label>

            <input
              type="text"
              placeholder="Enter your Login ID"
              value={loginId}
              onChange={(e) =>
                setLoginId(
                  e.target.value
                )
              }
              autoComplete="username"
            />

          </div>


          <div className="login-field">

            <div className="password-label-row">

              <label>
                Password
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  setShowForgotPassword(
                    true
                  );
                  setForgotStep(1);
                }}
              >
                Forgot password?
              </button>

            </div>


            <div className="password-input-wrap">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          {/* LOGIN BUTTON */}
          <button
            className="primary login-button"
            type="submit"
          >
            <span>
              Sign in
            </span>

            <ChevronRight size={18} />

          </button>

        </form>


        {/* DIVIDER */}
        <div className="login-divider">

          <span></span>

          <b>OR</b>

          <span></span>

        </div>


        {/* SOCIAL LOGIN */}
        <div className="social-login">

          {/* GOOGLE */}
          <button
            type="button"
            className="social-button"
            onClick={
              handleGoogleLogin
            }
            disabled={googleLoading}
          >

            <strong className="google-letter">
              G
            </strong>

            {googleLoading
              ? "Connecting..."
              : "Continue with Google"}

          </button>


          {/* FACEBOOK */}
          <button
            type="button"
            className="social-button"
            onClick={async () => {

              try {

                const provider =
                  new FacebookAuthProvider();

                provider.addScope("email");

                const result =
                  await signInWithPopup(
                    auth,
                    provider
                  );

                const firebaseToken =
                  await result.user.getIdToken();

                const response =
                  await fetch(
                    `${API_URL}/api/auth/social-login`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type":
                          "application/json"
                      },
                      body: JSON.stringify({
                        firebaseToken
                      })
                    }
                  );

                const data =
                  await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.message ||
                    "Facebook login failed"
                  );
                }

                localStorage.setItem(
                  "skilltrack_token",
                  data.token
                );

                localStorage.setItem(
                  "skilltrack_role",
                  data.user.role
                );

                onLogin(data.user);

              } catch (error) {

                console.error(
                  "Facebook login error:",
                  error
                );

                alert(
                  error.message ||
                  "Facebook login failed"
                );
              }

            }}
          >

            <strong className="facebook-letter">
              f
            </strong>

            Continue with Facebook

          </button>

        </div>


        {/* SIGN UP */}
        <p className="login-signup">

          Don't have an account?

          <button
            type="button"
            className="signup-link"
            onClick={onSignup}
          >
            Create account
          </button>

        </p>


        {/* BACK */}
        <button
          type="button"
          className="login-back"
          onClick={onBack}
        >
          <span>←</span>
          Back to Home
        </button>


        {/* SECURITY NOTE */}
        <div className="login-security-note">

          <span>●</span>

          Secure SkillTrack access

        </div>

      </div>

    </div>
  );
}
createRoot(document.getElementById("root")).render(<App/>);
