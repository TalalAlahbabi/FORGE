/* =========================================================
   FORGE v2 — training app engine
   ========================================================= */

// ============ DATA ============
let workouts     = JSON.parse(localStorage.getItem("forge_workouts") || "[]")
let runs         = JSON.parse(localStorage.getItem("forge_runs") || "[]")
let weights      = JSON.parse(localStorage.getItem("forge_weights") || "[]") // body weight log
let selectedPlan = JSON.parse(localStorage.getItem("forge_plan") || "null")
let profile      = JSON.parse(localStorage.getItem("forge_profile") || "null") || {
    name: "", weight: null, rest: 90, autoRest: true, warmup: true
}
let theme = localStorage.getItem("forge_theme") || "dark"

// ============ GYM PLANS (4 only) ============
const PLANS = {
    "Push Pull Legs": {
        days: 6, desc: "Classic bodybuilding split. High volume per muscle.",
        schedule: [
            { day: "Push", ex: [
                { name: "Bench Press", sets: 4, reps: "6-10" },
                { name: "Incline Dumbbell Press", sets: 3, reps: "8-12" },
                { name: "Shoulder Press", sets: 3, reps: "8-12" },
                { name: "Lateral Raise", sets: 3, reps: "12-15" },
                { name: "Triceps Pushdown", sets: 3, reps: "10-15" },
            ]},
            { day: "Pull", ex: [
                { name: "Deadlift", sets: 3, reps: "5-8" },
                { name: "Pull Up", sets: 3, reps: "6-12" },
                { name: "Barbell Row", sets: 3, reps: "8-12" },
                { name: "Face Pull", sets: 3, reps: "12-15" },
                { name: "Biceps Curl", sets: 3, reps: "10-15" },
            ]},
            { day: "Legs", ex: [
                { name: "Squat", sets: 4, reps: "6-10" },
                { name: "Romanian Deadlift", sets: 3, reps: "8-12" },
                { name: "Leg Press", sets: 3, reps: "10-15" },
                { name: "Leg Curl", sets: 3, reps: "10-15" },
                { name: "Calf Raise", sets: 4, reps: "12-20" },
            ]},
        ]
    },
    "Upper Lower": {
        days: 4, desc: "Balanced 4-day split. Great recovery.",
        schedule: [
            { day: "Upper A", ex: [
                { name: "Bench Press", sets: 4, reps: "6-10" },
                { name: "Barbell Row", sets: 4, reps: "8-12" },
                { name: "Shoulder Press", sets: 3, reps: "8-12" },
                { name: "Lat Pulldown", sets: 3, reps: "10-12" },
                { name: "Biceps Curl", sets: 3, reps: "10-15" },
            ]},
            { day: "Lower A", ex: [
                { name: "Squat", sets: 4, reps: "6-10" },
                { name: "Romanian Deadlift", sets: 3, reps: "8-12" },
                { name: "Leg Press", sets: 3, reps: "10-15" },
                { name: "Leg Curl", sets: 3, reps: "10-15" },
                { name: "Calf Raise", sets: 4, reps: "12-20" },
            ]},
            { day: "Upper B", ex: [
                { name: "Incline Dumbbell Press", sets: 4, reps: "8-12" },
                { name: "Pull Up", sets: 4, reps: "6-12" },
                { name: "Lateral Raise", sets: 3, reps: "12-15" },
                { name: "Seated Row", sets: 3, reps: "10-12" },
                { name: "Triceps Pushdown", sets: 3, reps: "10-15" },
            ]},
            { day: "Lower B", ex: [
                { name: "Deadlift", sets: 3, reps: "5-8" },
                { name: "Front Squat", sets: 3, reps: "8-12" },
                { name: "Leg Extension", sets: 3, reps: "12-15" },
                { name: "Leg Curl", sets: 3, reps: "10-15" },
                { name: "Calf Raise", sets: 4, reps: "12-20" },
            ]},
        ]
    },
    "Full Body": {
        days: 3, desc: "Best for beginners or 3 days a week.",
        schedule: [
            { day: "Full Body A", ex: [
                { name: "Squat", sets: 3, reps: "8-12" },
                { name: "Bench Press", sets: 3, reps: "8-12" },
                { name: "Barbell Row", sets: 3, reps: "8-12" },
                { name: "Shoulder Press", sets: 3, reps: "10-12" },
                { name: "Biceps Curl", sets: 2, reps: "12-15" },
            ]},
            { day: "Full Body B", ex: [
                { name: "Deadlift", sets: 3, reps: "5-8" },
                { name: "Incline Dumbbell Press", sets: 3, reps: "8-12" },
                { name: "Lat Pulldown", sets: 3, reps: "10-12" },
                { name: "Lateral Raise", sets: 3, reps: "12-15" },
                { name: "Triceps Pushdown", sets: 2, reps: "12-15" },
            ]},
            { day: "Full Body C", ex: [
                { name: "Leg Press", sets: 3, reps: "10-15" },
                { name: "Pull Up", sets: 3, reps: "6-12" },
                { name: "Shoulder Press", sets: 3, reps: "8-12" },
                { name: "Leg Curl", sets: 3, reps: "10-15" },
                { name: "Calf Raise", sets: 3, reps: "12-20" },
            ]},
        ]
    },
    "Bro Split": {
        days: 5, desc: "One muscle group per day. For advanced lifters.",
        schedule: [
            { day: "Chest", ex: [
                { name: "Bench Press", sets: 4, reps: "6-10" },
                { name: "Incline Dumbbell Press", sets: 3, reps: "8-12" },
                { name: "Pec Fly", sets: 3, reps: "12-15" },
                { name: "Cable Crossover", sets: 3, reps: "12-15" },
            ]},
            { day: "Back", ex: [
                { name: "Deadlift", sets: 4, reps: "5-8" },
                { name: "Pull Up", sets: 3, reps: "6-12" },
                { name: "Barbell Row", sets: 3, reps: "8-12" },
                { name: "Seated Row", sets: 3, reps: "10-12" },
            ]},
            { day: "Shoulders", ex: [
                { name: "Shoulder Press", sets: 4, reps: "8-12" },
                { name: "Lateral Raise", sets: 4, reps: "12-15" },
                { name: "Rear Delt Fly", sets: 3, reps: "12-15" },
                { name: "Face Pull", sets: 3, reps: "12-15" },
            ]},
            { day: "Arms", ex: [
                { name: "Biceps Curl", sets: 4, reps: "10-15" },
                { name: "Triceps Pushdown", sets: 4, reps: "10-15" },
                { name: "Hammer Curl", sets: 3, reps: "10-15" },
                { name: "Overhead Triceps Extension", sets: 3, reps: "10-15" },
            ]},
            { day: "Legs", ex: [
                { name: "Squat", sets: 4, reps: "6-10" },
                { name: "Leg Press", sets: 3, reps: "10-15" },
                { name: "Leg Curl", sets: 3, reps: "10-15" },
                { name: "Calf Raise", sets: 4, reps: "12-20" },
            ]},
        ]
    },
}

