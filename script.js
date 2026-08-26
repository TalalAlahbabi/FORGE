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
let theme = localStorage.getItem("forge_theme") || "light"

// ============ GYM PLANS (4 built-in defaults, used for reset) ============
const DEFAULT_PLANS = {
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

// ============ MUTABLE PLANS (editable copy in localStorage) ============
// User can edit any of these. Reset to default is per-plan.
let plans = JSON.parse(localStorage.getItem("forge_plans") || "null")
if (!plans) {
    plans = JSON.parse(JSON.stringify(DEFAULT_PLANS))
}
// Make sure any plan keys missing from user's saved plans get added (e.g. if we add new defaults later)
Object.keys(DEFAULT_PLANS).forEach(k => {
    if (!plans[k]) plans[k] = JSON.parse(JSON.stringify(DEFAULT_PLANS[k]))
})

// ============ WEEKLY SCHEDULE (rotating sequence) ============
// Array of slots; each slot is one of:
//   { id, type: "gym",  planName, dayName }
//   { id, type: "run",  runType, distance, time }
//   { id, type: "rest" }
let schedule    = JSON.parse(localStorage.getItem("forge_schedule") || "[]")
let schedulePos = parseInt(localStorage.getItem("forge_sched_pos") || "0", 10)

function nextSlotId() {
    return "s" + Date.now() + "-" + Math.floor(Math.random()*1000)
}

// Auto-generate a default schedule when a user picks a plan and has none
function generateDefaultSchedule(planName) {
    const p = plans[planName]
    if (!p) return []
    const days = p.schedule
    const out = []
    // Insert plan days, with a rest after every 3 working days for splits with 4+ days
    days.forEach((d, i) => {
        out.push({ id: nextSlotId(), type: "gym", planName, dayName: d.day })
        if (days.length >= 4 && (i+1) % 3 === 0 && i < days.length - 1) {
            out.push({ id: nextSlotId(), type: "rest" })
        }
    })
    // Final rest day at end of cycle (unless schedule is already only 3 days)
    if (days.length > 2) out.push({ id: nextSlotId(), type: "rest" })
    return out
}

// Helpful: get the slot that's "up next" right now
function currentSlot() {
    if (!schedule.length) return null
    if (schedulePos >= schedule.length) schedulePos = 0
    return schedule[schedulePos]
}
function advanceSchedule() {
    if (!schedule.length) return
    schedulePos = (schedulePos + 1) % schedule.length
    localStorage.setItem("forge_sched_pos", String(schedulePos))
}


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
    localStorage.setItem("forge_plans", JSON.stringify(plans))
    localStorage.setItem("forge_schedule", JSON.stringify(schedule))
    localStorage.setItem("forge_sched_pos", String(schedulePos))
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
    if (selectedPlan && plans[selectedPlan]) {
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
    if (!selectedPlan || !plans[selectedPlan]) return null
    const sched = plans[selectedPlan].schedule
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
    if (!selectedPlan || !plans[selectedPlan]) {
        list.innerHTML = `<div class="card"><div class="empty-line">Choose a plan to see your workouts.</div>
            <button class="btn-primary full" style="margin-top:12px" onclick="openPlanPicker()">Choose a plan</button></div>`
        return
    }
    const nextDay = getNextDay()
    list.innerHTML = plans[selectedPlan].schedule.map(d => {
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
    if (!selectedPlan || !plans[selectedPlan]) { go("gym"); openPlanPicker(); return }
    const next = getNextDay()
    if (next) startWorkout(next.day)
    else go("gym")
}

// ============ PLAN PICKER ============
function openPlanPicker() {
    let html = `<div class="sheet-title">Choose a plan</div><div class="sheet-sub">Pick the split that fits your schedule.</div>`
    html += Object.entries(plans).map(([name, p]) => `
        <div class="plan-option ${selectedPlan===name?'selected':''}" onclick="pickPlan('${name.replace(/'/g,"\\'")}')">
            <div class="plan-option-name">${name}</div>
            <div class="plan-option-desc">${p.desc}</div>
            <div class="plan-option-days">${p.days} days/week</div>
        </div>`).join("")
    openSheet(html)
}

function pickPlan(name) {
    selectedPlan = name
    // If no schedule yet, auto-generate from this plan
    if (!schedule || schedule.length === 0) {
        schedule = generateDefaultSchedule(name)
        schedulePos = 0
    }
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
    const day = plans[selectedPlan].schedule.find(d => d.day === dayName)
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

    // Determine current exercise (first one with unfinished sets)
    const currentExIdx = findCurrentExerciseIdx()

    const body = document.getElementById("workoutBody")
    body.innerHTML = activeWorkout.exercises.map((ex, ei) => {
        const allDone = ex.sets.every(s => s.done)
        const isCurrent = ei === currentExIdx
        const isExpanded = isCurrent || ex._expanded === true

        // COLLAPSED state: completed (or upcoming) exercises shown as compact card
        if (!isExpanded) {
            const doneCount = ex.sets.filter(s => s.done).length
            const summary = allDone
                ? ex.sets.map(s => s.reps).join(',')
                : `${doneCount}/${ex.sets.length} sets done`
            const topWeight = allDone ? `${fmt(ex.sets[0].weight)}kg × ${summary}` : summary
            return `<div class="ex-block collapsed ${allDone?'all-done':'upcoming'}" onclick="expandExercise(${ei})">
                <div class="ex-collapsed-row">
                    <div class="ex-collapsed-check">${allDone?'✓':''}</div>
                    <div class="ex-collapsed-info">
                        <div class="ex-collapsed-name">${ex.name}</div>
                        <div class="ex-collapsed-sub">${topWeight}</div>
                    </div>
                    <div class="ex-collapsed-go">›</div>
                </div>
            </div>`
        }

        // EXPANDED state
        let warmup = ""
        const firstUndoneSet = ex.sets.find(s => !s.done)
        const firstSetWeight = firstUndoneSet ? (firstUndoneSet.weight || ex.sets[0].weight) : ex.sets[0].weight
        if (profile.warmup && isCurrent && firstSetWeight && !ex.sets.some(s => s.done)) {
            warmup = `<div class="ex-warmup">🔥 Warmup: empty bar × 10, then ${fmt(firstSetWeight*0.5)}kg × 5, ${fmt(firstSetWeight*0.7)}kg × 3</div>`
        }

        return `<div class="ex-block expanded" id="exblock-${ei}">
            <div class="ex-block-head">
                <div class="ex-block-name">${ex.name}</div>
                <div class="ex-block-target">${ex.targetSets}×${ex.target}</div>
            </div>
            <div class="ex-prev">${ex.prev ? `Previous: <b>${fmt(ex.prev.weight)}kg × ${ex.prev.reps}</b>` : "First time — find your working weight"}</div>
            ${warmup}
            <div class="set-labels"><span>Set</span><span>kg</span><span>Reps</span><span></span></div>
            <div id="sets-${ei}">
                ${ex.sets.map((s, si) => setRowHtml(ei, si, s, ex)).join("")}
            </div>
            <button class="add-set-btn" onclick="addSet(${ei})">+ Add set</button>
        </div>`
    }).join("") + `<button class="finish-workout-btn" onclick="finishWorkout()">Finish workout</button>`

    updateWorkoutProgress()
}

function findCurrentExerciseIdx() {
    // First exercise with any undone sets
    for (let i = 0; i < activeWorkout.exercises.length; i++) {
        if (activeWorkout.exercises[i].sets.some(s => !s.done)) return i
    }
    // All done — return last index so it stays expanded
    return activeWorkout.exercises.length - 1
}

function expandExercise(ei) {
    // Mark this exercise as manually expanded; collapse currently-expanded ones except this
    activeWorkout.exercises.forEach((ex, i) => {
        if (i === ei) ex._expanded = true
        else delete ex._expanded
    })
    renderWorkout()
    // Scroll to it
    setTimeout(() => {
        const el = document.getElementById(`exblock-${ei}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
}

function setRowHtml(ei, si, s, ex) {
    // Find the most-recent done set in this exercise (for prefill)
    const prevDoneInThis = (() => {
        for (let i = si - 1; i >= 0; i--) {
            if (ex.sets[i].done) return ex.sets[i]
        }
        return null
    })()

    // DONE state: compact display, tap to re-edit
    if (s.done) {
        return `<div class="set-row done" onclick="reopenSet(${ei},${si})">
            <div class="set-num">${si+1}</div>
            <div class="set-result">${fmt(s.weight)}<span class="unit">kg</span></div>
            <div class="set-result">${s.reps}<span class="unit">reps</span></div>
            <button class="set-check checked" onclick="event.stopPropagation();reopenSet(${ei},${si})">✓</button>
        </div>`
    }

    // ACTIVE state: prefilled placeholders from previous set in this exercise (or last workout)
    const placeholderWeight = prevDoneInThis ? prevDoneInThis.weight :
                              (ex.prev ? ex.prev.weight : (s.weight || ''))
    const placeholderReps = prevDoneInThis ? prevDoneInThis.reps :
                            (ex.prev ? ex.prev.reps : '')

    return `<div class="set-row">
        <div class="set-num">${si+1}</div>
        <input type="number" inputmode="decimal" placeholder="${placeholderWeight}" value="${s.weight!==''?s.weight:''}" onchange="updateSet(${ei},${si},'weight',this.value)" onfocus="this.select()">
        <input type="number" inputmode="numeric" placeholder="${placeholderReps}" value="${s.reps!==''?s.reps:''}" onchange="updateSet(${ei},${si},'reps',this.value)" onfocus="this.select()">
        <button class="set-check" onclick="toggleSet(${ei},${si})">✓</button>
    </div>`
}

function reopenSet(ei, si) {
    activeWorkout.exercises[ei].sets[si].done = false
    renderWorkout()
}

function updateSet(ei, si, field, val) {
    activeWorkout.exercises[ei].sets[si][field] = val
}

function toggleSet(ei, si) {
    const set = activeWorkout.exercises[ei].sets[si]
    const ex = activeWorkout.exercises[ei]
    // Find the row's inputs
    const row = document.querySelectorAll(`#sets-${ei} .set-row`)[si]
    if (!row) return
    const inputs = row.querySelectorAll("input")
    if (!inputs || inputs.length < 2) return

    // CRUCIAL: use typed value OR placeholder (so one tap on ✓ logs the suggested values)
    const typedW = inputs[0].value
    const typedR = inputs[1].value
    set.weight = typedW !== "" ? typedW : (inputs[0].placeholder || set.weight)
    set.reps = typedR !== "" ? typedR : (inputs[1].placeholder || set.reps)

    // Validate
    if (!set.reps || !parseInt(set.reps)) {
        toast("Enter reps", "warn")
        return
    }
    if (!set.weight || isNaN(parseFloat(set.weight))) {
        toast("Enter weight", "warn")
        return
    }

    set.done = true

    // Auto-collapse the previously-current exercise if all sets in it are now done
    // and there are more exercises after it
    const wasLastSet = ex.sets.every(s => s.done)
    if (wasLastSet) {
        delete ex._expanded
    }

    renderWorkout()

    // Scroll to next active exercise smoothly
    if (wasLastSet) {
        setTimeout(() => {
            const nextIdx = findCurrentExerciseIdx()
            if (nextIdx !== null && nextIdx > ei) {
                const el = document.getElementById(`exblock-${nextIdx}`)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }, 100)
    }

    // Auto rest timer (now as floating pill)
    if (profile.autoRest) {
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

    const finishedDay = activeWorkout.day
    activeWorkout = null
    clearInterval(workoutClockInterval)

    if (logged === 0) {
        toast("No sets logged", "warn")
        go("gym")
        return
    }

    save()
    // Advance the schedule if the just-finished workout matches the current slot
    const cs = currentSlot()
    if (cs && cs.type === "gym" && cs.planName === selectedPlan && cs.dayName === finishedDay) {
        advanceSchedule()
        save()
    }
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
    // Default: floating pill (non-blocking)
    document.getElementById("restPill").classList.add("active")
    // Don't auto-open fullscreen
    updateRestDisplay()
    clearInterval(restInterval)
    restInterval = setInterval(() => {
        restRemaining--
        updateRestDisplay()
        if (restRemaining <= 0) {
            skipRest()
            if (navigator.vibrate) navigator.vibrate(200)
        }
    }, 1000)
}

function updateRestDisplay() {
    const m = Math.floor(restRemaining / 60), s = restRemaining % 60
    const timeStr = `${m}:${String(s).padStart(2,'0')}`

    // Update both pill + fullscreen displays
    const tEl = document.getElementById("restTime"); if (tEl) tEl.textContent = timeStr
    const pTEl = document.getElementById("restPillTime"); if (pTEl) pTEl.textContent = timeStr

    const pct = restTotal ? restRemaining / restTotal : 0

    // Fullscreen ring (circumference 565.48 for r=90)
    const fsRing = document.getElementById("restRingFg")
    if (fsRing) fsRing.style.strokeDashoffset = 565.48 * (1 - pct)

    // Pill ring (circumference ~100.5 for r=16)
    const pillRing = document.getElementById("restPillFg")
    if (pillRing) {
        const c = 2 * Math.PI * 16
        pillRing.style.strokeDasharray = c.toFixed(2)
        pillRing.style.strokeDashoffset = (c * (1 - pct)).toFixed(2)
    }
}

function adjustRest(delta) {
    restRemaining = Math.max(5, restRemaining + delta)
    restTotal = Math.max(restTotal, restRemaining)
    updateRestDisplay()
}

function skipRest() {
    clearInterval(restInterval)
    document.getElementById("restOverlay").classList.remove("active")
    document.getElementById("restPill").classList.remove("active")
}

function expandRestOverlay() {
    document.getElementById("restOverlay").classList.add("active")
}

function collapseRestOverlay() {
    document.getElementById("restOverlay").classList.remove("active")
}

// ============ REPEAT LAST WORKOUT ============
function repeatLastWorkout() {
    if (workouts.length === 0) { toast("No previous workouts", "warn"); return }
    const lastDate = workouts.map(w=>w.date).sort().reverse()[0]
    const lastDay = workouts.filter(w=>w.date===lastDate)[0]?.day
    if (lastDay && plans[selectedPlan]?.schedule.find(d=>d.day===lastDay)) {
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
    // Advance schedule if current slot is a run
    const cs = currentSlot()
    if (cs && cs.type === "run") {
        advanceSchedule()
        save()
    }
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
    // Badge count
    const badgesEl = document.getElementById("profileBadgesCount")
    if (badgesEl && typeof BADGES !== "undefined") {
        const earned = BADGES.filter(b => earnedBadges[b.id]).length
        badgesEl.textContent = `${earned} / ${BADGES.length} ›`
    }
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

/* =========================================================
   ============ EDITABLE PLANS + SCHEDULE ==================
   ========================================================= */

// ============ GYM SCREEN — use the schedule ============
// We override renderGym (defined earlier) to render the schedule preview + today box
function renderGym() {
    const banner = document.getElementById("planBannerName")
    banner.textContent = selectedPlan || "No plan"

    const today = document.getElementById("gymTodayBox")
    const slot = currentSlot()
    if (!selectedPlan) {
        today.innerHTML = `<div class="schedule-empty">Pick a plan to get started.<br><button class="btn-primary" style="margin-top:14px" onclick="openPlanPicker()">Choose a plan</button></div>`
    } else if (!slot) {
        today.innerHTML = `<div class="schedule-empty">No schedule yet.<br><button class="btn-primary" style="margin-top:14px" onclick="generateScheduleNow()">Build a schedule</button></div>`
    } else {
        today.innerHTML = renderTodayBox(slot)
    }

    // Schedule preview — next 4 slots
    const preview = document.getElementById("gymSchedPreview")
    if (!schedule.length) {
        preview.innerHTML = ""
    } else {
        const items = []
        for (let i = 0; i < Math.min(4, schedule.length); i++) {
            const idx = (schedulePos + i) % schedule.length
            items.push(renderSlot(schedule[idx], idx, i === 0))
        }
        preview.innerHTML = items.join("")
    }
}

function renderTodayBox(slot) {
    if (slot.type === "gym") {
        const plan = plans[slot.planName]
        const day = plan?.schedule.find(d => d.day === slot.dayName)
        const exCount = day?.ex.length || 0
        return `<div class="today-box" onclick="startSlot()">
            <div class="today-tag">Today · ${slot.planName}</div>
            <div class="today-name">${slot.dayName}</div>
            <div class="today-sub">${exCount} exercises</div>
            <div class="today-cta">Start workout ›</div>
        </div>`
    }
    if (slot.type === "run") {
        const tags = []
        if (slot.distance) tags.push(`${slot.distance}km`)
        if (slot.runType) tags.push(slot.runType)
        return `<div class="today-box run" onclick="startSlot()">
            <div class="today-tag">Today · Running</div>
            <div class="today-name">${slot.runType ? slot.runType.charAt(0).toUpperCase()+slot.runType.slice(1)+' run' : 'Run'}</div>
            <div class="today-sub">${tags.join(' · ') || 'Go for a run'}</div>
            <div class="today-cta">Log run ›</div>
        </div>`
    }
    return `<div class="today-box rest">
        <div class="today-tag">Today</div>
        <div class="today-name">Rest day</div>
        <div class="today-sub">Recovery is part of the program. Take it easy.</div>
        <div class="today-cta" onclick="event.stopPropagation();markRestDone()">Mark complete ›</div>
    </div>`
}

function renderSlot(slot, idx, isCurrent) {
    let icon, title, sub, cls
    if (slot.type === "gym") {
        icon = "💪"; cls = "gym"
        title = slot.dayName
        sub = slot.planName
    } else if (slot.type === "run") {
        icon = "🏃"; cls = "run"
        title = slot.runType ? slot.runType.charAt(0).toUpperCase()+slot.runType.slice(1) + " run" : "Run"
        const tags = []
        if (slot.distance) tags.push(`${slot.distance}km`)
        if (slot.time) tags.push(`${slot.time}min`)
        sub = tags.join(' · ') || "Free run"
    } else {
        icon = "○"; cls = "rest"
        title = "Rest day"
        sub = "Recovery"
    }
    const currentClass = isCurrent ? " current" : ""
    const nowTag = isCurrent ? `<span class="sched-now-tag">Next</span>` : ""
    return `<div class="sched-slot ${cls}${currentClass}" onclick="startSpecificSlot(${idx})">
        <div class="sched-icon">${icon}</div>
        <div class="sched-body">
            <div class="sched-num">Day ${idx+1}</div>
            <div class="sched-title">${title}${nowTag}</div>
            <div class="sched-sub">${sub}</div>
        </div>
        <div class="sched-actions">
            <span style="color:var(--muted);font-size:20px">›</span>
        </div>
    </div>`
}

function startSlot() {
    const slot = currentSlot()
    if (!slot) return
    if (slot.type === "gym") {
        startWorkout(slot.dayName)
    } else if (slot.type === "run") {
        go("run")
        // pre-fill distance/time if specified
        if (slot.distance) document.getElementById("runDist").value = slot.distance
        if (slot.time) document.getElementById("runTime").value = slot.time
        if (slot.runType) document.getElementById("runType").value = slot.runType
        // trigger pace update
        const evt = new Event('input')
        document.getElementById("runDist").dispatchEvent(evt)
    } else if (slot.type === "rest") {
        markRestDone()
    }
}

function startSpecificSlot(idx) {
    if (idx === schedulePos) {
        startSlot()
    } else {
        // jump to that slot
        openSheet(`<div class="sheet-title">Jump to Day ${idx+1}?</div>
            <div class="sheet-sub">This will skip days in between.</div>
            <button class="btn-primary full" style="margin-bottom:10px" onclick="setSchedulePos(${idx});closeSheet()">Jump to Day ${idx+1}</button>
            <button class="btn-ghost" style="width:100%;padding:14px" onclick="closeSheet()">Cancel</button>`)
    }
}

function setSchedulePos(idx) {
    schedulePos = idx
    save()
    if (currentScreen === "gym") renderGym()
    if (currentScreen === "home") renderHome()
    if (currentScreen === "schedule") renderSchedule()
}

function markRestDone() {
    advanceSchedule()
    save()
    toast("Rest day done", "success")
    if (currentScreen === "gym") renderGym()
    if (currentScreen === "home") renderHome()
    if (currentScreen === "schedule") renderSchedule()
}

function skipScheduleSlot() {
    if (!schedule.length) { toast("No schedule yet", "warn"); return }
    advanceSchedule()
    save()
    toast("Skipped to next day", "")
    if (currentScreen === "gym") renderGym()
    if (currentScreen === "home") renderHome()
}

function generateScheduleNow() {
    if (!selectedPlan) { openPlanPicker(); return }
    schedule = generateDefaultSchedule(selectedPlan)
    schedulePos = 0
    save()
    toast("Schedule built", "success")
    renderGym()
}

// ============ SCHEDULE SCREEN ============
function renderSchedule() {
    const box = document.getElementById("scheduleList")
    if (!schedule.length) {
        box.innerHTML = `<div class="schedule-empty">No days in your schedule yet. Add some below.</div>`
        return
    }
    box.innerHTML = schedule.map((s, i) => renderEditableSlot(s, i)).join("")
}

function renderEditableSlot(slot, idx) {
    let icon, title, sub, cls
    if (slot.type === "gym") {
        icon = "💪"; cls = "gym"
        title = slot.dayName
        sub = slot.planName
    } else if (slot.type === "run") {
        icon = "🏃"; cls = "run"
        title = slot.runType ? slot.runType.charAt(0).toUpperCase()+slot.runType.slice(1) + " run" : "Run"
        const tags = []
        if (slot.distance) tags.push(`${slot.distance}km`)
        if (slot.time) tags.push(`${slot.time}min`)
        sub = tags.join(' · ') || "Free run"
    } else {
        icon = "○"; cls = "rest"
        title = "Rest day"
        sub = "Recovery"
    }
    const cur = idx === schedulePos ? " current" : ""
    const nowTag = idx === schedulePos ? `<span class="sched-now-tag">Next</span>` : ""
    return `<div class="sched-slot ${cls}${cur}" onclick="editSlot(${idx})">
        <div class="sched-icon">${icon}</div>
        <div class="sched-body">
            <div class="sched-num">Day ${idx+1}</div>
            <div class="sched-title">${title}${nowTag}</div>
            <div class="sched-sub">${sub}</div>
        </div>
        <div class="sched-actions">
            <button class="sched-del-btn" onclick="event.stopPropagation();deleteSlot(${idx})">✕</button>
        </div>
    </div>`
}

function deleteSlot(idx) {
    schedule.splice(idx, 1)
    if (schedulePos >= schedule.length && schedule.length > 0) schedulePos = 0
    save()
    renderSchedule()
}

function editSlot(idx) {
    openAddSlot(idx)
}

function openAddSlot(editIdx) {
    const isEdit = editIdx != null
    const existing = isEdit ? schedule[editIdx] : null
    let html = `<div class="sheet-title">${isEdit ? "Edit" : "Add"} day</div>
        <div class="sheet-sub">What kind of training is this?</div>`
    html += `<button class="slot-type-btn" onclick="addGymSlot(${editIdx != null ? editIdx : 'null'})">
        <div class="sched-icon gym" style="background:var(--blue-dim);color:var(--blue)">💪</div>
        <div class="slot-type-btn-info"><div class="slot-type-btn-name">Gym workout</div><div class="slot-type-btn-sub">Pick a day from your plan</div></div>
    </button>`
    html += `<button class="slot-type-btn" onclick="addRunSlot(${editIdx != null ? editIdx : 'null'})">
        <div class="sched-icon run" style="background:rgba(255,159,10,0.15);color:var(--orange)">🏃</div>
        <div class="slot-type-btn-info"><div class="slot-type-btn-name">Running session</div><div class="slot-type-btn-sub">Easy, tempo, intervals, long</div></div>
    </button>`
    html += `<button class="slot-type-btn" onclick="addRestSlot(${editIdx != null ? editIdx : 'null'})">
        <div class="sched-icon rest" style="background:var(--surface-2);color:var(--muted)">○</div>
        <div class="slot-type-btn-info"><div class="slot-type-btn-name">Rest day</div><div class="slot-type-btn-sub">Recovery</div></div>
    </button>`
    openSheet(html)
}

function addGymSlot(editIdx) {
    if (!selectedPlan || !plans[selectedPlan]) {
        closeSheet()
        toast("Pick a plan first", "warn")
        openPlanPicker()
        return
    }
    let html = `<div class="sheet-title">Pick a day</div><div class="sheet-sub">From ${selectedPlan}</div>`
    plans[selectedPlan].schedule.forEach(d => {
        html += `<div class="plan-option" onclick="commitGymSlot('${d.day.replace(/'/g,"\\'")}',${editIdx})">
            <div class="plan-option-name">${d.day}</div>
            <div class="plan-option-desc">${d.ex.length} exercises</div>
        </div>`
    })
    openSheet(html)
}

function commitGymSlot(dayName, editIdx) {
    const slot = { id: nextSlotId(), type: "gym", planName: selectedPlan, dayName }
    if (editIdx !== null && editIdx !== undefined) {
        schedule[editIdx] = { ...slot, id: schedule[editIdx].id }
    } else {
        schedule.push(slot)
    }
    save()
    closeSheet()
    renderSchedule()
}

function addRunSlot(editIdx) {
    let html = `<div class="sheet-title">Run details</div>
        <div class="sheet-sub">Set a target for this run.</div>
        <div class="field"><label>Type</label>
            <select id="newRunType">
                <option value="easy">Easy</option>
                <option value="tempo">Tempo</option>
                <option value="intervals">Intervals</option>
                <option value="long">Long</option>
            </select>
        </div>
        <div class="run-input-grid">
            <div class="field"><label>Distance (km, optional)</label><input type="number" inputmode="decimal" id="newRunDist" placeholder="5"></div>
            <div class="field"><label>Time (min, optional)</label><input type="number" inputmode="decimal" id="newRunTime" placeholder="25"></div>
        </div>
        <button class="btn-primary full btn-orange" onclick="commitRunSlot(${editIdx})">Save</button>`
    openSheet(html)
}

function commitRunSlot(editIdx) {
    const slot = {
        id: nextSlotId(),
        type: "run",
        runType: document.getElementById("newRunType").value,
        distance: parseFloat(document.getElementById("newRunDist").value) || null,
        time: parseFloat(document.getElementById("newRunTime").value) || null,
    }
    if (editIdx !== null && editIdx !== undefined) {
        schedule[editIdx] = { ...slot, id: schedule[editIdx].id }
    } else {
        schedule.push(slot)
    }
    save()
    closeSheet()
    renderSchedule()
}

function addRestSlot(editIdx) {
    const slot = { id: nextSlotId(), type: "rest" }
    if (editIdx !== null && editIdx !== undefined) {
        schedule[editIdx] = { ...slot, id: schedule[editIdx].id }
    } else {
        schedule.push(slot)
    }
    save()
    closeSheet()
    renderSchedule()
}

function resetSchedule() {
    openSheet(`<div class="sheet-title">Reset schedule?</div>
        <div class="sheet-sub">Rebuilds from your current plan with default rest days.</div>
        <button class="btn-primary full" style="margin-bottom:10px" onclick="doResetSchedule()">Reset</button>
        <button class="btn-ghost" style="width:100%;padding:14px" onclick="closeSheet()">Cancel</button>`)
}
function doResetSchedule() {
    if (!selectedPlan) { closeSheet(); toast("Pick a plan first", "warn"); return }
    schedule = generateDefaultSchedule(selectedPlan)
    schedulePos = 0
    save()
    closeSheet()
    renderSchedule()
    toast("Schedule reset", "success")
}

// ============ MANAGE PLANS SCREEN ============
let editingPlanKey = null
let editingDayIdx = null

function renderPlans() {
    const box = document.getElementById("plansList")
    const allNames = Object.keys(plans)
    box.innerHTML = allNames.map(name => {
        const p = plans[name]
        const isBuiltin = DEFAULT_PLANS[name] != null
        const isActive = name === selectedPlan
        return `<div class="plan-list-card${isActive?' active':''}" onclick="openEditPlan('${name.replace(/'/g,"\\'")}')">
            <div>
                <div class="plan-list-name">${name}${isActive?'<span class="plan-list-tag active">Active</span>':''}${isBuiltin?'':'<span class="plan-list-tag">Custom</span>'}</div>
                <div class="plan-list-sub">${p.schedule.length} days · ${p.desc || ''}</div>
            </div>
            <span style="color:var(--muted);font-size:20px">›</span>
        </div>`
    }).join("")
}

function openEditPlan(name) {
    editingPlanKey = name
    document.getElementById("editPlanTitle").textContent = name
    document.getElementById("editPlanName").value = name
    document.getElementById("editPlanDesc").value = plans[name].desc || ""
    // Show reset button only for built-ins, delete only for custom
    document.getElementById("resetPlanRow").style.display = DEFAULT_PLANS[name] ? "" : "none"
    document.getElementById("deletePlanRow").style.display = DEFAULT_PLANS[name] ? "none" : ""
    go("edit-plan")
    renderEditPlanDays()
}

function renderEditPlanDays() {
    const box = document.getElementById("editPlanDays")
    const p = plans[editingPlanKey]
    if (!p || !p.schedule.length) {
        box.innerHTML = `<div class="schedule-empty">No days. Add one below.</div>`
        return
    }
    box.innerHTML = p.schedule.map((d, i) => `
        <div class="day-edit-card" onclick="openEditDay(${i})">
            <div class="day-edit-card-info">
                <div class="day-edit-card-name">${d.day}</div>
                <div class="day-edit-card-sub">${d.ex.length} exercises</div>
            </div>
            <div class="day-edit-card-actions">
                <button onclick="event.stopPropagation();deleteDay(${i})">✕</button>
            </div>
        </div>`).join("")
}

function updatePlanName() {
    const newName = document.getElementById("editPlanName").value.trim()
    if (!newName || newName === editingPlanKey) return
    if (plans[newName]) { toast("Name already used", "warn"); document.getElementById("editPlanName").value = editingPlanKey; return }
    plans[newName] = plans[editingPlanKey]
    delete plans[editingPlanKey]
    // Update selected plan if needed
    if (selectedPlan === editingPlanKey) selectedPlan = newName
    // Update schedule references
    schedule.forEach(s => { if (s.type === "gym" && s.planName === editingPlanKey) s.planName = newName })
    editingPlanKey = newName
    document.getElementById("editPlanTitle").textContent = newName
    save()
}

function updatePlanDesc() {
    plans[editingPlanKey].desc = document.getElementById("editPlanDesc").value.trim()
    save()
}

function addDayToPlan() {
    const p = plans[editingPlanKey]
    p.schedule.push({ day: "New day", ex: [{ name: "New exercise", sets: 3, reps: "8-12" }] })
    save()
    renderEditPlanDays()
}

function deleteDay(idx) {
    const p = plans[editingPlanKey]
    if (!confirm(`Delete "${p.schedule[idx].day}"?`)) return
    const oldDay = p.schedule[idx].day
    p.schedule.splice(idx, 1)
    // Remove schedule slots that point to this day
    schedule = schedule.filter(s => !(s.type === "gym" && s.planName === editingPlanKey && s.dayName === oldDay))
    save()
    renderEditPlanDays()
}

function resetPlanToDefault() {
    if (!DEFAULT_PLANS[editingPlanKey]) return
    if (!confirm(`Reset "${editingPlanKey}" to default? All your changes to this plan will be lost.`)) return
    plans[editingPlanKey] = JSON.parse(JSON.stringify(DEFAULT_PLANS[editingPlanKey]))
    save()
    toast("Reset to default", "success")
    openEditPlan(editingPlanKey)
}

function deletePlan() {
    if (DEFAULT_PLANS[editingPlanKey]) { toast("Can't delete built-in", "warn"); return }
    if (!confirm(`Delete "${editingPlanKey}" permanently?`)) return
    const name = editingPlanKey
    delete plans[name]
    if (selectedPlan === name) {
        selectedPlan = Object.keys(plans)[0] || null
    }
    schedule = schedule.filter(s => !(s.type === "gym" && s.planName === name))
    save()
    toast("Plan deleted", "success")
    go("plans")
}

function createNewPlan() {
    let n = 1
    while (plans["My Plan " + n]) n++
    const name = "My Plan " + n
    plans[name] = {
        days: 0, desc: "Custom plan",
        schedule: [{ day: "Day 1", ex: [{ name: "New exercise", sets: 3, reps: "8-12" }] }]
    }
    save()
    openEditPlan(name)
}

// ============ EDIT DAY ============
function openEditDay(dayIdx) {
    editingDayIdx = dayIdx
    const d = plans[editingPlanKey].schedule[dayIdx]
    document.getElementById("editDayTitle").textContent = d.day
    document.getElementById("editDayName").value = d.day
    go("edit-day")
    renderEditDayExercises()
}

function renderEditDayExercises() {
    const d = plans[editingPlanKey].schedule[editingDayIdx]
    const box = document.getElementById("editDayExercises")
    if (!d.ex.length) {
        box.innerHTML = `<div class="schedule-empty">No exercises. Add one below.</div>`
        return
    }
    box.innerHTML = d.ex.map((e, i) => `
        <div class="ex-edit-row">
            <div class="ex-edit-row-top">
                <input type="text" value="${(e.name||'').replace(/"/g,'&quot;')}" placeholder="Exercise name" onchange="updateExerciseField(${i},'name',this.value)">
            </div>
            <div class="ex-edit-row-grid">
                <div class="field"><label>Sets</label><input type="number" inputmode="numeric" value="${e.sets||3}" onchange="updateExerciseField(${i},'sets',parseInt(this.value)||3)"></div>
                <div class="field"><label>Reps</label><input type="text" value="${(e.reps||'').replace(/"/g,'&quot;')}" placeholder="8-12" onchange="updateExerciseField(${i},'reps',this.value)"></div>
                <button class="ex-del-btn" onclick="deleteExercise(${i})" title="Delete">✕</button>
            </div>
        </div>`).join("")
}

function updateDayName() {
    const newName = document.getElementById("editDayName").value.trim()
    if (!newName) return
    const oldName = plans[editingPlanKey].schedule[editingDayIdx].day
    plans[editingPlanKey].schedule[editingDayIdx].day = newName
    // Update schedule references
    schedule.forEach(s => { if (s.type === "gym" && s.planName === editingPlanKey && s.dayName === oldName) s.dayName = newName })
    document.getElementById("editDayTitle").textContent = newName
    save()
}

function updateExerciseField(idx, field, value) {
    plans[editingPlanKey].schedule[editingDayIdx].ex[idx][field] = value
    save()
}

function addExerciseToDay() {
    plans[editingPlanKey].schedule[editingDayIdx].ex.push({ name: "New exercise", sets: 3, reps: "8-12" })
    save()
    renderEditDayExercises()
}

function deleteExercise(idx) {
    plans[editingPlanKey].schedule[editingDayIdx].ex.splice(idx, 1)
    save()
    renderEditDayExercises()
}

// ============ HOME UPDATE: show today's scheduled item ============
const _origRenderHome = renderHome
renderHome = function() {
    _origRenderHome()
    // After base render, override the gym sub with today's actual schedule item
    const slot = currentSlot()
    const gymSub = document.getElementById("homeGymSub")
    if (slot && gymSub) {
        if (slot.type === "gym") gymSub.textContent = slot.dayName
        else if (slot.type === "run") gymSub.textContent = "Today is run day"
        else if (slot.type === "rest") gymSub.textContent = "Today is rest"
    }
}

// startTodayGym should now respect the schedule
const _origStartTodayGym = startTodayGym
startTodayGym = function() {
    const slot = currentSlot()
    if (slot) {
        if (slot.type === "gym") { startWorkout(slot.dayName); return }
        if (slot.type === "run") { startSlot(); return }
        if (slot.type === "rest") { go("gym"); return }
    }
    _origStartTodayGym()
}

// ============ NAVIGATION extension ============
const _origGo = go
go = function(screen) {
    _origGo(screen)
    if (screen === "schedule") renderSchedule()
    if (screen === "plans") renderPlans()
    if (screen === "edit-plan") renderEditPlanDays()
    if (screen === "edit-day") renderEditDayExercises()
}

/* =========================================================
   ============ EXERCISE LIBRARY + PICKER ==================
   ========================================================= */

// Categorized exercise library — ~100 commonly-used movements
const EXERCISE_LIBRARY = [
    // ===== CHEST =====
    { name: "Bench Press",                muscle: "chest", eq: "barbell" },
    { name: "Incline Bench Press",        muscle: "chest", eq: "barbell" },
    { name: "Decline Bench Press",        muscle: "chest", eq: "barbell" },
    { name: "Close-Grip Bench Press",     muscle: "chest", eq: "barbell" },
    { name: "Dumbbell Bench Press",       muscle: "chest", eq: "dumbbell" },
    { name: "Incline Dumbbell Press",     muscle: "chest", eq: "dumbbell" },
    { name: "Decline Dumbbell Press",     muscle: "chest", eq: "dumbbell" },
    { name: "Dumbbell Fly",               muscle: "chest", eq: "dumbbell" },
    { name: "Incline Dumbbell Fly",       muscle: "chest", eq: "dumbbell" },
    { name: "Cable Crossover",            muscle: "chest", eq: "cable" },
    { name: "Cable Fly",                  muscle: "chest", eq: "cable" },
    { name: "Pec Deck",                   muscle: "chest", eq: "machine" },
    { name: "Chest Press Machine",        muscle: "chest", eq: "machine" },
    { name: "Push Up",                    muscle: "chest", eq: "bodyweight" },
    { name: "Incline Push Up",            muscle: "chest", eq: "bodyweight" },
    { name: "Decline Push Up",            muscle: "chest", eq: "bodyweight" },
    { name: "Dip",                        muscle: "chest", eq: "bodyweight" },

    // ===== BACK =====
    { name: "Deadlift",                   muscle: "back", eq: "barbell" },
    { name: "Romanian Deadlift",          muscle: "back", eq: "barbell" },
    { name: "Sumo Deadlift",              muscle: "back", eq: "barbell" },
    { name: "Pull Up",                    muscle: "back", eq: "bodyweight" },
    { name: "Chin Up",                    muscle: "back", eq: "bodyweight" },
    { name: "Lat Pulldown",               muscle: "back", eq: "cable" },
    { name: "Wide-Grip Lat Pulldown",     muscle: "back", eq: "cable" },
    { name: "Close-Grip Lat Pulldown",    muscle: "back", eq: "cable" },
    { name: "Barbell Row",                muscle: "back", eq: "barbell" },
    { name: "Pendlay Row",                muscle: "back", eq: "barbell" },
    { name: "T-Bar Row",                  muscle: "back", eq: "barbell" },
    { name: "Dumbbell Row",               muscle: "back", eq: "dumbbell" },
    { name: "Seated Cable Row",           muscle: "back", eq: "cable" },
    { name: "Face Pull",                  muscle: "back", eq: "cable" },
    { name: "Straight-Arm Pulldown",      muscle: "back", eq: "cable" },
    { name: "Shrug",                      muscle: "back", eq: "barbell" },
    { name: "Dumbbell Shrug",             muscle: "back", eq: "dumbbell" },
    { name: "Hyperextension",             muscle: "back", eq: "bodyweight" },
    { name: "Inverted Row",               muscle: "back", eq: "bodyweight" },

    // ===== LEGS =====
    { name: "Squat",                      muscle: "legs", eq: "barbell" },
    { name: "Front Squat",                muscle: "legs", eq: "barbell" },
    { name: "Pause Squat",                muscle: "legs", eq: "barbell" },
    { name: "Hack Squat",                 muscle: "legs", eq: "machine" },
    { name: "Goblet Squat",               muscle: "legs", eq: "dumbbell" },
    { name: "Bulgarian Split Squat",      muscle: "legs", eq: "dumbbell" },
    { name: "Walking Lunge",              muscle: "legs", eq: "dumbbell" },
    { name: "Reverse Lunge",              muscle: "legs", eq: "dumbbell" },
    { name: "Leg Press",                  muscle: "legs", eq: "machine" },
    { name: "Leg Extension",              muscle: "legs", eq: "machine" },
    { name: "Leg Curl",                   muscle: "legs", eq: "machine" },
    { name: "Lying Leg Curl",             muscle: "legs", eq: "machine" },
    { name: "Standing Leg Curl",          muscle: "legs", eq: "machine" },
    { name: "Stiff-Leg Deadlift",         muscle: "legs", eq: "barbell" },
    { name: "Good Morning",               muscle: "legs", eq: "barbell" },
    { name: "Hip Thrust",                 muscle: "legs", eq: "barbell" },
    { name: "Glute Bridge",               muscle: "legs", eq: "barbell" },
    { name: "Calf Raise",                 muscle: "legs", eq: "machine" },
    { name: "Standing Calf Raise",        muscle: "legs", eq: "machine" },
    { name: "Seated Calf Raise",          muscle: "legs", eq: "machine" },
    { name: "Box Jump",                   muscle: "legs", eq: "bodyweight" },

    // ===== SHOULDERS =====
    { name: "Shoulder Press",             muscle: "shoulders", eq: "barbell" },
    { name: "Overhead Press",             muscle: "shoulders", eq: "barbell" },
    { name: "Push Press",                 muscle: "shoulders", eq: "barbell" },
    { name: "Dumbbell Shoulder Press",    muscle: "shoulders", eq: "dumbbell" },
    { name: "Arnold Press",               muscle: "shoulders", eq: "dumbbell" },
    { name: "Lateral Raise",              muscle: "shoulders", eq: "dumbbell" },
    { name: "Cable Lateral Raise",        muscle: "shoulders", eq: "cable" },
    { name: "Front Raise",                muscle: "shoulders", eq: "dumbbell" },
    { name: "Rear Delt Fly",              muscle: "shoulders", eq: "dumbbell" },
    { name: "Reverse Pec Deck",           muscle: "shoulders", eq: "machine" },
    { name: "Upright Row",                muscle: "shoulders", eq: "barbell" },
    { name: "Cable Upright Row",          muscle: "shoulders", eq: "cable" },
    { name: "Landmine Press",             muscle: "shoulders", eq: "barbell" },

    // ===== ARMS =====
    { name: "Biceps Curl",                muscle: "arms", eq: "barbell" },
    { name: "EZ-Bar Curl",                muscle: "arms", eq: "barbell" },
    { name: "Dumbbell Curl",              muscle: "arms", eq: "dumbbell" },
    { name: "Hammer Curl",                muscle: "arms", eq: "dumbbell" },
    { name: "Incline Dumbbell Curl",      muscle: "arms", eq: "dumbbell" },
    { name: "Preacher Curl",              muscle: "arms", eq: "barbell" },
    { name: "Concentration Curl",         muscle: "arms", eq: "dumbbell" },
    { name: "Cable Curl",                 muscle: "arms", eq: "cable" },
    { name: "Triceps Pushdown",           muscle: "arms", eq: "cable" },
    { name: "Rope Pushdown",              muscle: "arms", eq: "cable" },
    { name: "Overhead Triceps Extension", muscle: "arms", eq: "dumbbell" },
    { name: "Skull Crusher",              muscle: "arms", eq: "barbell" },
    { name: "Close-Grip Push Up",         muscle: "arms", eq: "bodyweight" },
    { name: "Triceps Dip",                muscle: "arms", eq: "bodyweight" },
    { name: "Bench Dip",                  muscle: "arms", eq: "bodyweight" },
    { name: "Wrist Curl",                 muscle: "arms", eq: "barbell" },
    { name: "Reverse Wrist Curl",         muscle: "arms", eq: "barbell" },

    // ===== CORE =====
    { name: "Plank",                      muscle: "core", eq: "bodyweight" },
    { name: "Side Plank",                 muscle: "core", eq: "bodyweight" },
    { name: "Crunch",                     muscle: "core", eq: "bodyweight" },
    { name: "Sit Up",                     muscle: "core", eq: "bodyweight" },
    { name: "Hanging Leg Raise",          muscle: "core", eq: "bodyweight" },
    { name: "Knee Raise",                 muscle: "core", eq: "bodyweight" },
    { name: "Cable Crunch",               muscle: "core", eq: "cable" },
    { name: "Russian Twist",              muscle: "core", eq: "bodyweight" },
    { name: "Ab Wheel Rollout",           muscle: "core", eq: "bodyweight" },
    { name: "Mountain Climber",           muscle: "core", eq: "bodyweight" },
    { name: "Dead Bug",                   muscle: "core", eq: "bodyweight" },
    { name: "Bird Dog",                   muscle: "core", eq: "bodyweight" },
    { name: "Pallof Press",               muscle: "core", eq: "cable" },
    { name: "Farmer's Carry",             muscle: "core", eq: "dumbbell" },

    // ===== OLYMPIC / FULL BODY =====
    { name: "Clean",                      muscle: "fullbody", eq: "barbell" },
    { name: "Power Clean",                muscle: "fullbody", eq: "barbell" },
    { name: "Clean and Jerk",             muscle: "fullbody", eq: "barbell" },
    { name: "Snatch",                     muscle: "fullbody", eq: "barbell" },
    { name: "Power Snatch",               muscle: "fullbody", eq: "barbell" },
    { name: "Thruster",                   muscle: "fullbody", eq: "barbell" },
    { name: "Burpee",                     muscle: "fullbody", eq: "bodyweight" },
    { name: "Kettlebell Swing",           muscle: "fullbody", eq: "kettlebell" },
    { name: "Turkish Get Up",             muscle: "fullbody", eq: "kettlebell" },
]

const MUSCLE_GROUPS = [
    { id: "all",      label: "All" },
    { id: "chest",    label: "Chest" },
    { id: "back",     label: "Back" },
    { id: "legs",     label: "Legs" },
    { id: "shoulders",label: "Shoulders" },
    { id: "arms",     label: "Arms" },
    { id: "core",     label: "Core" },
    { id: "fullbody", label: "Full body" },
]

// User-added custom exercises (saved separately)
let customExercises = JSON.parse(localStorage.getItem("forge_custom_ex") || "[]")

// Recently-used exercises — sorted desc by last-used date
function getRecentExercises(limit = 8) {
    const seen = new Map()
    workouts.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(w => {
        if (!seen.has(w.exercise)) seen.set(w.exercise, w.date)
    })
    return Array.from(seen.keys()).slice(0, limit)
}

// Combined library: built-in + custom + any names that appear in user's workouts
function allExercises() {
    const all = [...EXERCISE_LIBRARY]
    const seen = new Set(all.map(e => e.name.toLowerCase()))
    customExercises.forEach(c => {
        if (!seen.has(c.name.toLowerCase())) { all.push(c); seen.add(c.name.toLowerCase()) }
    })
    // Also include any historical exercises that aren't in the library (legacy / typos)
    workouts.forEach(w => {
        if (!seen.has(w.exercise.toLowerCase())) {
            all.push({ name: w.exercise, muscle: "other", eq: "other" })
            seen.add(w.exercise.toLowerCase())
        }
    })
    return all
}

// ============ EXERCISE PICKER UI ============
let pickerState = {
    onPick: null,    // callback(name)
    filter: "all",
    query: "",
    showCustomForm: false,
}

function openExercisePicker(onPick, opts = {}) {
    pickerState.onPick = onPick
    pickerState.filter = opts.filter || "all"
    pickerState.query = ""
    pickerState.showCustomForm = false
    renderPicker()
    document.getElementById("sheetBackdrop").classList.add("active")
    document.body.style.overflow = "hidden"
    // Focus the search input after sheet animates in
    setTimeout(() => {
        const inp = document.getElementById("pickerSearchInput")
        if (inp) inp.focus()
    }, 350)
}

function renderPicker() {
    const recents = getRecentExercises()
    const recentsHtml = (!pickerState.query && pickerState.filter === "all" && recents.length > 0)
        ? `<div class="picker-section-label">Recently used</div>
           ${recents.map(name => exercisePickerRow(name)).join("")}
           <div class="picker-section-label">All exercises</div>`
        : ""

    // Filter
    let list = allExercises()
    if (pickerState.filter !== "all") {
        list = list.filter(e => e.muscle === pickerState.filter)
    }
    if (pickerState.query) {
        const q = pickerState.query.toLowerCase()
        list = list.filter(e => e.name.toLowerCase().includes(q))
    }
    // Sort alpha
    list.sort((a,b) => a.name.localeCompare(b.name))

    const listHtml = list.length
        ? list.map(e => exercisePickerRow(e.name, e.muscle, e.eq)).join("")
        : `<div class="picker-empty">
              <div>No matches for "${pickerState.query}"</div>
              <button class="btn-primary" style="margin-top:14px" onclick="openCustomExForm()">+ Add as custom exercise</button>
           </div>`

    const customFormHtml = pickerState.showCustomForm ? `
        <div class="picker-custom-form">
            <div class="sheet-title" style="margin-bottom:6px">Add custom exercise</div>
            <div class="field"><label>Name</label><input type="text" id="customExName" placeholder="Exercise name" value="${pickerState.query.replace(/"/g,'&quot;')}"></div>
            <div class="run-input-grid">
                <div class="field"><label>Muscle</label>
                    <select id="customExMuscle">
                        ${MUSCLE_GROUPS.filter(m=>m.id!=='all').map(m=>`<option value="${m.id}">${m.label}</option>`).join("")}
                    </select>
                </div>
                <div class="field"><label>Equipment</label>
                    <select id="customExEq">
                        <option value="barbell">Barbell</option>
                        <option value="dumbbell">Dumbbell</option>
                        <option value="machine">Machine</option>
                        <option value="cable">Cable</option>
                        <option value="bodyweight">Bodyweight</option>
                        <option value="kettlebell">Kettlebell</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <button class="btn-primary full" onclick="saveCustomExercise()">Save & use</button>
            <button class="btn-ghost" style="width:100%;margin-top:8px;padding:14px" onclick="cancelCustomForm()">Cancel</button>
        </div>` : ""

    const html = `
        <div class="picker-header">
            <div class="sheet-title">Choose exercise</div>
            <div class="picker-search">
                <input type="search" id="pickerSearchInput" placeholder="Search exercises..." value="${pickerState.query.replace(/"/g,'&quot;')}" oninput="onPickerSearch(this.value)" autocomplete="off">
            </div>
            <div class="picker-chips">
                ${MUSCLE_GROUPS.map(m => `<button class="picker-chip${pickerState.filter===m.id?' active':''}" onclick="setPickerFilter('${m.id}')">${m.label}</button>`).join("")}
            </div>
        </div>
        ${customFormHtml}
        <div class="picker-list">
            ${!pickerState.showCustomForm ? recentsHtml + listHtml : ""}
        </div>
        ${!pickerState.showCustomForm ? `<button class="btn-ghost" style="width:100%;margin-top:10px;padding:14px" onclick="openCustomExForm()">+ Add custom exercise</button>` : ""}
    `

    document.getElementById("sheetContent").innerHTML = html
}

function exercisePickerRow(name, muscle, eq) {
    // If muscle/eq not provided, look it up
    if (!muscle) {
        const ex = allExercises().find(e => e.name === name)
        if (ex) { muscle = ex.muscle; eq = ex.eq }
    }
    const muscleLabel = (MUSCLE_GROUPS.find(m=>m.id===muscle)?.label) || ""
    const sub = [muscleLabel, eq && eq !== "other" ? eq.charAt(0).toUpperCase()+eq.slice(1) : null].filter(Boolean).join(" · ")
    return `<div class="picker-row" onclick="pickerSelect('${name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">
        <div class="picker-row-name">${name}</div>
        <div class="picker-row-sub">${sub}</div>
    </div>`
}

function onPickerSearch(v) {
    pickerState.query = v
    renderPicker()
    // Refocus the input after re-render
    const inp = document.getElementById("pickerSearchInput")
    if (inp) { inp.focus(); inp.setSelectionRange(v.length, v.length) }
}

function setPickerFilter(id) {
    pickerState.filter = id
    renderPicker()
}

function pickerSelect(name) {
    const cb = pickerState.onPick
    closeSheet()
    if (cb) cb(name)
}

function openCustomExForm() {
    pickerState.showCustomForm = true
    renderPicker()
    setTimeout(() => document.getElementById("customExName")?.focus(), 100)
}

function cancelCustomForm() {
    pickerState.showCustomForm = false
    renderPicker()
}

function saveCustomExercise() {
    const name = document.getElementById("customExName").value.trim()
    const muscle = document.getElementById("customExMuscle").value
    const eq = document.getElementById("customExEq").value
    if (!name) { toast("Enter a name", "warn"); return }
    if (allExercises().some(e => e.name.toLowerCase() === name.toLowerCase())) {
        toast("That exercise already exists", "warn")
        return
    }
    customExercises.push({ name, muscle, eq })
    localStorage.setItem("forge_custom_ex", JSON.stringify(customExercises))
    if (typeof queueCloudPush === "function") queueCloudPush()
    pickerSelect(name)
}

// ============ HOOK INTO PLAN EDITING ============
// Replace the plain text input with a tappable button that opens the picker
function openExercisePickerForPlan(exIdx) {
    openExercisePicker((name) => {
        updateExerciseField(exIdx, "name", name)
        renderEditDayExercises()
    })
}

// Override renderEditDayExercises to use a tappable name field
function renderEditDayExercises() {
    const d = plans[editingPlanKey].schedule[editingDayIdx]
    const box = document.getElementById("editDayExercises")
    if (!d.ex.length) {
        box.innerHTML = `<div class="schedule-empty">No exercises. Add one below.</div>`
        return
    }
    box.innerHTML = d.ex.map((e, i) => `
        <div class="ex-edit-row">
            <div class="ex-edit-row-top">
                <button class="ex-name-picker" onclick="openExercisePickerForPlan(${i})">
                    <span class="ex-name-picker-text">${e.name || 'Select exercise'}</span>
                    <span class="ex-name-picker-go">›</span>
                </button>
            </div>
            <div class="ex-edit-row-grid">
                <div class="field"><label>Sets</label><input type="number" inputmode="numeric" value="${e.sets||3}" onchange="updateExerciseField(${i},'sets',parseInt(this.value)||3)"></div>
                <div class="field"><label>Reps</label><input type="text" value="${(e.reps||'').replace(/"/g,'&quot;')}" placeholder="8-12" onchange="updateExerciseField(${i},'reps',this.value)"></div>
                <button class="ex-del-btn" onclick="deleteExercise(${i})" title="Delete">✕</button>
            </div>
        </div>`).join("")
}

// Override addExerciseToDay to immediately open picker
function addExerciseToDay() {
    const newIdx = plans[editingPlanKey].schedule[editingDayIdx].ex.length
    plans[editingPlanKey].schedule[editingDayIdx].ex.push({ name: "", sets: 3, reps: "8-12" })
    save()
    renderEditDayExercises()
    // Immediately open picker for the new exercise
    setTimeout(() => openExercisePickerForPlan(newIdx), 200)
}

// ============ MID-WORKOUT EXERCISE SWAP ============
function swapWorkoutExercise(exIdx) {
    openExercisePicker((newName) => {
        const ex = activeWorkout.exercises[exIdx]
        ex.name = newName
        // Refresh "previous" data for the new exercise
        ex.prev = getPrevious(newName)
        // Reset sets that aren't done
        ex.sets.forEach(s => {
            if (!s.done) {
                s.weight = ex.prev ? ex.prev.weight : ""
                s.reps = ""
            }
        })
        renderWorkout()
        toast(`Swapped to ${newName}`, "success")
    })
}

// Add swap button to workout exercise blocks
// We'll modify the expanded ex-block-head to include a swap menu button
const _origRenderWorkout = renderWorkout
renderWorkout = function() {
    _origRenderWorkout()
    // Add swap buttons to expanded exercise blocks
    document.querySelectorAll(".ex-block.expanded").forEach((block, vi) => {
        const idEl = block.getAttribute("id") // exblock-N
        if (!idEl) return
        const ei = parseInt(idEl.replace("exblock-", ""), 10)
        if (isNaN(ei)) return
        const head = block.querySelector(".ex-block-head")
        if (head && !head.querySelector(".ex-swap-btn")) {
            const btn = document.createElement("button")
            btn.className = "ex-swap-btn"
            btn.innerHTML = "⇄"
            btn.title = "Swap exercise"
            btn.onclick = (e) => { e.stopPropagation(); swapWorkoutExercise(ei) }
            head.appendChild(btn)
        }
    })
}

/* =========================================================
   ============ PR CELEBRATIONS + BADGES ===================
   ========================================================= */

// ============ EARNED BADGES STORAGE ============
let earnedBadges = JSON.parse(localStorage.getItem("forge_badges") || "{}")
// shape: { 'badge-id': '2026-05-29' (date earned) }

// ============ BADGE DEFINITIONS (50+ achievements) ============
const BADGES = [
    // ===== SESSIONS =====
    { id: 'first-session',   cat: 'Sessions',   icon: '🎯', name: 'Day One',          desc: 'Complete your first workout',           check: () => sessionCount() >= 1 },
    { id: 'sessions-10',     cat: 'Sessions',   icon: '🔥', name: 'Hooked',           desc: '10 workouts logged',                    check: () => sessionCount() >= 10 },
    { id: 'sessions-25',     cat: 'Sessions',   icon: '⚡', name: 'Habit Forming',    desc: '25 workouts logged',                    check: () => sessionCount() >= 25 },
    { id: 'sessions-50',     cat: 'Sessions',   icon: '💪', name: 'Consistent',       desc: '50 workouts logged',                    check: () => sessionCount() >= 50 },
    { id: 'sessions-100',    cat: 'Sessions',   icon: '🏛', name: 'Centurion',        desc: '100 workouts logged',                   check: () => sessionCount() >= 100 },
    { id: 'sessions-250',    cat: 'Sessions',   icon: '⚔️', name: 'Dedicated',        desc: '250 workouts logged',                   check: () => sessionCount() >= 250 },
    { id: 'sessions-500',    cat: 'Sessions',   icon: '👑', name: 'Iron Lifer',       desc: '500 workouts logged',                   check: () => sessionCount() >= 500 },

    // ===== VOLUME (lifetime kg lifted) =====
    { id: 'vol-1k',          cat: 'Volume',     icon: '🏋️', name: 'Iron Beginner',   desc: '1,000 kg lifetime volume',              check: () => totalVolume() >= 1000 },
    { id: 'vol-10k',         cat: 'Volume',     icon: '⚙️', name: 'Iron Apprentice', desc: '10 tonnes lifetime volume',             check: () => totalVolume() >= 10000 },
    { id: 'vol-50k',         cat: 'Volume',     icon: '🔧', name: 'Iron Tradesman',  desc: '50 tonnes lifetime volume',             check: () => totalVolume() >= 50000 },
    { id: 'vol-100k',        cat: 'Volume',     icon: '🏗',  name: 'Iron Master',     desc: '100 tonnes lifetime volume',            check: () => totalVolume() >= 100000 },
    { id: 'vol-500k',        cat: 'Volume',     icon: '🌋', name: 'Iron Veteran',    desc: '500 tonnes lifetime volume',            check: () => totalVolume() >= 500000 },
    { id: 'vol-1m',          cat: 'Volume',     icon: '🪨', name: 'Iron Legend',     desc: '1 million kg lifted!',                  check: () => totalVolume() >= 1000000 },

    // ===== STREAKS =====
    { id: 'streak-3',        cat: 'Streaks',    icon: '🌱', name: 'Getting Started',  desc: '3 day training streak',                 check: () => getStreak() >= 3 },
    { id: 'streak-7',        cat: 'Streaks',    icon: '🌿', name: 'Week Warrior',     desc: '7 day training streak',                 check: () => getStreak() >= 7 },
    { id: 'streak-14',       cat: 'Streaks',    icon: '🌳', name: 'Two-Week Tear',    desc: '14 day training streak',                check: () => getStreak() >= 14 },
    { id: 'streak-30',       cat: 'Streaks',    icon: '🏔', name: 'Month of Iron',    desc: '30 day training streak',                check: () => getStreak() >= 30 },
    { id: 'streak-60',       cat: 'Streaks',    icon: '🌋', name: 'Steel Will',       desc: '60 day training streak',                check: () => getStreak() >= 60 },
    { id: 'streak-100',      cat: 'Streaks',    icon: '💎', name: 'Centurion Streak', desc: '100 day training streak',               check: () => getStreak() >= 100 },

    // ===== PRs =====
    { id: 'first-pr',        cat: 'Records',    icon: '🏆', name: 'Personal Best',    desc: 'Hit your first PR',                     check: () => countPRs() >= 1 },
    { id: 'pr-10',           cat: 'Records',    icon: '🥇', name: 'Progress Tracker', desc: '10 personal records',                   check: () => countPRs() >= 10 },
    { id: 'pr-25',           cat: 'Records',    icon: '🏅', name: 'Always Improving', desc: '25 personal records',                   check: () => countPRs() >= 25 },
    { id: 'pr-50',           cat: 'Records',    icon: '⭐', name: 'PR Machine',       desc: '50 personal records',                   check: () => countPRs() >= 50 },
    { id: 'pr-100',          cat: 'Records',    icon: '🌟', name: 'Beating Yesterday',desc: '100 personal records',                  check: () => countPRs() >= 100 },

    // ===== STRENGTH BENCHMARKS (bodyweight ratios) =====
    { id: 'bench-bw',        cat: 'Strength',   icon: '🟦', name: 'Plate Pusher',     desc: 'Bench press your bodyweight',           check: () => liftRatioReached('Bench Press', 1.0) },
    { id: 'bench-125',       cat: 'Strength',   icon: '🟪', name: 'Strong Pusher',    desc: 'Bench 1.25× bodyweight',                check: () => liftRatioReached('Bench Press', 1.25) },
    { id: 'bench-150',       cat: 'Strength',   icon: '🟧', name: 'Elite Pusher',     desc: 'Bench 1.5× bodyweight',                 check: () => liftRatioReached('Bench Press', 1.5) },
    { id: 'squat-bw',        cat: 'Strength',   icon: '🟦', name: 'Squatter',         desc: 'Squat your bodyweight',                 check: () => liftRatioReached('Squat', 1.0) },
    { id: 'squat-150',       cat: 'Strength',   icon: '🟪', name: 'Strong Legs',      desc: 'Squat 1.5× bodyweight',                 check: () => liftRatioReached('Squat', 1.5) },
    { id: 'squat-2',         cat: 'Strength',   icon: '🟧', name: 'Powerful Legs',    desc: 'Squat 2× bodyweight',                   check: () => liftRatioReached('Squat', 2.0) },
    { id: 'dl-150',          cat: 'Strength',   icon: '🟦', name: 'Puller',           desc: 'Deadlift 1.5× bodyweight',              check: () => liftRatioReached('Deadlift', 1.5) },
    { id: 'dl-2',            cat: 'Strength',   icon: '🟪', name: 'Strong Puller',    desc: 'Deadlift 2× bodyweight',                check: () => liftRatioReached('Deadlift', 2.0) },
    { id: 'dl-25',           cat: 'Strength',   icon: '🟧', name: 'Elite Puller',     desc: 'Deadlift 2.5× bodyweight',              check: () => liftRatioReached('Deadlift', 2.5) },

    // ===== RUN DISTANCE =====
    { id: 'first-run',       cat: 'Running',    icon: '👟', name: 'On the Move',      desc: 'Log your first run',                    check: () => runs.length >= 1 },
    { id: 'run-5k',          cat: 'Running',    icon: '🏃', name: '5K Done',          desc: 'Run 5 km in a single session',          check: () => runs.some(r => r.distance >= 5) },
    { id: 'run-10k',         cat: 'Running',    icon: '🏃‍♂️',name: '10K Done',         desc: 'Run 10 km in a single session',         check: () => runs.some(r => r.distance >= 10) },
    { id: 'run-half',        cat: 'Running',    icon: '🎽', name: 'Half Marathon',    desc: 'Run 21.1 km in a single session',       check: () => runs.some(r => r.distance >= 21.1) },
    { id: 'run-100km',       cat: 'Running',    icon: '🛣',  name: 'Century',          desc: '100 km lifetime distance',              check: () => totalKm() >= 100 },
    { id: 'run-500km',       cat: 'Running',    icon: '🗺',  name: 'Five Hundred Club',desc: '500 km lifetime distance',              check: () => totalKm() >= 500 },
    { id: 'run-1000km',      cat: 'Running',    icon: '🌍', name: 'Thousand Miles',   desc: '1000 km lifetime distance',             check: () => totalKm() >= 1000 },

    // ===== RUN PACE =====
    { id: 'pace-6',          cat: 'Running',    icon: '⏱',  name: 'Steady Runner',    desc: 'Sub-6:00/km in a 5K+ run',              check: () => runs.some(r => r.distance >= 5 && r.pace < 6) },
    { id: 'pace-5',          cat: 'Running',    icon: '⏱',  name: 'Fast Runner',      desc: 'Sub-5:00/km in a 5K+ run',              check: () => runs.some(r => r.distance >= 5 && r.pace < 5) },
    { id: 'pace-430',        cat: 'Running',    icon: '⚡', name: 'Quick Feet',       desc: 'Sub-4:30/km in a 5K+ run',              check: () => runs.some(r => r.distance >= 5 && r.pace < 4.5) },
    { id: 'pace-4',          cat: 'Running',    icon: '💨', name: 'Speedster',        desc: 'Sub-4:00/km in a 5K+ run',              check: () => runs.some(r => r.distance >= 5 && r.pace < 4) },

    // ===== RUN CONSISTENCY =====
    { id: 'run-week-3',      cat: 'Running',    icon: '📅', name: 'Triple Threat',    desc: '3 runs in a single week',               check: () => maxRunsInWeek() >= 3 },
    { id: 'run-week-5',      cat: 'Running',    icon: '🔁', name: 'Run Streak',       desc: '5 runs in a single week',               check: () => maxRunsInWeek() >= 5 },
    { id: 'run-20km-wk',     cat: 'Running',    icon: '📈', name: '20K Week',         desc: '20 km in a single week',                check: () => maxKmInWeek() >= 20 },
    { id: 'run-50km-wk',     cat: 'Running',    icon: '🚀', name: '50K Week',         desc: '50 km in a single week',                check: () => maxKmInWeek() >= 50 },

    // ===== VARIETY =====
    { id: 'ex-10',           cat: 'Variety',    icon: '🎨', name: 'Curious',          desc: 'Tried 10 different exercises',          check: () => uniqueExerciseCount() >= 10 },
    { id: 'ex-25',           cat: 'Variety',    icon: '🎭', name: 'Variety Seeker',   desc: 'Tried 25 different exercises',          check: () => uniqueExerciseCount() >= 25 },
    { id: 'ex-50',           cat: 'Variety',    icon: '🌈', name: 'Explorer',         desc: 'Tried 50 different exercises',          check: () => uniqueExerciseCount() >= 50 },

    // ===== SPECIAL =====
    { id: 'early-bird',      cat: 'Special',    icon: '🌅', name: 'Early Bird',       desc: 'Workout logged before 7 AM',            check: () => hasTimeWorkout(0, 7) },
    { id: 'night-owl',       cat: 'Special',    icon: '🦉', name: 'Night Owl',        desc: 'Workout logged after 10 PM',            check: () => hasTimeWorkout(22, 24) },
    { id: 'weekend-warrior', cat: 'Special',    icon: '⚔️', name: 'Weekend Warrior',  desc: 'Trained on Saturday or Sunday',         check: () => hasWeekendWorkout() },
    { id: 'custom-plan',     cat: 'Special',    icon: '🛠', name: 'Plan Maker',       desc: 'Create a custom plan',                  check: () => hasCustomPlan() },
    { id: 'custom-ex',       cat: 'Special',    icon: '✏️', name: 'Trailblazer',      desc: 'Add a custom exercise',                 check: () => (customExercises||[]).length >= 1 },
    { id: 'cycle-done',      cat: 'Special',    icon: '♻️', name: 'Cycle Complete',   desc: 'Complete a full schedule cycle',        check: () => hasCycleCompleted() },
]

// ============ HELPER FUNCTIONS FOR BADGE CHECKS ============
function countPRs() {
    // A PR for each exercise = current best e1RM. Count of distinct exercises with any lift counts as PRs achieved.
    // But to be accurate, we count "PR moments" — every time the best was set, it's a PR.
    // Simplest proxy: count distinct (exercise, weight, reps) groupings that were the best at their time.
    // For simplicity, count one PR per exercise that has any logged sets (assuming each best lift was a PR).
    const seen = {}
    workouts.forEach(w => {
        const e = estimate1RM(parseFloat(w.weight), parseInt(w.reps))
        if (!seen[w.exercise] || e > seen[w.exercise]) {
            seen[w.exercise] = e
        }
    })
    // Approximation: count exercises with at least one logged set
    return Object.keys(seen).length
}

function liftRatioReached(exercise, ratio) {
    if (!profile.weight || profile.weight <= 0) return false
    const target = profile.weight * ratio
    return workouts.some(w => w.exercise === exercise && parseFloat(w.weight) >= target)
}

function totalKm() {
    return runs.reduce((s, r) => s + (parseFloat(r.distance) || 0), 0)
}

function uniqueExerciseCount() {
    return new Set(workouts.map(w => w.exercise)).size
}

function maxRunsInWeek() {
    if (runs.length === 0) return 0
    const weekCounts = {}
    runs.forEach(r => {
        const d = new Date(r.date)
        const sunday = new Date(d); sunday.setDate(d.getDate() - d.getDay())
        const key = sunday.toISOString().slice(0,10)
        weekCounts[key] = (weekCounts[key] || 0) + 1
    })
    return Math.max(...Object.values(weekCounts))
}

function maxKmInWeek() {
    if (runs.length === 0) return 0
    const weekKm = {}
    runs.forEach(r => {
        const d = new Date(r.date)
        const sunday = new Date(d); sunday.setDate(d.getDate() - d.getDay())
        const key = sunday.toISOString().slice(0,10)
        weekKm[key] = (weekKm[key] || 0) + (parseFloat(r.distance) || 0)
    })
    return Math.max(...Object.values(weekKm))
}

function hasTimeWorkout(startHour, endHour) {
    // Time isn't tracked per workout currently, so check if any workout was created during that window
    // For simplicity, we check workouts saved 'now' — but we don't store the time of save.
    // As a proxy: check the current time when this is being checked. This means it's only earned
    // if the user finishes a workout during that hour.
    const h = new Date().getHours()
    return h >= startHour && h < endHour
}

function hasWeekendWorkout() {
    return workouts.some(w => {
        const d = new Date(w.date).getDay()
        return d === 0 || d === 6
    })
}

function hasCustomPlan() {
    return Object.keys(plans).some(name => !DEFAULT_PLANS[name])
}

function hasCycleCompleted() {
    // True if schedulePos has wrapped around at least once
    // We approximate by checking: total sessions+runs >= schedule.length
    if (!schedule || schedule.length === 0) return false
    const sessions = sessionCount() + runs.length
    return sessions >= schedule.length
}

// ============ CHECK & RECORD NEWLY EARNED BADGES ============
function checkAllBadges() {
    const newlyEarned = []
    BADGES.forEach(b => {
        if (!earnedBadges[b.id]) {
            try {
                if (b.check()) {
                    earnedBadges[b.id] = todayStr()
                    newlyEarned.push(b)
                }
            } catch (e) {
                console.warn("badge check failed", b.id, e)
            }
        }
    })
    if (newlyEarned.length) {
        localStorage.setItem("forge_badges", JSON.stringify(earnedBadges))
        if (typeof queueCloudPush === "function") queueCloudPush()
    }
    return newlyEarned
}

function showBadgeUnlocks(badges) {
    if (!badges.length) return
    // Queue toasts: one per badge, slight delay between them
    badges.forEach((b, i) => {
        setTimeout(() => {
            toast(`🎖 Badge unlocked: ${b.name}`, "success")
        }, i * 700)
    })
}

// ============ PR DETECTION DURING WORKOUT FINISH ============
// We need to know the BEST lift for an exercise BEFORE saving the new workouts,
// then compare AFTER. The existing finishWorkout already does this. We'll replace it
// with a version that captures PRs into a list and shows celebration.

let _pendingPRs = []  // populated during finishWorkout

// Override finishWorkout to capture PRs and show celebration
const _origFinishWorkout = finishWorkout
finishWorkout = function() {
    if (!activeWorkout) { go("gym"); return }
    const date = todayStr()
    const prsThisSession = []
    let logged = 0

    activeWorkout.exercises.forEach(ex => {
        const doneSets = ex.sets.filter(s => s.done && s.reps)
        if (doneSets.length === 0) return

        // Get PREVIOUS best e1RM (before this session's lifts)
        const prevBest = getBestLift(ex.name)
        const prevE1RM = prevBest ? prevBest.e1rm : 0

        // Find top set of this session
        let topSet = doneSets[0]
        doneSets.forEach(s => {
            if (estimate1RM(parseFloat(s.weight), parseInt(s.reps)) >
                estimate1RM(parseFloat(topSet.weight), parseInt(topSet.reps))) topSet = s
        })

        const newE1RM = estimate1RM(parseFloat(topSet.weight), parseInt(topSet.reps))

        // Push to workouts BEFORE checking — so the new lift counts
        workouts.push({
            date, day: activeWorkout.day, exercise: ex.name,
            weight: parseFloat(topSet.weight) || 0,
            reps: parseInt(topSet.reps) || 0,
            sets: doneSets.length,
            e1rm: newE1RM,
            allSets: doneSets.map(s => ({ weight: parseFloat(s.weight)||0, reps: parseInt(s.reps)||0 })),
            client_id: `w-${date}-${activeWorkout.day}-${ex.name}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`.replace(/\s+/g,"_")
        })
        logged++

        // PR detected if newE1RM > prevE1RM + threshold
        if (newE1RM > prevE1RM + 0.5) {
            prsThisSession.push({
                exercise: ex.name,
                oldWeight: prevBest ? prevBest.weight : null,
                oldReps: prevBest ? prevBest.reps : null,
                oldE1RM: prevE1RM,
                newWeight: parseFloat(topSet.weight),
                newReps: parseInt(topSet.reps),
                newE1RM: newE1RM,
                firstTime: !prevBest,
            })
        }
    })

    const finishedDay = activeWorkout.day
    activeWorkout = null
    clearInterval(workoutClockInterval)

    if (logged === 0) {
        toast("No sets logged", "warn")
        go("gym")
        return
    }

    save()

    // Advance schedule if appropriate
    const cs = currentSlot()
    if (cs && cs.type === "gym" && cs.planName === selectedPlan && cs.dayName === finishedDay) {
        advanceSchedule()
        save()
    }

    // Run badge checks AFTER saving
    const newBadges = checkAllBadges()

    // Show PR celebration OR plain success
    if (prsThisSession.length > 0) {
        _pendingPRs = prsThisSession
        showPRCelebration(prsThisSession, newBadges)
    } else {
        toast(`Workout saved — ${logged} exercises`, "success")
        showBadgeUnlocks(newBadges)
        go("home")
    }
}

// ============ PR CELEBRATION OVERLAY ============
function showPRCelebration(prs, pendingBadges = []) {
    const overlay = document.getElementById("prCelebration")
    if (!overlay) return
    const body = document.getElementById("prCelebBody")

    const prRows = prs.map(pr => {
        const diff = pr.newE1RM - pr.oldE1RM
        return `<div class="pr-celeb-row">
            <div class="pr-celeb-name">${pr.exercise}</div>
            <div class="pr-celeb-numbers">
                ${pr.firstTime
                    ? `<div class="pr-celeb-new">${fmt(pr.newWeight)}kg × ${pr.newReps}</div>
                       <div class="pr-celeb-first">FIRST TIME ★</div>`
                    : `<div class="pr-celeb-old">${fmt(pr.oldWeight)}kg × ${pr.oldReps}</div>
                       <div class="pr-celeb-arrow">→</div>
                       <div class="pr-celeb-new">${fmt(pr.newWeight)}kg × ${pr.newReps}</div>`}
            </div>
            ${!pr.firstTime ? `<div class="pr-celeb-gain">+${fmt(diff, 1)}kg e1RM</div>` : ''}
        </div>`
    }).join("")

    body.innerHTML = `
        <div class="pr-celeb-title">${prs.length === 1 ? "New PR!" : `${prs.length} New PRs!`}</div>
        <div class="pr-celeb-sub">${prs.length === 1 ? "You beat your previous best." : "You crushed it today."}</div>
        <div class="pr-celeb-list">${prRows}</div>
    `

    // Confetti
    spawnConfetti()

    overlay.classList.add("active")
    document.body.style.overflow = "hidden"

    // Store pending badges so the continue button can show them
    _pendingBadgesAfterCelebration = pendingBadges
}

let _pendingBadgesAfterCelebration = []

function closePRCelebration() {
    document.getElementById("prCelebration").classList.remove("active")
    document.body.style.overflow = ""
    // Then show any pending badge toasts
    if (_pendingBadgesAfterCelebration.length > 0) {
        setTimeout(() => showBadgeUnlocks(_pendingBadgesAfterCelebration), 400)
        _pendingBadgesAfterCelebration = []
    }
    go("home")
}

// Confetti — pure CSS-driven particles
function spawnConfetti() {
    const container = document.getElementById("confettiHost")
    if (!container) return
    container.innerHTML = ""
    const colors = ["#0a84ff", "#ff9f0a", "#30d158", "#ff453a", "#bf5af2", "#ffd60a"]
    for (let i = 0; i < 60; i++) {
        const p = document.createElement("div")
        p.className = "confetti-particle"
        p.style.left = Math.random() * 100 + "%"
        p.style.background = colors[Math.floor(Math.random() * colors.length)]
        p.style.animationDelay = (Math.random() * 0.5) + "s"
        p.style.animationDuration = (1.5 + Math.random() * 1.5) + "s"
        p.style.transform = `rotate(${Math.random() * 360}deg)`
        container.appendChild(p)
    }
    // Cleanup after animation
    setTimeout(() => { container.innerHTML = "" }, 3500)
}

// ============ HOOK INTO saveRun TO CHECK BADGES ============
const _origSaveRun = saveRun
saveRun = function() {
    _origSaveRun()
    // Allow save to complete then check badges
    setTimeout(() => {
        const newBadges = checkAllBadges()
        showBadgeUnlocks(newBadges)
    }, 300)
}

// ============ BADGES SCREEN ============
function renderBadges() {
    const total = BADGES.length
    const earnedCount = BADGES.filter(b => earnedBadges[b.id]).length

    document.getElementById("badgesStatTitle").textContent = `${earnedCount} / ${total}`

    // Group by category
    const byCat = {}
    BADGES.forEach(b => {
        if (!byCat[b.cat]) byCat[b.cat] = []
        byCat[b.cat].push(b)
    })

    const order = ['Sessions', 'Volume', 'Streaks', 'Records', 'Strength', 'Running', 'Variety', 'Special']
    const html = order.filter(c => byCat[c]).map(cat => {
        const items = byCat[cat]
        return `<div class="section-label">${cat}</div>
            <div class="badges-grid">
                ${items.map(b => {
                    const isEarned = !!earnedBadges[b.id]
                    return `<div class="badge-card ${isEarned ? 'earned' : 'locked'}" onclick="showBadgeDetail('${b.id}')">
                        <div class="badge-icon">${b.icon}</div>
                        <div class="badge-name">${b.name}</div>
                        ${isEarned ? `<div class="badge-date">${formatBadgeDate(earnedBadges[b.id])}</div>` : `<div class="badge-locked-tag">Locked</div>`}
                    </div>`
                }).join("")}
            </div>`
    }).join("")

    document.getElementById("badgesList").innerHTML = html
}

function formatBadgeDate(dateStr) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function showBadgeDetail(badgeId) {
    const b = BADGES.find(x => x.id === badgeId)
    if (!b) return
    const isEarned = !!earnedBadges[b.id]
    openSheet(`
        <div class="badge-detail-icon ${isEarned?'':'locked'}">${b.icon}</div>
        <div class="sheet-title" style="text-align:center">${b.name}</div>
        <div class="sheet-sub" style="text-align:center">${b.desc}</div>
        <div class="badge-detail-status">
            ${isEarned
                ? `<div style="color:var(--green);font-weight:700;text-align:center;margin-top:14px">✓ Earned ${formatBadgeDate(earnedBadges[b.id])}</div>`
                : `<div style="color:var(--text-2);text-align:center;margin-top:14px">Keep training to unlock this badge.</div>`}
        </div>
    `)
}

// ============ NAVIGATION HOOK ============
const _origGoForBadges = go
go = function(screen) {
    _origGoForBadges(screen)
    if (screen === "badges") renderBadges()
}

// ============ UPDATE CLOUD SYNC TO INCLUDE BADGES + CUSTOM EXERCISES ============
// Patch cloudPush to include the new data
const _origCloudPush = (typeof cloudPush === 'function') ? cloudPush : null
if (_origCloudPush) {
    cloudPush = async function() {
        if (!cloudUser || !sb) return
        const payload = {
            user_id: cloudUser.id,
            data: { workouts, runs, weights, selectedPlan, profile, theme, plans, schedule, schedulePos, earnedBadges, customExercises },
            updated_at: new Date().toISOString()
        }
        const { error } = await sb.from("forge_data").upsert(payload, { onConflict: "user_id" })
        if (error) console.warn("Cloud push error:", error.message)
    }
}

// Patch cloudPull to restore badges + customExercises
const _origCloudPull = (typeof cloudPull === 'function') ? cloudPull : null
if (_origCloudPull) {
    cloudPull = async function() {
        if (!cloudUser || !sb) return
        try {
            const { data, error } = await sb.from("forge_data").select("data").eq("user_id", cloudUser.id).maybeSingle()
            if (error) { console.warn("pull", error.message); return }
            if (data && data.data) {
                const cloud = data.data
                workouts = mergeById(workouts, cloud.workouts || [])
                runs = mergeById(runs, cloud.runs || [])
                weights = mergeById(weights, cloud.weights || [])
                if (cloud.selectedPlan && !selectedPlan) selectedPlan = cloud.selectedPlan
                if (cloud.profile) profile = { ...profile, ...cloud.profile }
                if (cloud.plans) plans = { ...plans, ...cloud.plans }
                if (Array.isArray(cloud.schedule) && cloud.schedule.length) schedule = cloud.schedule
                if (typeof cloud.schedulePos === "number") schedulePos = cloud.schedulePos
                if (cloud.earnedBadges) earnedBadges = { ...earnedBadges, ...cloud.earnedBadges }
                if (Array.isArray(cloud.customExercises)) {
                    const seen = new Set(customExercises.map(e => e.name.toLowerCase()))
                    cloud.customExercises.forEach(c => {
                        if (!seen.has(c.name.toLowerCase())) customExercises.push(c)
                    })
                }
                save()
                localStorage.setItem("forge_badges", JSON.stringify(earnedBadges))
                localStorage.setItem("forge_custom_ex", JSON.stringify(customExercises))
                go(currentScreen)
                setTimeout(cloudPush, 500)
            } else {
                cloudPush()
            }
        } catch(e) { console.warn("pull failed", e) }
    }
}

// Also persist badges in save()
const _origSave = save
save = function() {
    _origSave()
    localStorage.setItem("forge_badges", JSON.stringify(earnedBadges))
    localStorage.setItem("forge_custom_ex", JSON.stringify(customExercises))
}
