export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Eyasta Hospital</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033}
header{background:#123b68;color:white;padding:20px}
header h1{margin:0;font-size:24px}
header p{margin:5px 0 0;opacity:.8}
main{padding:18px}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.card{background:white;border-radius:14px;padding:18px;box-shadow:0 3px 12px #0001}
.card h2{margin:0 0 8px;font-size:25px;color:#123b68}
.card p{margin:0;color:#687386}
nav{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:18px}
button{border:0;border-radius:10px;padding:14px;background:#123b68;color:white;font-size:15px}
.section{margin-top:20px;background:white;padding:18px;border-radius:14px}
input,select{width:100%;padding:12px;margin:6px 0;border:1px solid #ccd4df;border-radius:8px}
</style>
</head>
<body>

<header>
<h1>🏥 Eyasta Hospital</h1>
<p>Hospital Management System</p>
</header>

<main>
<div class="cards">
<div class="card"><h2 id="patients">0</h2><p>Patients</p></div>
<div class="card"><h2 id="doctors">0</h2><p>Doctors</p></div>
<div class="card"><h2 id="appointments">0</h2><p>Appointments</p></div>
<div class="card"><h2 id="medicines">0</h2><p>Medicines</p></div>
</div>

<div class="section">
<h3>Quick Actions</h3>
<nav>
<button onclick="showPatients()">Patients</button>
<button onclick="showDoctors()">Doctors</button>
<button onclick="showAppointments()">Appointments</button>
<button onclick="showPharmacy()">Pharmacy</button>
</nav>
</div>

<div id="content" class="section">
<h3>Welcome to Eyasta Hospital</h3>
<p>Select a section above to manage hospital information.</p>
</div>
</main>

<script>
async function loadDashboard(){
 try{
  const r=await fetch('/api/stats');
  const d=await r.json();
  document.getElementById('patients').textContent=d.patients;
  document.getElementById('doctors').textContent=d.doctors;
  document.getElementById('appointments').textContent=d.appointments;
  document.getElementById('medicines').textContent=d.medicines;
 }catch(e){}
}

function showPatients(){
 document.getElementById('content').innerHTML=`
 <h3>🧑‍🤝‍🧑 Patients</h3>
 <input id="pname" placeholder="Patient name">
 <input id="pphone" placeholder="Phone">
 <input id="page" type="number" placeholder="Age">
 <select id="pgender"><option>Male</option><option>Female</option></select>
 <button onclick="addPatient()">Add Patient</button>
 <div id="plist"></div>`;
 loadPatients();
}

async function addPatient(){
 await fetch('/api/patients',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
   name:pname.value,
   phone:pphone.value,
   age:page.value,
   gender:pgender.value
  })
 });
 showPatients();
 loadDashboard();
}

async function loadPatients(){
 const r=await fetch('/api/patients');
 const d=await r.json();
 plist.innerHTML=d.map(p=>`<p><b>${p.name}</b> — ${p.gender}, ${p.age} — ${p.phone||''}</p>`).join('');
}

function showDoctors(){
 document.getElementById('content').innerHTML=`
 <h3>👨‍⚕️ Doctors</h3>
 <input id="dname" placeholder="Doctor name">
 <input id="dspec" placeholder="Specialization">
 <input id="dphone" placeholder="Phone">
 <button onclick="addDoctor()">Add Doctor</button>
 <div id="dlist"></div>`;
 loadDoctors();
}

async function addDoctor(){
 await fetch('/api/doctors',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
   name:dname.value,
   specialization:dspec.value,
   phone:dphone.value
  })
 });
 showDoctors();
 loadDashboard();
}

async function loadDoctors(){
 const r=await fetch('/api/doctors');
 const d=await r.json();
 dlist.innerHTML=d.map(x=>`<p><b>${x.name}</b> — ${x.specialization||'General'} — ${x.phone||''}</p>`).join('');
}

function showAppointments(){
 document.getElementById('content').innerHTML=`
 <h3>📅 Appointments</h3>
 <p>Appointment management is ready for the next module.</p>`;
}

function showPharmacy(){
 document.getElementById('content').innerHTML=`
 <h3>💊 Pharmacy</h3>
 <p>Medicine inventory management is ready for the next module.</p>`;
}

loadDashboard();
</script>

</body>
</html>
      `, {
        headers: {"Content-Type":"text/html;charset=UTF-8"}
      });
    }

    if (url.pathname === "/api/stats") {
      const tables = ["patients","doctors","appointments","medicines"];
      const result = {};
      for (const table of tables) {
        const r = await env.DB.prepare(
          `SELECT COUNT(*) AS count FROM ${table}`
        ).first();
        result[table] = r.count;
      }
      return Response.json(result);
    }

    if (url.pathname === "/api/patients") {
      if (request.method === "GET") {
        const r = await env.DB.prepare(
          "SELECT * FROM patients ORDER BY id DESC"
        ).all();
        return Response.json(r.results);
      }

      if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
          "INSERT INTO patients (name,phone,age,gender) VALUES (?,?,?,?)"
        ).bind(data.name,data.phone,data.age,data.gender).run();

        return Response.json({success:true});
      }
    }

    if (url.pathname === "/api/doctors") {
      if (request.method === "GET") {
        const r = await env.DB.prepare(
          "SELECT * FROM doctors ORDER BY id DESC"
        ).all();
        return Response.json(r.results);
      }

      if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
          "INSERT INTO doctors (name,specialization,phone) VALUES (?,?,?)"
        ).bind(data.name,data.specialization,data.phone).run();

        return Response.json({success:true});
      }
    }

    return new Response("Not Found", {status:404});
  }
};