// ============ RUN PLANS ============
const RUN_PLANS = {
    "5K Improvement": { desc: "Get faster over 5K. 3 runs/week, 6 weeks.", weekly: "1 easy · 1 intervals · 1 tempo" },
    "10K Improvement": { desc: "Build speed and endurance for 10K. 4 runs/week.", weekly: "2 easy · 1 intervals · 1 long" },
    "Half Marathon": { desc: "Train up to 21.1K. 4 runs/week, building long runs.", weekly: "2 easy · 1 tempo · 1 long" },
}

// ============ SAVE ============
function save() {
    localStorage.setItem("forge_workouts", JSON.stringify(workouts))
    localStorage.setItem("forge_runs", JSON.stringify(runs))
    localStorage.setItem("forge_weights", JSON.stringify(weights))
    localStorage.setItem("forge_plan", JSON.stringify(selectedPlan))
    localStorage.setItem("forge_profile", JSON.stringify(profile))
    localStorage.setItem("forge_theme", theme)
    if (typeof queueCloudPush === "function") queueCloudPush()
}

// ============ NAVIGATION ============
let currentScreen = "home"

function go(screen) {
    currentScreen = screen
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"))
    const el = document.getElementById("screen-" + screen)
    if (el) el.classList.add("active")

    // nav active state
    document.querySelectorAll(".nav-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.screen === screen)
    })

    // hide bottom nav during active workout
    document.getElementById("bottomNav").classList.toggle("hidden", screen === "workout")

    // render
    if (screen === "home") renderHome()
    if (screen === "gym") renderGym()
    if (screen === "run") renderRun()
    if (screen === "progress") renderProgress()
    if (screen === "history") renderHistory()
    if (screen === "profile") renderProfile()

    window.scrollTo(0, 0)
}

// ============ HELPERS ============
function fmt(n, d = 1) {
    if (n == null || isNaN(n)) return "—"
    return Number(n).toFixed(d).replace(/\.0+$/, "")
}

function todayStr() { return new Date().toISOString().slice(0, 10) }

function estimate1RM(w, r) {
    if (!w || !r || r < 1) return 0
    return r === 1 ? w : w * (1 + r / 30)
}

function getStreak() {
    const dates = [...new Set([...workouts.map(w => w.date), ...runs.map(r => r.date)])].sort().reverse()
    if (dates.length === 0) return 0
    let streak = 0
    let cursor = new Date(); cursor.setHours(0,0,0,0)
    const today = todayStr()
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10)
    if (dates[0] !== today && dates[0] !== yesterday) return 0
    // Walk back day by day
    let checkDate = dates[0] === today ? new Date() : new Date(Date.now() - 86400000)
    checkDate.setHours(0,0,0,0)
    const dateSet = new Set(dates)
    while (dateSet.has(checkDate.toISOString().slice(0,10))) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
    }
    return streak
}

function toast(msg, kind = "") {
    const host = document.getElementById("toastHost")
    const t = document.createElement("div")
    t.className = "toast " + kind
    t.textContent = msg
    host.appendChild(t)
    requestAnimationFrame(() => t.classList.add("show"))
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300) }, 2600)
}

// previous performance for an exercise
function getPrevious(exName) {
    const hits = workouts.filter(w => w.exercise === exName).sort((a,b) => new Date(b.date) - new Date(a.date))
    return hits[0] || null
}

// best e1RM for exercise
function getBestLift(exName) {
    let best = 0, rec = null
    workouts.filter(w => w.exercise === exName).forEach(w => {
        const e = estimate1RM(parseFloat(w.weight), parseInt(w.reps))
        if (e > best) { best = e; rec = w }
    })
    return rec ? { e1rm: best, ...rec } : null
}

function totalVolume() {
    return workouts.reduce((s, w) => s + (parseFloat(w.weight)||0) * (parseInt(w.reps)||0) * (parseInt(w.sets)||0), 0)
}

function sessionCount() {
    return new Set(workouts.map(w => w.date + w.day)).size
}

// ============ THEME ============
function applyTheme() {
    document.body.setAttribute("data-theme", theme)
    const lbl = document.getElementById("themeLabel")
    if (lbl) lbl.textContent = theme === "dark" ? "Dark" : "Light"
}
function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark"
    applyTheme()
    save()
}

// ============ HOME ============
function renderHome() {
    // greeting
    const h = new Date().getHours()
    const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
    document.getElementById("homeGreeting").textContent = profile.name ? `${greet}, ${profile.name}` : greet

    // streak
    document.getElementById("streakNum").textContent = getStreak()

    // gym sub — next workout
    const gymSub = document.getElementById("homeGymSub")
    if (selectedPlan && PLANS[selectedPlan]) {
        const next = getNextDay()
        gymSub.textContent = next ? next.day : "Pick a workout"
    } else {
        gymSub.textContent = "Choose a plan"
    }

    // week dots
    renderWeekDots()

    // recovery
    renderRecovery()

    // recent PRs
    renderHomePRs()
}

