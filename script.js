/* ===========================
   FORGE — script.js
   Complete feature set v5
=========================== */

// ===== DATA =====
let workouts   = JSON.parse(localStorage.getItem("forge_workouts"))   || JSON.parse(localStorage.getItem("workouts_v4")) || []
let selectedPlanName = JSON.parse(localStorage.getItem("forge_planName")) || JSON.parse(localStorage.getItem("selectedPlanName_v4")) || null
let currentPlan      = JSON.parse(localStorage.getItem("forge_currentPlan")) || JSON.parse(localStorage.getItem("currentPlan_v4")) || null
let darkMode         = localStorage.getItem("forge_dark") === "true"
let sessionRating    = 0
let restTimerInterval = null
let restTimerSeconds  = 0
let restTimerTotal    = 90
let calendarDate      = new Date()

// ===== EXERCISE LIBRARY with muscle group tags, form cues, and video IDs =====
// Rich library with form cues, common mistakes, primary/secondary muscles, and YouTube video IDs
const exerciseLibrary = {
    // CHEST
    "Chest Press":               { muscle: "Chest", secondary: ["Triceps","Shoulders"], equipment: "gym",  category: "strength", video: "rT7DgCr-3pg",
        cues: ["Brace core before pressing", "Keep elbows at ~45° from torso", "Control the eccentric — 2s down"],
        mistakes: ["Elbows flaring to 90°", "Bouncing the weight off chest", "Lifting hips off bench"] },
    "Incline Chest Press":       { muscle: "Chest", secondary: ["Shoulders","Triceps"], equipment: "gym",  category: "strength", video: "SrqOu55lrYU",
        cues: ["Bench at 30-45°", "Lower bar to upper chest", "Drive through heels"],
        mistakes: ["Bench too steep — turns into shoulder press", "Bouncing reps"] },
    "Bench Press":               { muscle: "Chest", secondary: ["Triceps","Shoulders"], equipment: "gym",  category: "strength", video: "rT7DgCr-3pg",
        cues: ["Retract shoulder blades", "Feet planted, glutes tight", "Lower to mid-chest with control"],
        mistakes: ["Flared elbows", "Bouncing off chest", "Hips lifting"] },
    "Pec Fly":                   { muscle: "Chest", secondary: ["Shoulders"], equipment: "gym",  category: "strength", video: "eGjt4lk6g34",
        cues: ["Soft bend in elbows — maintain the angle", "Squeeze chest at peak", "Slow stretch at bottom"],
        mistakes: ["Bending elbows like a press", "Using momentum"] },
    "Push Up":                   { muscle: "Chest", secondary: ["Triceps","Core"], equipment: "home", category: "strength", video: "IODxDxX7oi4",
        cues: ["Body in a straight line", "Lower chest to floor", "Drive through palms"],
        mistakes: ["Sagging hips", "Flared elbows", "Half reps"] },
    "Dumbbell Bench Press":      { muscle: "Chest", secondary: ["Triceps","Shoulders"], equipment: "gym",  category: "strength", video: "VmB1G1K7v94",
        cues: ["Dumbbells track slightly over chest", "Full range of motion", "Press in arc path"],
        mistakes: ["Dumbbells crashing together", "Dropping the negative"] },

    // BACK
    "Lat Pulldown":              { muscle: "Back", secondary: ["Biceps"], equipment: "gym", category: "strength", video: "CAwf7n6Luuc",
        cues: ["Pull bar to upper chest", "Drive elbows down and back", "Slight backward lean"],
        mistakes: ["Using momentum", "Pulling behind the neck", "Not engaging lats"] },
    "Seated Row":                { muscle: "Back", secondary: ["Biceps","Rear Delts"], equipment: "gym", category: "strength", video: "sP_4vybjVJs",
        cues: ["Chest up, shoulders back", "Pull to lower abdomen", "Squeeze shoulder blades"],
        mistakes: ["Rounding the back", "Jerking the weight", "Pulling too high"] },
    "Close Grip Row":            { muscle: "Back", secondary: ["Biceps"], equipment: "gym", category: "strength", video: "GZbfZ033f74",
        cues: ["Neutral grip", "Elbows stay close to body", "Full squeeze at end"],
        mistakes: ["Swinging the body", "Incomplete range"] },
    "Rear Delt Fly":             { muscle: "Back", secondary: ["Rear Delts"], equipment: "gym", category: "strength", video: "ttvfGg9d76c",
        cues: ["Slight bend in elbows — hold it", "Lead with rear delts, not arms", "Control the negative"],
        mistakes: ["Using too heavy weight", "Turning into a row"] },
    "Pull Up":                   { muscle: "Back", secondary: ["Biceps"], equipment: "gym", category: "strength", video: "eGo4IYlbE5g",
        cues: ["Chin over bar", "Engage lats first", "Full extension at bottom"],
        mistakes: ["Kipping", "Half reps", "Using only arms"] },
    "Deadlift":                  { muscle: "Back", secondary: ["Hamstrings","Glutes","Traps"], equipment: "gym", category: "strength", video: "op9kVnSso6Q",
        cues: ["Neutral spine", "Bar close to body", "Drive floor away with feet"],
        mistakes: ["Rounding lower back", "Bar drifting forward", "Jerking off floor"] },
    "Barbell Row":               { muscle: "Back", secondary: ["Biceps"], equipment: "gym", category: "strength", video: "G8l_8chR5BE",
        cues: ["Hinge at hips ~45°", "Pull bar to lower chest", "Elbows drive back"],
        mistakes: ["Standing too upright", "Using momentum", "Short range"] },

    // SHOULDERS
    "Shoulder Press":            { muscle: "Shoulders", secondary: ["Triceps"], equipment: "gym", category: "strength", video: "qEwKCR5JCog",
        cues: ["Neutral wrist", "Press straight up", "Lock out at top"],
        mistakes: ["Arching back excessively", "Incomplete lockout", "Flared elbows"] },
    "Lateral Raise":             { muscle: "Shoulders", secondary: [], equipment: "gym", category: "strength", video: "3VcKaXpzqRo",
        cues: ["Slight bend in elbows", "Raise to shoulder height", "Lead with elbows"],
        mistakes: ["Swinging for momentum", "Going above shoulder", "Using too heavy weight"] },
    "Shrug":                     { muscle: "Shoulders", secondary: ["Traps"], equipment: "gym", category: "strength", video: "g6qbq4Lf1FI",
        cues: ["Straight up, not rolling", "Hold peak contraction 1s", "Full range"],
        mistakes: ["Rolling shoulders", "Partial range"] },
    "Front Raise":               { muscle: "Shoulders", secondary: [], equipment: "gym", category: "strength", video: "sxeY7kMa5zI",
        cues: ["Thumbs up grip", "Raise to eye level", "Slow negative"],
        mistakes: ["Swinging", "Going too high"] },

    // LEGS
    "Squat":                     { muscle: "Quads", secondary: ["Glutes","Hamstrings","Core"], equipment: "gym", category: "strength", video: "ultWZbUMPL8",
        cues: ["Chest up, eyes forward", "Hips below knees", "Drive knees out"],
        mistakes: ["Knees caving", "Heel lifting", "Good morning squat"] },
    "Leg Press":                 { muscle: "Quads", secondary: ["Glutes","Hamstrings"], equipment: "gym", category: "strength", video: "IZxyjW7MPJQ",
        cues: ["Feet shoulder width", "Deep range — thighs to chest", "Don't lock knees at top"],
        mistakes: ["Knees caving", "Using only half the range", "Locking out hard"] },
    "Leg Extension":             { muscle: "Quads", secondary: [], equipment: "gym", category: "strength", video: "YyvSfVjQeL0",
        cues: ["Full extension at top", "Slow 2s negative", "Pad at ankles"],
        mistakes: ["Kicking the weight", "Using momentum", "Partial range"] },
    "Leg Curl":                  { muscle: "Hamstrings", secondary: [], equipment: "gym", category: "strength", video: "1Tq3QdYUuHs",
        cues: ["Hips pressed into pad", "Squeeze hamstrings at peak", "Slow negative"],
        mistakes: ["Lifting hips", "Using too heavy a weight", "Fast reps"] },
    "Romanian Deadlift":         { muscle: "Hamstrings", secondary: ["Glutes","Back"], equipment: "gym", category: "strength", video: "2SHsk9AzdjA",
        cues: ["Soft bend in knees — maintain", "Hinge at hips", "Feel stretch in hamstrings"],
        mistakes: ["Bending knees more as you lower", "Rounding back"] },
    "Romanian Deadlift Machine": { muscle: "Hamstrings", secondary: ["Glutes"], equipment: "gym", category: "strength", video: "2SHsk9AzdjA",
        cues: ["Press hips back", "Feel hamstring stretch", "Engage glutes to return"],
        mistakes: ["Squatting the movement", "Rounding back"] },
    "Calf Raise":                { muscle: "Calves", secondary: [], equipment: "gym", category: "strength", video: "-M4-G8p8fmc",
        cues: ["Full stretch at bottom", "Full contraction at top", "1s pause at peak"],
        mistakes: ["Half reps", "Bouncing"] },
    "Lunge":                     { muscle: "Quads", secondary: ["Glutes","Hamstrings"], equipment: "home", category: "strength", video: "3XDriUn0udo",
        cues: ["Long stride", "Back knee gently touches floor", "Drive through front heel"],
        mistakes: ["Knee over toe too far", "Short stride", "Losing balance"] },

    // ARMS
    "Biceps Curl":               { muscle: "Biceps", secondary: [], equipment: "gym", category: "strength", video: "ykJmrZ5v0Oo",
        cues: ["Elbows pinned to sides", "Full range — arm extended", "Squeeze at top"],
        mistakes: ["Swinging elbows forward", "Using momentum", "Partial range"] },
    "Preacher Curl":             { muscle: "Biceps", secondary: [], equipment: "gym", category: "strength", video: "fIWP-FRFNU0",
        cues: ["Armpits on pad", "Don't fully extend at bottom (joint stress)", "Slow eccentric"],
        mistakes: ["Lifting elbows off pad", "Jerking the weight"] },
    "Hammer Curl":               { muscle: "Biceps", secondary: ["Forearms"], equipment: "gym", category: "strength", video: "zC3nLlEvin4",
        cues: ["Neutral grip", "Elbows stay fixed", "Alternate or together"],
        mistakes: ["Flaring elbows out", "Rocking body"] },
    "Triceps Pushdown":          { muscle: "Triceps", secondary: [], equipment: "gym", category: "strength", video: "2-LAMcpzODU",
        cues: ["Elbows tucked at sides", "Full extension at bottom", "Slow return"],
        mistakes: ["Elbows flaring forward", "Using momentum"] },
    "Overhead Triceps Extension":{ muscle: "Triceps", secondary: [], equipment: "gym", category: "strength", video: "_gsUck-7M74",
        cues: ["Elbows in, near ears", "Deep stretch at bottom", "Full lockout at top"],
        mistakes: ["Elbows flaring wide", "Short range"] },
    "Dip":                       { muscle: "Triceps", secondary: ["Chest","Shoulders"], equipment: "gym", category: "strength", video: "2z8JmcrW-As",
        cues: ["Chest up = triceps focus; lean forward = chest focus", "Lower to 90° elbow", "Control the descent"],
        mistakes: ["Going too deep (shoulder stress)", "Flaring elbows"] },

    // CORE
    "Abs":                       { muscle: "Core", secondary: [], equipment: "home", category: "strength", video: "pSHjTRCQxIw",
        cues: ["Press lower back into floor", "Exhale on crunch", "Control both phases"],
        mistakes: ["Pulling neck", "Using momentum"] },
    "Plank":                     { muscle: "Core", secondary: ["Shoulders"], equipment: "home", category: "strength", video: "ASdvN_XEl_c",
        cues: ["Straight line from head to heels", "Squeeze glutes", "Breathe"],
        mistakes: ["Sagging hips", "Raising hips too high"] },
    "Hanging Leg Raise":         { muscle: "Core", secondary: [], equipment: "gym", category: "strength", video: "Pr1ieGZ5atk",
        cues: ["No swinging", "Legs to ~90°+", "Slow lower"],
        mistakes: ["Swinging the body", "Using momentum"] },
    "Cable Crunch":              { muscle: "Core", secondary: [], equipment: "gym", category: "strength", video: "Xu72iMvTbxw",
        cues: ["Crunch with abs, not hips", "Roll the spine", "Full squeeze"],
        mistakes: ["Hip flexing instead of crunching", "Using weight as momentum"] },

    // CARDIO
    "Treadmill":                 { muscle: "Cardio", secondary: ["Legs"], equipment: "gym", category: "cardio", video: "uzl0SYt0Whg",
        cues: ["Run on the front 2/3 of the belt", "Relaxed shoulders", "Engage core"],
        mistakes: ["Holding handles — poor form", "Looking down", "Too long a stride"] },
    "Bike":                      { muscle: "Cardio", secondary: ["Quads"], equipment: "gym", category: "cardio", video: "1oZ8YNsXq_4",
        cues: ["Slight knee bend at bottom of stroke", "Seat at hip height standing", "Engage core"],
        mistakes: ["Seat too low (knee pain)", "Hunching over bars"] },
    "Rowing Machine":            { muscle: "Cardio", secondary: ["Back","Legs"], equipment: "gym", category: "cardio", video: "H0r_ZPXJLtg",
        cues: ["Legs → hips → arms on drive", "Arms → hips → legs on recovery", "Smooth rhythm"],
        mistakes: ["Arms pulling first", "Rocking torso", "Not using legs"] },
    "Elliptical":                { muscle: "Cardio", secondary: ["Legs"], equipment: "gym", category: "cardio", video: "6f_tMPXLEkA",
        cues: ["Upright posture", "Push AND pull the handles", "Full foot contact"],
        mistakes: ["Leaning on handles", "Short stride"] },

    // MOBILITY
    "Cat Cow":                   { muscle: "Mobility", secondary: ["Core"], equipment: "home", category: "mobility", video: "kqnua4rHVVA",
        cues: ["Hands under shoulders", "Slow, controlled breathing", "Full range spine flexion and extension"],
        mistakes: ["Rushing the movement", "Forgetting to breathe"] },
    "World's Greatest Stretch":  { muscle: "Mobility", secondary: [], equipment: "home", category: "mobility", video: "cnyJu5WAs0c",
        cues: ["Long lunge", "Rotate torso to lead arm", "Hold 1-2s at stretch"],
        mistakes: ["Short lunge", "Rushing the rotation"] },
    "Hip Flexor Stretch":        { muscle: "Mobility", secondary: [], equipment: "home", category: "mobility", video: "XGVqPLSXKH8",
        cues: ["Posterior pelvic tilt", "Squeeze glute of back leg", "Don't push knee forward"],
        mistakes: ["Arching low back", "Knee over toe"] }
}

