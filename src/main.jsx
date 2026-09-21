

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard, Users, GraduationCap, BriefcaseBusiness, Target,
  Bell, Search, Menu, X, ChevronRight, CheckCircle2, Clock3,
  AlertTriangle, TrendingUp, TrendingDown, MapPin, Phone, Mail,
  ShieldCheck, FileText, Settings, LogOut, BarChart3, Sparkles,
  UserCheck, Building2, BrainCircuit, Send, Filter, Download
} from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import "./styles.css";

const API_URL = "https://skilltrack-cziu.onrender.com";
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
function App(){
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
  const handleOutsideClick = (event) => {
    if (
      !event.target.closest(".avatar") &&
      !event.target.closest(".user-menu")
    ) {
      setShowUserMenu(false);
    }
  };

  document.addEventListener("click", handleOutsideClick);

  return () => {
    document.removeEventListener("click", handleOutsideClick);
  };
}, []);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [page,setPage] = useState("Dashboard");
  const [mobile,setMobile] = useState(false);
  const [query,setQuery] = useState("");
  const [trainees,setTrainees] = useState([]);
  const [training, setTraining] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const handleTraineeAdded = (newTrainee) => {
  const formattedTrainee = {
    id: newTrainee.trainee_id,
    name: newTrainee.name,
    course: newTrainee.course,
    status: newTrainee.status,
    provider: newTrainee.provider,
    gender: newTrainee.gender,
    age: newTrainee.age,
    trainingYear: newTrainee.training_year,
    company: "—",
    salary: 0,
    gap: "—",
    city: newTrainee.district,
    progress: newTrainee.confidence
  };

  setTrainees(prev => {
    const exists = prev.some(t => t.id === formattedTrainee.id);

    if (exists) {
      return prev.map(t =>
        t.id === formattedTrainee.id
          ? formattedTrainee
          : t
      );
    }

    return [...prev, formattedTrainee];
  });
};

