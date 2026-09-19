import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard, Users, GraduationCap, BriefcaseBusiness, Target,
  Bell, Search, Menu, X, ChevronRight, CheckCircle2, Clock3,
  AlertTriangle, TrendingUp, TrendingDown, MapPin, Phone, Mail,
  ShieldCheck, FileText, Settings, LogOut, BarChart3, Sparkles,
  UserCheck, Building2, BrainCircuit, Send, Filter, Download
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import "./styles.css";

const API_URL = "https://skilltrack-cziu.onrender.com";
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
    const response = await fetch(
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
  fetch(`${API_URL}/api/training`)
    .then(res => res.json())
    .then(data => {
      setTraining(data);
    })
    .catch(err => {
      console.error("Training fetch error:", err);
    });
}, []);
useEffect(() => {
  fetch(`${API_URL}/api/skill-gaps`)
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
  fetch(`${API_URL}/api/employment`)
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
  fetch(`${API_URL}/api/followups`)
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
  fetch(`${API_URL}/api/employers`)
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
      const response = await fetch(
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
    fetch(`${API_URL}/api/trainees`)
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
/>
)}
    {page==="Training" && (
  <Training
    trainees={trainees}
    training={training}
    setTraining={setTraining}
  />
)}
    {page==="Employment Outcomes" && (
  <Employment
    employment={employment}
    setEmployment={setEmployment}
  />
)}
   {page === "Skill Gaps" && (
  <SkillGaps
    trainees={trainees}
    skillGaps={skillGaps}
    setSkillGaps={setSkillGaps}
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
  <button
    className="secondary"
    onClick={() => onEdit(t)}
  >
    Edit
  </button>

  <button
    className="secondary"
    onClick={() => onDelete(t)}
  >
    Delete
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Status({s}){return <span className={`status ${s.toLowerCase().replace(" ","-")}`}><i/>{s}</span>}

function Trainees({query, trainees, onTraineeAdded,onDeleteTrainee}){
  const handleSaveTrainee = async () => {
  try {
    const isEditing = editingTrainee !== null;

    const url = isEditing
      ? `${API_URL}/api/trainees/${traineeId}`
     : `${API_URL}/api/trainees`;

    const response = await fetch(url, {
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
    [query,trainees]
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

       <button
  className="primary"
  onClick={() => setShowForm(true)}
>
  + Add Trainee
</button>

        <span className="count">
          {filtered.length} of 12,480 shown
        </span>
      </div>
      {showForm && (
  <div className="modal-overlay">
    <div className="modal-card">
    <h3>{editingTrainee ? "Edit Trainee" : "Add New Trainee"}</h3>
<p>Yahan hum trainee ki details fill karenge.</p>

<div className="form-group">
  <label>Trainee ID</label>
  <input
    type="text"
    placeholder="Example: ST1013"
    value={traineeId}
    onChange={(e) => setTraineeId(e.target.value)}
  />
</div>

<div className="form-group">
  <label>Name</label>
  <input
    type="text"
    placeholder="Enter trainee name"
    value={traineeName}
    onChange={(e) => setTraineeName(e.target.value)}
  />
</div>
<div className="form-group">
  <label>Course</label>
  <input
    type="text"
    placeholder="Enter course name"
    value={traineeCourse}
    onChange={(e) => setTraineeCourse(e.target.value)}
  />
</div>
<div className="form-group">
  <label>District</label>
  <input
    type="text"
    placeholder="Enter district"
    value={traineeDistrict}
    onChange={(e) => setTraineeDistrict(e.target.value)}
  />
</div>
<div className="form-group">
  <label>Provider</label>
  <input
    type="text"
    placeholder="Enter training provider"
    value={traineeProvider}
    onChange={(e) => setTraineeProvider(e.target.value)}
  />
</div>
<div className="form-group">
  <label>Gender</label>
  <input
    type="text"
    placeholder="Enter gender"
    value={traineeGender}
    onChange={(e) => setTraineeGender(e.target.value)}
  />
</div>
<div className="form-group">
  <label>Age</label>
  <input
    type="number"
    placeholder="Enter age"
    value={traineeAge}
    onChange={(e) => setTraineeAge(e.target.value)}
  />
</div>
<div className="form-group">
  <label>Training Year</label>
  <input
    type="number"
    placeholder="Example: 2026"
    value={trainingYear}
    onChange={(e) => setTrainingYear(e.target.value)}
  />
</div>
<div className="form-group">
  <label>Status</label>
  <input
    type="text"
    placeholder="Example: Employed"
    value={traineeStatus}
    onChange={(e) => setTraineeStatus(e.target.value)}
  />
</div>
<div className="form-group">
  <label>Confidence</label>
  <input
    type="number"
    placeholder="Example: 85"
    value={traineeConfidence}
    onChange={(e) => setTraineeConfidence(e.target.value)}
  />
</div>
<button
  className="primary"
  onClick={handleSaveTrainee}
>
  {editingTrainee ? "Save Changes" : "Save Trainee"}
</button>
    <button
      className="secondary"
      onClick={() => setShowForm(false)}
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
  onEdit={(trainee) => {
    setEditingTrainee(trainee);
    setShowForm(true);
  }}
  onDelete={onDeleteTrainee}
/>
      </Card>

      <div className="grid three">
        {filtered.slice(0, 3).map(t => (
          <TraineeCard t={t} key={t.id} />
        ))}
      </div>
    </div>
  );
}
function TraineeCard({t}){return <div className="card trainee-card"><div className="person"><div className="avatar">{t.name.split(" ").map(x=>x[0]).join("")}</div><div><b>{t.name}</b><small>{t.id}</small></div></div><hr/><div className="mini-grid"><span>Programme<b>{t.course}</b></span><span>Outcome<b>{t.status}</b></span><span>Skill gap<b>{t.gap}</b></span><span>Progress<b>{t.progress}%</b></span></div><div className="progress"><i style={{width:t.progress+"%"}}/></div></div>}

function PageIntro({title,text}){return <section className="page-intro"><div><p className="eyebrow">SKILLTRACK MODULE</p><h2>{title}</h2><p>{text}</p></div><div className="intro-icon"><Sparkles size={28}/></div></section>}

function Training({trainees, training, setTraining}) {
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
      <button
        className="btn primary"
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
      >
        + Add Training
      </button>


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

                      const response = await fetch(
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

const updatedTraining = await fetch(
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


                    {/* DELETE */}
                    <button
                      className="btn danger"
                      onClick={async () => {

                        try {

                          const response =
                            await fetch(
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
function Employment({employment = [], setEmployment}){

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
        const response = await fetch(
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

        const response = await fetch(url, {
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

        <button
          className="btn primary"
          onClick={() => {
  console.log("Add Employment clicked");
  setShowForm(true);
}}
        >
          + Add Employment
        </button>

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


      

{showForm && (
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
    <button
        className="btn"
        onClick={() => handleEditEmployment(item)}
    >
        Edit
    </button>

    <button
        className="btn"
        onClick={() => handleDeleteEmployment(item)}
        style={{ marginLeft: "8px" }}
    >
        Delete
    </button>
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

function SkillGaps({ trainees = [], skillGaps = [], setSkillGaps }) {
  const [showIntervention, setShowIntervention] = useState(false);
  const [showCohort, setShowCohort] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [editingIntervention, setEditingIntervention] = useState(null);

  
  useEffect(() => {
  fetch(`${API_URL}/api/interventions`)
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

      const response = await fetch(url, {
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
      const response = await fetch(
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
        </div>

       {showSkillForm && (
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

                        <button
                          className="outline"
                          onClick={() =>
                            handleEditSkillGap(gap)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="outline"
                          style={{ marginLeft: "6px" }}
                          onClick={() =>
                            handleDeleteSkillGap(gap)
                          }
                        >
                          Delete
                        </button>

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

              <button
                className="primary"
                onClick={() =>
                  setShowIntervention(true)
                }
              >
                Create intervention
              </button>

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
  <button
  className="outline"
  onClick={() => {
    setEditingIntervention(item);
    setShowIntervention(true);
  }}
>
  Edit
</button>

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

      const response = await fetch(
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
</td>

            </tr>
          ))}
        </tbody>

      </table>
    )}

  </div>
</Card>

     {showIntervention && (
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
                await fetch(
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
      const response = await fetch(
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
            <button className="primary" onClick={onLogin}>
              Get Started <ChevronRight size={18} />
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

        <div className="landing-dashboard-preview">
          <div className="preview-header">
            <div>
              <span>Programme Overview</span>
              <strong>SkillTrack Dashboard</strong>
            </div>
            <BarChart3 size={22} />
          </div>

          <div className="preview-stats">
            <div>
              <span>Active Trainees</span>
              <b>1,248</b>
            </div>

            <div>
              <span>Employment Rate</span>
              <b>72.4%</b>
            </div>

            <div>
              <span>Skill Gaps</span>
              <b>186</b>
            </div>
          </div>

          <div className="preview-chart">
            <div className="chart-line chart-line-one"></div>
            <div className="chart-line chart-line-two"></div>
            <div className="chart-line chart-line-three"></div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-features">
        <div className="landing-section-heading">
          <span>CORE CAPABILITIES</span>
          <h2>Everything after training, in one place.</h2>
          <p>
            Connect trainee data, employment outcomes and skill intelligence
            to understand the real impact of skilling programmes.
          </p>
        </div>

        <div className="landing-feature-grid">

          <div className="landing-feature-card">
            <Users size={25} />
            <h3>Trainee Lifecycle</h3>
            <p>
              Track trainees from enrolment and training through employment
              and long-term outcomes.
            </p>
          </div>

          <div className="landing-feature-card">
            <BriefcaseBusiness size={25} />
            <h3>Employment Outcomes</h3>
            <p>
              Monitor employment type, employers, joining dates, wages and
              retention.
            </p>
          </div>

          <div className="landing-feature-card">
            <Target size={25} />
            <h3>Skill Gap Intelligence</h3>
            <p>
              Identify skill gaps and connect them with targeted training
              interventions.
            </p>
          </div>

          <div className="landing-feature-card">
            <TrendingUp size={25} />
            <h3>Programme Impact</h3>
            <p>
              Understand employment, wage and retention outcomes across
              different training programmes.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-how">
        <div className="landing-section-heading">
          <span>HOW IT WORKS</span>
          <h2>From training data to actionable insight.</h2>
        </div>

        <div className="landing-steps">
          <div>
            <b>01</b>
            <h3>Collect</h3>
            <p>Bring trainee, training and outcome information together.</p>
          </div>

          <div>
            <b>02</b>
            <h3>Connect</h3>
            <p>Link training records with employment and follow-up data.</p>
          </div>

          <div>
            <b>03</b>
            <h3>Understand</h3>
            <p>Identify trends, skill gaps and programme outcomes.</p>
          </div>

          <div>
            <b>04</b>
            <h3>Act</h3>
            <p>Use insights to design better training interventions.</p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span>READY TO GET STARTED?</span>
          <h2>Turn training data into meaningful outcomes.</h2>
        </div>

        <button className="primary" onClick={onLogin}>
          Enter SkillTrack <ChevronRight size={18} />
        </button>
      </section>

      <footer className="landing-footer">
        <div>
          <strong>SkillTrack</strong>
          <span>Skilling Outcomes Intelligence</span>
        </div>

        <p>
          © 2026 SkillTrack. Built for smarter skilling outcomes.
        </p>
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

    alert("Login successful!");

    onLogin(data.user);

  } catch (error) {
    console.error("Login error:", error);
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
        

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to access your SkillTrack dashboard.</p>
        </div>

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="admin@skilltrack.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primary login-button" type="submit">
            Sign in
            <ChevronRight size={17} />
          </button>
          <button
  type="button"
  className="login-back"
  onClick={onBack}
>
  ← Back to Home
</button>

        </form>

       <p className="login-demo">
  Don't have an account?{" "}
  <button
    type="button"
    className="signup-link"
    onClick={onSignup}
  >
    Create account
  </button>
</p>

      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