// ===== PLANS =====
const plans = {
    "Full Body": {
        days: 3, description: "Best for beginners. Simple, balanced, solid recovery.",
        schedule: [
            { day: "Full Body A", exercises: [
                { name: "Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lat Pulldown", sets: 3, reps: "8 to 12", note: "" },
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Shoulder Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Biceps Curl", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Full Body B", exercises: [
                { name: "Incline Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Seated Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Leg Extension", sets: 3, reps: "10 to 15", note: "" },
                { name: "Lateral Raise", sets: 3, reps: "12 to 15", note: "" },
                { name: "Triceps Pushdown", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Full Body C", exercises: [
                { name: "Pec Fly", sets: 3, reps: "10 to 15", note: "" },
                { name: "Close Grip Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Rear Delt Fly", sets: 3, reps: "12 to 15", note: "" },
                { name: "Hammer Curl", sets: 2, reps: "10 to 15", note: "" }
            ]}
        ]
    },
    "Upper Lower": {
        days: 4, description: "Balanced split with simple structure and solid recovery.",
        schedule: [
            { day: "Upper 1", exercises: [
                { name: "Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lat Pulldown", sets: 3, reps: "8 to 12", note: "" },
                { name: "Shoulder Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Preacher Curl", sets: 2, reps: "10 to 15", note: "" },
                { name: "Triceps Pushdown", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Lower 1", exercises: [
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Leg Extension", sets: 3, reps: "10 to 15", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Calf Raise", sets: 3, reps: "12 to 20", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]},
            { day: "Upper 2", exercises: [
                { name: "Incline Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Seated Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lateral Raise", sets: 3, reps: "12 to 15", note: "" },
                { name: "Hammer Curl", sets: 2, reps: "10 to 15", note: "" },
                { name: "Overhead Triceps Extension", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Lower 2", exercises: [
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Romanian Deadlift Machine", sets: 3, reps: "8 to 12", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Calf Raise", sets: 3, reps: "12 to 20", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]}
        ]
    },
    "Anterior Posterior": {
        days: 4, description: "Front and back focused split with good exercise variety.",
        schedule: [
            { day: "Anterior 1", exercises: [
                { name: "Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Shoulder Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Leg Extension", sets: 3, reps: "10 to 15", note: "" },
                { name: "Triceps Pushdown", sets: 2, reps: "10 to 15", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]},
            { day: "Posterior 1", exercises: [
                { name: "Lat Pulldown", sets: 3, reps: "8 to 12", note: "" },
                { name: "Seated Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Rear Delt Fly", sets: 3, reps: "12 to 15", note: "" },
                { name: "Hammer Curl", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Anterior 2", exercises: [
                { name: "Incline Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lateral Raise", sets: 3, reps: "12 to 15", note: "" },
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Overhead Triceps Extension", sets: 2, reps: "10 to 15", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]},
            { day: "Posterior 2", exercises: [
                { name: "Close Grip Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Rear Delt Fly", sets: 3, reps: "12 to 15", note: "" },
                { name: "Romanian Deadlift Machine", sets: 3, reps: "8 to 12", note: "" },
                { name: "Preacher Curl", sets: 2, reps: "10 to 15", note: "" },
                { name: "Calf Raise", sets: 3, reps: "12 to 20", note: "" }
            ]}
        ]
    },
    "PPL": {
        days: 5, description: "Great if you enjoy training often and want more volume per muscle.",
        schedule: [
            { day: "Push", exercises: [
                { name: "Incline Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Pec Fly", sets: 3, reps: "10 to 15", note: "" },
                { name: "Shoulder Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lateral Raise", sets: 3, reps: "12 to 15", note: "" },
                { name: "Triceps Pushdown", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Pull", exercises: [
                { name: "Lat Pulldown", sets: 3, reps: "8 to 12", note: "" },
                { name: "Seated Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Close Grip Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Rear Delt Fly", sets: 3, reps: "12 to 15", note: "" },
                { name: "Preacher Curl", sets: 2, reps: "10 to 15", note: "" },
                { name: "Hammer Curl", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Legs", exercises: [
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Leg Extension", sets: 3, reps: "10 to 15", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Calf Raise", sets: 3, reps: "12 to 20", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]},
            { day: "Upper", exercises: [
                { name: "Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lat Pulldown", sets: 3, reps: "8 to 12", note: "" },
                { name: "Shoulder Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Biceps Curl", sets: 2, reps: "10 to 15", note: "" },
                { name: "Triceps Pushdown", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Lower", exercises: [
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Romanian Deadlift Machine", sets: 3, reps: "8 to 12", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Calf Raise", sets: 3, reps: "12 to 20", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]}
        ]
    },
    "PPL PPL Rest": {
        days: 6, description: "High frequency for people who love training every day.",
        schedule: [
            { day: "Push 1", exercises: [
                { name: "Incline Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Pec Fly", sets: 3, reps: "10 to 15", note: "" },
                { name: "Shoulder Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lateral Raise", sets: 3, reps: "12 to 15", note: "" },
                { name: "Triceps Pushdown", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Pull 1", exercises: [
                { name: "Lat Pulldown", sets: 3, reps: "8 to 12", note: "" },
                { name: "Seated Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Close Grip Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Rear Delt Fly", sets: 3, reps: "12 to 15", note: "" },
                { name: "Preacher Curl", sets: 2, reps: "10 to 15", note: "" },
                { name: "Hammer Curl", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Legs 1", exercises: [
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Leg Extension", sets: 3, reps: "10 to 15", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Calf Raise", sets: 3, reps: "12 to 20", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]},
            { day: "Push 2", exercises: [
                { name: "Incline Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Pec Fly", sets: 3, reps: "10 to 15", note: "" },
                { name: "Shoulder Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lateral Raise", sets: 3, reps: "12 to 15", note: "" },
                { name: "Overhead Triceps Extension", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Pull 2", exercises: [
                { name: "Lat Pulldown", sets: 3, reps: "8 to 12", note: "" },
                { name: "Seated Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Close Grip Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Rear Delt Fly", sets: 3, reps: "12 to 15", note: "" },
                { name: "Preacher Curl", sets: 2, reps: "10 to 15", note: "" },
                { name: "Hammer Curl", sets: 2, reps: "10 to 15", note: "" }
            ]},
            { day: "Legs 2", exercises: [
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Romanian Deadlift Machine", sets: 3, reps: "8 to 12", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Calf Raise", sets: 3, reps: "12 to 20", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]}
        ]
    },
    "Bro Split": {
        days: 5, description: "Classic muscle-group-per-day. High volume per body part.",
        schedule: [
            { day: "Chest", exercises: [
                { name: "Incline Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Chest Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Pec Fly", sets: 3, reps: "10 to 15", note: "" },
                { name: "Push Up", sets: 2, reps: "12 to 20", note: "" }
            ]},
            { day: "Back", exercises: [
                { name: "Lat Pulldown", sets: 3, reps: "8 to 12", note: "" },
                { name: "Seated Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Close Grip Row", sets: 3, reps: "8 to 12", note: "" },
                { name: "Rear Delt Fly", sets: 3, reps: "12 to 15", note: "" }
            ]},
            { day: "Shoulders", exercises: [
                { name: "Shoulder Press", sets: 3, reps: "8 to 12", note: "" },
                { name: "Lateral Raise", sets: 3, reps: "12 to 15", note: "" },
                { name: "Rear Delt Fly", sets: 3, reps: "12 to 15", note: "" },
                { name: "Shrug", sets: 3, reps: "10 to 15", note: "" }
            ]},
            { day: "Arms", exercises: [
                { name: "Preacher Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Hammer Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Triceps Pushdown", sets: 3, reps: "10 to 15", note: "" },
                { name: "Overhead Triceps Extension", sets: 3, reps: "10 to 15", note: "" }
            ]},
            { day: "Legs", exercises: [
                { name: "Leg Press", sets: 3, reps: "10 to 15", note: "" },
                { name: "Leg Extension", sets: 3, reps: "10 to 15", note: "" },
                { name: "Leg Curl", sets: 3, reps: "10 to 15", note: "" },
                { name: "Calf Raise", sets: 3, reps: "12 to 20", note: "" },
                { name: "Abs", sets: 3, reps: "12 to 20", note: "" }
            ]}
        ]
    }
}

const motivationMessages = [
    "The iron never lies.", "Show up. Every. Single. Time.",
    "Beat your last session.", "Small plates, big character.",
    "Progress is never linear. Keep moving.", "One rep at a time.",
    "Your future self is watching.", "Earn it.",
    "Consistency over intensity.", "No days off from being a beast.",
    "The best workout is the one you actually do.", "Forge yourself."
]

// ===== INIT =====
window.onload = function () {
    if (selectedPlanName && !currentPlan && plans[selectedPlanName]) {
        currentPlan = JSON.parse(JSON.stringify(plans[selectedPlanName]))
    }
    applyTheme()
    setGreeting()
    setTodayDate()
    renderDashboard()
    renderPlans()
    populateSessionDays()
    populateHistoryDayFilter()
    renderPlanEditor()
    renderHistory()
    renderRecords()
    renderCalendar()
    renderAnalytics()
    populateProgressionSelect()
}

// ===== NEW FEATURE DATA =====
let profile           = JSON.parse(localStorage.getItem("forge_profile"))       || { name: "", age: null, sex: "", height: null, units: "metric", trainingSince: "", injuries: [], restTimer: 90, voice: "on", notif: "off" }
let measurements      = JSON.parse(localStorage.getItem("forge_measurements"))  || []
let photos            = JSON.parse(localStorage.getItem("forge_photos"))        || [] // {id, date, dataUrl, label}
let foodLog           = JSON.parse(localStorage.getItem("forge_foodLog"))       || {} // { "YYYY-MM-DD": [ {name, kcal, p, c, f, time} ] }
let nutritionTargets  = JSON.parse(localStorage.getItem("forge_nutritionTargets")) || { kcal: null, p: null, c: null, f: null }
let goals             = JSON.parse(localStorage.getItem("forge_goals"))         || [] // {id, type, title, exercise?, target, deadline, createdAt, status}
let earnedBadges      = JSON.parse(localStorage.getItem("forge_badges"))        || {} // {badgeId: earnedDate}
let coachChatHistory  = JSON.parse(localStorage.getItem("forge_coachChat"))     || []

// ===== SAVE =====
function saveData() {
    localStorage.setItem("forge_workouts",          JSON.stringify(workouts))
    localStorage.setItem("forge_planName",          JSON.stringify(selectedPlanName))
    localStorage.setItem("forge_currentPlan",       JSON.stringify(currentPlan))
    localStorage.setItem("forge_dark",              String(darkMode))
    localStorage.setItem("forge_profile",           JSON.stringify(profile))
    localStorage.setItem("forge_measurements",      JSON.stringify(measurements))
    localStorage.setItem("forge_foodLog",           JSON.stringify(foodLog))
    localStorage.setItem("forge_nutritionTargets",  JSON.stringify(nutritionTargets))
    localStorage.setItem("forge_goals",             JSON.stringify(goals))
    localStorage.setItem("forge_badges",            JSON.stringify(earnedBadges))
    localStorage.setItem("forge_coachChat",         JSON.stringify(coachChatHistory.slice(-50)))
    // photos stored separately — large base64
    try { localStorage.setItem("forge_photos", JSON.stringify(photos)) } catch(e) { console.warn("Photo storage full") }
}

// ===== NAVIGATION =====
function navigate(sectionId, button) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"))
    document.getElementById(sectionId).classList.add("active-page")
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"))
    if (button) button.classList.add("active")

    if (sectionId === "dashboard")    renderDashboard()
    if (sectionId === "history")      renderHistory()
    if (sectionId === "records")      renderRecords()
    if (sectionId === "planEditor")   renderPlanEditor()
    if (sectionId === "analytics")    renderAnalytics()
    if (sectionId === "calendar")     renderCalendar()
    if (sectionId === "coach")        renderCoachPage()
    if (sectionId === "aiCoach")      renderAICoach()
    if (sectionId === "library")      renderLibrary()
    if (sectionId === "measurements") renderMeasurements()
    if (sectionId === "photos")       renderPhotos()
    if (sectionId === "nutrition")    renderNutrition()
    if (sectionId === "goals")        renderGoals()
    if (sectionId === "badges")       renderBadges()
    if (sectionId === "profile")      renderProfile()

    // close mobile sidebar
    closeSidebar()
}

function toggleSidebar() {
    const sb = document.getElementById("sidebar")
    const overlay = document.getElementById("sidebarOverlay")
    sb.classList.toggle("open")
    if (overlay) overlay.classList.toggle("active")
}

function closeSidebar() {
    const sb = document.getElementById("sidebar")
    const overlay = document.getElementById("sidebarOverlay")
    if (sb) sb.classList.remove("open")
    if (overlay) overlay.classList.remove("active")
}

// ===== THEME =====
function toggleDark() {
    darkMode = !darkMode
    applyTheme()
    saveData()
}

function applyTheme() {
    if (darkMode) {
        document.body.classList.remove("light")
        document.body.classList.add("dark")
        document.getElementById("themeBtn").textContent = "Light mode"
    } else {
        document.body.classList.remove("dark")
        document.body.classList.add("light")
        document.getElementById("themeBtn").textContent = "Dark mode"
    }
}

// ===== GREETING =====
function setGreeting() {
    const hour = new Date().getHours()
    const name = hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening."
    document.getElementById("dashGreeting").textContent = name
    const el = document.getElementById("motivationText")
    if (el) el.textContent = motivationMessages[Math.floor(Math.random() * motivationMessages.length)]
}

function setTodayDate() {
    const input = document.getElementById("sessionDate")
    if (input) input.value = new Date().toISOString().split("T")[0]
}

// ===== STREAK =====
function getStreak() {
    if (workouts.length === 0) return 0
    const sessionDays = [...new Set(workouts.map(w => w.date))].sort().reverse()
    let streak = 0
    const today = new Date()
    today.setHours(0,0,0,0)
    for (let i = 0; i < sessionDays.length; i++) {
        const d = new Date(sessionDays[i])
        d.setHours(0,0,0,0)
        const diff = Math.round((today - d) / 86400000)
        if (diff === i || diff === i + 1) streak++
        else break
    }
    return streak
}

function getWeekSessions() {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0,0,0,0)
    return [...new Set(workouts.filter(w => new Date(w.date) >= start).map(w => w.date))].length
}

// ===== DASHBOARD =====
function renderDashboard() {
    const streak = getStreak()
    const weekCount = getWeekSessions()
    const uniqueDays = [...new Set(workouts.map(w => w.date))].length

    document.getElementById("kpiSessions").textContent = uniqueDays
    document.getElementById("kpiWeek").textContent = weekCount
    document.getElementById("kpiStreak").textContent = streak + " 🔥"
    document.getElementById("kpiPlan").textContent = currentPlan?.customName || selectedPlanName || "None"
    document.getElementById("sidebarStreak").textContent = `🔥 ${streak} day streak`

    // Next workout
    const next = getNextWorkoutDay()
    document.getElementById("nextWorkout").textContent = next || "Choose a plan first."
    if (next && currentPlan) {
        const dayData = currentPlan.schedule.find(d => d.name === next || d.day === next)
        document.getElementById("nextWorkoutDetail").textContent = dayData
            ? `${dayData.exercises.length} exercises planned`
            : ""
    }

    // Coach alert
    renderCoachAlert()
    renderWeeklyBars()
    renderProgressionAlerts()
    renderRecentActivity()
    renderLastSessionSummary()
}

function renderCoachAlert() {
    const el = document.getElementById("coachAlert")
    const streak = getStreak()
    const weekSessions = getWeekSessions()

    if (streak === 0 && workouts.length === 0) {
        el.classList.remove("hidden")
        el.innerHTML = "⚡ Welcome to FORGE. Start your first session to begin tracking your progress."
        return
    }
    if (weekSessions === 0 && workouts.length > 0) {
        el.classList.remove("hidden")
        el.innerHTML = "⚠️ You haven't trained yet this week. Your next workout is waiting."
        return
    }
    if (streak >= 7) {
        el.classList.remove("hidden")
        el.innerHTML = `🔥 ${streak} day streak! You're on fire. Consider a deload day soon.`
        return
    }
    el.classList.add("hidden")
}

function renderWeeklyBars() {
    const container = document.getElementById("weeklyBarRow")
    container.innerHTML = ""
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    const today = new Date()
    const todayDay = today.getDay()

    for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - todayDay + i)
        const dateStr = d.toISOString().split("T")[0]
        const hasSessions = workouts.some(w => w.date === dateStr)
        const isToday = i === todayDay

        const col = document.createElement("div")
        col.className = "week-day-bar"

        const h = hasSessions ? Math.max(30, 60) : 8
        const fill = document.createElement("div")
        fill.className = "bar-fill" + (hasSessions ? " has-session" : "") + (isToday ? " today" : "")
        fill.style.height = h + "px"

        const lbl = document.createElement("div")
        lbl.className = "week-day-label"
        lbl.textContent = days[i]

        col.appendChild(fill)
        col.appendChild(lbl)
        container.appendChild(col)
    }
}

function getNextWorkoutDay() {
    if (!currentPlan) return null
    const days = currentPlan.schedule.map(d => d.day)
    if (workouts.length === 0) return days[0]
    const lastDay = workouts[workouts.length - 1].day
    const idx = days.indexOf(lastDay)
    if (idx === -1 || idx === days.length - 1) return days[0]
    return days[idx + 1]
}

function renderLastSessionSummary() {
    const el = document.getElementById("lastSessionSummary")
    if (workouts.length === 0) {
        el.innerHTML = `<p class="muted">No sessions yet.</p>`
        return
    }
    const lastDate = workouts.map(w => w.date).sort().reverse()[0]
    const lastItems = workouts.filter(w => w.date === lastDate)
    const day = lastItems[0]?.day || "—"
    el.innerHTML = `
        <div style="font-family:var(--font-display);font-size:18px;letter-spacing:1px;margin-bottom:10px">${day}</div>
        <div class="history-stats">
            <div class="history-stat"><strong>${lastDate}</strong></div>
            <div class="history-stat"><strong>${lastItems.length}</strong> exercises</div>
        </div>
        <div style="margin-top:10px;">
        ${lastItems.slice(0,3).map(item =>
            `<div class="activity-item">
                <span class="activity-name">${item.exercise}</span>
                <span class="activity-meta">${item.weight}kg × ${item.reps} reps × ${item.sets} sets</span>
            </div>`
        ).join("")}
        </div>
    `
}

function renderProgressionAlerts() {
    const el = document.getElementById("progressionAlerts")
    const alerts = getProgressionAlerts()
    if (alerts.length === 0) {
        el.innerHTML = `<p class="muted">Train consistently to get progression suggestions.</p>`
        return
    }
    el.innerHTML = alerts.map(a =>
        `<div class="prog-alert-item">
            <div class="prog-dot ${a.type}"></div>
            <div class="prog-text">${a.message}</div>
        </div>`
    ).join("")
}

function getProgressionAlerts() {
    const alerts = []
    const exerciseNames = [...new Set(workouts.map(w => w.exercise))]
    exerciseNames.forEach(name => {
        const history = workouts.filter(w => w.exercise === name).sort((a,b) => new Date(a.date) - new Date(b.date))
        if (history.length < 2) return
        const last = history[history.length - 1]
        const prev = history[history.length - 2]
        const maxW = Math.max(...history.map(h => h.weight))

        if (last.weight === maxW && last.weight > prev.weight) {
            alerts.push({ type: "", message: `<strong>${name}</strong> — New PB! ${last.weight}kg. Stay at this weight 1-2 more sessions.` })
        } else if (history.slice(-3).every(h => h.weight === last.weight && h.reps >= last.reps)) {
            const suggest = Math.round((last.weight * 1.025) * 4) / 4
            alerts.push({ type: "push-up", message: `<strong>${name}</strong> — Ready to progress. Try <strong>${suggest}kg</strong> next session.` })
        } else if (history.slice(-4).filter(h => h.weight === last.weight).length >= 4) {
            alerts.push({ type: "warn", message: `<strong>${name}</strong> — Possible plateau (4+ sessions same weight). Consider form check or +2.5kg.` })
        }
    })
    return alerts.slice(0, 5)
}

function renderRecentActivity() {
    const el = document.getElementById("recentActivity")
    if (workouts.length === 0) {
        el.innerHTML = `<p class="muted">No activity yet.</p>`
        return
    }
    el.innerHTML = workouts.slice(-6).reverse().map(item =>
        `<div class="activity-item">
            <div>
                <div class="activity-name">${item.exercise}</div>
                <div class="activity-meta">${item.day}</div>
            </div>
            <div>
                <div class="activity-meta">${item.weight}kg × ${item.reps}r × ${item.sets}s</div>
                <div class="activity-meta">${item.date}</div>
            </div>
        </div>`
    ).join("")
}

// ===== COACH PAGE =====
function suggestPlan() {
    const days = document.getElementById("trainingDays").value
    const goal = document.getElementById("goalType").value
    const box  = document.getElementById("planSuggestionBox")

    if (!days || !goal) { alert("Select training days and goal first."); return }

    let suggestion = "Full Body"
    if (days === "3") suggestion = "Full Body"
    else if (days === "4" && goal === "simple") suggestion = "Upper Lower"
    else if (days === "4" && goal !== "simple") suggestion = "Anterior Posterior"
    else if (days === "5") suggestion = goal === "muscle" ? "Bro Split" : "PPL"
    else if (days === "6") suggestion = "PPL PPL Rest"

    box.classList.remove("hidden")
    box.innerHTML = `
        <h3>Suggested: ${suggestion}</h3>
        <p style="color:var(--text);font-size:14px;margin-bottom:14px">${plans[suggestion].description}</p>
        <button class="pill-btn" onclick="selectPlan('${suggestion}')">Use This Plan</button>
    `
}

function renderCoachPage() {
    renderFatigueReport()
    renderMuscleBalance()
}

function renderFatigueReport() {
    const el = document.getElementById("fatigueReport")
    const weekSessions = getWeekSessions()
    const plan = currentPlan
    const planDays = plan ? plan.days || plan.schedule.length : 4

    const load = Math.min(100, Math.round((weekSessions / planDays) * 100))
    let status = load < 40 ? "Low — You can train more." : load < 80 ? "Good — On track." : load >= 100 ? "High — Consider a rest day." : "Optimal range."
    let color = load < 40 ? "var(--danger)" : load < 80 ? "var(--success)" : "var(--warning)"

    el.innerHTML = `
        <div style="margin-bottom:10px;font-size:13px;color:var(--muted)">This week: <strong style="color:var(--text)">${weekSessions} of ${planDays} sessions</strong></div>
        <div style="background:var(--surface);height:8px;border-radius:4px;overflow:hidden;margin-bottom:10px">
            <div style="height:100%;width:${load}%;background:${color};border-radius:4px;transition:width 0.8s"></div>
        </div>
        <div style="font-size:13px;font-weight:600;color:${color}">${status}</div>
        ${weekSessions >= planDays ? `<div style="margin-top:12px;font-size:13px;color:var(--warning)">⚠️ You've hit your weekly target. Rest or do active recovery.</div>` : ""}
    `
}

function renderMuscleBalance() {
    const el = document.getElementById("muscleBalance")
    if (workouts.length < 3) {
        el.innerHTML = `<p class="muted">Train more to see muscle group coverage.</p>`
        return
    }

    const last30 = workouts.filter(w => {
        const d = new Date(w.date)
        const now = new Date()
        return (now - d) / 86400000 <= 30
    })

    const groups = {}
    last30.forEach(w => {
        const muscle = exerciseLibrary[w.exercise]?.muscle || "Other"
        groups[muscle] = (groups[muscle] || 0) + w.sets
    })

    const total = Object.values(groups).reduce((a, b) => a + b, 0) || 1
    const sorted = Object.entries(groups).sort((a,b) => b[1]-a[1])

    el.innerHTML = `<div class="muscle-bar-row">` +
        sorted.map(([name, vol]) => {
            const pct = Math.round((vol / total) * 100)
            const cls = pct < 10 ? "low" : pct < 20 ? "warn" : ""
            return `<div class="muscle-row">
                <div class="muscle-name">${name}</div>
                <div class="muscle-track"><div class="muscle-fill ${cls}" style="width:${pct}%"></div></div>
                <div class="muscle-pct">${pct}%</div>
            </div>`
        }).join("") + `</div>`
}

// ===== PLANS =====
function renderPlans() {
    const grid = document.getElementById("plansGrid")
    grid.innerHTML = ""
    for (let name in plans) {
        const p = plans[name]
        const isSelected = name === selectedPlanName
        const card = document.createElement("div")
        card.className = "plan-card" + (isSelected ? " selected" : "")
        card.innerHTML = `
            <h3>${name}</h3>
            <p>${p.description}</p>
            <span class="plan-tag">${p.days} days/week</span>
            <div style="margin:10px 0">
                ${p.schedule[0].exercises.slice(0,3).map(e => `<div style="font-size:12px;color:var(--muted);padding:2px 0">• ${e.name}</div>`).join("")}
                ${p.schedule[0].exercises.length > 3 ? `<div style="font-size:12px;color:var(--muted2)">+ ${p.schedule[0].exercises.length - 3} more</div>` : ""}
            </div>
            <button class="pill-btn${isSelected ? " outline" : ""}" onclick="selectPlan('${name}')">${isSelected ? "✓ Active" : "Use Plan"}</button>
        `
        grid.appendChild(card)
    }
}

function selectPlan(name) {
    selectedPlanName = name
    currentPlan = JSON.parse(JSON.stringify(plans[name]))
    saveData()
    populateSessionDays()
    populateHistoryDayFilter()
    renderPlans()
    renderDashboard()
    renderPlanEditor()
    populateProgressionSelect()
}

// ===== PLAN EDITOR =====
function renderPlanEditor() {
    const nameInput = document.getElementById("editorPlanName")
    const container = document.getElementById("planEditorContent")
    if (!container) return

    if (!currentPlan) {
        if (nameInput) nameInput.value = ""
        container.innerHTML = `<div class="card"><p class="muted">Select a plan from Coach to begin editing.</p></div>`
        return
    }

    if (nameInput) nameInput.value = currentPlan.customName || selectedPlanName || ""

    container.innerHTML = ""
    currentPlan.schedule.forEach((dayItem, dayIdx) => {
        const card = document.createElement("div")
        card.className = "editor-day-card"
        card.innerHTML = `
            <div class="editor-day-header">
                <input type="text" value="${dayItem.day}" onchange="updateDayName(${dayIdx}, this.value)">
                <span style="color:var(--muted);font-size:13px">${dayItem.exercises.length} exercises</span>
            </div>
            <div class="editor-exercises-list" id="editorExList_${dayIdx}">
                ${dayItem.exercises.map((ex, exIdx) => renderEditorRow(dayIdx, exIdx, ex)).join("")}
            </div>
            <div style="padding:0 20px 16px">
                <button class="add-exercise-btn" onclick="addExercise(${dayIdx})">+ Add Exercise</button>
            </div>
        `
        container.appendChild(card)
    })
}

function renderEditorRow(dayIdx, exIdx, ex) {
    return `
        <div class="editor-exercise-row" id="exrow_${dayIdx}_${exIdx}">
            <input type="text" value="${ex.name}" onchange="updateExerciseField(${dayIdx},${exIdx},'name',this.value)" placeholder="Exercise name">
            <input type="number" value="${ex.sets}" onchange="updateExerciseField(${dayIdx},${exIdx},'sets',Number(this.value))" placeholder="Sets">
            <input type="text" value="${ex.reps}" onchange="updateExerciseField(${dayIdx},${exIdx},'reps',this.value)" placeholder="Reps">
            <input type="text" value="${ex.note}" onchange="updateExerciseField(${dayIdx},${exIdx},'note',this.value)" placeholder="Note">
            <div class="ex-controls">
                <button class="icon-btn" onclick="moveExerciseUp(${dayIdx},${exIdx})" title="Move up">↑</button>
                <button class="icon-btn" onclick="moveExerciseDown(${dayIdx},${exIdx})" title="Move down">↓</button>
                <button class="icon-btn del" onclick="removeExercise(${dayIdx},${exIdx})" title="Remove">✕</button>
            </div>
        </div>`
}

function updatePlanCustomName(val) {
    if (!currentPlan) return
    currentPlan.customName = val.trim()
    saveData()
    renderDashboard()
}

function updateDayName(dayIdx, val) {
    if (!currentPlan) return
    currentPlan.schedule[dayIdx].day = val.trim() || `Day ${dayIdx + 1}`
    saveData()
    populateSessionDays()
    populateHistoryDayFilter()
}

function updateExerciseField(dayIdx, exIdx, field, val) {
    if (!currentPlan) return
    currentPlan.schedule[dayIdx].exercises[exIdx][field] = val
    saveData()
}

function addExercise(dayIdx) {
    if (!currentPlan) return
    currentPlan.schedule[dayIdx].exercises.push({ name: "New Exercise", sets: 3, reps: "8 to 12", note: "" })
    saveData()
    renderPlanEditor()
}

function removeExercise(dayIdx, exIdx) {
    if (!currentPlan) return
    currentPlan.schedule[dayIdx].exercises.splice(exIdx, 1)
    saveData()
    renderPlanEditor()
}

function moveExerciseUp(dayIdx, exIdx) {
    if (!currentPlan || exIdx === 0) return
    const ex = currentPlan.schedule[dayIdx].exercises
    ;[ex[exIdx-1], ex[exIdx]] = [ex[exIdx], ex[exIdx-1]]
    saveData()
    renderPlanEditor()
}

function moveExerciseDown(dayIdx, exIdx) {
    if (!currentPlan) return
    const ex = currentPlan.schedule[dayIdx].exercises
    if (exIdx >= ex.length - 1) return
    ;[ex[exIdx+1], ex[exIdx]] = [ex[exIdx], ex[exIdx+1]]
    saveData()
    renderPlanEditor()
}

function resetPlanToDefault() {
    if (!selectedPlanName || !plans[selectedPlanName]) { alert("No plan selected."); return }
    if (!confirm("Reset all customisations for this plan?")) return
    currentPlan = JSON.parse(JSON.stringify(plans[selectedPlanName]))
    saveData()
    renderPlanEditor()
    populateSessionDays()
}

function savePlanAs() {
    const name = prompt("Name your custom plan:", currentPlan?.customName || "My Plan")
    if (!name) return
    currentPlan.customName = name
    saveData()
    renderDashboard()
    renderPlanEditor()
}

// ===== SESSION =====
function populateSessionDays() {
    const sel = document.getElementById("sessionDay")
    if (!sel) return
    sel.innerHTML = `<option value="">Select day</option>`
    if (!currentPlan) return
    currentPlan.schedule.forEach(item => {
        const opt = document.createElement("option")
        opt.value = item.day
        opt.textContent = item.day
        sel.appendChild(opt)
    })
}

function loadSessionExercises() {
    const day = document.getElementById("sessionDay").value
    const container = document.getElementById("sessionExercises")
    const finishCard = document.getElementById("sessionFinishCard")
    container.innerHTML = ""
    if (!currentPlan || !day) { finishCard.style.display = "none"; return }

    const session = currentPlan.schedule.find(s => s.day === day)
    if (!session) { finishCard.style.display = "none"; return }

    finishCard.style.display = "block"

    session.exercises.forEach((ex, idx) => {
        const last  = getLastForExercise(ex.name, day)
        const hint  = getCoachHint(ex.name, day)
        const smartHint = getSmartCoachTip(ex.name, day)
        const allWeights = workouts.filter(w => w.exercise === ex.name).map(w => parseFloat(w.weight) || 0)
        const isPB  = last && last.weight === Math.max(...allWeights, 0)
        const isInLibrary = exerciseLibrary[ex.name] != null
        const defaultRest = profile.restTimer || 90

        const card = document.createElement("div")
        card.className = "session-ex-card"
        card.innerHTML = `
            <div class="ex-header">
                <div class="ex-name-wrap">
                    <div class="ex-name">${ex.name}</div>
                    ${isInLibrary ? `<button class="ex-info-btn" onclick="showExerciseDetail('${ex.name.replace(/'/g,"\\'")}')" title="Form cues and video">ⓘ</button>` : ""}
                </div>
                <div class="ex-target">${ex.sets} × ${ex.reps}</div>
            </div>
            <div class="ex-last ${isPB ? 'pb' : ''}">
                ${last ? `Last: ${last.weight}kg × ${last.reps} reps × ${last.sets} sets (${last.date})${isPB ? " 🏆 PB" : ""}` : "No previous data — set your baseline."}
            </div>
            ${smartHint ? `<div class="coach-hint push-up">💡 ${smartHint}</div>` : (hint ? `<div class="coach-hint ${hint.type}">${hint.text}</div>` : "")}
            <div class="session-inputs-row">
                <div class="input-group">
                    <label>Weight (kg)</label>
                    <div class="input-with-action">
                        <input type="number" id="weight_${idx}" placeholder="kg" min="0" step="0.5"
                            value="${last ? last.weight : ''}"
                            onfocus="this.select()" onchange="onSetInputChange(${idx},'${ex.name.replace(/'/g,"\\'")}')"
                            oninput="update1RM(${idx})">
                        <button class="input-action-btn" onclick="openPlateFromWeight(${idx})" title="Plate calculator">⚖</button>
                    </div>
                </div>
                <div class="input-group">
                    <label>Reps</label>
                    <input type="number" id="reps_${idx}" placeholder="reps" min="1"
                        value="${last ? last.reps : ''}" onfocus="this.select()" oninput="update1RM(${idx})">
                </div>
                <div class="input-group">
                    <label>Sets</label>
                    <input type="number" id="sets_${idx}" placeholder="sets" min="1" value="${ex.sets}"
                        onfocus="this.select()">
                </div>
            </div>
            <div class="rpe-row">
                <div class="rpe-label-wrap">
                    <span class="rpe-label">RPE (how hard?)</span>
                    <span class="rpe-value" id="rpeValue_${idx}">—</span>
                </div>
                <input type="range" class="rpe-slider" id="rpe_${idx}" min="5" max="10" step="0.5" value="7.5"
                    oninput="updateRPEDisplay(${idx})" onchange="updateRPEDisplay(${idx})">
                <div class="rpe-scale">
                    <span>Easy</span><span>Hard</span><span>Max</span>
                </div>
            </div>
            <div class="one-rm-display" id="oneRM_${idx}">
                <span class="muted">Enter weight & reps to see estimated 1RM</span>
            </div>
            <button class="rest-btn" onclick="startRestTimer(${defaultRest})">⏱ Start Rest Timer (${defaultRest}s)</button>
        `
        container.appendChild(card)
        // Initialize 1RM display if last data exists
        if (last) update1RM(idx)
    })
}

function update1RM(idx) {
    const weightEl = document.getElementById(`weight_${idx}`)
    const repsEl = document.getElementById(`reps_${idx}`)
    const el = document.getElementById(`oneRM_${idx}`)
    if (!weightEl || !repsEl || !el) return
    const w = parseFloat(weightEl.value) || 0
    const r = parseInt(repsEl.value) || 0
    if (w > 0 && r > 0) {
        const e1rm = estimate1RM(w, r)
        el.innerHTML = `<span class="one-rm-label">Estimated 1RM</span><span class="one-rm-value">${fmtNum(e1rm)} kg</span>`
    } else {
        el.innerHTML = `<span class="muted">Enter weight & reps to see estimated 1RM</span>`
    }
}

function updateRPEDisplay(idx) {
    const el = document.getElementById(`rpe_${idx}`)
    const val = document.getElementById(`rpeValue_${idx}`)
    if (!el || !val) return
    const v = parseFloat(el.value)
    val.textContent = v.toString().replace(".0", "")
    // Color-code: green < 7, yellow 7-8.5, red 9+
    val.className = "rpe-value"
    if (v <= 7)        val.classList.add("rpe-easy")
    else if (v <= 8.5) val.classList.add("rpe-moderate")
    else               val.classList.add("rpe-hard")
}

function onSetInputChange(idx, name) {
    checkNewPB(idx, name)
    update1RM(idx)
}

function openPlateFromWeight(idx) {
    const w = parseFloat(document.getElementById(`weight_${idx}`)?.value) || 0
    if (w <= 0) {
        toast("Enter a weight first", "warn")
        return
    }
    openPlateModal(w)
}

function getLastForExercise(name, day) {
    const matches = workouts.filter(w => w.exercise === name && w.day === day)
    return matches.length > 0 ? matches[matches.length - 1] : null
}

function getCoachHint(name, day) {
    const history = workouts.filter(w => w.exercise === name && w.day === day)
        .sort((a,b) => new Date(a.date) - new Date(b.date))
    if (history.length < 2) return null

    const last = history[history.length - 1]
    const prev = history[history.length - 2]

    if (history.slice(-3).every(h => h.weight === last.weight)) {
        const suggest = Math.round((last.weight * 1.025) * 4) / 4
        return { type: "push-up", text: `🎯 Coach: You've hit this weight 3+ times. Try ${suggest}kg today.` }
    }
    if (last.weight < prev.weight) {
        return { type: "maintain", text: `⚠️ Coach: You dropped weight last session. Focus on hitting ${prev.weight}kg.` }
    }
    if (last.reps >= 12) {
        return { type: "push-up", text: `💪 Coach: You hit 12+ reps. Ready to add weight.` }
    }
    return null
}

function checkNewPB(idx, name) {
    const val = parseFloat(document.getElementById(`weight_${idx}`)?.value) || 0
    const maxPrev = Math.max(...workouts.filter(w => w.exercise === name).map(w => w.weight), 0)
    const card = document.getElementById(`weight_${idx}`)?.closest(".session-ex-card")
    if (card && val > maxPrev && maxPrev > 0) {
        const hint = card.querySelector(".coach-hint")
        if (!hint) {
            const h = document.createElement("div")
            h.className = "coach-hint push-up"
            h.textContent = `🏆 New PB incoming at ${val}kg!`
            card.querySelector(".ex-last").after(h)
        }
    }
}

function setRating(n) {
    sessionRating = n
    document.querySelectorAll(".star-rating button").forEach((b, i) => {
        b.classList.toggle("active", i < n)
    })
}

function saveSession() {
    const day   = document.getElementById("sessionDay").value
    const date  = document.getElementById("sessionDate").value
    const notes = document.getElementById("sessionNotes").value.trim()
    const energy = document.getElementById("energyLevel").value
    const msg   = document.getElementById("saveMessage")

    if (!currentPlan || !day || !date) { alert("Select a workout day first."); return }

    const session = currentPlan.schedule.find(s => s.day === day)
    if (!session) return

    let added = 0
    session.exercises.forEach((ex, idx) => {
        const w = document.getElementById(`weight_${idx}`)?.value
        const r = document.getElementById(`reps_${idx}`)?.value
        const s = document.getElementById(`sets_${idx}`)?.value
        const rpe = document.getElementById(`rpe_${idx}`)?.value
        if (w && r && s) {
            const weightNum = Number(w)
            const repsNum = Number(r)
            workouts.push({
                day, date,
                exercise: ex.name,
                weight: weightNum,
                reps: repsNum,
                sets: Number(s),
                rpe: rpe ? Number(rpe) : null,
                e1rm: estimate1RM(weightNum, repsNum),
                notes, rating: sessionRating,
                energy: Number(energy)
            })
            added++
        }
    })

    if (added === 0) { alert("Log at least one exercise."); return }

    saveData()
    checkBadges()
    renderDashboard()
    renderHistory()
    renderRecords()
    populateProgressionSelect()

    msg.textContent = `✓ Session saved — ${added} exercises logged.`
    setTimeout(() => { msg.textContent = "" }, 4000)
    document.getElementById("sessionNotes").value = ""
    setRating(0)
    loadSessionExercises()
    toast(`Session saved — ${added} exercises`, "success")
}

function duplicateLastWorkout() {
    const day = document.getElementById("sessionDay").value
    if (!day) { alert("Select a workout day first."); return }
    const session = currentPlan?.schedule.find(s => s.day === day)
    if (!session) return
    session.exercises.forEach((ex, idx) => {
        const last = getLastForExercise(ex.name, day)
        if (last) {
            document.getElementById(`weight_${idx}`).value = last.weight
            document.getElementById(`reps_${idx}`).value   = last.reps
            document.getElementById(`sets_${idx}`).value   = last.sets
        }
    })
}

// ===== REST TIMER =====
function startRestTimer(seconds) {
    stopRestTimer()
    restTimerTotal   = seconds
    restTimerSeconds = seconds
    document.getElementById("restTimerBar").classList.remove("hidden")
    updateRestTimerDisplay()
    restTimerInterval = setInterval(() => {
        restTimerSeconds--
        updateRestTimerDisplay()
        if (restTimerSeconds <= 0) { stopRestTimer(); playTimerEnd() }
    }, 1000)
}

function updateRestTimerDisplay() {
    const m = Math.floor(restTimerSeconds / 60)
    const s = restTimerSeconds % 60
    document.getElementById("restTimerDisplay").textContent = `${m}:${s.toString().padStart(2,"0")}`
    const pct = (restTimerSeconds / restTimerTotal) * 100
    document.getElementById("restTimerProgress").style.width = pct + "%"
}

function stopRestTimer() {
    clearInterval(restTimerInterval)
    restTimerInterval = null
    document.getElementById("restTimerBar").classList.add("hidden")
}

function playTimerEnd() {
    try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
        osc.start()
        osc.stop(ctx.currentTime + 0.6)
    } catch(e) {}
}

// ===== HISTORY =====
function populateHistoryDayFilter() {
    const filter = document.getElementById("historyDayFilter")
    if (!filter) return
    filter.innerHTML = `<option value="All">All Days</option>`
    let days = currentPlan ? currentPlan.schedule.map(d => d.day)
                           : [...new Set(workouts.map(w => w.day))]
    days.forEach(d => {
        const opt = document.createElement("option")
        opt.value = d; opt.textContent = d
        filter.appendChild(opt)
    })
}

function renderHistory() {
    const list    = document.getElementById("historyList")
    if (!list) return
    const search  = (document.getElementById("historySearch")?.value || "").toLowerCase()
    const dayFilt = document.getElementById("historyDayFilter")?.value || "All"
    const sort    = document.getElementById("historySort")?.value || "newest"

    let filtered = workouts.filter(w =>
        w.exercise.toLowerCase().includes(search) &&
        (dayFilt === "All" || w.day === dayFilt)
    )

    filtered = sort === "newest"
        ? [...filtered].reverse()
        : filtered

    list.innerHTML = ""
    if (filtered.length === 0) {
        list.innerHTML = `<p class="muted">No history found.</p>`
        return
    }

    filtered.forEach(item => {
        const realIdx = workouts.indexOf(item)
        const maxW = Math.max(...workouts.filter(w => w.exercise === item.exercise).map(w => w.weight))
        const isPB = item.weight === maxW

        const div = document.createElement("div")
        div.className = "history-item"
        div.innerHTML = `
            <div class="history-top">
                <div class="history-title">${item.exercise} ${isPB ? '<span style="color:var(--primary);font-size:12px">🏆 PB</span>' : ""}</div>
                <div class="history-meta">${item.date}</div>
            </div>
            <div class="history-stats">
                <div class="history-stat"><strong>${item.weight}</strong> kg</div>
                <div class="history-stat"><strong>${item.reps}</strong> reps</div>
                <div class="history-stat"><strong>${item.sets}</strong> sets</div>
                <div class="history-stat">${item.day}</div>
                ${item.rating ? `<div class="history-stat">${"★".repeat(item.rating)}</div>` : ""}
            </div>
            ${item.notes ? `<div style="font-size:13px;color:var(--muted);margin-top:6px;font-style:italic">"${item.notes}"</div>` : ""}
            <div class="history-actions">
                <button class="pill-btn sm outline" onclick="editHistoryEntry(${realIdx})">Edit</button>
                <button class="pill-btn sm danger" onclick="deleteHistoryEntry(${realIdx})">Delete</button>
            </div>
        `
        list.appendChild(div)
    })
}

function editHistoryEntry(idx) {
    const entry = workouts[idx]
    navigate("session", document.querySelector("[data-section=session]"))
    document.getElementById("sessionDay").value = entry.day
    loadSessionExercises()
    document.getElementById("sessionDate").value = entry.date

    const session = currentPlan?.schedule.find(s => s.day === entry.day)
    if (!session) return
    const exIdx = session.exercises.findIndex(e => e.name === entry.exercise)
    if (exIdx !== -1) {
        document.getElementById(`weight_${exIdx}`).value = entry.weight
        document.getElementById(`reps_${exIdx}`).value   = entry.reps
        document.getElementById(`sets_${exIdx}`).value   = entry.sets
    }
    document.getElementById("sessionNotes").value = entry.notes || ""
    workouts.splice(idx, 1)
    saveData()
}

function deleteHistoryEntry(idx) {
    if (!confirm("Delete this entry?")) return
    workouts.splice(idx, 1)
    saveData()
    renderDashboard()
    renderHistory()
    renderRecords()
}

// ===== RECORDS =====
function renderRecords() {
    const grid = document.getElementById("recordsList")
    if (!grid) return
    grid.innerHTML = ""

    const records = {}
    workouts.forEach(w => {
        if (!records[w.exercise] || w.weight > records[w.exercise].weight) {
            records[w.exercise] = { weight: w.weight, reps: w.reps, sets: w.sets, date: w.date }
        }
    })

    const entries = Object.entries(records).sort((a,b) => b[1].weight - a[1].weight)
    if (entries.length === 0) {
        grid.innerHTML = `<p class="muted">No records yet. Start logging sessions.</p>`
        return
    }

    entries.forEach(([name, data]) => {
        const card = document.createElement("div")
        card.className = "record-card"
        card.innerHTML = `
            <div class="record-pb-tag">PB</div>
            <h3>${name}</h3>
            <div class="record-weight">${data.weight}<span style="font-size:18px">kg</span></div>
            <div class="record-detail">${data.reps} reps · ${data.sets} sets · ${data.date}</div>
        `
        grid.appendChild(card)
    })
}

// ===== ANALYTICS =====
function switchAnalyticsTab(name, btn) {
    document.querySelectorAll(".analytics-panel").forEach(p => p.classList.add("hidden"))
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"))
    document.getElementById(`tab-${name}`).classList.remove("hidden")
    btn.classList.add("active")
    if (name === "volume")      renderVolumeCharts()
    if (name === "performance") renderPerformanceTab()
    if (name === "compare")     renderCompareTab()
}

function renderAnalytics() {
    populateProgressionSelect()
    renderProgressionChart()
}

function populateProgressionSelect() {
    const sel = document.getElementById("progressionExSelect")
    if (!sel) return
    const names = [...new Set(workouts.map(w => w.exercise))].sort()
    sel.innerHTML = `<option value="">Choose exercise</option>`
    names.forEach(n => {
        const opt = document.createElement("option")
        opt.value = n; opt.textContent = n
        sel.appendChild(opt)
    })
}

function renderProgressionChart() {
    const name = document.getElementById("progressionExSelect")?.value
    const el   = document.getElementById("progressionChart")
    if (!el) return

    if (!name) {
        el.innerHTML = `<div class="chart-empty">Select an exercise to view progression.</div>`
        return
    }

    const data = workouts.filter(w => w.exercise === name)
        .sort((a,b) => new Date(a.date) - new Date(b.date))

    if (data.length < 2) {
        el.innerHTML = `<div class="chart-empty">Need at least 2 sessions to show chart.</div>`
        return
    }

    const weights = data.map(d => d.weight)
    const minW = Math.min(...weights)
    const maxW = Math.max(...weights)
    const range = maxW - minW || 1

    const W = 600, H = 160, pad = 30
    const pts = data.map((d, i) => ({
        x: pad + (i / (data.length - 1)) * (W - 2 * pad),
        y: H - pad - ((d.weight - minW) / range) * (H - 2 * pad),
        weight: d.weight,
        date: d.date
    }))

    const path = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ")
    const area = pts.map((p, i) => (i === 0 ? `M${p.x},${H - pad}` : "") + `L${p.x},${p.y}`).join(" ")
        + ` L${pts[pts.length-1].x},${H-pad} Z`

    el.innerHTML = `
        <svg class="chart-svg" viewBox="0 0 ${W} ${H}">
            <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <path d="${area}" fill="url(#chartGrad)"/>
            <path d="${path}" stroke="var(--primary)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            ${pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--primary)">
                <title>${p.weight}kg on ${p.date}</title>
            </circle>`).join("")}
            <text x="${pad}" y="${H - 8}" fill="var(--muted)" font-size="11">${minW}kg</text>
            <text x="${W - pad - 30}" y="${H - 8}" fill="var(--muted)" font-size="11">${data[data.length-1].date}</text>
            <text x="${W / 2 - 30}" y="20" fill="var(--primary)" font-size="12" font-weight="bold">Max: ${maxW}kg</text>
        </svg>
    `
}

function renderVolumeCharts() {
    renderWeeklyVolumeChart()
    renderMuscleVolumeChart()
}

function renderWeeklyVolumeChart() {
    const el = document.getElementById("weeklyVolumeChart")
    if (!el) return

    const weeks = {}
    workouts.forEach(w => {
        const d = new Date(w.date)
        const week = `W${getWeekNumber(d)}`
        weeks[week] = (weeks[week] || 0) + (w.sets * w.reps * w.weight)
    })

    const entries = Object.entries(weeks).slice(-8)
    if (entries.length === 0) { el.innerHTML = `<div class="chart-empty">No volume data yet.</div>`; return }

    const maxVol = Math.max(...entries.map(e => e[1])) || 1
    const W = 400, H = 140, pad = 20
    const barW = (W - pad * 2) / entries.length - 4

    el.innerHTML = `
        <svg class="chart-svg" viewBox="0 0 ${W} ${H}">
            ${entries.map(([label, vol], i) => {
                const x = pad + i * ((W - pad * 2) / entries.length)
                const h = Math.round((vol / maxVol) * (H - 50))
                return `
                    <rect x="${x}" y="${H - pad - h}" width="${barW}" height="${h}"
                          rx="4" fill="var(--primary)" opacity="0.8"/>
                    <text x="${x + barW/2}" y="${H - 4}" fill="var(--muted)" font-size="9"
                          text-anchor="middle">${label}</text>
                `
            }).join("")}
        </svg>
    `
}

function renderMuscleVolumeChart() {
    const el = document.getElementById("muscleVolumeChart")
    if (!el) return

    const groups = {}
    workouts.forEach(w => {
        const muscle = exerciseLibrary[w.exercise]?.muscle || "Other"
        groups[muscle] = (groups[muscle] || 0) + w.sets
    })

    const entries = Object.entries(groups).sort((a,b) => b[1]-a[1]).slice(0, 8)
    if (entries.length === 0) { el.innerHTML = `<div class="chart-empty">No data yet.</div>`; return }

    const maxV = Math.max(...entries.map(e => e[1])) || 1
    const W = 400, H = 200, pad = 20, barH = 20, gap = 8
    const totalH = entries.length * (barH + gap) + pad * 2

    el.innerHTML = `
        <svg class="chart-svg" viewBox="0 0 ${W} ${totalH}">
            ${entries.map(([name, vol], i) => {
                const y = pad + i * (barH + gap)
                const w = Math.round((vol / maxV) * (W - 120))
                return `
                    <text x="0" y="${y + barH - 4}" fill="var(--muted)" font-size="11">${name}</text>
                    <rect x="90" y="${y}" width="${w}" height="${barH}" rx="4" fill="var(--primary)" opacity="0.8"/>
                    <text x="${90 + w + 6}" y="${y + barH - 4}" fill="var(--muted)" font-size="11">${vol}s</text>
                `
            }).join("")}
        </svg>
    `
}

function getWeekNumber(d) {
    const jan1 = new Date(d.getFullYear(), 0, 1)
    return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
}

function renderPerformanceTab() {
    renderBestLifts()
    renderMostImproved()
    renderPlateauDetection()
}

function renderBestLifts() {
    const el = document.getElementById("bestLifts")
    const records = {}
    workouts.forEach(w => {
        if (!records[w.exercise] || w.weight > records[w.exercise]) records[w.exercise] = w.weight
    })
    const top = Object.entries(records).sort((a,b) => b[1]-a[1]).slice(0, 8)
    el.innerHTML = top.map(([name, w]) =>
        `<div class="activity-item">
            <span class="activity-name">${name}</span>
            <span style="font-family:var(--font-display);font-size:18px;color:var(--primary)">${w}kg</span>
        </div>`
    ).join("") || `<p class="muted">No data yet.</p>`
}

function renderMostImproved() {
    const el = document.getElementById("mostImproved")
    const improvements = []
    const exerciseNames = [...new Set(workouts.map(w => w.exercise))]
    exerciseNames.forEach(name => {
        const history = workouts.filter(w => w.exercise === name).sort((a,b) => new Date(a.date)-new Date(b.date))
        if (history.length < 2) return
        const diff = history[history.length-1].weight - history[0].weight
        if (diff > 0) improvements.push({ name, diff, pct: Math.round((diff/history[0].weight)*100) })
    })
    improvements.sort((a,b) => b.diff - a.diff)
    el.innerHTML = improvements.slice(0,6).map(item =>
        `<div class="activity-item">
            <span class="activity-name">${item.name}</span>
            <span style="color:var(--success);font-weight:700">+${item.diff}kg (+${item.pct}%)</span>
        </div>`
    ).join("") || `<p class="muted">Need more data.</p>`
}

function renderPlateauDetection() {
    const el = document.getElementById("plateauDetection")
    const plateaus = []
    const names = [...new Set(workouts.map(w => w.exercise))]
    names.forEach(name => {
        const history = workouts.filter(w => w.exercise === name).sort((a,b) => new Date(a.date)-new Date(b.date))
        if (history.length < 4) return
        const last4 = history.slice(-4)
        if (last4.every(h => h.weight === last4[0].weight)) {
            plateaus.push({ name, weight: last4[0].weight, sessions: last4.length })
        }
    })
    el.innerHTML = plateaus.length === 0
        ? `<p class="muted">No plateaus detected — keep progressing.</p>`
        : plateaus.map(p =>
            `<div class="activity-item">
                <span class="activity-name">${p.name}</span>
                <span style="color:var(--warning);font-size:13px">Stuck at ${p.weight}kg for ${p.sessions}+ sessions</span>
            </div>`
        ).join("")
}

function renderCompareTab() {
    renderWeekCompare()
    renderMonthCompare()
    renderConsistency()
}

function getWeekStats(weeksAgo) {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay() - weeksAgo * 7)
    start.setHours(0,0,0,0)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)

    const wkWorkouts = workouts.filter(w => {
        const d = new Date(w.date)
        return d >= start && d < end
    })
    const sessions = [...new Set(wkWorkouts.map(w => w.date))].length
    const vol = wkWorkouts.reduce((s, w) => s + w.sets * w.reps * w.weight, 0)
    return { sessions, vol: Math.round(vol) }
}

function renderWeekCompare() {
    const el = document.getElementById("weekCompare")
    const thisW = getWeekStats(0)
    const lastW = getWeekStats(1)

    const sessDiff = thisW.sessions - lastW.sessions
    const volDiff  = thisW.vol - lastW.vol

    el.innerHTML = [
        { label: "Sessions",  this: thisW.sessions, diff: sessDiff },
        { label: "Total Volume", this: thisW.vol, diff: volDiff }
    ].map(row => {
        const cls = row.diff > 0 ? "up" : row.diff < 0 ? "down" : "same"
        const sign = row.diff > 0 ? "+" : ""
        return `<div class="compare-row">
            <span class="compare-metric">${row.label}</span>
            <span class="compare-val">${row.this}</span>
            <span class="compare-diff ${cls}">${sign}${row.diff}</span>
        </div>`
    }).join("")
}

function renderMonthCompare() {
    const el = document.getElementById("monthCompare")
    const now = new Date()
    const thisMonth = workouts.filter(w => {
        const d = new Date(w.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const lastMonth = workouts.filter(w => {
        const d = new Date(w.date)
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
    })

    const thisS = [...new Set(thisMonth.map(w => w.date))].length
    const lastS = [...new Set(lastMonth.map(w => w.date))].length
    const sessDiff = thisS - lastS

    el.innerHTML = [
        { label: "Sessions", this: thisS, diff: sessDiff }
    ].map(row => {
        const cls = row.diff > 0 ? "up" : row.diff < 0 ? "down" : "same"
        return `<div class="compare-row">
            <span class="compare-metric">${row.label}</span>
            <span class="compare-val">${row.this}</span>
            <span class="compare-diff ${cls}">${row.diff > 0 ? "+" : ""}${row.diff}</span>
        </div>`
    }).join("")
}

function renderConsistency() {
    const el = document.getElementById("consistencyScore")
    if (workouts.length === 0) { el.innerHTML = `<p class="muted">No data yet.</p>`; return }

    const planDays = currentPlan ? currentPlan.schedule.length : 3
    const totalWeeks = 4
    const totalExpected = planDays * totalWeeks

    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    const recent = [...new Set(workouts.filter(w => new Date(w.date) >= fourWeeksAgo).map(w => w.date))].length
    const score = Math.min(100, Math.round((recent / totalExpected) * 100))

    const label = score >= 80 ? "Elite" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Needs Work"
    const color = score >= 80 ? "var(--success)" : score >= 60 ? "var(--primary)" : score >= 40 ? "var(--warning)" : "var(--danger)"

    el.innerHTML = `
        <div class="consistency-meter">
            <div class="consistency-track">
                <div class="consistency-fill" style="width:${score}%;background:${color}"></div>
            </div>
            <div class="consistency-pct" style="color:${color}">${score}%</div>
        </div>
        <div style="font-size:13px;color:${color};font-weight:600;margin-top:8px">${label}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">${recent} sessions in the last 4 weeks</div>
    `
}

// ===== CALENDAR =====
function renderCalendar() {
    const grid  = document.getElementById("calendarGrid")
    const title = document.getElementById("calendarTitle")
    if (!grid) return

    const year  = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    title.textContent = calendarDate.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()

    const sessionDates = {}
    workouts.forEach(w => {
        if (!sessionDates[w.date]) sessionDates[w.date] = []
        sessionDates[w.date].push(w)
    })

    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    grid.innerHTML = days.map(d => `<div class="cal-header">${d}</div>`).join("")

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date().toISOString().split("T")[0]

    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="cal-day empty"></div>`
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
        const hasSess = !!sessionDates[dateStr]
        const isToday = dateStr === today
        const cls = `cal-day${hasSess ? " has-session" : ""}${isToday ? " today" : ""}`

        const cell = document.createElement("div")
        cell.className = cls
        cell.innerHTML = `${d}${hasSess ? `<div class="cal-dot"></div>` : ""}`
        if (hasSess) cell.onclick = () => showCalendarDay(dateStr, sessionDates[dateStr])
        grid.appendChild(cell)
    }
}

function showCalendarDay(date, entries) {
    const detail  = document.getElementById("calendarDayDetail")
    const content = document.getElementById("calendarDayContent")
    detail.style.display = "block"
    content.innerHTML = `
        <div style="font-family:var(--font-display);font-size:20px;letter-spacing:1px;margin-bottom:12px">${date}</div>
        ${entries.map(e =>
            `<div class="activity-item">
                <span class="activity-name">${e.exercise}</span>
                <span class="activity-meta">${e.weight}kg × ${e.reps} reps × ${e.sets} sets</span>
            </div>`
        ).join("")}
    `
    detail.scrollIntoView({ behavior: "smooth" })
}

function calendarPrev() {
    calendarDate.setMonth(calendarDate.getMonth() - 1)
    document.getElementById("calendarDayDetail").style.display = "none"
    renderCalendar()
}

function calendarNext() {
    calendarDate.setMonth(calendarDate.getMonth() + 1)
    document.getElementById("calendarDayDetail").style.display = "none"
    renderCalendar()
}

/* =========================================================
   ========  NEW FEATURES: AI COACH, LIBRARY, ETC.  ========
   ========================================================= */

// ===== TOAST NOTIFICATIONS =====
function toast(msg, kind = "info") {
    const host = document.getElementById("toastHost")
    if (!host) return
    const t = document.createElement("div")
    t.className = `toast-item toast-${kind}`
    t.textContent = msg
    host.appendChild(t)
    requestAnimationFrame(() => t.classList.add("show"))
    setTimeout(() => {
        t.classList.remove("show")
        setTimeout(() => t.remove(), 300)
    }, 2800)
}

// ===== UTILITY: FORMAT NUMBER =====
function fmtNum(n, decimals = 1) {
    if (n == null || isNaN(n)) return "—"
    return Number(n).toFixed(decimals).replace(/\.0$/, "")
}

// ===== 1RM ESTIMATOR (Epley formula) =====
function estimate1RM(weight, reps) {
    if (!weight || !reps || reps < 1) return 0
    if (reps === 1) return weight
    return weight * (1 + reps / 30)
}

// ===== PARSE REP RANGES LIKE "8 to 12" =====
function parseRepRange(str) {
    if (typeof str === "number") return { min: str, max: str }
    const m = String(str).match(/(\d+)\s*(?:to|-)\s*(\d+)/)
    if (m) return { min: +m[1], max: +m[2] }
    const single = String(str).match(/(\d+)/)
    if (single) return { min: +single[1], max: +single[1] }
    return { min: 8, max: 12 }
}

// ===== PROGRESSIVE OVERLOAD ENGINE =====
function suggestNextWeight(exerciseName, day) {
    const history = workouts.filter(w => w.exercise === exerciseName && (!day || w.day === day))
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 5)
    if (history.length === 0) return null

    const last = history[0]
    const lastWeight = parseFloat(last.weight) || 0
    const lastReps = parseInt(last.reps) || 0
    const ex = currentPlan?.days?.find(d => d.day === day)?.exercises?.find(e => e.name === exerciseName)
    const range = parseRepRange(ex?.reps || "8 to 12")

    // If hit top of range -> increase weight
    if (lastReps >= range.max) {
        const increment = lastWeight < 40 ? 1.25 : (lastWeight < 80 ? 2.5 : 2.5)
        return { weight: lastWeight + increment, reps: range.min, reason: "You hit the top of your rep range — time to go up." }
    }
    // If didn't hit bottom of range -> stay or even deload slightly
    if (lastReps < range.min) {
        return { weight: lastWeight, reps: range.min, reason: "Didn't hit rep range — stay here until you do." }
    }
    // In the middle — try one more rep
    return { weight: lastWeight, reps: Math.min(lastReps + 1, range.max), reason: "Keep climbing reps — add one more than last time." }
}

// ===========================================================
// ======================= AI COACH ==========================
// ===========================================================

const coachSuggestions = [
    "What should I do today?",
    "Analyze my last week",
    "Why am I stuck on bench press?",
    "Am I overtraining?",
    "What muscle groups am I neglecting?",
    "Give me a form tip for squats",
    "How is my consistency?",
    "What's my strongest lift?"
]

function renderAICoach() {
    const msgBox = document.getElementById("coachMessages")
    const sugBox = document.getElementById("coachSuggestions")
    if (!msgBox) return

    // Load history
    msgBox.innerHTML = ""
    if (coachChatHistory.length === 0) {
        const name = profile.name ? `, ${profile.name}` : ""
        const welcome = `Hey${name}. I'm your coach. I've looked through your training data — ready to help whenever you are. Ask me anything, or tap a suggestion below.`
        addCoachMessage(welcome, "coach", false)
    } else {
        coachChatHistory.forEach(m => addCoachMessage(m.text, m.role, false))
    }

    // Update banner
    const bTitle = document.getElementById("coachBannerTitle")
    const bSub   = document.getElementById("coachBannerSub")
    if (bTitle && bSub) {
        const totalSessions = workouts.length > 0 ? new Set(workouts.map(w => w.date + w.day)).size : 0
        const streak = getStreak()
        if (totalSessions === 0) {
            bTitle.textContent = "Let's get started."
            bSub.textContent = "Log your first session and I'll start giving personalized advice."
        } else {
            bTitle.textContent = `${totalSessions} sessions analyzed.`
            bSub.textContent = streak > 0 ? `${streak}-day streak active. Keep it rolling.` : `Your last session gave me plenty to work with.`
        }
    }

    // Suggestions
    if (sugBox) {
        sugBox.innerHTML = coachSuggestions.map(s =>
            `<button class="coach-chip" onclick="askCoach('${s.replace(/'/g, "\\'")}')">${s}</button>`
        ).join("")
    }

    scrollCoachToBottom()
}

function addCoachMessage(text, role, save = true) {
    const msgBox = document.getElementById("coachMessages")
    if (!msgBox) return
    const bubble = document.createElement("div")
    bubble.className = `msg ${role}`
    // For coach messages, support simple markdown-like bolding
    if (role === "coach") {
        bubble.innerHTML = formatCoachMarkdown(text)
    } else {
        bubble.textContent = text
    }
    msgBox.appendChild(bubble)
    if (save) {
        coachChatHistory.push({ text, role, ts: Date.now() })
        saveData()
    }
    scrollCoachToBottom()
}

function formatCoachMarkdown(text) {
    return text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>")
}

function scrollCoachToBottom() {
    const msgBox = document.getElementById("coachMessages")
    if (msgBox) msgBox.scrollTop = msgBox.scrollHeight
}

function handleCoachKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendCoachMessage()
    }
}

function askCoach(q) {
    const input = document.getElementById("coachInput")
    if (input) input.value = q
    sendCoachMessage()
}

function sendCoachMessage() {
    const input = document.getElementById("coachInput")
    if (!input) return
    const q = input.value.trim()
    if (!q) return
    input.value = ""
    addCoachMessage(q, "user")

    // Typing indicator
    const msgBox = document.getElementById("coachMessages")
    const typing = document.createElement("div")
    typing.className = "msg coach"
    typing.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`
    msgBox.appendChild(typing)
    scrollCoachToBottom()

    // Generate a thoughtful response based on the user's actual data
    setTimeout(() => {
        typing.remove()
        const response = generateCoachResponse(q)
        addCoachMessage(response, "coach")
    }, 600 + Math.random() * 400)
}

// This is the "local intelligence" coach — analyzes actual data to give real advice
function generateCoachResponse(q) {
    const lower = q.toLowerCase()
    const sessionsCount = new Set(workouts.map(w => w.date + w.day)).size
    const streak = getStreak()

    // First: empty state
    if (workouts.length === 0 && !lower.includes("form") && !lower.includes("how")) {
        return "I'd love to help, but you haven't logged any sessions yet. Head to **Session** and log your first workout — once I see your data, I can give you real, personalized advice. In the meantime: pick a plan in **Plans**, then start logging."
    }

    // ----- "WHAT SHOULD I DO TODAY" -----
    if (lower.match(/what.*(today|now|should i do)/) || lower.match(/^today/)) {
        return adviceForToday()
    }

    // ----- "LAST WEEK / ANALYZE WEEK" -----
    if (lower.match(/last week|my week|this week|analyze.*week/)) {
        return analyzeLastWeek()
    }

    // ----- "STUCK ON X / PLATEAU" -----
    const stuckMatch = lower.match(/stuck on (.+?)(\?|$|\.)/)
    if (stuckMatch || lower.includes("plateau") || lower.includes("not progressing")) {
        const liftName = stuckMatch ? stuckMatch[1].trim() : null
        return analyzePlateau(liftName)
    }

    // ----- "OVERTRAINING / TIRED" -----
    if (lower.match(/overtrain|burn.?out|tired|fatigue|recover/)) {
        return analyzeOvertraining()
    }

    // ----- "NEGLECTING / IMBALANCE" -----
    if (lower.match(/neglect|imbalance|balance|muscle group|weak/)) {
        return analyzeMuscleBalance()
    }

    // ----- "FORM TIP" -----
    if (lower.match(/form|technique|how.*do.*/) && !lower.match(/doing|going/)) {
        const exerciseFound = findExerciseInQuery(q)
        if (exerciseFound) {
            const ex = exerciseLibrary[exerciseFound]
            let r = `**${exerciseFound}** — here's what matters:\n\n`
            r += "**Cues:**\n" + ex.cues.map(c => `• ${c}`).join("\n")
            r += "\n\n**Common mistakes:**\n" + ex.mistakes.map(m => `• ${m}`).join("\n")
            r += `\n\nPrimary muscle: ${ex.muscle}`
            if (ex.secondary?.length) r += `. Also hits: ${ex.secondary.join(", ")}.`
            return r
        }
        return "Which exercise did you want form tips for? I can cover anything in your plan — bench, squat, deadlift, rows, press, you name it."
    }

    // ----- "CONSISTENCY" -----
    if (lower.match(/consistent|streak|how often|how.*i.*doing/)) {
        return analyzeConsistency()
    }

    // ----- "STRONGEST / BEST LIFT" -----
    if (lower.match(/strongest|best.*lift|biggest.*pr|favorite lift/)) {
        return analyzeStrongestLift()
    }

    // ----- "CHANGE PLAN / WHAT PLAN" -----
    if (lower.match(/change plan|new plan|what plan|recommend.*plan/)) {
        return "Head to **Plans** and pick based on your goals:\n\n• **Full Body** — best for beginners or 3 days/week\n• **Upper/Lower** — balanced, great for 4 days\n• **Push/Pull/Legs** — classic bodybuilding split, 3-6 days\n• **Bro Split** — one muscle per day, for advanced\n\nOr build your own in **Plan Editor**."
    }

    // ----- "WEIGHT / CUT / BULK" -----
    if (lower.match(/cut|bulk|lose weight|gain weight|lean|body fat/)) {
        return "For body composition, training matters but **nutrition is ~80% of the work**. Head to **Nutrition** and set your daily targets:\n\n• **Cut:** maintenance calories minus 300-500, keep protein high (2g per kg bodyweight)\n• **Bulk:** maintenance plus 200-300, protein same\n• **Maintain:** hit TDEE, steady protein\n\nTap **Auto-calculate from profile** in Nutrition and I'll set reasonable starting targets."
    }

    // ----- "RPE / HARD / EASY" -----
    if (lower.match(/rpe|how hard|intensity/)) {
        return "**RPE** is how hard a set felt, 1-10:\n\n• **RPE 10** — absolute max, no reps left\n• **RPE 9** — 1 rep left in the tank\n• **RPE 8** — 2 reps left\n• **RPE 7** — 3 reps left, feels crisp\n• **RPE 6 and below** — warm-up territory\n\nTarget RPE 7-9 for most working sets. Log it after each set in Session, and I'll use it to suggest better weights next time."
    }

    // Generic fallback — tries to be helpful with context
    return genericCoachResponse(q, sessionsCount, streak)
}