function getNextDay() {
    if (!selectedPlan || !PLANS[selectedPlan]) return null
    const sched = PLANS[selectedPlan].schedule
    // find the least-recently-done day
    let best = sched[0], oldestDate = "9999"
    for (const d of sched) {
        const last = workouts.filter(w => w.day === d.day).sort((a,b) => new Date(b.date) - new Date(a.date))[0]
        const lastDate = last ? last.date : "0000"
        if (lastDate < oldestDate) { oldestDate = lastDate; best = d }
    }
    return best
}

function renderWeekDots() {
    const box = document.getElementById("weekDots")
    const days = ["S","M","T","W","T","F","S"]
    const today = new Date()
    const todayIdx = today.getDay()
    // get start of week (Sunday)
    const sunday = new Date(today); sunday.setDate(today.getDate() - todayIdx); sunday.setHours(0,0,0,0)

    let html = ""
    let trained = 0
    for (let i = 0; i < 7; i++) {
        const d = new Date(sunday); d.setDate(sunday.getDate() + i)
        const ds = d.toISOString().slice(0,10)
        const hasGym = workouts.some(w => w.date === ds)
        const hasRun = runs.some(r => r.date === ds)
        if (hasGym || hasRun) trained++
        let cls = "week-dot"
        if (hasGym) cls += " done"
        else if (hasRun) cls += " run"
        if (i === todayIdx) cls += " today"
        html += `<div class="${cls}">${days[i]}</div>`
    }
    box.innerHTML = html
    document.getElementById("weekMeta").textContent = `${trained}/7 days`
}

function renderRecovery() {
    // simple recovery estimate: based on days since last session and weekly frequency
    const allDates = [...workouts.map(w=>w.date), ...runs.map(r=>r.date)].sort().reverse()
    const fill = document.getElementById("recoveryFill")
    const state = document.getElementById("recoveryState")
    const note = document.getElementById("recoveryNote")

    if (allDates.length === 0) {
        fill.style.width = "100%"; fill.style.background = "var(--green)"
        state.textContent = "Fresh"
        note.textContent = "Ready to train. Log your first session."
        return
    }
    const last = allDates[0]
    const hoursSince = (Date.now() - new Date(last).getTime()) / 3600000
    // count sessions last 7 days
    const weekAgo = new Date(Date.now() - 7*86400000).toISOString().slice(0,10)
    const recentCount = allDates.filter(d => d >= weekAgo).length

    let pct, label, msg, color
    if (hoursSince < 12) {
        pct = 35; label = "Recovering"; color = "var(--orange)"
        msg = "Trained recently. Give muscles time to rebuild."
    } else if (hoursSince < 36) {
        pct = 70; label = "Almost ready"; color = "var(--blue)"
        msg = "Recovering well. Light or moderate session is fine."
    } else {
        pct = 100; label = "Fresh"; color = "var(--green)"
        msg = "Fully recovered. Go hard today."
    }
    if (recentCount >= 6) {
        pct = Math.min(pct, 50); label = "High fatigue"; color = "var(--orange)"
        msg = "6+ sessions this week. Consider a rest day."
    }
    fill.style.width = pct + "%"
    fill.style.background = color
    state.textContent = label
    note.textContent = msg
}

function renderHomePRs() {
    const box = document.getElementById("homePRList")
    // top 3 lifts by e1RM
    const byEx = {}
    workouts.forEach(w => {
        const e = estimate1RM(parseFloat(w.weight), parseInt(w.reps))
        if (!byEx[w.exercise] || e > byEx[w.exercise].e1rm) byEx[w.exercise] = { e1rm: e, ...w }
    })
    const top = Object.entries(byEx).sort((a,b) => b[1].e1rm - a[1].e1rm).slice(0, 3)
    if (top.length === 0) {
        box.innerHTML = `<div class="empty-line">No PRs yet. Start logging to see your records.</div>`
        return
    }
    box.innerHTML = top.map(([name, d]) => `
        <div class="pr-row">
            <div><div class="pr-name">${name}</div><div class="pr-sub">${fmt(d.weight)}kg × ${d.reps}</div></div>
            <div class="pr-val">${fmt(d.e1rm)}kg</div>
        </div>`).join("")
}

// ============ GYM ============
function renderGym() {
    const banner = document.getElementById("planBannerName")
    banner.textContent = selectedPlan || "No plan selected"

    const list = document.getElementById("gymDayList")
    if (!selectedPlan || !PLANS[selectedPlan]) {
        list.innerHTML = `<div class="card"><div class="empty-line">Choose a plan to see your workouts.</div>
            <button class="btn-primary full" style="margin-top:12px" onclick="openPlanPicker()">Choose a plan</button></div>`
        return
    }
    const nextDay = getNextDay()
    list.innerHTML = PLANS[selectedPlan].schedule.map(d => {
        const isNext = nextDay && d.day === nextDay.day
        const last = workouts.filter(w => w.day === d.day).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
        const lastTxt = last ? `Last: ${timeAgo(last.date)}` : "Not done yet"
        return `<div class="day-card ${isNext?'next':''}" onclick="startWorkout('${d.day.replace(/'/g,"\\'")}')">
            <div>
                ${isNext ? '<div class="day-card-badge">Up next</div>' : ''}
                <div class="day-card-name">${d.day}</div>
                <div class="day-card-sub">${d.ex.length} exercises · ${lastTxt}</div>
            </div>
            <div class="day-card-go">›</div>
        </div>`
    }).join("")
}