const handleDeleteTrainee = async (trainee) => {
  try {
    const response = await authFetch(
      `${API_URL}/api/trainees/${trainee.id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete trainee");
    }

    setTrainees(prev =>
      prev.filter(t => t.id !== trainee.id)
    );

    alert("Trainee deleted successfully!");

  } catch (error) {
    console.error(error);
    alert("ERROR: " + error.message);
  }
};
useEffect(() => {
 authFetch(`${API_URL}/api/training`)
    .then(res => res.json())
    .then(data => {
      setTraining(data);
    })
    .catch(err => {
      console.error("Training fetch error:", err);
    });
}, []);
useEffect(() => {
  authFetch(`${API_URL}/api/skill-gaps`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch skill gaps");
      }
      return res.json();
    })
    .then(data => {
      setSkillGaps(data);
    })
    .catch(err => {
      console.error("Skill gap fetch error:", err);
    });
}, []);
useEffect(() => {
  authFetch(`${API_URL}/api/employment`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch employment");
      }
      return res.json();
    })
    .then(data => {
      setEmployment(data);
    })
    .catch(err => {
      console.error("Employment fetch error:", err);
    });
}, []);
useEffect(() => {
  authFetch(`${API_URL}/api/followups`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch follow-ups");
      }
      return res.json();
    })
    .then(data => {
      setFollowups(data);
    })
    .catch(err => {
      console.error("Follow-up fetch error:", err);
    });
}, []);

  useEffect(() => {
  authFetch(`${API_URL}/api/employers`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch employers");
      }
      return res.json();
    })
    .then(data => {
      setEmployers(data);
    })
    .catch(err => {
      console.error("Employer fetch error:", err);
    });
}, []);
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await authFetch(
  `${API_URL}/api/notifications`
);

      const data = await response.json();

      if (response.ok) {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  };

  fetchNotifications();
}, []);
useEffect(() => {
  const handleOutsideClick = (event) => {
    if (
      !event.target.closest(".avatar") &&
      !event.target.closest(".user-menu")
    ) {
      setShowUserMenu(false);
    }

    if (
      !event.target.closest(".icon-btn") &&
      !event.target.closest(".notification-panel")
    ) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("click", handleOutsideClick);

  return () => {
    document.removeEventListener("click", handleOutsideClick);
  };
}, []);

  useEffect(() => {
    authFetch(`${API_URL}/api/trainees`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch trainees");
        }
        return response.json();
      })
      .then(data => {
        const formattedData = data.map(t => ({
  id: t.trainee_id,
  name: t.name,
  course: t.course,
  status: t.status,
  provider: t.provider,
  gender: t.gender,
  age: t.age,
  trainingYear: t.training_year,
  company: "—",
  salary: 0,
  gap: "—",
  city: t.district,
  progress: t.confidence
}));

        setTrainees(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Unable to connect to backend");
        setLoading(false);
      });
  }, []);
  const nav = [
    ["Dashboard", LayoutDashboard],
    ["Trainees", Users],
    ["Training", GraduationCap],
    ["Employment Outcomes", BriefcaseBusiness],
    ["Skill Gaps", Target],
    ["Follow-up Center", Bell],
    ["Programme Impact", BarChart3],
    ["Policy Simulator", BrainCircuit],
  ];
 if (!isLoggedIn) {
  if (showSignup) {
    return (
      <SignupPage
        onSignup={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
        onBack={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />
    );
  }

  if (showLogin) {
    return (
     <LoginPage
  onLogin={(user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  }}
  onBack={() => setShowLogin(false)}
  onSignup={() => setShowSignup(true)}
/>
    );
  }

  return (
    <LandingPage
      onLogin={() => setShowLogin(true)}
    />
  );
}
  return ( 
    <div className="app">
      <aside className={`sidebar ${mobile ? "open":""}`}>
        <div className="brand">
          <div className="brand-mark"><TrendingUp size={25}/></div>
          <div><strong>SkillTrack</strong><span>Skilling Outcomes Intelligence</span></div>
          <button className="mobile-close" onClick={()=>setMobile(false)}><X/></button>
        </div>
        <div className="workspace">COMMAND CENTER</div>
        <nav>
          {nav.map(([label,Icon]) => (
            <button key={label} className={page===label?"active":""} onClick={()=>{setPage(label);setMobile(false)}}>
              <Icon size={18}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button><Settings size={18}/> Settings</button>
          <button
  onClick={() => {
    localStorage.removeItem("skilltrack_token");
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowUserMenu(false);
  }}
>
  Sign out
</button>
        </div>
      </aside>

      {mobile && <div className="overlay" onClick={()=>setMobile(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={()=>setMobile(true)}><Menu/></button>
          <div>
            <div className="eyebrow">LONGITUDINAL SKILLING OUTCOMES PLATFORM</div>
            <h1>{page}</h1>
          </div>
          <div className="top-actions">
            <div className="search"><Search size={17}/><input value={query}onChange={e => setQuery(e.target.value)}
onKeyDown={e => {
  if (e.key === "Enter" && query.trim()) {
    setPage("Trainees");
  }
}}placeholder="Search trainee, ID, employer..." /></div>
            <button
  className="icon-btn"
  onClick={() => setShowNotifications(prev => !prev)}
>
  <Bell size={19}/>
  <i/>
</button>
{showNotifications && (
  <div className="notification-panel">
    <div className="notification-header">
      <strong>Notifications</strong>
      <span>Recent updates</span>
    </div>
{notifications.length === 0 ? (
  <div className="notification-item">
    <Bell size={17} />
    <div>
      <strong>No new notifications</strong>
      <span>Everything looks up to date.</span>
    </div>
  </div>
) : (
  notifications.map((notification) => (
    <div className="notification-item" key={notification.id}>
      {notification.type === "followup" && <Bell size={17} />}

      <div>
        <strong>{notification.title}</strong>
        <span>{notification.message}</span>
      </div>
    </div>
  ))
)}

    

  </div>
)}
           <div
  className="avatar"
  onClick={() => setShowUserMenu(prev => !prev)}
  style={{ cursor: "pointer" }}
>
  {currentUser?.name
    ? currentUser.name
        .split(" ")
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"}
</div>
{showUserMenu && (
  <div className="user-menu">
    <strong>{currentUser?.name || "User"}</strong>
    <span>{currentUser?.email || ""}</span>

    <button onClick={() => setIsLoggedIn(false)}>
      Sign out
    </button>
  </div>
)} 
          </div>
        </header>

        {loading && <div className="content"><p>Loading trainees...</p></div>}

{error && <div className="content"><p>{error}</p></div>}

{!loading && !error && (
  <>
    {page==="Dashboard" && <Dashboard
  setPage={setPage}
  trainees={trainees}
  employment={employment}
  skillGaps={skillGaps}
  followups={followups}
  employers={employers}
/>}
    {page==="Trainees" && (
 <Trainees
  query={query}
  trainees={trainees}
  onTraineeAdded={handleTraineeAdded}
  onDeleteTrainee={handleDeleteTrainee}
  currentUser={currentUser}
/>
)}
    {page==="Training" && (
  <Training
  trainees={trainees}
  training={training}
  setTraining={setTraining}
  currentUser={currentUser}
/>
)}
    {page==="Employment Outcomes" && (
  <Employment
    employment={employment}
    setEmployment={setEmployment}
    currentUser={currentUser}

  />
)}
   {page === "Skill Gaps" && (
  <SkillGaps
    trainees={trainees}
    skillGaps={skillGaps}
    setSkillGaps={setSkillGaps}
     currentUser={currentUser}
  />
)}
   {page==="Follow-up Center" && (
  <FollowUps
    trainees={trainees}
    followups={followups}
     setFollowups={setFollowups}
  />
)}
    {page === "Programme Impact" && (
  <Impact
    trainees={trainees}
    employment={employment}
  />
)}
    {page==="Policy Simulator" && <Policy/>}
  </>
)}

        <footer>SkillTrack <span>|</span> Smarter Data <b>→</b> Better Decisions <b>→</b> Greater Livelihoods</footer>
      </main>
    </div>
  )
}

function Dashboard({setPage, trainees, employment, skillGaps, followups, employers}){
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
      salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length
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

    // हर employment record
    acc[key].employed++;

    // केवल Full-time = Placed
    if (item.employment_type === "Full-time") {
      acc[key].placed++;
    }

    return acc;
  }, {})
)
.sort((a, b) => {
  return new Date(a[0]) - new Date(b[0]);
})
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
  ? Math.round((verifiedEmployers / totalEmployers) * 100)
  : 0;
  return <div className="content">
    <section className="welcome">
      <div><p className="eyebrow">GOOD MORNING, ADMIN</p><h2>Track what happens <em>after training.</em></h2><p>Monitor placement, retention, wage growth and skill gaps across the trainee lifecycle.</p></div>
      <div className="welcome-actions"><button className="primary" onClick={()=>setPage("Trainees")}>View trainees <ChevronRight size={17}/></button><button className="secondary" onClick={()=>setPage("Programme Impact")}>Programme impact</button></div>
    </section>

    <section className="stats">
      <Stat
  title="Active Trainees"
  value={trainees.length}
  icon={Users}
/>
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
  title="Skill Gaps Detected"
  value={skillGapsDetected}
  icon={Target}
/>
    </section>

    <section className="grid two">
      <Card title="Outcome trend" subtitle="Placement and employment signals · last 6 months">
        <div className="chart"><ResponsiveContainer width="100%" height={255}><AreaChart data={monthly}><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopOpacity=".22"/><stop offset="100%" stopOpacity=".01"/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="m"/><YAxis domain={[40,100]}/><Tooltip/><Area type="monotone" dataKey="employed" stroke="#1769aa" fill="url(#g)" strokeWidth={3}/><Area type="monotone" dataKey="placed" stroke="#21a179" fill="none" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
        <div className="legend"><span><i className="dot blue"/> Employed</span><span><i className="dot green"/> Placed</span></div>
      </Card>
      <Card title="Programme health" subtitle="Current cohort overview">
        <div className="health">
          <div className="donut"><ResponsiveContainer width="100%" height={190}><PieChart><Pie
  data={[
    {v: Number(employmentRate)},
    {v: 100 - Number(employmentRate)}
  ]}
  dataKey="v"innerRadius={55} outerRadius={72} startAngle={90} endAngle={-270} paddingAngle={2}><Cell fill="#1769aa"/><Cell fill="#e8eef5"/></Pie></PieChart></ResponsiveContainer><strong>{employmentRate}%</strong>
<small>employment</small></div>
          <div className="health-list"><Row
  label="Placed"
  value={`${employmentRate}%`}
  icon={CheckCircle2}
/><Row
  label="Follow-up due"
  value={`${followupDue}`}
  icon={Clock3}
/><Row
  label="High skill gap"
  value={`${highSkillGaps}`}
  icon={AlertTriangle}
/><Row
  label="Verified employers"
  value={`${verifiedEmployerRate}%`}
  icon={ShieldCheck}
/></div>
        </div>
      </Card>
    </section>

    <section className="grid two">
      <Card title="Recent trainees" subtitle="Latest lifecycle activity" action={<button className="text-btn" onClick={()=>setPage("Trainees")}>View all <ChevronRight size={15}/></button>}>
        <Table rows={trainees.slice(0,4)}/>
      </Card>
      <Card title="Priority follow-ups" subtitle="Trainees needing an outcome update">
        <div className="follow-list">
  {followups
    .filter(f => f.status !== "Completed")
    .map(f => {
      const trainee = trainees.find(
        t => t.id === f.trainee_id
      );

      return (
        <div className="follow" key={f.followup_id}>

          <div className="avatar small">
            {trainee
              ? trainee.name
                  .split(" ")
                  .map(x => x[0])
                  .join("")
              : f.trainee_id}
          </div>

          <div>
            <b>
              {trainee
                ? trainee.name
                : f.trainee_id}
            </b>

            <span>
              {f.trainee_id} · {f.type}
            </span>

            <span>
              {f.response}
            </span>
          </div>

          <button className="outline">
            Contact
          </button>

        </div>
      );
    })}
</div>
      </Card>
    </section>
  </div>
}

function Stat({title,value,change,icon:Icon,down}){
 return <div className="stat card"><div className="stat-icon">{Icon &&<Icon size={19}/>}</div><div><span>{title}</span><strong>{value}</strong><small className={down?"down":""}>{down?<TrendingDown size={13}/>:<TrendingUp size={13}/>} {change} vs last month</small></div></div>
}

function Card({title,subtitle,action,children}){return <section className="card panel"><div className="panel-head"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>{children}</section>}
function Row({label,value,icon:Icon}){return <div className="row"><span><Icon size={15}/>{label}</span><b>{value}</b></div>}
function Table({rows, onEdit, onDelete}){

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
          {rows.map(t => (
            <tr key={t.id}>
              
              <td>
                <div className="person">
                  <div className="avatar tiny">
                    {t.name.split(" ").map(x => x[0]).join("")}
                  </div>

                  <span>
                    <b>{t.name}</b>
                    <small>{t.id}</small>
                  </span>
                </div>
              </td>

              <td>{t.course}</td>

              <td>
                <Status s={t.status}/>
              </td>

              <td>{t.city}</td>

              <td>
  {onEdit && (
  <button
    className="secondary"
    onClick={() => onEdit(t)}
  >
    Edit
  </button>
)}

{onDelete && (
  <button
    className="secondary"
    onClick={() => onDelete(t)}
  >
    Delete
  </button>
)}
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Status({s}){return <span className={`status ${s.toLowerCase().replace(" ","-")}`}><i/>{s}</span>}

function Trainees({
  query,
  trainees,
  onTraineeAdded,
  onDeleteTrainee,
  currentUser
}) {
  const isAdmin = currentUser?.role === "admin";

  const handleSaveTrainee = async () => {
    try {
      const isEditing = editingTrainee !== null;

      const url = isEditing
        ? `${API_URL}/api/trainees/${traineeId}`
        : `${API_URL}/api/trainees`;

      const response = await authFetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          trainee_id: traineeId,
          name: traineeName,
          course: traineeCourse,
          district: traineeDistrict,
          provider: traineeProvider,
          gender: traineeGender,
          age: Number(traineeAge),
          training_year: Number(trainingYear),
          status: traineeStatus,
          confidence: Number(traineeConfidence)
        })
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? "Failed to update trainee"
            : "Failed to save trainee"
        );
      }

      const savedTrainee = await response.json();

      onTraineeAdded(savedTrainee);

      alert(
        isEditing
          ? "Trainee successfully updated!"
          : "Trainee successfully added!"
      );

      setShowForm(false);
      setEditingTrainee(null);

    } catch (error) {
      console.error(error);
      alert("ERROR: " + error.message);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState(null);

  useEffect(() => {
    if (editingTrainee) {
      setTraineeId(editingTrainee.id);
      setTraineeName(editingTrainee.name);
      setTraineeCourse(editingTrainee.course);
      setTraineeDistrict(editingTrainee.city);
      setTraineeProvider(editingTrainee.provider || "");
      setTraineeGender(editingTrainee.gender || "");
      setTraineeAge(editingTrainee.age || "");
      setTrainingYear(editingTrainee.trainingYear || "");
      setTraineeStatus(editingTrainee.status);
      setTraineeConfidence(editingTrainee.progress || "");
    }
  }, [editingTrainee]);

  const [traineeId, setTraineeId] = useState("");
  const [traineeName, setTraineeName] = useState("");
  const [traineeCourse, setTraineeCourse] = useState("");
  const [traineeDistrict, setTraineeDistrict] = useState("");
  const [traineeProvider, setTraineeProvider] = useState("");
  const [traineeGender, setTraineeGender] = useState("");
  const [traineeAge, setTraineeAge] = useState("");
  const [trainingYear, setTrainingYear] = useState("");
  const [traineeStatus, setTraineeStatus] = useState("");
  const [traineeConfidence, setTraineeConfidence] = useState("");

  const filtered = useMemo(
    () =>
      trainees.filter(t =>
        (t.name + " " + t.id + " " + t.course + " " + t.city)
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query, trainees]
  );

  return (
    <div className="content">

      <PageIntro
        title="Trainee digital twin"
        text="A consent-based longitudinal profile linking training, assessment, employment and follow-up."
      />

      <div className="toolbar">

        <button className="secondary">
          <Filter size={16} /> Filters
        </button>

        <button className="secondary">
          <Download size={16} /> Export
        </button>

        {/* ADD BUTTON - ADMIN ONLY */}
        {isAdmin && (
          <button
            className="primary"
            onClick={() => {
              setEditingTrainee(null);
              setShowForm(true);
            }}
          >
            + Add Trainee
          </button>
        )}

        <span className="count">
          {filtered.length} of 12,480 shown
        </span>

      </div>


      {/* FORM - ADMIN ONLY */}
      {isAdmin && showForm && (
        <div className="modal-overlay">
          <div className="modal-card">

            <h3>
              {editingTrainee
                ? "Edit Trainee"
                : "Add New Trainee"}
            </h3>

            <p>
              Yahan hum trainee ki details fill karenge.
            </p>

            <div className="form-group">
              <label>Trainee ID</label>
              <input
                type="text"
                placeholder="Example: ST1013"
                value={traineeId}
                onChange={(e) =>
                  setTraineeId(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter trainee name"
                value={traineeName}
                onChange={(e) =>
                  setTraineeName(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Course</label>
              <input
                type="text"
                placeholder="Enter course name"
                value={traineeCourse}
                onChange={(e) =>
                  setTraineeCourse(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                placeholder="Enter district"
                value={traineeDistrict}
                onChange={(e) =>
                  setTraineeDistrict(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Provider</label>
              <input
                type="text"
                placeholder="Enter training provider"
                value={traineeProvider}
                onChange={(e) =>
                  setTraineeProvider(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <input
                type="text"
                placeholder="Enter gender"
                value={traineeGender}
                onChange={(e) =>
                  setTraineeGender(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                placeholder="Enter age"
                value={traineeAge}
                onChange={(e) =>
                  setTraineeAge(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Training Year</label>
              <input
                type="number"
                placeholder="Example: 2026"
                value={trainingYear}
                onChange={(e) =>
                  setTrainingYear(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <input
                type="text"
                placeholder="Example: Employed"
                value={traineeStatus}
                onChange={(e) =>
                  setTraineeStatus(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Confidence</label>
              <input
                type="number"
                placeholder="Example: 85"
                value={traineeConfidence}
                onChange={(e) =>
                  setTraineeConfidence(e.target.value)
                }
              />
            </div>

            <button
              className="primary"
              onClick={handleSaveTrainee}
            >
              {editingTrainee
                ? "Save Changes"
                : "Save Trainee"}
            </button>

            <button
              className="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingTrainee(null);
              }}
            >
              Close
            </button>

          </div>
        </div>
      )}


      <Card
        title="Trainee directory"
        subtitle="Unified identifiers across programmes"
      >

        <Table
          rows={filtered}

        
          onEdit={
            isAdmin
              ? (trainee) => {
                  setEditingTrainee(trainee);
                  setShowForm(true);
                }
              : undefined
          }

          onDelete={
            isAdmin
              ? onDeleteTrainee
              : undefined
          }
        />

      </Card>


      <div className="grid three">
        {filtered.slice(0, 3).map(t => (
          <TraineeCard
            t={t}
            key={t.id}
          />
        ))}
      </div>

    </div>
  );
}
function TraineeCard({t}){return <div className="card trainee-card"><div className="person"><div className="avatar">{t.name.split(" ").map(x=>x[0]).join("")}</div><div><b>{t.name}</b><small>{t.id}</small></div></div><hr/><div className="mini-grid"><span>Programme<b>{t.course}</b></span><span>Outcome<b>{t.status}</b></span><span>Skill gap<b>{t.gap}</b></span><span>Progress<b>{t.progress}%</b></span></div><div className="progress"><i style={{width:t.progress+"%"}}/></div></div>}

function PageIntro({title,text}){return <section className="page-intro"><div><p className="eyebrow">SKILLTRACK MODULE</p><h2>{title}</h2><p>{text}</p></div><div className="intro-icon"><Sparkles size={28}/></div></section>}

function Training({
  trainees,
  training,
  setTraining,
  currentUser
}) {
  const isAdmin = currentUser?.role === "admin";
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
  };

  const handleClose = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="content">

      <PageIntro
        title="Training & assessment"
        text="Track enrolment, attendance, assessment scores and certification in one lifecycle record."
      />

      {/* ADD TRAINING BUTTON */}
      {/* ADD TRAINING BUTTON */}
{isAdmin && (
  <button
    className="btn primary"
    onClick={() => {
      resetForm();
      setShowForm(true);
    }}
  >
    + Add Training
  </button>
)}


      {/* POPUP */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >

            <Card
              title="Training Record"
              subtitle="Add or edit training details"
            >

              {/* CLOSE BUTTON */}
              <button
                type="button"
                className="btn"
                onClick={handleClose}
                style={{ marginBottom: "15px" }}
              >
                ✕ Close
              </button>


              {/* FORM */}
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  gridTemplateColumns: "repeat(2, 1fr)"
                }}
              >

                <select
                  value={form.trainee_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trainee_id: e.target.value
                    })
                  }
                >
                  <option value="">Select Trainee</option>

                  {trainees.map((trainee) => (
                    <option
                      key={trainee.id}
                      value={trainee.id}
                    >
                      {trainee.id} - {trainee.name}
                    </option>
                  ))}
                </select>


                <input
                  placeholder="Course"
                  value={form.course}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      course: e.target.value
                    })
                  }
                />


                <input
                  placeholder="Course Provider"
                  value={form.course_provider}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      course_provider: e.target.value
                    })
                  }
                />


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


                <input
                  type="number"
                  placeholder="Assessment Score"
                  value={form.assessment_score}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      assessment_score: e.target.value
                    })
                  }
                />


                {/* SAVE BUTTON */}
                <button
                  type="button"
                  className="btn primary"
                  onClick={async () => {
                    try {

                      const response = await authFetch(
                        editingId
? `${API_URL}/api/training/${editingId}`
: `${API_URL}/api/training`,
                        {
                          method: editingId ? "PUT" : "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify(form)
                        }
                      );

                      if (!response.ok) {
                        throw new Error(
                          "Failed to save training"
                        );
                      }

                     const newTraining = await response.json();

const updatedTraining = await authFetch(
  `${API_URL}/api/training`
).then(res => res.json());

setTraining(updatedTraining);

alert("Training record added successfully!");

                      handleClose();

                

                    } catch (error) {

                      console.error(error);

                      alert(
                        "ERROR: " + error.message
                      );
                    }
                  }}
                >
                  Save Training
                </button>

              </div>

            </Card>

          </div>

        </div>
      )}


      {/* STATS */}
      <div className="stats">

        <div className="stat card">
          <strong>
            Training Records: {training.length}
          </strong>
        </div>

        <div className="stat card">
          <strong>
            Average Score:{" "}
            {training.length
              ? (
                  training.reduce(
                    (sum, item) =>
                      sum +
                      Number(
                        item.assessment_score || 0
                      ),
                    0
                  ) / training.length
                ).toFixed(1)
              : 0}
          </strong>
        </div>

        <div className="stat card">
          <strong>
            Highest Score:{" "}
            {training.length
              ? Math.max(
                  ...training.map((item) =>
                    Number(
                      item.assessment_score || 0
                    )
                  )
                )
              : 0}
          </strong>
        </div>

        <div className="stat card">
          <strong>
            Lowest Score:{" "}
            {training.length
              ? Math.min(
                  ...training.map((item) =>
                    Number(
                      item.assessment_score || 0
                    )
                  )
                )
              : 0}
          </strong>
        </div>

      </div>


      {/* TRAINING TABLE */}
      <Card
        title="Training Records"
        subtitle="Records loaded from PostgreSQL"
      >

        <div style={{ overflowX: "auto" }}>

          <table>

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

              {training.map((item) => (

                <tr key={item.training_id}>

                  <td>{item.training_id}</td>

               <td>
  {item.trainee_id}
</td>

                  <td>{item.trainee_name}</td>

                  <td>{item.course}</td>

                  <td>{item.course_provider}</td>

                  <td>
                    {item.start_date?.slice(0, 10)}
                  </td>

                  <td>
                    {item.end_date?.slice(0, 10)}
                  </td>

                  <td>{item.assessment_score}</td>


                  <td>

                    {/* EDIT */}
                    {isAdmin && (
                    <button
                      className="btn"
                      onClick={() => {

                        setForm({
                          trainee_id: item.trainee_id,
                          course: item.course,
                          course_provider:
                            item.course_provider,
                          start_date:
                            item.start_date?.slice(
                              0,
                              10
                            ),
                          end_date:
                            item.end_date?.slice(
                              0,
                              10
                            ),
                          assessment_score:
                            item.assessment_score
                        });
                        setEditingId(item.training_id);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    )}

                    {/* DELETE */}
                    {isAdmin && (
                    <button
                      className="btn danger"
                      onClick={async () => {

                        try {

                          const response =
                            await authFetch(
                              `${API_URL}/api/training/${item.training_id}`,
                              {
                                method: "DELETE"
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
                          setTraining(prev =>
  prev.filter(t => t.training_id !== item.training_id)
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

        </div>

      </Card>

    </div>
  );
}
function Employment({
  employment,
  setEmployment,
  currentUser
}) {
  const isAdmin = currentUser?.role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    trainee_id: "",
    employer: "",
    job_role: "",
    employment_type: "",
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
const handleEditEmployment = (item) => {
    setEditingId(item.employment_id);

    setForm({
        trainee_id: item.trainee_id || "",
        employer: item.employer || "",
        job_role: item.job_role || "",
        employment_type: item.employment_type || "",
        joining_date: item.joining_date
            ? item.joining_date.substring(0, 10)
            : "",
        starting_salary: item.starting_salary || "",
        current_salary: item.current_salary || "",
        retained: item.retained || false,
        relevance: item.relevance || ""
    });

    setShowForm(true);
};
const handleDeleteEmployment = async (item) => {
    const confirmDelete = window.confirm(
        "Are you sure you want to delete this employment record?"
    );

    if (!confirmDelete) {
        return;
    }

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
                record => record.employment_id !== item.employment_id
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
            : `${API_URL}/api/employment`

        const method = editingId ? "PUT" : "POST";

        const response = await authFetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...form,
                starting_salary: form.starting_salary
                    ? Number(form.starting_salary)
                    : null,
                current_salary: form.current_salary
                    ? Number(form.current_salary)
                    : null,
                relevance: form.relevance
                    ? Number(form.relevance)
                    : null
            })
        });

        if (!response.ok) {
            throw new Error("Failed to save employment");
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

        setForm({
            trainee_id: "",
            employer: "",
            job_role: "",
            employment_type: "",
            joining_date: "",
            starting_salary: "",
            current_salary: "",
            retained: false,
            relevance: ""
        });

        setEditingId(null);
        setShowForm(false);

    } catch (error) {
        console.error(error);
        alert("ERROR: " + error.message);
    }
};


  return (
    <div className="content">

      <PageIntro
        title="Employment outcomes"
        text="Follow placement, employer verification, retention and wage progression after certification."
      />
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "16px"
      }}>
{isAdmin && (
        <button
          className="btn primary"
          onClick={() => {
  console.log("Add Employment clicked");
  setShowForm(true);
}}
        >
          + Add Employment
        </button>
)}

      </div>

      <div className="stats">

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

        <div className="chart">

          <ResponsiveContainer width="100%" height={310}>

            <BarChart
              data={employment.filter(item => item.employer)}
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
                radius={[5,5,0,0]}
              />

              <Bar
                dataKey="current_salary"
                name="Current Salary"
                fill="#21a179"
                radius={[5,5,0,0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </Card>


      

{isAdmin && showForm && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  }}>

    <div style={{
      background: "white",
      width: "90%",
      maxWidth: "800px",
      maxHeight: "90vh",
      overflowY: "auto",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    }}>

      <Card
        title="Add Employment Record"
        subtitle="Enter employment outcome details"
      >

          <form onSubmit={handleSaveEmployment}>

            <div className="form-grid">

              <input
                name="trainee_id"
                placeholder="Trainee ID"
                value={form.trainee_id}
                onChange={handleChange}
                required
              />

              <input
                name="employer"
                placeholder="Employer"
                value={form.employer}
                onChange={handleChange}
                required
              />

              <input
                name="job_role"
                placeholder="Job Role"
                value={form.job_role}
                onChange={handleChange}
                required
              />

              <select
                name="employment_type"
                value={form.employment_type}
                onChange={handleChange}
                required
              >
                <option value="">Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Apprenticeship">Apprenticeship</option>
                <option value="Contract">Contract</option>
              </select>

              <input
                type="date"
                name="joining_date"
                value={form.joining_date}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="starting_salary"
                placeholder="Starting Salary"
                value={form.starting_salary}
                onChange={handleChange}
              />

              <input
                type="number"
                name="current_salary"
                placeholder="Current Salary"
                value={form.current_salary}
                onChange={handleChange}
              />

              <input
                type="number"
                name="relevance"
                placeholder="Relevance %"
                min="0"
                max="100"
                value={form.relevance}
                onChange={handleChange}
              />

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <input
                  type="checkbox"
                  name="retained"
                  checked={form.retained}
                  onChange={handleChange}
                />
                Retained
              </label>

            </div>


            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px"
            }}>

              <button
                type="submit"
                className="btn primary"
              >
                Save Employment
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

            </div>

          </form>

        </Card>
         </div>
  </div>

      )} 
     


      <Card
        title="Employment records"
        subtitle="Records fetched from the employment database"
      >

        <div className="table-wrap">

          <table className="data-table">

            <thead>

              <tr>
                <th>Trainee ID</th>
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

                  <td>{item.trainee_id}</td>

                  <td>
                    {item.employer || "—"}
                  </td>

                  <td>
                    {item.job_role || "—"}
                  </td>

                  <td>
                    {item.employment_type || "—"}
                  </td>

                  <td>
                    {item.starting_salary
                      ? `₹${Number(item.starting_salary).toLocaleString("en-IN")}`
                      : "—"}
                  </td>

                  <td>
                    {item.current_salary
                      ? `₹${Number(item.current_salary).toLocaleString("en-IN")}`
                      : "—"}
                  </td>

                  <td>
                    {item.retained ? "Yes" : "No"}
                  </td>

                  <td>
                    {item.relevance != null
                      ? `${item.relevance}%`
                      : "—"}
                  </td>
                 <td>
                  {isAdmin && (
    <button
        className="btn"
        onClick={() => handleEditEmployment(item)}
    >
        Edit
    </button>
                  
                  )}
                  {isAdmin && (
    <button
        className="btn"
        onClick={() => handleDeleteEmployment(item)}
        style={{ marginLeft: "8px" }}
    >
        Delete
    </button>
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
  const [showIntervention, setShowIntervention] = useState(false);
  const [showCohort, setShowCohort] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [editingIntervention, setEditingIntervention] = useState(null);

  
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

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkillGap, setEditingSkillGap] = useState(null);
  // Future Skill Recommendation
const [recommendationData, setRecommendationData] = useState(null);
const [recommendationLoading, setRecommendationLoading] = useState(false);
const [selectedRecommendationTrainee, setSelectedRecommendationTrainee] = useState("");

  const [form, setForm] = useState({
    trainee_id: "",
    required_skill: "",
    current_level: "",
    required_level: "",
    gap_score: "",
    recommendation: ""
  });

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
      trainee_id: "",
      required_skill: "",
      current_level: "",
      required_level: "",
      gap_score: "",
      recommendation: ""
    });

    setEditingSkillGap(null);
    setShowSkillForm(false);
  };

  const handleSaveSkillGap = async () => {
    if (
      !form.trainee_id ||
      !form.required_skill ||
      !form.current_level ||
      !form.required_level ||
      form.gap_score === ""
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const url = editingSkillGap
        ? `${API_URL}/api/skill-gaps/${editingSkillGap.gap_id}`
        :`${API_URL}/api/skill-gaps`

      const response = await authFetch(url, {
        method: editingSkillGap ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          trainee_id: form.trainee_id,
          required_skill: form.required_skill,
          current_level: form.current_level,
          required_level: form.required_level,
          gap_score: Number(form.gap_score),
          recommendation: form.recommendation
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save skill gap");
      }
      const result = await response.json();
//       const savedIntervention = result.intervention;

// setInterventions(prev => {
//   if (editingIntervention) {
//     return prev.map(item =>
//       item.intervention_id === savedIntervention.intervention_id
//         ? savedIntervention
//         : item
//     );
//   }

//   return [savedIntervention, ...prev];
// });

// setEditingIntervention(null);
// setShowIntervention(false);
const savedSkillGap = result.skillGap;

setSkillGaps(prev => {
  if (editingSkillGap) {
    return prev.map(g =>
      g.gap_id === savedSkillGap.gap_id
        ? savedSkillGap
        : g
    );
  }

  return [savedSkillGap, ...prev];
});

      alert(
        editingSkillGap
          ? "Skill gap updated successfully!"
          : "Skill gap added successfully!"
      );
      resetForm();

    } catch (error) {
      console.error(error);
      alert("ERROR: " + error.message);
    }
  };

  const handleEditSkillGap = (gap) => {
    setEditingSkillGap(gap);

    setForm({
      trainee_id: gap.trainee_id || "",
      required_skill: gap.required_skill || "",
      current_level: gap.current_level || "",
      required_level: gap.required_level || "",
      gap_score: gap.gap_score ?? "",
      recommendation: gap.recommendation || ""
    });

    setShowSkillForm(true);
  };

  const handleDeleteSkillGap = async (gap) => {
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

      alert("Skill gap deleted successfully!");

    setSkillGaps(prev =>
  prev.filter(g => g.gap_id !== gap.gap_id)
);

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

      {/* ADD / EDIT SKILL GAP */}
      <Card
        title="Skill gap records"
        subtitle="Manage skill gaps stored in database"
      >

        <div style={{ marginBottom: "15px" }}>
          {isAdmin && (
          <button
            className="primary"
            onClick={() => {
              setEditingSkillGap(null);

              setForm({
                trainee_id: "",
                required_skill: "",
                current_level: "",
                required_level: "",
                gap_score: "",
                recommendation: ""
              });

              setShowSkillForm(true);
            }}
          >
            + Add skill gap
          </button>
          )}
        </div>

       {isAdmin && showSkillForm && (
  <div className="modal-overlay">

    <div className="modal">

      <div className="modal-header">

        <h3>
          {editingSkillGap
            ? "Edit skill gap"
            : "Add skill gap"}
        </h3>

        <button
          className="modal-close"
          onClick={resetForm}
        >
          ×
        </button>

      </div>

      <div className="grid two">

        <div>
          <label>Trainee</label>

          <select
            value={form.trainee_id}
            onChange={e =>
              setForm({
                ...form,
                trainee_id: e.target.value
              })
            }
          >
            <option value="">
              Select trainee
            </option>

            {trainees.map(t => (
              <option
                key={t.id}
                value={t.id}
              >
                {t.id} - {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Required skill</label>

          <input
            type="text"
            value={form.required_skill}
            placeholder="e.g. Communication"
            onChange={e =>
              setForm({
                ...form,
                required_skill: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Current level</label>

          <select
            value={form.current_level}
            onChange={e =>
              setForm({
                ...form,
                current_level: e.target.value
              })
            }
          >
            <option value="">
              Select level
            </option>
            <option value="Basic">
              Basic
            </option>
            <option value="Intermediate">
              Intermediate
            </option>
            <option value="Advanced">
              Advanced
            </option>
          </select>
        </div>

        <div>
          <label>Required level</label>

          <select
            value={form.required_level}
            onChange={e =>
              setForm({
                ...form,
                required_level: e.target.value
              })
            }
          >
            <option value="">
              Select level
            </option>
            <option value="Basic">
              Basic
            </option>
            <option value="Intermediate">
              Intermediate
            </option>
            <option value="Advanced">
              Advanced
            </option>
          </select>
        </div>

        <div>
          <label>Gap score</label>

          <input
            type="number"
            min="0"
            max="100"
            value={form.gap_score}
            placeholder="0 - 100"
            onChange={e =>
              setForm({
                ...form,
                gap_score: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Recommendation</label>

          <input
            type="text"
            value={form.recommendation}
            placeholder="Recommended action"
            onChange={e =>
              setForm({
                ...form,
                recommendation: e.target.value
              })
            }
          />
        </div>

      </div>

      <div style={{ marginTop: "15px" }}>

        <button
          className="primary"
          onClick={handleSaveSkillGap}
        >
          {editingSkillGap
            ? "Update skill gap"
            : "Save skill gap"}
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

  </div>
)}
        {/* SKILL GAP TABLE */}

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

                skillGaps.map(gap => {

                  const trainee = trainees.find(
                    t => t.id === gap.trainee_id
                  );

                  return (
                    <tr key={gap.gap_id}>

                      <td>
                        {gap.gap_id}
                      </td>

                      <td>
                        {gap.trainee_id}
                      </td>

                      <td>
                        {trainee?.name || "—"}
                      </td>

                      <td>
                        {gap.required_skill}
                      </td>

                      <td>
                        {gap.current_level}
                      </td>

                      <td>
                        {gap.required_level}
                      </td>

                      <td>
                        {Number(gap.gap_score)}%
                      </td>

                      <td>
                        {gap.recommendation || "—"}
                      </td>

                      <td>
{isAdmin && (
                        <button
                          className="outline"
                          onClick={() =>
                            handleEditSkillGap(gap)
                          }
                        >
                          Edit
                        </button>
)}
{isAdmin && (
                        <button
                          className="outline"
                          style={{ marginLeft: "6px" }}
                          onClick={() =>
                            handleDeleteSkillGap(gap)
                          }
                        >
                          Delete
                        </button>
)}

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </Card>

      {/* SKILL GAP MATRIX */}

      <div className="grid two">

        <Card
          title="Skill gap matrix"
          subtitle="Current cohort"
        >

          <div className="skill-bars">

            {skills.map(
              ([name, val, label]) => (

                <div
                  className="skill-row"
                  key={name}
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

              )
            )}

          </div>

        </Card>

        {/* RECOMMENDED ACTIONS */}

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

      {/* CREATE INTERVENTION */}
      <Card
  title="Interventions"
  subtitle="Training actions created from skill gaps"
>
  <div className="table-wrap">

    {interventions.length === 0 ? (
      <p>No interventions found.</p>
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
  style={{ marginLeft: "6px" }}
  onClick={async () => {

    const confirmDelete = window.confirm(
      `Delete "${item.intervention_name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await authFetch(
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

      alert("Intervention deleted successfully!");

    } catch (error) {

      console.error(error);

      alert(
        "ERROR: " + error.message
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

        <h3>Create intervention</h3>

        <button
          className="modal-close"
          onClick={() => setShowIntervention(false)}
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
                    method: editingIntervention ? "PUT" : "POST",

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

              setInterventions(prev => [
                result.intervention,
                ...prev
              ]);

              alert(
                "Intervention saved successfully!"
              );

              setShowIntervention(false);

            } catch (error) {

              console.error(error);

              alert(
                "ERROR: " +
                error.message
              );

            }

          }}
        >
          Save intervention
        </button>

        <button
          className="secondary"
          style={{
            marginLeft: "10px"
          }}
          onClick={() =>
            setShowIntervention(false)
          }
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}

      {/* COMMUNICATION COHORT */}

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
                  .filter(t =>
                    skillGaps.some(
                      gap =>
                        gap.trainee_id === t.id
                    )
                  )
                  .map(t => (

                    <tr key={t.id}>

                      <td>{t.id}</td>
                      <td>{t.name}</td>
                      <td>{t.course}</td>
                      <td>{t.status}</td>

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

  return (
    <div className="content">

      <PageIntro
        title="Follow-up center"
        text="Schedule low-burden SMS, WhatsApp or email check-ins at 3, 6 and 12 months."
      />

      <Card
        title="Follow-up queue"
        subtitle="Outcome signals from database"
      >

        <div className="follow-list large">

          {followups.length === 0 ? (

            <p>No follow-up records found.</p>

          ) : (

            followups.map(f => {

              const trainee = trainees.find(
                t => t.id === f.trainee_id
              );

              return (
                <div
                  className="follow"
                  key={f.followup_id}
                >

                  <div className="avatar small">
                    {trainee
                      ? trainee.name
                          .split(" ")
                          .map(x => x[0])
                          .join("")
                      : f.trainee_id}
                  </div>

                  <div>

                    <b>
                      {trainee
                        ? trainee.name
                        : f.trainee_id}
                    </b>

                    <span>
                      {f.trainee_id} · {f.type}
                    </span>

                    <span>
                      {f.response}
                    </span>

                  </div>

                  <select
  value={f.status || ""}
  onChange={async (e) => {
    const newStatus = e.target.value;

    try {
      const response = await authFetch(
        `${API_URL}/api/followups/${f.followup_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update follow-up");
      }

      const result = await response.json();

      setFollowups(prev =>
        prev.map(item =>
          item.followup_id === result.followup.followup_id
            ? result.followup
            : item
        )
      );

    } catch (error) {
      console.error(error);
      alert("ERROR: " + error.message);
    }
  }}
  style={{
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid #d0d5dd",
    background: "#fff",
    cursor: "pointer"
  }}
>
  <option value="">Select status</option>
  <option value="Pending">Pending</option>
  <option value="In Progress">In Progress</option>
  <option value="Completed">Completed</option>
</select>

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
    t => t.id === e.trainee_id
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
  <div className="impact-chart">

    <ResponsiveContainer width="100%" height="100%">

      <BarChart
        data={courseData}
        layout="vertical"
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 10
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
        />

        <XAxis
          type="number"
          allowDecimals={false}
        />

        <YAxis
          type="category"
          dataKey="course"
          width={150}
        />

        <Tooltip />

        <Bar
          dataKey="employed"
          name="Employed"
          stackId="employment"
          fill="#1769aa"
        />

        <Bar
          dataKey="notEmployed"
          name="Not Employed"
          stackId="employment"
          fill="#b8c7d9"
        />

      </BarChart>

    </ResponsiveContainer>

  </div>
</Card>

      <Card
        title="Employment records"
        subtitle="Real employment data from database"
      >

        <div className="table-wrap">

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

                employment.map(item => (

                  <tr key={item.employment_id}>

                    <td>{item.trainee_id}</td>

                    <td>{item.employer}</td>

                    <td>{item.job_role}</td>

                    <td>{item.employment_type}</td>

                    <td>
                      ₹{Number(
                        item.current_salary || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {item.retained ? "Yes" : "No"}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}

function Policy(){
 const [investment,setInvestment]=useState(60);
 return <div className="content"><PageIntro title="Policy simulator" text="Explore hypothetical allocation scenarios using the mock programme model. This does not predict real-world results."/>
 <div className="grid two"><Card title="Scenario controls" subtitle="Adjust assumptions"><label className="range-label">Programme investment <b>{investment}%</b></label><input className="range" type="range" min="0" max="100" value={investment} onChange={e=>setInvestment(+e.target.value)}/><div className="scenario"><span>Baseline employment</span><b>81.2%</b></div><div className="scenario"><span>Scenario estimate</span><b>{(76+investment*.13).toFixed(1)}%</b></div><button className="primary full">Run simulation</button></Card><Card title="Scenario outputs" subtitle="Illustrative model only"><div className="big-output">{(76+investment*.13).toFixed(1)}%<small>employment signal</small></div><div className="mini-grid"><span>Skill gap reduction<b>{Math.round(investment*.42)}%</b></span><span>Follow-up coverage<b>{Math.round(55+investment*.35)}%</b></span><span>Wage signal<b>+{Math.round(investment*.11)}%</b></span><span>Data confidence<b>{Math.round(70+investment*.22)}%</b></span></div></Card></div></div>
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
function SignupPage({ onSignup, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
  method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Account creation failed");
        return;
      }

      alert("Account created successfully!");

      onSignup();
    } catch (error) {
      console.error("Signup error:", error);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <div className="landing-logo-icon">
            <BrainCircuit size={25} />
          </div>

          <div>
            <strong>SkillTrack</strong>
            <span>Skilling Outcomes Intelligence</span>
          </div>
        </div>

        <button
          type="button"
          className="login-back"
          onClick={onBack}
        >
          ← Back to Login
        </button>

        <div className="login-heading">
          <h1>Create account</h1>
          <p>Create your SkillTrack administrator account.</p>
        </div>

        <form onSubmit={handleSignup}>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primary login-button" type="submit">
            Create account
            <ChevronRight size={17} />
          </button>

        </form>

        <p className="login-demo">
          Already have an account?{" "}
          <button
            type="button"
            className="signup-link"
            onClick={onBack}
          >
            Sign in
          </button>
        </p>

      </div>
    </div>
  );
}
function LoginPage({ onLogin, onBack, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // =========================
  // EMAIL + PASSWORD LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Store SkillTrack JWT
      localStorage.setItem("skilltrack_token", data.token);

      alert("Login successful!");

      onLogin(data.user);

    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server.");
    }
  };


  // =========================
  // GOOGLE LOGIN
  // =========================
  const handleGoogleLogin = async () => {
    if (googleLoading) return;

    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(
        auth,
        provider
      );

      // Firebase ID token
      const firebaseToken =
        await result.user.getIdToken();

      // Send Firebase token to SkillTrack backend
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

      // Store SkillTrack JWT
      localStorage.setItem(
        "skilltrack_token",
        data.token
      );

      alert("Google login successful!");

      onLogin(data.user);

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


  return (
    <div className="login-page">

      <div className="login-card">

        {/* LOGO */}
        <div className="login-brand">

          <div className="login-brand-icon">
            <BrainCircuit size={27} />
          </div>

          <div>
            <strong>SkillTrack</strong>
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


        {/* EMAIL + PASSWORD LOGIN */}
        <form onSubmit={handleLogin}>

          <div className="login-field">

            <label>
              Email address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
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
                onClick={() =>
                  alert(
                    "Password recovery will be available soon."
                  )
                }
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
                  setPassword(e.target.value)
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
            <span>Sign in</span>
            <ChevronRight size={18} />
          </button>

        </form>


        {/* DIVIDER */}
        <div className="login-divider">
          <span></span>
          <b>OR</b>
          <span></span>
        </div>


        {/* SOCIAL BUTTONS */}
        <div className="social-login">

          {/* GOOGLE */}
          <button
            type="button"
            className="social-button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >

            <strong className="google-letter">
              G
            </strong>

            {googleLoading
              ? "Connecting..."
              : "Continue with Google"}

          </button>


          {/* FACEBOOK - NEXT STEP */}
          <button
            type="button"
            className="social-button"
            onClick={() =>
              alert(
                "Facebook login will be connected next."
              )
            }
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