function findExerciseInQuery(q) {
    const lower = q.toLowerCase()
    for (const name of Object.keys(exerciseLibrary)) {
        if (lower.includes(name.toLowerCase())) return name
    }
    // fuzzy word match
    const words = lower.split(/\s+/)
    for (const name of Object.keys(exerciseLibrary)) {
        const lowName = name.toLowerCase()
        if (words.some(w => w.length > 3 && lowName.includes(w))) return name
    }
    return null
}

function adviceForToday() {
    if (!currentPlan || !currentPlan.days?.length) {
        return "You don't have a plan loaded yet. Go to **Plans**, pick one, then I can tell you what today's session looks like."
    }
    const nextDay = getNextWorkoutDay()
    if (!nextDay) return "Your plan is loaded but I can't figure out what's next. Try checking the Dashboard."

    const day = currentPlan.days.find(d => d.day === nextDay)
    if (!day) return `Next up: **${nextDay}**. Head to Session to start.`

    let r = `**Today's session: ${day.day}**\n\n`
    r += day.exercises.map(e => `• ${e.name} — ${e.sets}×${e.reps}`).join("\n")
    r += "\n\n"

    // Add smart weight suggestions
    const suggestions = day.exercises
        .map(e => ({ name: e.name, sugg: suggestNextWeight(e.name, day.day) }))
        .filter(s => s.sugg)
    if (suggestions.length > 0) {
        r += "**Suggested starting weights** (based on your last sessions):\n"
        r += suggestions.slice(0, 5).map(s => `• ${s.name}: ${fmtNum(s.sugg.weight)}kg × ${s.sugg.reps}`).join("\n")
    } else {
        r += "No history for these lifts yet — pick a weight you can do for the full rep range with 1-2 reps in reserve."
    }
    return r
}