function timeAgo(dateStr) {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (days === 0) return "today"
    if (days === 1) return "yesterday"
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days/7)}w ago`
    return `${Math.floor(days/30)}mo ago`
}

function startTodayGym() {
    if (!selectedPlan || !PLANS[selectedPlan]) { go("gym"); openPlanPicker(); return }
    const next = getNextDay()
    if (next) startWorkout(next.day)
    else go("gym")
}

// ============ PLAN PICKER ============
function openPlanPicker() {
    let html = `<div class="sheet-title">Choose a plan</div><div class="sheet-sub">Pick the split that fits your schedule.</div>`
    html += Object.entries(PLANS).map(([name, p]) => `
        <div class="plan-option ${selectedPlan===name?'selected':''}" onclick="pickPlan('${name.replace(/'/g,"\\'")}')">
            <div class="plan-option-name">${name}</div>
            <div class="plan-option-desc">${p.desc}</div>
            <div class="plan-option-days">${p.days} days/week</div>
        </div>`).join("")
    openSheet(html)
}

function pickPlan(name) {
    selectedPlan = name
    save()
    closeSheet()
    toast(`${name} selected`, "success")
    renderGym()
}

// ============ SHEET ============
function openSheet(html) {
    document.getElementById("sheetContent").innerHTML = html
    document.getElementById("sheetBackdrop").classList.add("active")
    document.body.style.overflow = "hidden"
}
function closeSheet() {
    document.getElementById("sheetBackdrop").classList.remove("active")
    document.body.style.overflow = ""
}

// ============ WORKOUT FLOW ============
let activeWorkout = null  // { day, exercises: [{name, target, sets:[{weight,reps,done}]}], startTime }
let workoutClockInterval = null

function startWorkout(dayName) {
    const day = PLANS[selectedPlan].schedule.find(d => d.day === dayName)
    if (!day) return

    activeWorkout = {
        day: dayName,
        startTime: Date.now(),
        exercises: day.ex.map(e => {
            const prev = getPrevious(e.name)
            const nSets = e.sets
            const sets = []
            for (let i = 0; i < nSets; i++) {
                sets.push({
                    weight: prev ? prev.weight : "",
                    reps: "",
                    done: false
                })
            }
            return { name: e.name, target: e.reps, targetSets: e.sets, sets, prev }
        })
    }
    go("workout")
    renderWorkout()
    startWorkoutClock()
}

function startWorkoutClock() {
    clearInterval(workoutClockInterval)
    workoutClockInterval = setInterval(() => {
        if (!activeWorkout) return
        const secs = Math.floor((Date.now() - activeWorkout.startTime) / 1000)
        const m = Math.floor(secs / 60), s = secs % 60
        const el = document.getElementById("workoutClock")
        if (el) el.textContent = `${m}:${String(s).padStart(2,'0')}`
    }, 1000)
}

function renderWorkout() {
    if (!activeWorkout) return
    document.getElementById("workoutDayName").textContent = activeWorkout.day

    const body = document.getElementById("workoutBody")
    body.innerHTML = activeWorkout.exercises.map((ex, ei) => {
        const allDone = ex.sets.every(s => s.done)
        let warmup = ""
        if (profile.warmup && ei === 0 && ex.sets[0].weight) {
            warmup = `<div class="ex-warmup">🔥 Warmup: empty bar × 10, then ${fmt(ex.sets[0].weight*0.5)}kg × 5, ${fmt(ex.sets[0].weight*0.7)}kg × 3</div>`
        }
        return `<div class="ex-block ${allDone?'done':''}" id="exblock-${ei}">
            <div class="ex-block-head">
                <div class="ex-block-name">${ex.name}</div>
                <div class="ex-block-target">${ex.targetSets}×${ex.target}</div>
            </div>
            <div class="ex-prev">${ex.prev ? `Previous: <b>${fmt(ex.prev.weight)}kg × ${ex.prev.reps}</b>` : "First time — find your working weight"}</div>
            ${warmup}
            <div class="set-labels"><span>Set</span><span>kg</span><span>Reps</span><span></span></div>
            <div id="sets-${ei}">
                ${ex.sets.map((s, si) => setRowHtml(ei, si, s)).join("")}
            </div>
            <button class="add-set-btn" onclick="addSet(${ei})">+ Add set</button>
        </div>`
    }).join("") + `<button class="finish-workout-btn" onclick="finishWorkout()">Finish workout</button>`

    updateWorkoutProgress()
}

function setRowHtml(ei, si, s) {
    return `<div class="set-row">
        <div class="set-num">${si+1}</div>
        <input type="number" inputmode="decimal" placeholder="${s.weight||'0'}" value="${s.weight!==''&&!s.done?s.weight:(s.done?s.weight:'')}" onchange="updateSet(${ei},${si},'weight',this.value)">
        <input type="number" inputmode="numeric" placeholder="0" value="${s.reps!==''?s.reps:''}" onchange="updateSet(${ei},${si},'reps',this.value)">
        <button class="set-check ${s.done?'checked':''}" onclick="toggleSet(${ei},${si})">✓</button>
    </div>`
}

function updateSet(ei, si, field, val) {
    activeWorkout.exercises[ei].sets[si][field] = val
}

function toggleSet(ei, si) {
    const set = activeWorkout.exercises[ei].sets[si]
    // grab current input values
    const row = document.querySelectorAll(`#sets-${ei} .set-row`)[si]
    const inputs = row.querySelectorAll("input")
    set.weight = inputs[0].value || set.weight || inputs[0].placeholder
    set.reps = inputs[1].value || set.reps
    set.done = !set.done

    if (set.done && !set.reps) {
        toast("Enter reps first", "warn")
        set.done = false
        return
    }

    renderWorkout()

    // auto rest timer
    if (set.done && profile.autoRest) {
        startRest(profile.rest || 90)
    }
}

function addSet(ei) {
    const ex = activeWorkout.exercises[ei]
    const lastSet = ex.sets[ex.sets.length - 1]
    ex.sets.push({ weight: lastSet ? lastSet.weight : "", reps: "", done: false })
    renderWorkout()
}

function updateWorkoutProgress() {
    if (!activeWorkout) return
    let total = 0, done = 0
    activeWorkout.exercises.forEach(ex => ex.sets.forEach(s => { total++; if (s.done) done++ }))
    const pct = total ? (done/total*100) : 0
    const bar = document.getElementById("exerciseProgress")
    if (bar) bar.style.width = pct + "%"
}

