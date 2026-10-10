let trainings=[],participants=[],speakers=[],attendance=[];

function saveData(){
    localStorage.setItem("trainingSystemData",JSON.stringify({trainings,participants,speakers,attendance}));
}

function loadData(){
    const saved=localStorage.getItem("trainingSystemData");
    if(saved){
        const data=JSON.parse(saved);
        trainings=data.trainings||[]; participants=data.participants||[];
        speakers=data.speakers||[]; attendance=data.attendance||[];
        initialize();
    }else{
        fetch("data.json").then(r=>r.json()).then(data=>{
            trainings=data.trainings||[]; participants=data.participants||[];
            speakers=data.speakers||[]; attendance=data.attendance||[];
            saveData(); initialize();
        }).catch(e=>console.error(e));
    }
}

function initialize(){
    displayTrainings(); displayParticipants(); displaySpeakers();
    displayAttendance(); updateAttendanceDropdowns(); updateDashboard(); updateReport(); updateClock();
}

function showPage(pageName){
    document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
    document.getElementById(pageName).classList.remove("hidden");
}

document.getElementById("trainingForm").addEventListener("submit",function(e){
    e.preventDefault();
    trainings.push({id:Date.now(),title:trainingTitle.value,date:trainingDate.value,time:trainingTime.value,venue:trainingVenue.value,speaker:trainingSpeaker.value});
    saveData(); displayTrainings(); updateAttendanceDropdowns(); updateDashboard(); this.reset();
    alert("Training/Seminar added successfully!");
});

function displayTrainings(){
    trainingTable.innerHTML="";
    trainings.forEach(t=>trainingTable.innerHTML+=`<tr><td>${t.title}</td><td>${t.date}</td><td>${t.time}</td><td>${t.venue}</td><td>${t.speaker}</td><td><button class="delete-btn" onclick="deleteTraining(${t.id})">Delete</button></td></tr>`);
}
function deleteTraining(id){
    trainings=trainings.filter(t=>t.id!==id); saveData(); displayTrainings(); updateAttendanceDropdowns(); updateDashboard();
}

document.getElementById("participantForm").addEventListener("submit",function(e){
    e.preventDefault();
    participants.push({id:Date.now(),name:participantName.value,contact:participantContact.value,address:participantAddress.value});
    saveData(); displayParticipants(); updateAttendanceDropdowns(); updateDashboard(); this.reset();
    alert("Participant added successfully!");
});
function displayParticipants(){
    participantTable.innerHTML="";
    participants.forEach(p=>participantTable.innerHTML+=`<tr><td>${p.name}</td><td>${p.contact}</td><td>${p.address}</td><td><button class="delete-btn" onclick="deleteParticipant(${p.id})">Delete</button></td></tr>`);
}
function deleteParticipant(id){
    participants=participants.filter(p=>p.id!==id); saveData(); displayParticipants(); updateAttendanceDropdowns(); updateDashboard();
}

function updateAttendanceDropdowns(){
    attendanceTraining.innerHTML='<option value="">-- Select Training --</option>';
    attendanceParticipant.innerHTML='<option value="">-- Select Participant --</option>';
    trainings.forEach(t=>attendanceTraining.innerHTML+=`<option value="${t.id}">${t.title} - ${t.date}</option>`);
    participants.forEach(p=>attendanceParticipant.innerHTML+=`<option value="${p.id}">${p.name}</option>`);
}

function getCurrentDate(){
    const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
}

function signInParticipant(){
    const trainingId=attendanceTraining.value,participantId=attendanceParticipant.value;
    if(!trainingId||!participantId){alert("Please select a training/seminar and participant.");return}
    const training=trainings.find(t=>t.id==trainingId),participant=participants.find(p=>p.id==participantId);
    if(!training||!participant){alert("Invalid training or participant.");return}
    const date=getCurrentDate();
    if(attendance.some(a=>a.trainingId==trainingId&&a.participantId==participantId&&a.date===date)){
        alert(`${participant.name} has already signed in for this training today.`);return;
    }
    const now=new Date();
    attendance.push({id:Date.now(),participantId:participant.id,participant:participant.name,trainingId:training.id,training:training.title,date,timeIn:now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"}),status:"Present"});
    saveData(); displayAttendance(); updateDashboard(); updateReport();
    alert(`✓ Attendance recorded!\n\n${participant.name}\nTime In: ${now.toLocaleTimeString()}`);
}

function displayAttendance(){
    attendanceTable.innerHTML="";
    attendance.forEach(a=>attendanceTable.innerHTML+=`<tr><td>${a.participant}</td><td>${a.training}</td><td>${a.date}</td><td>${a.timeIn}</td><td><strong>${a.status}</strong></td></tr>`);
}
function updateReport(){
    reportTable.innerHTML="";
    let present=0,absent=0;
    attendance.forEach(a=>{
        if(a.status==="Present")present++;else absent++;
        reportTable.innerHTML+=`<tr><td>${a.participant}</td><td>${a.training}</td><td>${a.date}</td><td>${a.timeIn}</td><td>${a.status}</td></tr>`;
    });
    reportTotal.textContent=attendance.length; reportPresent.textContent=present; reportAbsent.textContent=absent;
}
function updateDashboard(){
    totalTrainings.textContent=trainings.length;
    totalParticipants.textContent=participants.length;
    totalSpeakers.textContent=speakers.length;
    totalAttendance.textContent=attendance.length;
    upcomingTable.innerHTML="";
    trainings.forEach(t=>upcomingTable.innerHTML+=`<tr><td>${t.title}</td><td>${t.date}</td><td>${t.time}</td><td>${t.venue}</td></tr>`);
}

document.getElementById("speakerForm").addEventListener("submit",function(e){
    e.preventDefault();
    speakers.push({id:Date.now(),name:speakerName.value,topic:speakerTopic.value,contact:speakerContact.value});
    saveData(); displaySpeakers(); updateDashboard(); this.reset();
    alert("Speaker added successfully!");
});
function displaySpeakers(){
    speakerTable.innerHTML="";
    speakers.forEach(s=>speakerTable.innerHTML+=`<tr><td>${s.name}</td><td>${s.topic}</td><td>${s.contact}</td><td><button class="delete-btn" onclick="deleteSpeaker(${s.id})">Delete</button></td></tr>`);
}
function deleteSpeaker(id){speakers=speakers.filter(s=>s.id!==id);saveData();displaySpeakers();updateDashboard();}

function updateClock(){
    const now=new Date();
    currentDate.textContent=now.toLocaleDateString();
    currentTime.textContent=now.toLocaleTimeString();
}
setInterval(updateClock,1000);
loadData();