function analyzeLastWeek() {
    const now = new Date()
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
    const wk = workouts.filter(w => new Date(w.date) >= weekAgo)
    if (wk.length === 0) return "You didn't log any sessions in the past 7 days. Let's fix that — even one short session this week keeps momentum."

    const sessions = new Set(wk.map(w => w.date + w.day)).size
    const volume = wk.reduce((s, w) => s + (parseFloat(w.weight) || 0) * (parseInt(w.reps) || 0) * (parseInt(w.sets) || 0), 0)
    const exerciseCounts = {}
    wk.forEach(w => { exerciseCounts[w.exercise] = (exerciseCounts[w.exercise] || 0) + 1 })
    const topEx = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)

    // Compare to previous week
    const prevStart = new Date(now); prevStart.setDate(prevStart.getDate() - 14)
    const prev = workouts.filter(w => {
        const d = new Date(w.date); return d >= prevStart && d < weekAgo
    })
    const prevVolume = prev.reduce((s, w) => s + (parseFloat(w.weight) || 0) * (parseInt(w.reps) || 0) * (parseInt(w.sets) || 0), 0)
    const volChange = prevVolume > 0 ? ((volume - prevVolume) / prevVolume * 100) : null

    let r = `**Last 7 days:**\n\n`
    r += `• ${sessions} session${sessions === 1 ? "" : "s"}\n`
    r += `• ${fmtNum(volume, 0)} kg total volume\n`
    if (volChange != null) {
        const sign = volChange >= 0 ? "+" : ""
        r += `• ${sign}${fmtNum(volChange, 1)}% vs prior week\n`
    }
    r += `• Most trained: ${topEx.map(e => e[0]).join(", ")}\n\n`

    if (sessions >= 4) r += "Great consistency. Keep this rhythm going."
    else if (sessions === 3) r += "Solid week. Three quality sessions beats five sloppy ones."
    else if (sessions >= 1) r += "A start. Aim for 3+ sessions next week to build a real rhythm."

    if (volChange != null && volChange < -15) r += "\n\nYour volume dropped meaningfully — check if you're tracking all sets."
    return r
}