function confirmExitWorkout() {
    const anyLogged = activeWorkout && activeWorkout.exercises.some(ex => ex.sets.some(s => s.done))
    if (anyLogged) {
        openSheet(`<div class="sheet-title">Leave workout?</div>
            <div class="sheet-sub">You have logged sets. What do you want to do?</div>
            <button class="btn-primary full" style="margin-bottom:10px" onclick="closeSheet();finishWorkout()">Save & finish</button>
            <button class="btn-ghost" style="width:100%;padding:14px" onclick="closeSheet();discardWorkout()">Discard workout</button>`)
    } else {
        discardWorkout()
    }
}

function discardWorkout() {
    activeWorkout = null
    clearInterval(workoutClockInterval)
    go("gym")
}

function finishWorkout() {
    if (!activeWorkout) { go("gym"); return }
    const date = todayStr()
    let logged = 0
    let prCount = 0

    activeWorkout.exercises.forEach(ex => {
        const doneSets = ex.sets.filter(s => s.done && s.reps)
        if (doneSets.length === 0) return
        // record best set of this exercise (heaviest weight × reps)
        const prevBest = getBestLift(ex.name)
        // Use top set
        let topSet = doneSets[0]
        doneSets.forEach(s => {
            if (estimate1RM(parseFloat(s.weight), parseInt(s.reps)) > estimate1RM(parseFloat(topSet.weight), parseInt(topSet.reps))) topSet = s
        })
        workouts.push({
            date, day: activeWorkout.day, exercise: ex.name,
            weight: parseFloat(topSet.weight) || 0,
            reps: parseInt(topSet.reps) || 0,
            sets: doneSets.length,
            e1rm: estimate1RM(parseFloat(topSet.weight), parseInt(topSet.reps)),
            allSets: doneSets.map(s => ({ weight: parseFloat(s.weight)||0, reps: parseInt(s.reps)||0 })),
            client_id: `w-${date}-${activeWorkout.day}-${ex.name}-${Date.now()}`.replace(/\s+/g,"_")
        })
        logged++
        const newBest = getBestLift(ex.name)
        if (prevBest && newBest && newBest.e1rm > prevBest.e1rm + 0.5) prCount++
    })

    activeWorkout = null
    clearInterval(workoutClockInterval)

    if (logged === 0) {
        toast("No sets logged", "warn")
        go("gym")
        return
    }

    save()
    if (prCount > 0) toast(`🏆 ${prCount} new PR${prCount>1?'s':''}! ${logged} exercises logged`, "success")
    else toast(`Workout saved — ${logged} exercises`, "success")
    go("home")
}

// ============ REST TIMER ============
let restInterval = null
let restRemaining = 0
let restTotal = 0

function startRest(seconds) {
    restRemaining = seconds
    restTotal = seconds
    document.getElementById("restOverlay").classList.add("active")
    updateRestDisplay()
    clearInterval(restInterval)
    restInterval = setInterval(() => {
        restRemaining--
        updateRestDisplay()
        if (restRemaining <= 0) {
            skipRest()
            // subtle vibration if available
            if (navigator.vibrate) navigator.vibrate(200)
        }
    }, 1000)
}

function updateRestDisplay() {
    const m = Math.floor(restRemaining / 60), s = restRemaining % 60
    document.getElementById("restTime").textContent = `${m}:${String(s).padStart(2,'0')}`
    const circ = 565.48
    const ring = document.getElementById("restRingFg")
    const pct = restTotal ? restRemaining / restTotal : 0
    ring.style.strokeDashoffset = circ * (1 - pct)
}

function adjustRest(delta) {
    restRemaining = Math.max(5, restRemaining + delta)
    restTotal = Math.max(restTotal, restRemaining)
    updateRestDisplay()
}

function skipRest() {
    clearInterval(restInterval)
    document.getElementById("restOverlay").classList.remove("active")
}

// ============ REPEAT LAST WORKOUT ============
function repeatLastWorkout() {
    if (workouts.length === 0) { toast("No previous workouts", "warn"); return }
    const lastDate = workouts.map(w=>w.date).sort().reverse()[0]
    const lastDay = workouts.filter(w=>w.date===lastDate)[0]?.day
    if (lastDay && PLANS[selectedPlan]?.schedule.find(d=>d.day===lastDay)) {
        startWorkout(lastDay)
    } else {
        toast("Last workout's plan not found", "warn")
    }
}

function openPaceFromGym() {
    go("progress")
}

// ============ RUN ============
function renderRun() {
    // pace preview live
    setupRunPaceLive()
    // run plans
    document.getElementById("runPlanList").innerHTML = Object.entries(RUN_PLANS).map(([name,p]) => `
        <div class="run-plan-card" onclick="toast('${name} — coming soon as guided plan','')">
            <div class="run-plan-name">${name}</div>
            <div class="run-plan-sub">${p.desc}</div>
            <div class="run-plan-sub" style="color:var(--orange);margin-top:4px">${p.weekly}</div>
        </div>`).join("")
    // recent runs
    renderRunHistory()
}

function setupRunPaceLive() {
    const dist = document.getElementById("runDist")
    const time = document.getElementById("runTime")
    const prev = document.getElementById("runPacePreview")
    function update() {
        const d = parseFloat(dist.value), t = parseFloat(time.value)
        if (d > 0 && t > 0) {
            const pace = t / d
            const pmin = Math.floor(pace), ps = Math.round((pace - pmin) * 60)
            prev.innerHTML = `Pace <b>${pmin}:${String(ps).padStart(2,'0')}</b> /km`
        } else {
            prev.textContent = "Pace will show here"
        }
    }
    dist.oninput = update
    time.oninput = update
}

function saveRun() {
    const d = parseFloat(document.getElementById("runDist").value)
    const t = parseFloat(document.getElementById("runTime").value)
    const type = document.getElementById("runType").value
    if (!d || !t || d <= 0 || t <= 0) { toast("Enter distance and time", "warn"); return }
    const pace = t / d
    runs.push({
        date: todayStr(), distance: d, time: t, pace, type,
        client_id: `r-${Date.now()}`
    })
    save()
    document.getElementById("runDist").value = ""
    document.getElementById("runTime").value = ""
    document.getElementById("runPacePreview").textContent = "Pace will show here"
    toast(`Run saved — ${fmt(d)}km`, "success")
    renderRunHistory()
}

