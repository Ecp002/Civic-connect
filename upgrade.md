🚀 Civic Connect – System Upgrade Plan
(From Reporting App → Accountable Civic Management System)
4
1️⃣ PROJECT GOAL (VERY IMPORTANT)
🎯 Objective

Upgrade Civic Connect to ensure:

📍 Geo-tagged issue tracking

📸 Proof-based resolution

🕒 Transparent status timeline

⭐ Citizen satisfaction validation

So that civic authorities are accountable, and citizens can trust the system.

2️⃣ COMPLETE END-TO-END WORKFLOW (MASTER FLOW)
Citizen submits issue
  ↓
Before photo + location saved
  ↓
Status: Reported
  ↓
Admin sees issue on map & list
  ↓
Admin marks Processing
  ↓
Processing timestamp saved
  ↓
Admin uploads After photo
  ↓
Status: Resolved
  ↓
Citizen notified
  ↓
Citizen rates satisfaction (Yes/No + Rating)

👉 This single flow ties ALL features together.

3️⃣ FEATURE 1: MAP-BASED ADMIN DASHBOARD (CORE UPGRADE)
🔥 What it does

Converts text complaints into visual insights

Helps admins identify hotspots

Enables faster decision-making

🗺️ Admin Dashboard – Map View
Functionality:

Map at top of dashboard

Each complaint = marker

Marker color by status:

🔴 Reported

🟡 Processing

🟢 Resolved

Clicking marker shows:

Issue title

Before image

Status

View details button

Below the map:

Full report list/table

🧠 Data Used

latitude

longitude

status

title

area

🗣️ Judge Explanation Line

“The admin dashboard visualizes civic issues on a live map, allowing authorities to identify hotspots instead of reacting blindly.”

4️⃣ FEATURE 2: BEFORE–AFTER PROOF SYSTEM (ACCOUNTABILITY)
🔥 What it does

Prevents fake resolutions

Ensures visual verification

Builds trust

👤 Citizen Side

Upload Before Image while reporting

Image stored in Supabase Storage

👨‍💼 Admin Side

View before image

Mark status → Processing

Upload After Image

Mark status → Resolved

🚫 Rule:
Admin cannot mark Resolved without After Image

🗣️ Judge Explanation Line

“Resolution is verified using mandatory photographic proof before and after fixing the issue.”

5️⃣ FEATURE 3: STATUS HISTORY / TIMELINE
🔥 What it does

Shows real-world workflow

Adds professionalism

Tracks efficiency

🕒 Timeline Stages
Stage	Description
Reported	Citizen submitted issue
Processing	Authority started work
Resolved	Issue fixed
👁️ UI Example
🕒 Reported at: 16 Feb, 2:10 PM
🔧 Processing at: 16 Feb, 4:30 PM
✅ Resolved at: 17 Feb, 11:00 AM
🗣️ Judge Explanation Line

“The timeline ensures transparency and allows tracking of response time.”

6️⃣ FEATURE 4: CITIZEN SATISFACTION & RATING (IMPACT)
🔥 What it does

Closes the feedback loop

Makes system citizen-centric

Adds measurable impact

👤 Citizen Side (After Resolution)

Displayed only when status = Resolved

Citizen sees:

Before image

After image

Question:
“Are you satisfied with the resolution?”

Options:

✅ Satisfied

❌ Not Satisfied

⭐ Rating (1–5)

Optional text feedback

🔒 Rules

Feedback allowed only once

Feedback allowed only after Resolved

Feedback cannot be edited

🗣️ Judge Explanation Line

“Citizens validate the quality of resolution, ensuring true service completion.”

7️⃣ DATABASE / SUPABASE STRUCTURE (FINAL)
📋 reports Table (UPDATED)
id
title
description
area

latitude
longitude

before_image_url
after_image_url

status                 -- Reported | Processing | Resolved

created_at             -- Reported time
processing_at          -- When admin starts
resolved_at            -- When resolved

satisfaction_status    -- Satisfied | Not Satisfied | NULL
satisfaction_rating    -- 1–5 | NULL
feedback_text          -- Optional
8️⃣ PAGE / COMPONENT STRUCTURE (FOR KIRO)
🧩 Frontend Pages

Citizen Report Page

Submit issue

Upload before image

Pick location (map)

Admin Dashboard

Map with markers

Report list

Admin Report Detail

Before image

Timeline

Upload after image

Change status

Citizen Report Detail

Timeline

Before & after images

Satisfaction form