function analyzePlateau(liftName) {
    if (!liftName) {
        // Look through all lifts, find ones that haven't moved in 4+ weeks
        const byEx = {}
        workouts.forEach(w => {
            if (!byEx[w.exercise]) byEx[w.exercise] = []
            byEx[w.exercise].push(w)
        })
        const stuck = []
        for (const [name, list] of Object.entries(byEx)) {
            list.sort((a, b) => new Date(a.date) - new Date(b.date))
            if (list.length < 4) continue
            const recent = list.slice(-4)
            const weights = recent.map(r => parseFloat(r.weight) || 0)
            const max = Math.max(...weights)
            const min = Math.min(...weights)
            if (max - min < 1.5 && max > 0) stuck.push(name)
        }
        if (stuck.length === 0) return "I don't see any clear plateaus — your lifts are moving. Keep executing."
        return `You're stuck on: **${stuck.slice(0, 3).join(", ")}**.\n\nTo break through:\n\n• **Deload week** — drop weight 20%, reset\n• **Change rep range** — if you've been doing 8-12, try 4-6 with heavier weight\n• **Volume increase** — add 1-2 sets per exercise\n• **Check sleep and nutrition** — plateaus are often recovery problems, not training problems`
    }
    const history = workouts.filter(w => w.exercise.toLowerCase() === liftName.toLowerCase())
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
    if (history.length === 0) return `I don't have any history on "${liftName}". Log it a few times and I can analyze your progress.`
    if (history.length < 3) return `Only ${history.length} session${history.length === 1 ? "" : "s"} logged for ${liftName}. Need 3+ to see a pattern.`

    const first = history[0]
    const last = history[history.length - 1]
    const weightChange = (parseFloat(last.weight) || 0) - (parseFloat(first.weight) || 0)
    const daysSpan = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24)

    let r = `**${last.exercise} analysis:**\n\n`
    r += `• First logged: ${fmtNum(first.weight)}kg × ${first.reps}\n`
    r += `• Most recent: ${fmtNum(last.weight)}kg × ${last.reps}\n`
    r += `• Change: ${weightChange >= 0 ? "+" : ""}${fmtNum(weightChange)} kg over ${Math.round(daysSpan)} days\n\n`

    if (weightChange <= 0 && history.length >= 4) {
        r += "**You're stuck.** Here's what to try:\n\n"
        r += "• Drop to 85% of your current weight and rebuild over 3 weeks\n"
        r += "• Add a rest day — recovery might be the bottleneck\n"
        r += "• Increase protein to 2g per kg bodyweight\n"
        r += "• Change the rep range (try 4-6 heavy or 12-15 for volume)"
    } else if (weightChange > 0) {
        r += `You've added ${fmtNum(weightChange)}kg — that's real progress. Keep the momentum.`
    }
    return r
}

function analyzeOvertraining() {
    const recent = workouts.filter(w => {
        const d = new Date(w.date)
        const days = (Date.now() - d) / (1000 * 60 * 60 * 24)
        return days <= 7
    })
    const sessions = new Set(recent.map(w => w.date + w.day)).size

    let r = "**Recovery check:**\n\n"
    r += `You've trained ${sessions} time${sessions === 1 ? "" : "s"} in the last 7 days.\n\n`

    if (sessions >= 6) {
        r += "⚠️ That's a lot. Signs of overtraining:\n• Performance dropping session to session\n• Sleep disturbed\n• Persistent soreness\n• Elevated resting heart rate\n• Low motivation\n\nConsider taking **1-2 full rest days** this week."
    } else if (sessions >= 4) {
        r += "Solid training frequency. As long as you're sleeping 7+ hours and eating enough, you're good. Listen to your body."
    } else {
        r += "You're well within recovery limits. Overtraining is rarely the issue at this frequency — under-training is more common."
    }

    // Check recent ratings
    const ratedSessions = recent.filter(w => w.sessionRating).slice(-5)
    if (ratedSessions.length >= 3) {
        const avgRating = ratedSessions.reduce((s, w) => s + w.sessionRating, 0) / ratedSessions.length
        if (avgRating < 3) r += "\n\n**Your recent sessions feel rough** (avg rating below 3/5). Take it as a signal — deload or rest."
    }
    return r
}

function analyzeMuscleBalance() {
    const groupVolume = {}
    workouts.forEach(w => {
        const ex = exerciseLibrary[w.exercise]
        if (!ex) return
        const vol = (parseFloat(w.weight) || 0) * (parseInt(w.reps) || 0) * (parseInt(w.sets) || 0)
        groupVolume[ex.muscle] = (groupVolume[ex.muscle] || 0) + vol
    })
    if (Object.keys(groupVolume).length === 0) return "Not enough data yet. Log a couple weeks of sessions and I'll spot imbalances."

    const total = Object.values(groupVolume).reduce((a, b) => a + b, 0)
    const sorted = Object.entries(groupVolume).sort((a, b) => b[1] - a[1])
    const topGroup = sorted[0]
    const bottomGroup = sorted[sorted.length - 1]

    let r = "**Muscle group distribution** (by total volume):\n\n"
    sorted.forEach(([g, v]) => {
        const pct = (v / total * 100).toFixed(0)
        r += `• ${g}: ${pct}%\n`
    })
    r += "\n"

    if (topGroup[1] > bottomGroup[1] * 3 && sorted.length >= 3) {
        r += `**Imbalance detected.** ${topGroup[0]} is getting much more work than ${bottomGroup[0]}. Balance it:\n\n`
        r += `• Add 1-2 ${bottomGroup[0]} exercises per week\n`
        r += `• Or dedicate a ${bottomGroup[0]}-focused day to your plan`
    } else {
        // Check push/pull ratio
        const push = (groupVolume["Chest"] || 0) + (groupVolume["Shoulders"] || 0) + (groupVolume["Triceps"] || 0)
        const pull = (groupVolume["Back"] || 0) + (groupVolume["Biceps"] || 0)
        if (push > pull * 1.4 && pull > 0) r += "⚠️ **Push volume is way higher than pull.** This leads to posture issues. Add rows and pulldowns."
        else if (pull > push * 1.4 && push > 0) r += "Pull volume exceeds push — unusual but not a problem if intentional."
        else r += "Looks reasonably balanced. Keep rotating movements to cover all angles."
    }
    return r
}

function analyzeConsistency() {
    const streak = getStreak()
    const sessions = new Set(workouts.map(w => w.date + w.day)).size
    const uniqueDates = [...new Set(workouts.map(w => w.date))].sort()

    if (uniqueDates.length === 0) return "No sessions logged. Consistency starts with session 1 — go log one."

    const firstDate = new Date(uniqueDates[0])
    const daysSinceStart = (Date.now() - firstDate) / (1000 * 60 * 60 * 24)
    const sessionsPerWeek = sessions / (daysSinceStart / 7)

    let r = "**Consistency snapshot:**\n\n"
    r += `• Total sessions: ${sessions}\n`
    r += `• Training for: ${Math.round(daysSinceStart)} days\n`
    r += `• Average: ${fmtNum(sessionsPerWeek, 1)} sessions/week\n`
    r += `• Current streak: ${streak} days\n\n`

    if (sessionsPerWeek >= 3.5) r += "**Excellent.** You train like someone who's serious. Most people never get here."
    else if (sessionsPerWeek >= 2.5) r += "Solid baseline. If results are slow, bump to 3-4 sessions/week."
    else if (sessionsPerWeek >= 1.5) r += "Inconsistent. Two sessions won't cut it for strength gains. Aim for 3 minimum."
    else r += "You need to train more frequently. Even bad sessions beat no sessions."
    return r
}

function analyzeStrongestLift() {
    const byEx = {}
    workouts.forEach(w => {
        const e1rm = estimate1RM(parseFloat(w.weight) || 0, parseInt(w.reps) || 0)
        if (!byEx[w.exercise] || e1rm > byEx[w.exercise].e1rm) {
            byEx[w.exercise] = { e1rm, weight: w.weight, reps: w.reps, date: w.date }
        }
    })
    const ranked = Object.entries(byEx).sort((a, b) => b[1].e1rm - a[1].e1rm).slice(0, 5)
    if (ranked.length === 0) return "No lifts to rank yet. Log some sessions first."

    let r = "**Your top 5 estimated 1RMs:**\n\n"
    ranked.forEach(([name, d], i) => {
        r += `${i + 1}. **${name}** — ${fmtNum(d.e1rm)}kg est. 1RM\n   (from ${fmtNum(d.weight)}kg × ${d.reps} on ${d.date})\n`
    })
    r += "\nThat's based on the Epley formula — (weight × (1 + reps/30))."
    return r
}