function renderRunHistory() {
    const box = document.getElementById("runHistory")
    if (runs.length === 0) {
        box.innerHTML = `<div class="card"><div class="empty-line">No runs yet. Log your first run above.</div></div>`
        return
    }
    box.innerHTML = runs.slice().reverse().slice(0, 10).map(r => {
        const pmin = Math.floor(r.pace), ps = Math.round((r.pace - pmin) * 60)
        return `<div class="run-card">
            <div>
                <div class="run-card-dist">${fmt(r.distance)} km</div>
                <div class="run-card-meta">${timeAgo(r.date)} · ${fmt(r.time)} min</div>
            </div>
            <div>
                <div class="run-card-pace">${pmin}:${String(ps).padStart(2,'0')}/km</div>
                <div class="run-card-type">${r.type}</div>
            </div>
        </div>`
    }).join("")
}

function calcPace() {
    const d = parseFloat(document.getElementById("calcDist").value)
    const p = parseFloat(document.getElementById("calcPace").value)
    const res = document.getElementById("calcResult")
    if (d > 0 && p > 0) {
        const total = d * p
        const m = Math.floor(total), s = Math.round((total - m) * 60)
        const h = Math.floor(m / 60), mm = m % 60
        const timeStr = h > 0 ? `${h}h ${mm}m ${s}s` : `${mm}m ${s}s`
        res.innerHTML = `Finish time <b>${timeStr}</b>`
    } else {
        res.textContent = "Enter values to calculate finish time"
    }
}

// ============ PROGRESS ============
function switchProgress(which, btn) {
    document.querySelectorAll("#progressSeg .seg").forEach(s => s.classList.remove("active"))
    btn.classList.add("active")
    document.getElementById("progressGym").style.display = which === "gym" ? "block" : "none"
    document.getElementById("progressRun").style.display = which === "run" ? "block" : "none"
}

function renderProgress() {
    // gym stats
    document.getElementById("pgSessions").textContent = sessionCount()
    document.getElementById("pgVolume").textContent = fmt(totalVolume() / 1000, 1)
    document.getElementById("pgStreak").textContent = getStreak()
    const lastW = weights.slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
    document.getElementById("pgWeight").textContent = lastW ? fmt(lastW.kg) : (profile.weight ? fmt(profile.weight) : "—")

    // top lifts
    const byEx = {}
    workouts.forEach(w => {
        const e = estimate1RM(parseFloat(w.weight), parseInt(w.reps))
        if (!byEx[w.exercise] || e > byEx[w.exercise].e1rm) byEx[w.exercise] = { e1rm: e, ...w }
    })
    const top = Object.entries(byEx).sort((a,b)=>b[1].e1rm-a[1].e1rm).slice(0,6)
    const liftBox = document.getElementById("pgTopLifts")
    liftBox.innerHTML = top.length ? top.map(([n,d]) => `
        <div class="lift-row"><div><div class="pr-name">${n}</div><div class="pr-sub">${fmt(d.weight)}kg × ${d.reps}</div></div><div class="pr-val">${fmt(d.e1rm)}kg</div></div>`).join("")
        : `<div class="empty-line">No lifts logged yet.</div>`

    // body weight chart
    renderWeightChart()

    // run stats
    document.getElementById("prRuns").textContent = runs.length
    const totalKm = runs.reduce((s,r)=>s+r.distance,0)
    document.getElementById("prKm").textContent = fmt(totalKm)
    const weekAgo = new Date(Date.now()-7*86400000).toISOString().slice(0,10)
    const weekKm = runs.filter(r=>r.date>=weekAgo).reduce((s,r)=>s+r.distance,0)
    document.getElementById("prWeek").textContent = fmt(weekKm)
    const avgPace = runs.length ? runs.reduce((s,r)=>s+r.pace,0)/runs.length : 0
    if (avgPace > 0) {
        const pmin = Math.floor(avgPace), ps = Math.round((avgPace-pmin)*60)
        document.getElementById("prPace").textContent = `${pmin}:${String(ps).padStart(2,'0')}`
    } else document.getElementById("prPace").textContent = "—"

    renderPaceChart()
    renderMileageChart()
}

function renderWeightChart() {
    const box = document.getElementById("pgWeightChart")
    const data = weights.slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(-20)
    if (data.length < 2) { box.innerHTML = `<div class="chart-empty">Log body weight to see your trend.</div>`; return }
    box.innerHTML = lineChart(data.map(d=>d.kg), "blue")
}

function renderPaceChart() {
    const box = document.getElementById("prPaceChart")
    const data = runs.slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(-15)
    if (data.length < 2) { box.innerHTML = `<div class="chart-empty">Log runs to see pace progression.</div>`; return }
    // invert pace so faster = higher on chart
    box.innerHTML = lineChart(data.map(d=>d.pace), "orange", true)
}

function renderMileageChart() {
    const box = document.getElementById("prMileageChart")
    if (runs.length === 0) { box.innerHTML = `<div class="chart-empty">No runs logged yet.</div>`; return }
    // weekly mileage last 8 weeks
    const weeks = {}
    runs.forEach(r => {
        const d = new Date(r.date)
        const sunday = new Date(d); sunday.setDate(d.getDate()-d.getDay())
        const key = sunday.toISOString().slice(0,10)
        weeks[key] = (weeks[key]||0) + r.distance
    })
    const sorted = Object.entries(weeks).sort((a,b)=>new Date(a[0])-new Date(b[0])).slice(-8)
    box.innerHTML = barChart(sorted.map(w=>w[1]))
}