function genericCoachResponse(q, sessions, streak) {
    const responses = [
        `I'm not sure exactly what you're asking. Try one of the suggestions below, or ask me things like "what should I do today?" or "analyze my last week."`,
        `Good question. I can help with session planning, form tips, analyzing your progress, and checking for plateaus or imbalances. What specifically do you want to know?`,
        `Let me be more useful. Try asking:\n• "What should I do today?"\n• "Why am I stuck on bench?"\n• "Analyze my last week"\n• "What am I neglecting?"`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
}

// ===========================================================
// ===================== EXERCISE LIBRARY ====================
// ===========================================================

let libraryFilter = "All"

function renderLibrary() {
    const filtersEl = document.getElementById("libraryFilters")
    const gridEl = document.getElementById("exerciseGrid")
    if (!gridEl) return

    // Build muscle group filters
    const groups = ["All"]
    for (const name of Object.keys(exerciseLibrary)) {
        const g = exerciseLibrary[name].muscle
        if (!groups.includes(g)) groups.push(g)
    }
    filtersEl.innerHTML = groups.map(g =>
        `<button class="filter-chip ${libraryFilter === g ? "active" : ""}" onclick="setLibraryFilter('${g}')">${g}</button>`
    ).join("")

    // Build exercise tiles
    const filtered = Object.entries(exerciseLibrary).filter(([name, ex]) =>
        libraryFilter === "All" || ex.muscle === libraryFilter
    )
    gridEl.innerHTML = filtered.map(([name, ex]) => `
        <button class="exercise-tile" onclick="showExerciseDetail('${name.replace(/'/g, "\\'")}')">
            <div class="exercise-tile-muscle">${ex.muscle}</div>
            <div class="exercise-tile-name">${name}</div>
            <div class="exercise-tile-tags">
                ${ex.secondary?.slice(0, 2).map(s => `<span class="exercise-tile-tag">${s}</span>`).join("") || ""}
            </div>
        </button>
    `).join("")
}

function setLibraryFilter(g) {
    libraryFilter = g
    renderLibrary()
}

function showExerciseDetail(name) {
    const ex = exerciseLibrary[name]
    if (!ex) return
    document.getElementById("exModalTitle").textContent = name
    document.getElementById("exModalSub").textContent = `${ex.muscle}${ex.secondary?.length ? " · " + ex.secondary.join(", ") : ""} · ${ex.equipment === "home" ? "Home-friendly" : "Gym"}`

    // Get user's history for this exercise
    const userHistory = workouts.filter(w => w.exercise === name).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    const userPR = userHistory.length > 0
        ? userHistory.reduce((best, w) => {
            const e1 = estimate1RM(parseFloat(w.weight) || 0, parseInt(w.reps) || 0)
            return e1 > best.e1rm ? { e1rm: e1, weight: w.weight, reps: w.reps, date: w.date } : best
        }, { e1rm: 0 }) : null

    let body = ""
    if (ex.video) {
        body += `<div class="exercise-video-embed">
            <iframe src="https://www.youtube.com/embed/${ex.video}?rel=0" frameborder="0" allowfullscreen loading="lazy"></iframe>
        </div>`
    }
    body += `<div class="exercise-section">
        <div class="exercise-section-title">Form cues</div>
        <ul class="exercise-cue-list">${ex.cues.map(c => `<li>${c}</li>`).join("")}</ul>
    </div>`
    body += `<div class="exercise-section">
        <div class="exercise-section-title">Common mistakes</div>
        <ul class="exercise-cue-list mistakes">${ex.mistakes.map(m => `<li>${m}</li>`).join("")}</ul>
    </div>`
    if (userPR && userPR.e1rm > 0) {
        body += `<div class="exercise-section">
            <div class="exercise-section-title">Your personal record</div>
            <div class="exercise-pr">${fmtNum(userPR.weight)} kg × ${userPR.reps} · est. 1RM ${fmtNum(userPR.e1rm)} kg<br><span class="muted">${userPR.date}</span></div>
        </div>`
    }
    if (userHistory.length > 0) {
        body += `<div class="exercise-section">
            <div class="exercise-section-title">Recent sessions</div>
            <div class="exercise-history">${userHistory.map(h => `
                <div class="exercise-history-row">
                    <span>${h.date}</span>
                    <span>${fmtNum(h.weight)}kg × ${h.reps} × ${h.sets}</span>
                </div>`).join("")}</div>
        </div>`
    }
    document.getElementById("exModalBody").innerHTML = body
    openModal("exerciseModal")
}

function closeExerciseModal() { closeModal("exerciseModal") }

// ===========================================================
// ===================== MEASUREMENTS ========================
// ===========================================================

function renderMeasurements() {
    const dateEl = document.getElementById("measureDate")
    if (dateEl && !dateEl.value) dateEl.valueAsDate = new Date()

    renderMeasurementCharts()
    renderMeasurementHistory()
}

function saveMeasurement() {
    const date = document.getElementById("measureDate").value
    if (!date) { toast("Pick a date first", "warn"); return }
    const m = {
        id: Date.now(),
        date,
        weight: parseFloat(document.getElementById("measureWeight").value) || null,
        bf: parseFloat(document.getElementById("measureBF").value) || null,
        waist: parseFloat(document.getElementById("measureWaist").value) || null,
        chest: parseFloat(document.getElementById("measureChest").value) || null,
        arm: parseFloat(document.getElementById("measureArm").value) || null,
        thigh: parseFloat(document.getElementById("measureThigh").value) || null,
    }
    // At least one real value
    if (!m.weight && !m.bf && !m.waist && !m.chest && !m.arm && !m.thigh) {
        toast("Enter at least one measurement", "warn"); return
    }
    measurements.push(m)
    measurements.sort((a, b) => new Date(b.date) - new Date(a.date))
    saveData()
    checkBadges()
    // Clear form
    ;["measureWeight","measureBF","measureWaist","measureChest","measureArm","measureThigh"].forEach(id =>
        document.getElementById(id).value = "")
    toast("Measurement saved 💪", "success")
    renderMeasurements()
}

function deleteMeasurement(id) {
    if (!confirm("Delete this measurement?")) return
    measurements = measurements.filter(m => m.id !== id)
    saveData()
    renderMeasurements()
}

function renderMeasurementCharts() {
    renderMetricChart("weightTrendChart", "weight", "kg")
    renderMetricChart("bfTrendChart", "bf", "%")
}

function renderMetricChart(containerId, metric, unit) {
    const el = document.getElementById(containerId)
    if (!el) return
    const data = measurements.filter(m => m[metric] != null)
                             .sort((a, b) => new Date(a.date) - new Date(b.date))
                             .slice(-30)
    if (data.length === 0) {
        el.innerHTML = `<p class="muted">No ${metric} data yet.</p>`
        return
    }
    if (data.length === 1) {
        el.innerHTML = `<div class="single-metric-value">${fmtNum(data[0][metric])} ${unit}<div class="muted" style="font-size:12px;margin-top:8px">${data[0].date}</div></div>`
        return
    }

    const values = data.map(d => d[metric])
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const W = 600, H = 200, P = 20

    const points = data.map((d, i) => {
        const x = P + (i / (data.length - 1)) * (W - P * 2)
        const y = H - P - ((d[metric] - min) / range) * (H - P * 2)
        return { x, y, val: d[metric], date: d.date }
    })
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    const areaPath = path + ` L ${points[points.length - 1].x} ${H - P} L ${points[0].x} ${H - P} Z`

    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="chart-line-svg">
        <path d="${areaPath}" class="chart-line-area"/>
        <path d="${path}" class="chart-line-path"/>
        ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" class="chart-dot"><title>${p.date}: ${fmtNum(p.val)} ${unit}</title></circle>`).join("")}
    </svg>
    <div class="chart-summary">
        <span>First: <strong>${fmtNum(values[0])} ${unit}</strong></span>
        <span>Latest: <strong>${fmtNum(values[values.length - 1])} ${unit}</strong></span>
        <span>Change: <strong>${fmtNum(values[values.length - 1] - values[0])} ${unit}</strong></span>
    </div>`
}

function renderMeasurementHistory() {
    const el = document.getElementById("measureHistory")
    if (!el) return
    if (measurements.length === 0) {
        el.innerHTML = `<p class="muted">No measurements logged yet. Add one above to get started.</p>`
        return
    }
    el.innerHTML = measurements.slice(0, 20).map(m => {
        const parts = []
        if (m.weight) parts.push(`${fmtNum(m.weight)} kg`)
        if (m.bf)     parts.push(`${fmtNum(m.bf)}% BF`)
        if (m.waist)  parts.push(`Waist ${fmtNum(m.waist)} cm`)
        if (m.chest)  parts.push(`Chest ${fmtNum(m.chest)} cm`)
        if (m.arm)    parts.push(`Arm ${fmtNum(m.arm)} cm`)
        if (m.thigh)  parts.push(`Thigh ${fmtNum(m.thigh)} cm`)
        return `<div class="measure-item">
            <div>
                <div class="measure-item-date">${m.date}</div>
                <div class="measure-item-stats">${parts.join(" · ")}</div>
            </div>
            <button class="icon-btn del" onclick="deleteMeasurement(${m.id})" title="Delete">✕</button>
        </div>`
    }).join("")
}

// ===========================================================
// ===================== PROGRESS PHOTOS =====================
// ===========================================================

function renderPhotos() {
    const grid = document.getElementById("photoGrid")
    if (!grid) return

    // Upload tile first
    let html = `<button class="photo-tile photo-upload-tile" onclick="document.getElementById('photoUploadInput').click()">
        <div class="photo-upload-icon">+</div>
        <div class="photo-upload-text">Add photo</div>
    </button>`

    if (photos.length === 0) {
        html += `<div class="photo-empty">Your first photo will appear here.<br>Same lighting, same pose, same time of day works best.</div>`
    } else {
        html += photos.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => `
            <div class="photo-tile" onclick="viewPhoto(${p.id})">
                <img src="${p.dataUrl}" alt="Progress photo ${p.date}">
                <div class="photo-tile-overlay">
                    <span class="photo-tile-date">${p.date}</span>
                    <button class="photo-del-btn" onclick="event.stopPropagation();deletePhoto(${p.id})" title="Delete">✕</button>
                </div>
            </div>`).join("")
    }
    grid.innerHTML = html

    // Populate compare selectors
    const sel1 = document.getElementById("compareBefore")
    const sel2 = document.getElementById("compareAfter")
    if (sel1 && sel2) {
        const sorted = [...photos].sort((a, b) => new Date(a.date) - new Date(b.date))
        const opts = `<option value="">Pick a photo</option>` + sorted.map(p =>
            `<option value="${p.id}">${p.date}</option>`).join("")
        sel1.innerHTML = opts
        sel2.innerHTML = opts
        // Default to oldest vs newest
        if (sorted.length >= 2) {
            sel1.value = sorted[0].id
            sel2.value = sorted[sorted.length - 1].id
            renderPhotoCompare()
        }
    }
}

function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
        toast("Photo too large — keep it under 3MB", "warn"); return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
        // Resize image to max 800px width to save storage
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement("canvas")
            const maxW = 800
            const ratio = Math.min(1, maxW / img.width)
            canvas.width = img.width * ratio
            canvas.height = img.height * ratio
            const ctx = canvas.getContext("2d")
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            const dataUrl = canvas.toDataURL("image/jpeg", 0.75)

            const today = new Date().toISOString().slice(0, 10)
            photos.push({ id: Date.now(), date: today, dataUrl, label: "" })
            try {
                saveData()
                toast("Photo saved 📸", "success")
                checkBadges()
                renderPhotos()
            } catch(err) {
                toast("Storage full — delete old photos first", "warn")
                photos.pop()
            }
        }
        img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = "" // allow re-uploading same file
}

function deletePhoto(id) {
    if (!confirm("Delete this photo? This can't be undone.")) return
    photos = photos.filter(p => p.id !== id)
    saveData()
    renderPhotos()
    toast("Photo deleted")
}

function viewPhoto(id) {
    const p = photos.find(p => p.id === id)
    if (!p) return
    // Create a full-screen lightbox
    const box = document.createElement("div")
    box.className = "photo-lightbox"
    box.innerHTML = `<img src="${p.dataUrl}"><div class="photo-lightbox-caption">${p.date}</div>`
    box.onclick = () => box.remove()
    document.body.appendChild(box)
}

function renderPhotoCompare() {
    const beforeId = document.getElementById("compareBefore")?.value
    const afterId = document.getElementById("compareAfter")?.value
    const box = document.getElementById("photoCompareBox")
    if (!box) return
    const before = photos.find(p => p.id == beforeId)
    const after = photos.find(p => p.id == afterId)
    box.innerHTML = `
        <div class="photo-compare-slot">
            ${before ? `<img src="${before.dataUrl}"><div class="photo-compare-label">Before · ${before.date}</div>` : `<span>Select a "before" photo</span>`}
        </div>
        <div class="photo-compare-slot">
            ${after ? `<img src="${after.dataUrl}"><div class="photo-compare-label">After · ${after.date}</div>` : `<span>Select an "after" photo</span>`}
        </div>`
}

// ===========================================================
// ===================== NUTRITION ===========================
// ===========================================================

const QUICK_FOODS = [
    { name: "Chicken breast (100g)", kcal: 165, p: 31, c: 0, f: 3.6 },
    { name: "Eggs (2 large)", kcal: 156, p: 12, c: 1, f: 11 },
    { name: "Oatmeal (50g dry)", kcal: 190, p: 7, c: 33, f: 3 },
    { name: "Rice white (100g cooked)", kcal: 130, p: 2.7, c: 28, f: 0.3 },
    { name: "Banana (1 medium)", kcal: 105, p: 1.3, c: 27, f: 0.4 },
    { name: "Whey protein (1 scoop)", kcal: 120, p: 24, c: 3, f: 1.5 },
    { name: "Greek yogurt (170g)", kcal: 100, p: 17, c: 6, f: 0.7 },
    { name: "Beef 85% (100g)", kcal: 250, p: 26, c: 0, f: 17 },
    { name: "Salmon (100g)", kcal: 208, p: 20, c: 0, f: 13 },
    { name: "Sweet potato (100g)", kcal: 86, p: 1.6, c: 20, f: 0.1 },
    { name: "Avocado (½)", kcal: 160, p: 2, c: 8, f: 15 },
    { name: "Almonds (28g)", kcal: 164, p: 6, c: 6, f: 14 },
    { name: "Peanut butter (2 tbsp)", kcal: 190, p: 7, c: 8, f: 16 },
    { name: "Broccoli (100g)", kcal: 35, p: 2.4, c: 7, f: 0.4 },
    { name: "Apple (medium)", kcal: 95, p: 0.5, c: 25, f: 0.3 },
    { name: "Pasta cooked (100g)", kcal: 158, p: 5.8, c: 31, f: 0.9 }
]

function getTodayDateStr() {
    return new Date().toISOString().slice(0, 10)
}

function renderNutrition() {
    const dateEl = document.getElementById("nutritionDate")
    if (dateEl && !dateEl.value) dateEl.value = getTodayDateStr()
    const date = dateEl?.value || getTodayDateStr()

    const log = foodLog[date] || []
    const totals = log.reduce((t, f) => ({
        kcal: t.kcal + (f.kcal || 0),
        p: t.p + (f.p || 0),
        c: t.c + (f.c || 0),
        f: t.f + (f.f || 0),
    }), { kcal: 0, p: 0, c: 0, f: 0 })

    // Macro rings
    const ringEl = document.getElementById("macroRingRow")
    if (ringEl) {
        const macros = [
            { key: "kcal", label: "Calories", unit: "kcal", color: "kcal", current: totals.kcal, target: nutritionTargets.kcal || 2500 },
            { key: "p", label: "Protein", unit: "g", color: "protein", current: totals.p, target: nutritionTargets.p || 150 },
            { key: "c", label: "Carbs", unit: "g", color: "carbs", current: totals.c, target: nutritionTargets.c || 275 },
            { key: "f", label: "Fat", unit: "g", color: "fat", current: totals.f, target: nutritionTargets.f || 70 },
        ]
        ringEl.innerHTML = macros.map(m => {
            const pct = Math.min(100, (m.current / m.target) * 100)
            const r = 42
            const circ = 2 * Math.PI * r
            const offset = circ - (pct / 100) * circ
            return `<div class="macro-ring-card">
                <div class="macro-ring">
                    <svg viewBox="0 0 100 100">
                        <circle class="macro-ring-bg" cx="50" cy="50" r="${r}"></circle>
                        <circle class="macro-ring-fg ${m.color}" cx="50" cy="50" r="${r}"
                            stroke-dasharray="${circ.toFixed(2)}"
                            stroke-dashoffset="${offset.toFixed(2)}"></circle>
                    </svg>
                    <div class="macro-ring-value">
                        <div class="num">${fmtNum(m.current, 0)}</div>
                        <div class="of">/ ${fmtNum(m.target, 0)}</div>
                    </div>
                </div>
                <div class="macro-ring-label">${m.label}<br><span class="muted" style="font-weight:500">${m.unit}</span></div>
            </div>`
        }).join("")
    }

    // Food log
    const logEl = document.getElementById("foodLogList")
    if (logEl) {
        if (log.length === 0) {
            logEl.innerHTML = `<p class="muted">No food logged for ${date}. Add something above.</p>`
        } else {
            logEl.innerHTML = log.map((f, i) => `
                <div class="food-item">
                    <div>
                        <div class="food-item-name">${f.name}</div>
                        <div class="food-item-macros">${f.kcal} kcal · ${fmtNum(f.p)}p · ${fmtNum(f.c)}c · ${fmtNum(f.f)}f</div>
                    </div>
                    <button class="icon-btn del" onclick="removeFood('${date}', ${i})" title="Remove">✕</button>
                </div>
            `).join("")
        }
    }
}

function addFood() {
    const name = document.getElementById("foodName").value.trim()
    if (!name) { toast("Enter a food name", "warn"); return }
    const food = {
        name,
        kcal: parseFloat(document.getElementById("foodKcal").value) || 0,
        p: parseFloat(document.getElementById("foodProtein").value) || 0,
        c: parseFloat(document.getElementById("foodCarbs").value) || 0,
        f: parseFloat(document.getElementById("foodFat").value) || 0,
        time: new Date().toISOString()
    }
    const date = document.getElementById("nutritionDate")?.value || getTodayDateStr()
    if (!foodLog[date]) foodLog[date] = []
    foodLog[date].push(food)
    saveData()
    // Clear inputs
    ;["foodName","foodKcal","foodProtein","foodCarbs","foodFat"].forEach(id =>
        document.getElementById(id).value = "")
    toast(`Added "${food.name}"`, "success")
    renderNutrition()
}

function removeFood(date, idx) {
    if (!foodLog[date]) return
    foodLog[date].splice(idx, 1)
    if (foodLog[date].length === 0) delete foodLog[date]
    saveData()
    renderNutrition()
}

function openQuickFoods() {
    const list = document.getElementById("quickFoodsList")
    list.innerHTML = QUICK_FOODS.map((f, i) => `
        <button class="quick-food-row" onclick="addQuickFood(${i})">
            <div>
                <div class="quick-food-name">${f.name}</div>
                <div class="quick-food-macros">${f.kcal} kcal · ${f.p}p · ${f.c}c · ${f.f}f</div>
            </div>
            <span class="quick-food-add">+</span>
        </button>
    `).join("")
    openModal("quickFoodsModal")
}

function addQuickFood(i) {
    const f = QUICK_FOODS[i]
    const date = document.getElementById("nutritionDate")?.value || getTodayDateStr()
    if (!foodLog[date]) foodLog[date] = []
    foodLog[date].push({ ...f, time: new Date().toISOString() })
    saveData()
    toast(`Added ${f.name}`, "success")
    renderNutrition()
}

function closeQuickFoods() { closeModal("quickFoodsModal") }

function openNutritionSettings() {
    document.getElementById("targetKcal").value    = nutritionTargets.kcal || ""
    document.getElementById("targetProtein").value = nutritionTargets.p || ""
    document.getElementById("targetCarbs").value   = nutritionTargets.c || ""
    document.getElementById("targetFat").value     = nutritionTargets.f || ""
    openModal("nutritionSettingsModal")
}

function closeNutritionSettings() { closeModal("nutritionSettingsModal") }

function saveNutritionTargets() {
    nutritionTargets = {
        kcal: parseFloat(document.getElementById("targetKcal").value) || null,
        p:    parseFloat(document.getElementById("targetProtein").value) || null,
        c:    parseFloat(document.getElementById("targetCarbs").value) || null,
        f:    parseFloat(document.getElementById("targetFat").value) || null,
    }
    saveData()
    closeNutritionSettings()
    toast("Targets saved", "success")
    renderNutrition()
}

function autoCalcTargets() {
    const age = profile.age || 30
    const weight = profile.weight || 75 // fall back
    const latestWeight = measurements.find(m => m.weight)?.weight || weight
    const height = profile.height || 175
    const sex = profile.sex || "male"

    // Mifflin-St Jeor BMR
    let bmr = (10 * latestWeight) + (6.25 * height) - (5 * age)
    bmr += (sex === "female" ? -161 : 5)
    // Moderate activity multiplier
    const tdee = Math.round(bmr * 1.55)
    const protein = Math.round(latestWeight * 1.8) // 1.8g / kg bodyweight
    const fat = Math.round(tdee * 0.25 / 9)
    const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4)

    document.getElementById("targetKcal").value    = tdee
    document.getElementById("targetProtein").value = protein
    document.getElementById("targetCarbs").value   = carbs
    document.getElementById("targetFat").value     = fat
    toast("Calculated from your profile", "success")
}

// ===========================================================
// ===================== GOALS ===============================
// ===========================================================

function renderGoals() {
    const el = document.getElementById("goalsList")
    if (!el) return

    if (goals.length === 0) {
        el.innerHTML = `<div class="card"><div class="empty-state">
            <h3 style="font-family:var(--font-display);font-size:22px;margin-bottom:8px">No goals yet</h3>
            <p class="muted">Setting a specific, deadline-bound goal is the biggest predictor of success. Click "+ New Goal" to set one.</p>
        </div></div>`
        return
    }

    // Sort: active first, then by deadline
    const sorted = [...goals].sort((a, b) => {
        if (a.status === "achieved" && b.status !== "achieved") return 1
        if (b.status === "achieved" && a.status !== "achieved") return -1
        return new Date(a.deadline) - new Date(b.deadline)
    })

    el.innerHTML = sorted.map(g => {
        const p = computeGoalProgress(g)
        const pct = Math.min(100, Math.max(0, p.pct))
        const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - Date.now()) / (1000 * 60 * 60 * 24)) : null
        const statusClass = g.status === "achieved" ? "achieved" : (daysLeft < 0 ? "overdue" : (pct >= 80 ? "almost" : "active"))

        return `<div class="goal-card goal-${statusClass}">
            <div class="goal-header">
                <div>
                    <div class="goal-title">${g.title}</div>
                    <div class="goal-sub">${p.currentLabel} → target ${p.targetLabel}</div>
                </div>
                <div class="goal-badge">${g.status === "achieved" ? "🏆 Achieved" : (daysLeft < 0 ? `${-daysLeft}d overdue` : (daysLeft != null ? `${daysLeft}d left` : "—"))}</div>
            </div>
            <div class="goal-progress-bar">
                <div class="goal-progress-fill" style="width:${pct}%"></div>
            </div>
            <div class="goal-progress-text">${fmtNum(pct, 0)}% complete</div>
            <div class="goal-actions">
                <button class="pill-btn sm outline" onclick="deleteGoal(${g.id})">Delete</button>
            </div>
        </div>`
    }).join("")
}

function computeGoalProgress(g) {
    let current = 0, target = g.target || 0
    let currentLabel = "—", targetLabel = "—"

    switch (g.type) {
        case "weight-body": {
            const latest = measurements.find(m => m.weight)
            current = latest?.weight || 0
            currentLabel = `${fmtNum(current)} kg`
            targetLabel = `${fmtNum(target)} kg`
            break
        }
        case "weight-lift": {
            const history = workouts.filter(w => w.exercise === g.exercise)
            const maxE1RM = history.reduce((m, w) =>
                Math.max(m, estimate1RM(parseFloat(w.weight) || 0, parseInt(w.reps) || 0)), 0)
            current = maxE1RM
            currentLabel = `est. ${fmtNum(current)} kg 1RM`
            targetLabel = `${fmtNum(target)} kg`
            break
        }
        case "sessions": {
            const createdAt = new Date(g.createdAt)
            current = workouts.filter(w => new Date(w.date) >= createdAt).length
            currentLabel = `${current} sessions`
            targetLabel = `${target} sessions`
            break
        }
        case "streak": {
            current = getStreak()
            currentLabel = `${current} days`
            targetLabel = `${target} days`
            break
        }
        default: {
            current = 0
            currentLabel = "Custom"
            targetLabel = "—"
        }
    }

    // Auto-mark achieved for non-body-weight goals (body weight may go down toward target)
    if (g.type === "weight-body" && current > 0) {
        // if starting >target, direction is loss; else gain
        const start = g.createdWeight || current
        const losing = start > target
        if ((losing && current <= target) || (!losing && current >= target)) {
            if (g.status !== "achieved") {
                g.status = "achieved"
                saveData()
                toast(`🏆 Goal achieved: ${g.title}`, "success")
            }
        }
    } else if (current >= target && target > 0 && g.status !== "achieved") {
        g.status = "achieved"
        saveData()
        toast(`🏆 Goal achieved: ${g.title}`, "success")
    }

    let pct = target > 0 ? (current / target) * 100 : 0
    if (g.type === "weight-body") {
        const start = g.createdWeight || current
        const losing = start > target
        if (losing) {
            const totalNeeded = start - target
            const done = start - current
            pct = totalNeeded > 0 ? (done / totalNeeded) * 100 : 0
        } else {
            const totalNeeded = target - start
            const done = current - start
            pct = totalNeeded > 0 ? (done / totalNeeded) * 100 : 0
        }
    }
    return { current, target, pct, currentLabel, targetLabel }
}

function openNewGoalModal() {
    document.getElementById("goalTypeInput").value = "weight-body"
    document.getElementById("goalTitleInput").value = ""
    document.getElementById("goalTargetInput").value = ""
    document.getElementById("goalDeadlineInput").value = ""
    // Default deadline: 12 weeks
    const d = new Date(); d.setDate(d.getDate() + 84)
    document.getElementById("goalDeadlineInput").value = d.toISOString().slice(0, 10)
    updateGoalForm()
    openModal("goalModal")
}

function closeGoalModal() { closeModal("goalModal") }

function updateGoalForm() {
    const type = document.getElementById("goalTypeInput").value
    const exField = document.getElementById("goalExerciseField")
    const titleInput = document.getElementById("goalTitleInput")

    if (type === "weight-lift") {
        exField.style.display = "block"
        const exSel = document.getElementById("goalExerciseInput")
        const exercises = Object.keys(exerciseLibrary)
        exSel.innerHTML = exercises.map(e => `<option value="${e}">${e}</option>`).join("")
        titleInput.placeholder = "e.g. Bench 100kg"
    } else {
        exField.style.display = "none"
        if (type === "weight-body") titleInput.placeholder = "e.g. Cut to 75kg"
        if (type === "sessions")    titleInput.placeholder = "e.g. 30 sessions this quarter"
        if (type === "streak")      titleInput.placeholder = "e.g. 60 day streak"
        if (type === "custom")      titleInput.placeholder = "Describe your goal"
    }
}

function saveNewGoal() {
    const type = document.getElementById("goalTypeInput").value
    const title = document.getElementById("goalTitleInput").value.trim()
    const target = parseFloat(document.getElementById("goalTargetInput").value)
    const deadline = document.getElementById("goalDeadlineInput").value

    if (!title) { toast("Give your goal a title", "warn"); return }
    if (type !== "custom" && (!target || target <= 0)) { toast("Enter a target number", "warn"); return }

    const g = {
        id: Date.now(),
        type,
        title,
        target: target || null,
        exercise: type === "weight-lift" ? document.getElementById("goalExerciseInput").value : null,
        deadline: deadline || null,
        createdAt: new Date().toISOString(),
        status: "active"
    }
    // Snapshot starting value for body weight goals
    if (type === "weight-body") {
        const latest = measurements.find(m => m.weight)
        g.createdWeight = latest?.weight || null
    }
    goals.push(g)
    saveData()
    closeGoalModal()
    toast("Goal created 🎯", "success")
    renderGoals()
}

function deleteGoal(id) {
    if (!confirm("Delete this goal?")) return
    goals = goals.filter(g => g.id !== id)
    saveData()
    renderGoals()
}

// ===========================================================
// ===================== BADGES ==============================
// ===========================================================

const BADGE_DEFS = [
    { id: "first_session",  name: "First Session",    desc: "Log your first workout",                     icon: "🎯", check: () => workouts.length > 0 },
    { id: "sessions_10",    name: "10 Sessions",      desc: "Log 10 sessions",                            icon: "⚡", check: () => new Set(workouts.map(w=>w.date+w.day)).size >= 10 },
    { id: "sessions_50",    name: "50 Sessions",      desc: "Log 50 sessions",                            icon: "🔥", check: () => new Set(workouts.map(w=>w.date+w.day)).size >= 50 },
    { id: "sessions_100",   name: "Century",          desc: "Log 100 sessions",                           icon: "💯", check: () => new Set(workouts.map(w=>w.date+w.day)).size >= 100 },
    { id: "sessions_250",   name: "Iron Devotion",    desc: "Log 250 sessions",                           icon: "⚔️", check: () => new Set(workouts.map(w=>w.date+w.day)).size >= 250 },
    { id: "streak_7",       name: "Week Warrior",     desc: "7-day streak",                               icon: "🌟", check: () => getStreak() >= 7 },
    { id: "streak_30",      name: "Month Master",     desc: "30-day streak",                              icon: "👑", check: () => getStreak() >= 30 },
    { id: "streak_90",      name: "Quarter King",     desc: "90-day streak",                              icon: "🏆", check: () => getStreak() >= 90 },
    { id: "first_pr",       name: "First PR",         desc: "Set your first personal record",             icon: "💪", check: () => workouts.length >= 3 },
    { id: "volume_10k",     name: "10,000 kg Club",   desc: "Total volume over 10,000 kg",                icon: "🏋️", check: () => totalVolume() >= 10000 },
    { id: "volume_100k",    name: "100,000 kg Club",  desc: "Total volume over 100,000 kg",               icon: "🦾", check: () => totalVolume() >= 100000 },
    { id: "photo_first",    name: "Looking Good",     desc: "Upload your first progress photo",           icon: "📸", check: () => photos.length > 0 },
    { id: "measure_first",  name: "By The Numbers",   desc: "Log your first measurement",                 icon: "📏", check: () => measurements.length > 0 },
    { id: "goal_achieved",  name: "Goal Crusher",     desc: "Achieve your first goal",                    icon: "🎖️", check: () => goals.some(g => g.status === "achieved") },
    { id: "profile_done",   name: "Fully Loaded",     desc: "Complete your profile",                      icon: "✅", check: () => profile.name && profile.age && profile.sex && profile.height },
    { id: "coach_chat",     name: "Coachable",        desc: "Chat with the AI coach 10 times",            icon: "💬", check: () => coachChatHistory.filter(c=>c.role==="user").length >= 10 },
    { id: "muscle_balance", name: "Balanced Beast",   desc: "Train 5+ different muscle groups",           icon: "⚖️", check: () => {
        const gs = new Set(workouts.map(w => exerciseLibrary[w.exercise]?.muscle).filter(Boolean))
        return gs.size >= 5
    }},
    { id: "week_perfect",   name: "Perfect Week",     desc: "Train 5+ days in one week",                  icon: "🎪", check: () => {
        const byWeek = {}
        workouts.forEach(w => {
            const d = new Date(w.date)
            const wk = `${d.getFullYear()}-${getWeekNumber(d)}`
            if (!byWeek[wk]) byWeek[wk] = new Set()
            byWeek[wk].add(w.date)
        })
        return Object.values(byWeek).some(s => s.size >= 5)
    }},
]

function totalVolume() {
    return workouts.reduce((s, w) => s + (parseFloat(w.weight) || 0) * (parseInt(w.reps) || 0) * (parseInt(w.sets) || 0), 0)
}

function checkBadges() {
    BADGE_DEFS.forEach(b => {
        if (!earnedBadges[b.id]) {
            try {
                if (b.check()) {
                    earnedBadges[b.id] = new Date().toISOString()
                    saveData()
                    toast(`🏆 Badge earned: ${b.name}`, "success")
                }
            } catch(e) { console.warn("Badge check failed:", b.id, e) }
        }
    })
}

function renderBadges() {
    checkBadges()
    const grid = document.getElementById("badgesGrid")
    if (!grid) return
    const earnedCount = Object.keys(earnedBadges).length
    const totalCount = BADGE_DEFS.length

    let html = `<div class="badges-summary">
        <div class="badges-count">${earnedCount} <span class="muted">/ ${totalCount} earned</span></div>
        <div class="badges-count-label">Keep training. Keep earning.</div>
    </div>`

    html += BADGE_DEFS.map(b => {
        const earned = earnedBadges[b.id]
        return `<div class="badge-tile ${earned ? "earned" : "locked"}">
            <div class="badge-icon">${b.icon}</div>
            <div class="badge-name">${b.name}</div>
            <div class="badge-desc">${b.desc}</div>
            ${earned ? `<div class="badge-date">Earned ${new Date(earned).toLocaleDateString()}</div>` : `<div class="badge-locked">Locked</div>`}
        </div>`
    }).join("")
    grid.innerHTML = html
}

// ===========================================================
// ===================== PROFILE =============================
// ===========================================================

function renderProfile() {
    document.getElementById("profNameInput").value      = profile.name || ""
    document.getElementById("profAge").value            = profile.age || ""
    document.getElementById("profSex").value            = profile.sex || ""
    document.getElementById("profHeight").value         = profile.height || ""
    document.getElementById("profUnits").value          = profile.units || "metric"
    document.getElementById("profTrainingSince").value  = profile.trainingSince || ""
    document.getElementById("prefRestTimer").value      = profile.restTimer || 90
    document.getElementById("prefVoice").value          = profile.voice || "on"
    document.getElementById("prefNotif").value          = profile.notif || "off"

    // Avatar = initials
    const avatar = document.getElementById("profileAvatar")
    avatar.textContent = profile.name ? profile.name.slice(0, 1).toUpperCase() : "?"

    document.getElementById("profileName").textContent = profile.name || "Set your name"
    const subParts = []
    if (profile.age) subParts.push(`${profile.age} yrs`)
    if (profile.sex) subParts.push(profile.sex === "male" ? "Male" : profile.sex === "female" ? "Female" : "Other")
    if (profile.height) subParts.push(`${fmtNum(profile.height)} cm`)
    document.getElementById("profileSubLine").textContent = subParts.length > 0 ? subParts.join(" · ") : "Tell us who you're training for."

    // Stats
    const sessionsCount = new Set(workouts.map(w => w.date + w.day)).size
    document.getElementById("profileStatSessions").textContent = sessionsCount
    document.getElementById("profileStatStreak").textContent   = getStreak()
    document.getElementById("profileStatVolume").textContent   = fmtNum(totalVolume(), 0)
    document.getElementById("profileStatBadges").textContent   = Object.keys(earnedBadges).length

    renderInjuryTags()

    // Populate datalist for injury autocomplete
    const dl = document.getElementById("injuryList")
    if (dl) {
        dl.innerHTML = Object.keys(exerciseLibrary).map(e => `<option value="${e}">`).join("")
    }
}

function saveProfile() {
    profile.name          = document.getElementById("profNameInput").value.trim()
    profile.age           = parseInt(document.getElementById("profAge").value) || null
    profile.sex           = document.getElementById("profSex").value
    profile.height        = parseFloat(document.getElementById("profHeight").value) || null
    profile.units         = document.getElementById("profUnits").value
    profile.trainingSince = document.getElementById("profTrainingSince").value
    profile.restTimer     = parseInt(document.getElementById("prefRestTimer").value) || 90
    profile.voice         = document.getElementById("prefVoice").value
    profile.notif         = document.getElementById("prefNotif").value
    saveData()
    checkBadges()
    // Update avatar initials live
    const avatar = document.getElementById("profileAvatar")
    if (avatar) avatar.textContent = profile.name ? profile.name.slice(0, 1).toUpperCase() : "?"
}

function addInjury() {
    const input = document.getElementById("injuryInput")
    const val = input.value.trim()
    if (!val) return
    if (!profile.injuries.includes(val)) {
        profile.injuries.push(val)
        saveData()
    }
    input.value = ""
    renderInjuryTags()
}

function removeInjury(name) {
    profile.injuries = profile.injuries.filter(i => i !== name)
    saveData()
    renderInjuryTags()
}

function renderInjuryTags() {
    const el = document.getElementById("injuryTags")
    if (!el) return
    if (profile.injuries.length === 0) {
        el.innerHTML = `<span class="muted">No injuries flagged.</span>`
        return
    }
    el.innerHTML = profile.injuries.map(i =>
        `<span class="injury-tag">${i}<button onclick="removeInjury('${i.replace(/'/g,"\\'")}')">✕</button></span>`
    ).join("")
}