// simple SVG line chart
function lineChart(values, color="blue", invert=false) {
    const W=320, H=140, P=12
    const min = Math.min(...values), max = Math.max(...values)
    const range = max-min || 1
    const pts = values.map((v,i) => {
        const x = P + (i/(values.length-1))*(W-P*2)
        let norm = (v-min)/range
        if (invert) norm = 1-norm
        const y = H-P - norm*(H-P*2)
        return [x,y]
    })
    const path = pts.map((p,i)=>`${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")
    const area = path + ` L${pts[pts.length-1][0].toFixed(1)},${H-P} L${pts[0][0].toFixed(1)},${H-P} Z`
    return `<svg class="mini-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <path class="chart-area ${color}" d="${area}" fill="var(--${color==='orange'?'orange':'blue'})"/>
        <path class="chart-line ${color}" d="${path}"/>
        ${pts.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="var(--${color==='orange'?'orange':'blue'})"/>`).join("")}
    </svg>`
}

function barChart(values) {
    const W=320, H=140, P=12
    const max = Math.max(...values) || 1
    const bw = (W-P*2)/values.length * 0.65
    const gap = (W-P*2)/values.length
    return `<svg class="mini-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        ${values.map((v,i) => {
            const h = (v/max)*(H-P*2)
            const x = P + i*gap + (gap-bw)/2
            const y = H-P-h
            return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="var(--orange)"/>`
        }).join("")}
    </svg>`
}

function openWeightLog() {
    openSheet(`<div class="sheet-title">Log body weight</div>
        <div class="field"><label>Weight (kg)</label><input type="number" inputmode="decimal" id="logWeightInput" placeholder="75.0" step="0.1"></div>
        <button class="btn-primary full" onclick="saveWeightLog()">Save</button>`)
    setTimeout(()=>document.getElementById("logWeightInput")?.focus(), 200)
}

function saveWeightLog() {
    const kg = parseFloat(document.getElementById("logWeightInput").value)
    if (!kg || kg <= 0) { toast("Enter a weight", "warn"); return }
    weights.push({ date: todayStr(), kg, client_id: `bw-${Date.now()}` })
    profile.weight = kg
    save()
    closeSheet()
    toast("Weight logged", "success")
    renderProgress()
}

// ============ HISTORY ============
function renderHistory() {
    const box = document.getElementById("historyList")
    // group by date+day
    const sessions = {}
    workouts.forEach(w => {
        const key = w.date + "|" + w.day
        if (!sessions[key]) sessions[key] = []
        sessions[key].push(w)
    })
    const sorted = Object.entries(sessions).sort((a,b) => {
        const da = a[0].split("|")[0], db = b[0].split("|")[0]
        return new Date(db) - new Date(da)
    })
    if (sorted.length === 0) {
        box.innerHTML = `<div class="card"><div class="empty-line">No workout history yet.</div></div>`
        return
    }
    box.innerHTML = sorted.map(([key, exs]) => {
        const [date, day] = key.split("|")
        const vol = exs.reduce((s,w)=>s+(w.weight*w.reps*w.sets||0),0)
        return `<div class="card">
            <div class="card-head">
                <span class="card-title">${day}</span>
                <span class="card-meta">${timeAgo(date)}</span>
            </div>
            ${exs.map(w=>`<div class="pr-row"><div class="pr-name">${w.exercise}</div><div class="pr-sub">${fmt(w.weight)}kg × ${w.reps} × ${w.sets}</div></div>`).join("")}
            <div class="card-meta" style="margin-top:10px">Volume: ${fmt(vol/1000,1)}t</div>
        </div>`
    }).join("")
}

// ============ PROFILE ============
function renderProfile() {
    document.getElementById("profName").value = profile.name || ""
    document.getElementById("profWeight").value = profile.weight || ""
    document.getElementById("profRest").value = profile.rest || 90
    document.getElementById("autoRest").checked = profile.autoRest !== false
    document.getElementById("warmupPref").checked = profile.warmup !== false
    document.getElementById("themeLabel").textContent = theme === "dark" ? "Dark" : "Light"
    updateSyncRow()
}

function saveProfileFields() {
    profile.name = document.getElementById("profName").value.trim()
    profile.weight = parseFloat(document.getElementById("profWeight").value) || null
    profile.rest = parseInt(document.getElementById("profRest").value) || 90
    profile.autoRest = document.getElementById("autoRest").checked
    profile.warmup = document.getElementById("warmupPref").checked
    save()
}

function exportData() {
    const data = { workouts, runs, weights, selectedPlan, profile, exported: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"})
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `forge-backup-${todayStr()}.json`
    a.click()
    toast("Backup downloaded", "success")
}

function resetAll() {
    openSheet(`<div class="sheet-title">Reset all data?</div>
        <div class="sheet-sub">This permanently deletes all workouts, runs, and settings on this device. This cannot be undone.</div>
        <button class="btn-primary full" style="background:var(--red);margin-bottom:10px" onclick="doReset()">Delete everything</button>
        <button class="btn-ghost" style="width:100%;padding:14px" onclick="closeSheet()">Cancel</button>`)
}
function doReset() {
    Object.keys(localStorage).filter(k=>k.startsWith("forge_")).forEach(k=>localStorage.removeItem(k))
    location.reload()
}

// ============ INIT ============
function init() {
    applyTheme()
    go("home")
    if (typeof initCloud === "function") initCloud()
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
} else {
    init()
}

/* =========================================================
   CLOUD SYNC (optional) — Supabase
   ========================================================= */
const SB_URL = "https://eyvhyyshiwuiveycnlux.supabase.co"
const SB_KEY = "sb_publishable_9vufsThorZ8iCGWzRGasyg_TmMwtbt9"

let sb = null
let cloudUser = null
let pushTimer = null

function initCloud() {
    if (!window.supabase) return
    try {
        sb = window.supabase.createClient(SB_URL, SB_KEY, {
            auth: { persistSession: true, autoRefreshToken: true, storageKey: "forge2_session" }
        })
        sb.auth.onAuthStateChange((event, session) => {
            cloudUser = session?.user || null
            updateSyncRow()
            if (event === "SIGNED_IN") { toast("Signed in", "success"); cloudPull() }
            if (event === "SIGNED_OUT") { toast("Signed out") }
        })
        sb.auth.getSession().then(({data}) => {
            cloudUser = data?.session?.user || null
            updateSyncRow()
            if (cloudUser) setTimeout(cloudPull, 600)
        })
    } catch(e) { console.warn("Cloud init failed", e) }
}

function updateSyncRow() {
    const label = document.getElementById("syncLabel")
    const state = document.getElementById("syncState")
    if (!label || !state) return
    if (cloudUser) {
        label.textContent = cloudUser.email || "Signed in"
        state.textContent = "Sign out"
    } else {
        label.textContent = "Sign in to back up"
        state.textContent = "›"
    }
}

function handleAuthClick() {
    if (cloudUser) {
        openSheet(`<div class="sheet-title">Sign out?</div>
            <div class="sheet-sub">Your data stays on this device. Signed in as ${cloudUser.email}.</div>
            <button class="btn-primary full" style="margin-bottom:10px" onclick="doSignOut()">Sign out</button>
            <button class="btn-ghost" style="width:100%;padding:14px" onclick="closeSheet()">Cancel</button>`)
    } else {
        openAuthSheet("signin")
    }
}

function openAuthSheet(mode) {
    const isSignin = mode === "signin"
    openSheet(`
        <div class="sheet-title">${isSignin ? "Sign in" : "Create account"}</div>
        <div class="sheet-sub">Back up and sync across devices. Optional.</div>
        <div class="field"><label>Email</label><input type="email" id="authEmail" placeholder="you@email.com"></div>
        <div class="field"><label>Password</label><input type="password" id="authPw" placeholder="6+ characters"></div>
        <p id="authMsg" style="color:var(--red);font-size:13px;min-height:18px;margin-bottom:10px"></p>
        <button class="btn-primary full" id="authBtn" onclick="submitAuth('${mode}')" style="margin-bottom:10px">${isSignin?"Sign in":"Create account"}</button>
        <button class="btn-ghost" style="width:100%;padding:14px" onclick="openAuthSheet('${isSignin?'signup':'signin'}')">${isSignin?"Need an account? Sign up":"Have an account? Sign in"}</button>
    `)
    setTimeout(()=>document.getElementById("authEmail")?.focus(), 200)
}

async function submitAuth(mode) {
    const email = document.getElementById("authEmail").value.trim()
    const pw = document.getElementById("authPw").value
    const msg = document.getElementById("authMsg")
    const btn = document.getElementById("authBtn")
    if (!email || !email.includes("@")) { msg.textContent = "Enter a valid email"; return }
    if (!pw || pw.length < 6) { msg.textContent = "Password must be 6+ characters"; return }
    if (!sb) { msg.textContent = "Cloud unavailable — check connection"; return }

    btn.disabled = true
    btn.textContent = mode === "signin" ? "Signing in…" : "Creating…"
    try {
        const res = mode === "signin"
            ? await sb.auth.signInWithPassword({ email, password: pw })
            : await sb.auth.signUp({ email, password: pw })
        if (res.error) {
            msg.textContent = friendlyErr(res.error.message)
            btn.disabled = false; btn.textContent = mode==="signin"?"Sign in":"Create account"
            return
        }
        if (mode === "signup" && !res.data?.session) {
            msg.style.color = "var(--green)"; msg.textContent = "Check your email to confirm."
            btn.disabled = false; btn.textContent = "Create account"
            return
        }
        closeSheet()
        // After sign in, push local data up
        setTimeout(cloudPush, 800)
    } catch(e) {
        msg.textContent = friendlyErr(e.message)
        btn.disabled = false; btn.textContent = mode==="signin"?"Sign in":"Create account"
    }
}

function friendlyErr(s) {
    s = (s||"").toLowerCase()
    if (s.includes("invalid login")) return "Wrong email or password"
    if (s.includes("already registered")) return "Account exists — sign in instead"
    if (s.includes("email not confirmed")) return "Confirm your email first"
    return "Something went wrong — try again"
}

async function doSignOut() {
    closeSheet()
    if (sb) await sb.auth.signOut()
}

function queueCloudPush() {
    if (!cloudUser || !sb) return
    if (pushTimer) clearTimeout(pushTimer)
    pushTimer = setTimeout(() => cloudPush().catch(e=>console.warn("push",e)), 2500)
}

async function cloudPush() {
    if (!cloudUser || !sb) return
    // Store everything as a single JSON blob per user (simplest, reliable)
    const payload = {
        user_id: cloudUser.id,
        data: { workouts, runs, weights, selectedPlan, profile, theme },
        updated_at: new Date().toISOString()
    }
    const { error } = await sb.from("forge_data").upsert(payload, { onConflict: "user_id" })
    if (error) console.warn("Cloud push error:", error.message)
}

async function cloudPull() {
    if (!cloudUser || !sb) return
    try {
        const { data, error } = await sb.from("forge_data").select("data").eq("user_id", cloudUser.id).maybeSingle()
        if (error) { console.warn("pull", error.message); return }
        if (data && data.data) {
            const cloud = data.data
            // Merge: cloud is source of truth if it has more data, else keep local & push
            const cloudWorkouts = cloud.workouts || []
            const cloudRuns = cloud.runs || []
            // Merge by client_id
            workouts = mergeById(workouts, cloudWorkouts)
            runs = mergeById(runs, cloudRuns)
            weights = mergeById(weights, cloud.weights || [])
            if (cloud.selectedPlan && !selectedPlan) selectedPlan = cloud.selectedPlan
            if (cloud.profile) profile = { ...profile, ...cloud.profile }
            save()
            // re-render current screen
            go(currentScreen)
            // push merged back
            setTimeout(cloudPush, 500)
        } else {
            // No cloud data yet — push local up
            cloudPush()
        }
    } catch(e) { console.warn("pull failed", e) }
}

function mergeById(local, cloud) {
    const seen = new Set()
    const out = []
    ;[...local, ...cloud].forEach(item => {
        const id = item.client_id || JSON.stringify(item)
        if (!seen.has(id)) { seen.add(id); out.push(item) }
    })
    return out
}