function requestNotifPermission() {
    if (profile.notif === "on" && "Notification" in window) {
        if (Notification.permission === "default") {
            Notification.requestPermission()
        }
    }
}

// ===== EXPORT / IMPORT / RESET =====
function exportAllData() {
    const data = {
        version: "forge_v5",
        exportedAt: new Date().toISOString(),
        workouts, selectedPlanName, currentPlan,
        profile, measurements, photos, foodLog, nutritionTargets, goals, earnedBadges, coachChatHistory
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `forge-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast("Backup downloaded", "success")
}

function importAllData() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,application/json"
    input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!confirm("This will replace all your current data. Continue?")) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result)
                workouts          = data.workouts || []
                selectedPlanName  = data.selectedPlanName || null
                currentPlan       = data.currentPlan || null
                profile           = data.profile || profile
                measurements      = data.measurements || []
                photos            = data.photos || []
                foodLog           = data.foodLog || {}
                nutritionTargets  = data.nutritionTargets || { kcal: null, p: null, c: null, f: null }
                goals             = data.goals || []
                earnedBadges      = data.earnedBadges || {}
                coachChatHistory  = data.coachChatHistory || []
                saveData()
                toast("Data imported — refreshing", "success")
                setTimeout(() => location.reload(), 800)
            } catch (err) {
                toast("Couldn't parse file", "warn")
            }
        }
        reader.readAsText(file)
    }
    input.click()
}

function resetEverything() {
    if (!confirm("⚠️ This deletes ALL your data permanently. Are you sure?")) return
    if (!confirm("Last chance. Everything will be gone. Really reset?")) return
    Object.keys(localStorage).filter(k => k.startsWith("forge_")).forEach(k => localStorage.removeItem(k))
    location.reload()
}

// ===========================================================
// ===================== MODALS ==============================
// ===========================================================

function openModal(id) {
    const m = document.getElementById(id)
    if (!m) return
    m.classList.add("active")
    document.body.style.overflow = "hidden"
}

function closeModal(id) {
    const m = document.getElementById(id)
    if (!m) return
    m.classList.remove("active")
    document.body.style.overflow = ""
}

// ===========================================================
// ============= PLATE CALCULATOR & 1RM ======================
// ===========================================================

const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5]

function openPlateModal(targetWeight) {
    if (targetWeight) document.getElementById("plateTargetInput").value = targetWeight
    computePlates()
    openModal("plateModal")
}

function closePlateModal() { closeModal("plateModal") }

function computePlates() {
    const targetEl = document.getElementById("plateTargetInput")
    const barEl = document.getElementById("plateBarInput")
    const resultEl = document.getElementById("plateResult")
    const barVisEl = document.getElementById("plateBarVisual")
    const listEl = document.getElementById("plateList")

    const target = parseFloat(targetEl.value) || 0
    const bar = parseFloat(barEl.value) || 0

    if (target < bar) {
        resultEl.innerHTML = `<span class="muted">Target (${target}kg) is less than bar (${bar}kg).</span>`
        barVisEl.innerHTML = ""
        listEl.innerHTML = ""
        return
    }
    const perSide = (target - bar) / 2
    if (perSide < 0) {
        resultEl.innerHTML = `<span class="muted">Enter target weight.</span>`
        barVisEl.innerHTML = ""
        listEl.innerHTML = ""
        return
    }

    const plates = []
    let remaining = perSide
    for (const p of PLATES_KG) {
        while (remaining >= p - 0.001) {
            plates.push(p)
            remaining -= p
        }
    }
    const remainder = remaining > 0.001 ? remaining : 0

    // Counts
    const counts = {}
    plates.forEach(p => counts[p] = (counts[p] || 0) + 1)

    resultEl.innerHTML = `<div class="plate-result-big">${plates.length * 2} plate${plates.length * 2 === 1 ? "" : "s"} total</div>
        <div class="plate-result-sub">${plates.length} per side · bar ${bar}kg${remainder > 0 ? ` · ${fmtNum(remainder*2)}kg unreachable` : ""}</div>`

    // Visual
    const plateColors = { 25:"#f22", 20:"#28f", 15:"#fc0", 10:"#2a2", 5:"#aaa", 2.5:"#444", 1.25:"#666", 1:"#777", 0.5:"#999" }
    barVisEl.innerHTML = `
        <div class="plate-side">${plates.slice().reverse().map(p =>
            `<div class="plate-visual" style="background:${plateColors[p]||'#666'};height:${20 + p*2}px" title="${p}kg"><span>${p}</span></div>`
        ).join("")}</div>
        <div class="plate-bar-visual"></div>
        <div class="plate-side right">${plates.map(p =>
            `<div class="plate-visual" style="background:${plateColors[p]||'#666'};height:${20 + p*2}px" title="${p}kg"><span>${p}</span></div>`
        ).join("")}</div>`

    // List
    listEl.innerHTML = `<div class="plate-list-title">Per side:</div>` +
        Object.entries(counts).sort((a, b) => b[0] - a[0]).map(([w, c]) =>
            `<div class="plate-list-row"><span>${w} kg</span><span><strong>× ${c}</strong></span></div>`
        ).join("")
}

// ===========================================================
// ===================== VOICE COACHING ======================
// ===========================================================

function speakCoach(text) {
    if (profile.voice !== "on") return
    if (!("speechSynthesis" in window)) return
    try {
        const u = new SpeechSynthesisUtterance(text)
        u.rate = 1.05
        u.pitch = 1
        u.volume = 1
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(u)
    } catch (e) {}
}

// Hook into existing rest timer — at halfway and 10s warning, speak
let _voiceCuesSpoken = { half: false, ten: false }
function speakTimerCue(remaining, total) {
    if (profile.voice !== "on") return
    if (total >= 40 && remaining === Math.floor(total / 2) && !_voiceCuesSpoken.half) {
        _voiceCuesSpoken.half = true
        speakCoach("Halfway")
    }
    if (remaining === 10 && !_voiceCuesSpoken.ten) {
        _voiceCuesSpoken.ten = true
        speakCoach("Ten seconds")
    }
}

// ===========================================================
// ================= SESSION UPGRADES ========================
// ===========================================================

// A smart coach tip shown above each exercise card in Session
function getSmartCoachTip(exerciseName, day) {
    const sugg = suggestNextWeight(exerciseName, day)
    if (!sugg) {
        const ex = exerciseLibrary[exerciseName]
        if (ex?.cues?.length) return `<strong>Focus:</strong> ${ex.cues[0]}`
        return null
    }
    return `<strong>Coach:</strong> Try <strong>${fmtNum(sugg.weight)}kg × ${sugg.reps}</strong>. ${sugg.reason}`
}

// Hook into existing saveSession — wrap if needed for badges + goals
const _origSaveSession = typeof saveSession === "function" ? saveSession : null
if (_origSaveSession) {
    window.saveSession = function() {
        _origSaveSession.apply(this, arguments)
        setTimeout(() => {
            checkBadges()
            renderGoals()
        }, 100)
    }
}

// ===========================================================
// ================= SPEECH / NOTIFICATIONS ==================
// ===========================================================

function notify(title, body) {
    if (profile.notif !== "on") return
    if (!("Notification" in window)) return
    if (Notification.permission === "granted") {
        new Notification(title, { body })
    }
}

// ===========================================================
// ============== DASHBOARD ENHANCEMENTS =====================
// ===========================================================

// Extend existing renderDashboard to also check badges & render goal progress
const _origRenderDashboard = typeof renderDashboard === "function" ? renderDashboard : null
if (_origRenderDashboard) {
    window.renderDashboard = function() {
        _origRenderDashboard.apply(this, arguments)
        checkBadges()

        // Update sidebar streak
        const sidebarStreak = document.getElementById("sidebarStreak")
        if (sidebarStreak) {
            const s = getStreak()
            sidebarStreak.textContent = s > 0 ? `🔥 ${s} day streak` : `🔥 No streak yet`
        }
    }
}

// ===========================================================
// ================= INIT HOOKS ==============================
// ===========================================================

// Run this once on load to handle any post-upgrade tasks
function initNewFeatures() {
    // Make sure badges get checked
    checkBadges()

    // Voice warmup: some browsers need a speak call to initialize voices
    if ("speechSynthesis" in window) {
        try { window.speechSynthesis.getVoices() } catch (e) {}
    }

    // Hook escape key to close any open modals
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-backdrop.active").forEach(m => m.classList.remove("active"))
            document.body.style.overflow = ""
            // Close photo lightbox too
            document.querySelectorAll(".photo-lightbox").forEach(l => l.remove())
        }
    })

    // Update sidebar streak every time data changes (simple: on init)
    const sidebarStreak = document.getElementById("sidebarStreak")
    if (sidebarStreak) {
        const s = getStreak()
        sidebarStreak.textContent = s > 0 ? `🔥 ${s} day streak` : `🔥 No streak yet`
    }
}

// Run init after everything else
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNewFeatures)
} else {
    setTimeout(initNewFeatures, 50)
}

/* =========================================================
   ============= SUPABASE CLOUD SYNC =======================
   ========================================================= */

// ===== CONFIG =====
const SUPABASE_URL = "https://eyvhyyshiwuiveycnlux.supabase.co"
const SUPABASE_KEY = "sb_publishable_9vufsThorZ8iCGWzRGasyg_TmMwtbt9"

// Lazy init: only create client when SDK loads (after network)
let sbClient = null
let currentUser = null   // null if signed out
let syncInFlight = false
let lastSyncAt = null

function initSupabase() {
    if (sbClient) return sbClient
    if (typeof window === "undefined" || !window.supabase) return null
    try {
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false,
                storage: window.localStorage,
                storageKey: "forge_sb_session"
            }
        })
        // Listen for auth changes
        sbClient.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null
            updateAuthPill()
            if (event === "SIGNED_IN") {
                onSignedIn()
            } else if (event === "SIGNED_OUT") {
                onSignedOut()
            }
        })
        // Check for existing session on load
        sbClient.auth.getSession().then(({ data }) => {
            currentUser = data?.session?.user || null
            updateAuthPill()
            if (currentUser) {
                // Silently pull latest data on app start
                setTimeout(() => cloudPullAll().catch(() => {}), 500)
            }
        })
        return sbClient
    } catch (e) {
        console.error("Supabase init failed:", e)
        return null
    }
}

// ===== UI: AUTH PILL =====
function updateAuthPill() {
    const pill = document.getElementById("authPill")
    const icon = document.getElementById("authPillIcon")
    const text = document.getElementById("authPillText")
    if (!pill || !icon || !text) return

    if (currentUser) {
        pill.classList.add("signed-in")
        pill.classList.remove("syncing")
        icon.textContent = "✓"
        const email = currentUser.email || "Signed in"
        text.textContent = email.length > 20 ? email.slice(0, 18) + "…" : email
        pill.title = `Signed in as ${email} — click to manage`
    } else {
        pill.classList.remove("signed-in", "syncing")
        icon.textContent = "☁"
        text.textContent = "Sign in to sync"
        pill.title = "Sign in to sync across devices"
    }
}

function setAuthPillSyncing(isSyncing) {
    const pill = document.getElementById("authPill")
    const icon = document.getElementById("authPillIcon")
    const text = document.getElementById("authPillText")
    if (!pill) return
    if (isSyncing) {
        pill.classList.add("syncing")
        if (icon) icon.textContent = "↻"
        if (text) text.textContent = "Syncing…"
    } else {
        pill.classList.remove("syncing")
        updateAuthPill()
    }
}

function handleAuthPillClick() {
    if (currentUser) {
        // Show a menu: sync now / sign out
        const doSignOut = confirm(`Signed in as ${currentUser.email}\n\nSign out? Your local data will stay on this device.`)
        if (doSignOut) signOut()
    } else {
        openAuthModal("signin")
    }
}

// ===== UI: AUTH MODAL =====
let authTab = "signin"

function openAuthModal(tab = "signin") {
    authTab = tab
    switchAuthTab(tab)
    // Clear inputs
    const emailEl = document.getElementById("authEmail")
    const pwEl = document.getElementById("authPassword")
    const msgEl = document.getElementById("authMessage")
    if (emailEl) emailEl.value = ""
    if (pwEl) pwEl.value = ""
    if (msgEl) { msgEl.textContent = ""; msgEl.className = "helper-text" }
    openModal("authModal")
    // Focus email
    setTimeout(() => document.getElementById("authEmail")?.focus(), 100)
}

function closeAuthModal() { closeModal("authModal") }

function switchAuthTab(tab) {
    authTab = tab
    const signInTab = document.getElementById("authTabSignIn")
    const signUpTab = document.getElementById("authTabSignUp")
    const submitBtn = document.getElementById("authSubmitBtn")
    const title = document.getElementById("authModalTitle")
    const sub = document.getElementById("authModalSub")
    const pwEl = document.getElementById("authPassword")

    if (tab === "signin") {
        signInTab?.classList.add("active")
        signUpTab?.classList.remove("active")
        if (submitBtn) submitBtn.textContent = "Sign in"
        if (title) title.textContent = "Sign in to FORGE"
        if (sub) sub.textContent = "Sync your training across all your devices."
        if (pwEl) pwEl.autocomplete = "current-password"
    } else {
        signInTab?.classList.remove("active")
        signUpTab?.classList.add("active")
        if (submitBtn) submitBtn.textContent = "Create account"
        if (title) title.textContent = "Create your FORGE account"
        if (sub) sub.textContent = "Free forever. Your data stays yours."
        if (pwEl) pwEl.autocomplete = "new-password"
    }
    const msgEl = document.getElementById("authMessage")
    if (msgEl) { msgEl.textContent = ""; msgEl.className = "helper-text" }
}

async function submitAuth() {
    const emailEl = document.getElementById("authEmail")
    const pwEl = document.getElementById("authPassword")
    const msgEl = document.getElementById("authMessage")
    const btn = document.getElementById("authSubmitBtn")
    if (!emailEl || !pwEl || !msgEl) return

    const email = emailEl.value.trim()
    const password = pwEl.value

    if (!email || !email.includes("@")) {
        showAuthMessage("Enter a valid email", "error")
        return
    }
    if (!password || password.length < 6) {
        showAuthMessage("Password must be at least 6 characters", "error")
        return
    }

    if (!initSupabase()) {
        showAuthMessage("Cloud sync unavailable — check your connection", "error")
        return
    }

    btn.disabled = true
    btn.textContent = authTab === "signin" ? "Signing in…" : "Creating account…"
    showAuthMessage("", "")

    try {
        let result
        if (authTab === "signin") {
            result = await sbClient.auth.signInWithPassword({ email, password })
        } else {
            result = await sbClient.auth.signUp({ email, password })
        }

        if (result.error) {
            showAuthMessage(friendlyAuthError(result.error.message), "error")
            btn.disabled = false
            btn.textContent = authTab === "signin" ? "Sign in" : "Create account"
            return
        }

        if (authTab === "signup" && !result.data?.session) {
            // Email confirmation required
            showAuthMessage("Check your email for a confirmation link.", "success")
            btn.disabled = false
            btn.textContent = "Create account"
            return
        }

        // Success!
        showAuthMessage("Success 🎉", "success")
        setTimeout(() => closeAuthModal(), 600)
    } catch (e) {
        showAuthMessage(friendlyAuthError(e.message), "error")
        btn.disabled = false
        btn.textContent = authTab === "signin" ? "Sign in" : "Create account"
    }
}

function showAuthMessage(msg, kind) {
    const el = document.getElementById("authMessage")
    if (!el) return
    el.textContent = msg
    el.className = "helper-text" + (kind ? " " + kind : "")
}

function friendlyAuthError(raw) {
    const s = (raw || "").toLowerCase()
    if (s.includes("invalid login")) return "Wrong email or password."
    if (s.includes("already registered")) return "Account exists — try Sign in instead."
    if (s.includes("email not confirmed")) return "Check your email to confirm your account."
    if (s.includes("invalid email")) return "That email doesn't look right."
    if (s.includes("password should be at least")) return "Password must be at least 6 characters."
    if (s.includes("rate limit") || s.includes("too many")) return "Too many attempts — try again in a minute."
    if (s.includes("network") || s.includes("fetch")) return "Network issue — check your connection."
    return raw || "Something went wrong."
}

async function signOut() {
    if (!sbClient) return
    try {
        await sbClient.auth.signOut()
        toast("Signed out — your local data is preserved", "info")
    } catch (e) {
        console.warn("Sign out error:", e)
    }
}

// ===== LIFECYCLE: called when sign-in/out events fire =====
async function onSignedIn() {
    if (!currentUser) return
    toast(`Welcome back`, "success")
    // Decide: migrate or merge-sync
    const hasLocalData = workouts.length > 0 || measurements.length > 0 || goals.length > 0 || photos.length > 0
    const hasMigratedFlag = localStorage.getItem(`forge_migrated_${currentUser.id}`) === "1"

    if (hasLocalData && !hasMigratedFlag) {
        // First time signing in on this device with local data → show migration modal
        showMigrateModal()
    } else {
        // Already migrated OR fresh device with no local data — safe to merge-pull
        // cloudPullAll is now merge-based, so it won't wipe local data even if cloud is empty
        setTimeout(() => cloudPullAll().catch(e => {
            console.warn("Initial pull failed:", e)
            toast("Couldn't sync from cloud", "warn")
        }), 400)
    }
}

function onSignedOut() {
    toast("Signed out", "info")
}

// ===== MIGRATE LOCAL DATA TO CLOUD =====
function showMigrateModal() {
    const detailsEl = document.getElementById("migrateDetails")
    if (!detailsEl) return

    const counts = {
        Workouts: workouts.length,
        Measurements: measurements.length,
        "Progress photos": photos.length,
        Goals: goals.length,
        "Food entries": Object.values(foodLog).reduce((a, b) => a + (b?.length || 0), 0),
        "Earned badges": Object.keys(earnedBadges).length,
    }

    detailsEl.innerHTML = Object.entries(counts)
        .filter(([_, v]) => v > 0)
        .map(([k, v]) => `<div class="migrate-stat"><span>${k}</span><span class="migrate-stat-count">${v}</span></div>`)
        .join("") || `<p class="muted">No data to upload.</p>`

    openModal("migrateModal")
}

async function runMigration(doUpload) {
    closeModal("migrateModal")
    if (!currentUser) return
    localStorage.setItem(`forge_migrated_${currentUser.id}`, "1")

    if (!doUpload) {
        // User chose fresh start — pull cloud data (which may be empty)
        await cloudPullAll().catch(() => {})
        return
    }

    setAuthPillSyncing(true)
    try {
        await cloudPushAll()
        toast("Data uploaded to cloud 🎉", "success")
    } catch (e) {
        console.error("Migration failed:", e)
        toast("Upload failed — will retry later", "warn")
    } finally {
        setAuthPillSyncing(false)
    }
}

// ===== CLOUD PUSH: upload all local data to user's account =====
async function cloudPushAll() {
    if (!currentUser || !sbClient) return

    // 1. Profile
    await sbClient.from("user_profiles").upsert({
        user_id: currentUser.id,
        display_name: profile.name || null,
        age: profile.age,
        sex: profile.sex || null,
        height_cm: profile.height,
        units: profile.units || "metric",
        training_since: profile.trainingSince || null,
        injuries: profile.injuries || [],
        rest_timer_sec: profile.restTimer || 90,
        voice_on: profile.voice === "on",
        notif_on: profile.notif === "on",
        selected_plan: selectedPlanName || null,
        current_plan: currentPlan || null,
        updated_at: new Date().toISOString()
    }, { onConflict: "user_id" })

    // 2. Workouts — ensure every record has a stable client_id, persist it locally too
    if (workouts.length > 0) {
        // Assign stable client_ids to any workouts that lack one
        workouts.forEach((w) => {
            if (!w.client_id) {
                // Use content-based ID so same workout generates same ID twice
                w.client_id = `local-${w.date}-${w.day}-${w.exercise}-${w.weight||0}-${w.reps||0}-${w.sets||0}`.replace(/\s+/g, "_")
            }
        })
        // Persist the IDs back to localStorage
        localStorage.setItem("forge_workouts", JSON.stringify(workouts))

        const rows = workouts.map(w => ({
            user_id: currentUser.id,
            date: w.date,
            day: w.day,
            exercise: w.exercise,
            weight: w.weight != null ? Number(w.weight) : null,
            reps: w.reps != null ? Number(w.reps) : null,
            sets: w.sets != null ? Number(w.sets) : null,
            rpe: w.rpe != null ? Number(w.rpe) : null,
            e1rm: w.e1rm != null ? Number(w.e1rm) : null,
            notes: w.notes || null,
            rating: w.rating != null ? Number(w.rating) : null,
            energy: w.energy != null ? Number(w.energy) : null,
            client_id: w.client_id
        }))
        // Upsert in chunks of 200
        for (let i = 0; i < rows.length; i += 200) {
            const chunk = rows.slice(i, i + 200)
            const { error } = await sbClient.from("workouts").upsert(chunk, { onConflict: "user_id,client_id", ignoreDuplicates: false })
            if (error) throw error
        }
    }

    // 3. Measurements
    if (measurements.length > 0) {
        measurements.forEach(m => {
            if (!m.client_id) {
                m.client_id = `local-m-${m.date}-${m.id || (m.weight||0) + '-' + (m.bf||0)}`
            }
        })
        localStorage.setItem("forge_measurements", JSON.stringify(measurements))
        const rows = measurements.map(m => ({
            user_id: currentUser.id,
            date: m.date,
            weight_kg: m.weight,
            body_fat_pct: m.bf,
            waist_cm: m.waist,
            chest_cm: m.chest,
            arm_cm: m.arm,
            thigh_cm: m.thigh,
            client_id: m.client_id
        }))
        const { error } = await sbClient.from("measurements").upsert(rows, { onConflict: "user_id,client_id" })
        if (error) throw error
    }

    // 4. Goals
    if (goals.length > 0) {
        goals.forEach(g => {
            if (!g.client_id) {
                g.client_id = `local-g-${g.id || g.title.replace(/\s+/g, '_') + '-' + (g.createdAt || '')}`
            }
        })
        localStorage.setItem("forge_goals", JSON.stringify(goals))
        const rows = goals.map(g => ({
            user_id: currentUser.id,
            title: g.title,
            goal_type: g.type,
            exercise: g.exercise || null,
            target_val: g.target,
            deadline: g.deadline,
            status: g.status || "active",
            created_weight: g.createdWeight,
            client_id: g.client_id
        }))
        const { error } = await sbClient.from("goals").upsert(rows, { onConflict: "user_id,client_id" })
        if (error) throw error
    }

    // 5. Food log — flatten
    const foodRows = []
    let foodLogChanged = false
    Object.entries(foodLog).forEach(([date, entries]) => {
        entries.forEach((e, i) => {
            if (!e.client_id) {
                e.client_id = `local-f-${date}-${e.name.replace(/\s+/g,'_')}-${e.kcal||0}-${i}`
                foodLogChanged = true
            }
            foodRows.push({
                user_id: currentUser.id,
                date,
                name: e.name,
                kcal: e.kcal,
                protein_g: e.p,
                carbs_g: e.c,
                fat_g: e.f,
                client_id: e.client_id
            })
        })
    })
    if (foodLogChanged) localStorage.setItem("forge_foodLog", JSON.stringify(foodLog))
    if (foodRows.length > 0) {
        for (let i = 0; i < foodRows.length; i += 200) {
            const chunk = foodRows.slice(i, i + 200)
            const { error } = await sbClient.from("food_log").upsert(chunk, { onConflict: "user_id,client_id" })
            if (error) throw error
        }
    }

    // 6. Nutrition targets
    if (nutritionTargets.kcal || nutritionTargets.p || nutritionTargets.c || nutritionTargets.f) {
        await sbClient.from("nutrition_targets").upsert({
            user_id: currentUser.id,
            kcal: nutritionTargets.kcal,
            protein_g: nutritionTargets.p,
            carbs_g: nutritionTargets.c,
            fat_g: nutritionTargets.f,
            updated_at: new Date().toISOString()
        }, { onConflict: "user_id" })
    }

    // 7. Badges
    const badgeRows = Object.entries(earnedBadges).map(([id, ts]) => ({
        user_id: currentUser.id,
        badge_id: id,
        earned_at: ts
    }))
    if (badgeRows.length > 0) {
        await sbClient.from("earned_badges").upsert(badgeRows, { onConflict: "user_id,badge_id" })
    }

    lastSyncAt = new Date()
}

// ===== CLOUD PULL: download all user data =====
async function cloudPullAll() {
    if (!currentUser || !sbClient) return
    setAuthPillSyncing(true)
    try {
        // ===== Profile (single row, ok to replace) =====
        const { data: prof } = await sbClient.from("user_profiles").select("*").eq("user_id", currentUser.id).maybeSingle()
        if (prof) {
            // Only overwrite if cloud has meaningful data (not empty defaults)
            if (prof.display_name || prof.age || prof.height_cm) {
                profile.name = prof.display_name || profile.name || ""
                profile.age = prof.age ?? profile.age
                profile.sex = prof.sex || profile.sex || ""
                profile.height = prof.height_cm ?? profile.height
                profile.units = prof.units || profile.units || "metric"
                profile.trainingSince = prof.training_since || profile.trainingSince || ""
                profile.injuries = prof.injuries || profile.injuries || []
                profile.restTimer = prof.rest_timer_sec || profile.restTimer || 90
                profile.voice = prof.voice_on != null ? (prof.voice_on ? "on" : "off") : profile.voice
                profile.notif = prof.notif_on != null ? (prof.notif_on ? "on" : "off") : profile.notif
                if (prof.selected_plan) selectedPlanName = prof.selected_plan
                if (prof.current_plan) currentPlan = prof.current_plan
            }
        }

        // ===== Helper: merge cloud rows with local array using client_id =====
        // Keeps local rows that aren't in cloud, adds cloud rows that aren't local
        function mergeByClientId(localArr, cloudRows, mapFn, idKey = "client_id") {
            const cloudMapped = cloudRows.map(mapFn)
            const cloudIds = new Set(cloudMapped.map(r => r[idKey]).filter(Boolean))
            const localUnique = localArr.filter(r => !r[idKey] || !cloudIds.has(r[idKey]))
            return [...localUnique, ...cloudMapped]
        }

        // ===== Workouts =====
        const { data: wo } = await sbClient.from("workouts").select("*").eq("user_id", currentUser.id).order("date", { ascending: true })
        if (Array.isArray(wo)) {
            workouts = mergeByClientId(workouts, wo, r => ({
                date: r.date, day: r.day, exercise: r.exercise,
                weight: r.weight, reps: r.reps, sets: r.sets,
                rpe: r.rpe, e1rm: r.e1rm, notes: r.notes,
                rating: r.rating, energy: r.energy,
                client_id: r.client_id
            }))
        }

        // ===== Measurements =====
        const { data: ms } = await sbClient.from("measurements").select("*").eq("user_id", currentUser.id).order("date", { ascending: false })
        if (Array.isArray(ms)) {
            measurements = mergeByClientId(measurements, ms, r => ({
                id: r.id, date: r.date,
                weight: r.weight_kg, bf: r.body_fat_pct,
                waist: r.waist_cm, chest: r.chest_cm,
                arm: r.arm_cm, thigh: r.thigh_cm,
                client_id: r.client_id
            }))
            // Re-sort by date desc
            measurements.sort((a, b) => new Date(b.date) - new Date(a.date))
        }

        // ===== Goals =====
        const { data: gs } = await sbClient.from("goals").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false })
        if (Array.isArray(gs)) {
            goals = mergeByClientId(goals, gs, r => ({
                id: r.id, type: r.goal_type, title: r.title,
                exercise: r.exercise, target: r.target_val,
                deadline: r.deadline, status: r.status,
                createdAt: r.created_at, createdWeight: r.created_weight,
                client_id: r.client_id
            }))
        }

        // ===== Food log — merge per day =====
        const { data: fl } = await sbClient.from("food_log").select("*").eq("user_id", currentUser.id).order("date", { ascending: false })
        if (Array.isArray(fl)) {
            // Build cloud version
            const cloudByDate = {}
            fl.forEach(r => {
                if (!cloudByDate[r.date]) cloudByDate[r.date] = []
                cloudByDate[r.date].push({
                    name: r.name, kcal: r.kcal,
                    p: r.protein_g, c: r.carbs_g, f: r.fat_g,
                    time: r.created_at, client_id: r.client_id
                })
            })
            // Merge per date
            const allDates = new Set([...Object.keys(foodLog), ...Object.keys(cloudByDate)])
            const merged = {}
            allDates.forEach(d => {
                const localEntries = foodLog[d] || []
                const cloudEntries = cloudByDate[d] || []
                merged[d] = mergeByClientId(localEntries, cloudEntries, r => r)
            })
            foodLog = merged
        }

        // ===== Nutrition targets (single row, only replace if cloud has values) =====
        const { data: nt } = await sbClient.from("nutrition_targets").select("*").eq("user_id", currentUser.id).maybeSingle()
        if (nt && (nt.kcal || nt.protein_g || nt.carbs_g || nt.fat_g)) {
            nutritionTargets = { kcal: nt.kcal, p: nt.protein_g, c: nt.carbs_g, f: nt.fat_g }
        }

        // ===== Badges (union of cloud and local) =====
        const { data: bg } = await sbClient.from("earned_badges").select("*").eq("user_id", currentUser.id)
        if (Array.isArray(bg)) {
            // Merge: keep local badges AND cloud badges
            bg.forEach(r => {
                if (!earnedBadges[r.badge_id]) {
                    earnedBadges[r.badge_id] = r.earned_at
                }
            })
        }

        // Persist merged data locally
        saveData()
        lastSyncAt = new Date()

        // Push merged data back to cloud so both sides match
        // (This re-uploads any local records that weren't in cloud yet)
        setTimeout(() => cloudPushAll().catch(e => console.warn("Post-merge push:", e)), 300)

        // Re-render active page
        const active = document.querySelector(".page.active-page")
        if (active) {
            const id = active.id
            const btn = document.querySelector(`[data-section="${id}"]`)
            if (typeof navigate === "function") navigate(id, btn)
        }
    } finally {
        setAuthPillSyncing(false)
    }
}

// ===== HOOK: saveData → also push to cloud (debounced) =====
let _cloudPushTimer = null
const _origSaveData = (typeof saveData === "function") ? saveData : null
if (_origSaveData) {
    window.saveData = function() {
        _origSaveData.apply(this, arguments)
        if (currentUser && sbClient) {
            // Debounce: only push after 2 seconds of no more saves
            if (_cloudPushTimer) clearTimeout(_cloudPushTimer)
            _cloudPushTimer = setTimeout(() => {
                cloudPushAll().catch(e => console.warn("Cloud push failed:", e))
            }, 2000)
        }
    }
}

// ===== INIT =====
function initCloudSync() {
    initSupabase()
    updateAuthPill()
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCloudSync)
} else {
    setTimeout(initCloudSync, 100)
}
