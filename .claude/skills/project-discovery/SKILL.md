---
name: project-discovery
description: Interactive project discovery interview that generates a launch prompt and SPEC.md for new software projects. Use when the user says "new project", "I have an idea", "let's build", "project discovery", "help me plan a project", "brainstorm an app", or describes a software product they want to build. Interviews the user about their idea, users, business model, UX, and technical approach, then generates downloadable SPEC.md and a Claude Code launch prompt as files.
---

# Project Discovery

You are running an interactive product discovery interview inside Claude.ai. Your job is to ask smart questions one at a time, gather everything needed to define the project, then generate two downloadable files the user will place in their new project folder.

## How This Works in Claude.ai

This is a CONVERSATIONAL skill. You are chatting with the user in Claude.ai (web/mobile). The workflow is:

1. The user mentions an idea or says "new project"
2. You run the interview — ONE question at a time, conversationally
3. After 10-15 questions, you summarize and ask the user to confirm
4. Once confirmed, you CREATE TWO FILES using the computer tool:
   - `SPEC.md` — Product spec with features, user stories, MVP scope
   - `LAUNCH_PROMPT.md` — Ready-to-paste prompt for Claude Code terminal
5. You present both files for download

The user then takes these files, drops them into a new project folder alongside their CLAUDE.md template and .claude/skills/ from the Awasero Claude Toolkit, opens Claude Code, and pastes the launch prompt.

## Interview Rules

- **ONE question at a time.** Never stack multiple questions. Wait for the answer.
- **Be conversational.** Don't say "Phase 2: The Users." Just flow naturally.
- **Adapt.** Skip questions that don't apply based on previous answers.
- **Challenge assumptions.** Gently push back on complexity. "Do you really need auth for the MVP?" "Could we skip the admin panel for v1?"
- **Bias toward lean.** The goal is the smallest thing that proves the idea works.
- **Don't number your questions out loud.** The user shouldn't feel like they're filling out a form.
- **Use follow-ups.** If an answer is vague, dig deeper before moving on.

## Interview Flow

### Phase 1: The Idea (3-4 questions)

Start with:
> "What's the idea? Give me the elevator pitch — who is it for and what problem does it solve?"

Then cover:
- **Why now?** What's driving this — validated demand, personal pain point, market opportunity?
- **Business model** — How does it make money? SaaS, marketplace, freemium, internal tool? (If unclear, that's fine — note it as an open question)
- **Competition** — Only ask if they didn't mention it: "Who else is solving this? What makes yours different?"

Listen for: target user, core problem, urgency, revenue model, differentiation.

### Phase 2: The Users (3-4 questions)

Cover:
- **User types** — "Who are the different types of users? Is there an admin and an end user? A buyer and a seller?"
- **Core journey** — "Walk me through the #1 thing your main user does. Step by step — from opening the app to getting the value they came for." This is the most important question. Push for specifics.
- **Retention** — "What brings them back a second time?"
- **Auth** — Only if the journey implies accounts: "Do users need accounts, or could this work without login for the MVP?" Challenge gently.

Listen for: roles, permissions, the critical path, the "aha moment," retention hooks.

### Phase 3: The Product (3-4 questions)

Cover:
- **Feature dump** — "Give me ALL the features you're imagining — don't filter yourself. I'll help prioritize after." Let them brain-dump. Don't push back yet.
- **MVP cut** — After the dump, YOU propose the cut: "Here's what I'd put in the MVP: [list]. Everything else goes to V2. Does that feel right, or is something I cut actually essential?" Be aggressive — the MVP should be the minimum that delivers the core journey.
- **UX feel** — "What should this feel like to use? Fast and minimal? Polished and premium? Playful? Data-dense and powerful?" This drives design decisions.
- **Integrations** — Only if relevant: "Does this need to connect to anything external? Payments, email, social login, third-party APIs?"

Listen for: feature scope, what's truly essential vs. nice-to-have, aesthetic direction, external dependencies.

### Phase 4: The Tech (2-3 questions)

Cover:
- **Stack preference** — "Do you have a stack in mind, or want me to recommend one based on what we discussed?" If recommending, use `references/stack-decision-tree.md` logic.
- **Deployment** — "Where should this live? Vercel, AWS, Fly.io, or existing infrastructure?"
- **Database** — Only if the product needs persistent data: "What kind of data are we storing? Users, content, transactions?"

Listen for: tech constraints, hosting preferences, data complexity.

## After the Interview

### Step 1: Summarize

Present a 5-7 bullet summary of what you heard. Example:

> "Here's what I've got:
> - **Product**: An invoice tool for freelancers that reduces time-to-payment
> - **Users**: Freelancers (primary) and their clients (view/pay only)
> - **Core flow**: Create invoice from template → send via email → client pays via Stripe link
> - **MVP**: Invoice creation, email sending, Stripe payment link, basic dashboard
> - **V2**: Recurring invoices, expense tracking, tax reports
> - **Stack**: Next.js + Supabase + Stripe, deployed on Vercel
> - **Feel**: Clean and minimal
>
> Does this capture it? Anything I'm missing or got wrong?"

**Wait for confirmation before generating files.**

### Step 2: Generate Files

Once confirmed, use the computer tool to create both files and present them for download.

#### SPEC.md Structure:

```markdown
# [Project Name] — Product Spec

## Overview
[2-3 sentence summary: what it is, who it's for, what problem it solves]

## Business Model
[How it makes money or measures success]

## Users

### [User Type 1]
- **Description**: [who they are]
- **Goal**: [what they want to accomplish]
- **Key actions**: [what they do in the app]

### [User Type 2]
(repeat as needed)

## User Stories — MVP

### Core Flow
- As a [user], I want to [action] so that [outcome]
(5-10 stories covering the critical path)

### Supporting
- As a [user], I want to [action] so that [outcome]
(3-5 stories for essential supporting features)

## Features

### MVP (v1.0)
| Feature | Description | Priority |
|---------|------------|----------|
| [name]  | [what it does] | Must have |

### V2 (post-launch)
| Feature | Description |
|---------|------------|
| [name]  | [what it does] |

## UX Direction
- **Feel**: [fast/minimal, polished/premium, playful, data-dense]
- **Key screens**: [list the 3-5 main screens/pages]

## Technical Decisions
- **Stack**: [framework, language, database, hosting]
- **Auth**: [approach or "none for MVP"]
- **Integrations**: [external services]

## MVP Scope Boundary
**In scope**: [clear list]
**Out of scope**: [what we're NOT building yet]

## Open Questions
- [unresolved items]
```

#### LAUNCH_PROMPT.md Structure:

This is the text the user pastes into Claude Code. It must be completely self-contained.

```markdown
I'm building [PROJECT NAME] — [one-line description].

## What This Is
[2-3 sentences: who it's for, what it solves, business model]

## Tech Stack
- [Framework + version]
- [Language]
- [Database + ORM]
- [Auth approach]
- [Hosting target]
- [CSS approach]

## MVP Features (build these, nothing else)
1. [Feature]: [brief description]
2. [Feature]: [brief description]
3. [Feature]: [brief description]

## Core User Flow
[Step-by-step of the main user journey — this is what to build FIRST]

## Users & Roles
- [Role 1]: [what they can do]
- [Role 2]: [what they can do]

## UX Direction
[Feel + key screens]

## Integrations
- [Service]: [what for]
(or "None for MVP")

## NOT Building (V2)
- [Excluded feature 1]
- [Excluded feature 2]

## Build Instructions
1. Read SPEC.md and CLAUDE.md in this project root
2. Set up the project with the stack above
3. Install only essential dependencies
4. Build the core user flow first: [the critical path]
5. Follow the skills in .claude/skills/ for code quality and design
6. After the core flow works, build supporting features in this order: [ordered list]
7. Write tests for critical paths as you go
```

### Step 3: Present Files

Create both files using the computer tool and present them for download. Keep the closing message short:

> "Here are your two files. Drop them in your new project folder alongside your CLAUDE.md and .claude/skills/ from the toolkit, then paste the launch prompt into Claude Code."

---

## Examples

### Example: User says "I want to build a tool for comparing peptide prices"

The interview would cover:
- Who uses it (consumers researching compounded medications)
- Core flow (search compound → see price comparisons → link to provider)
- Business model (affiliate commissions or advertising)
- MVP cut (comparison engine + 3-5 providers, skip user accounts)
- Stack recommendation (Next.js + Vercel, maybe no database for v1 if data is static)

### Example: User says "I need an AI meeting scheduler"

The interview would dig into:
- User types (meeting organizer + invitees)
- Core flow (create meeting → share availability → auto-find time)
- Integrations (Google Calendar, Outlook — critical for MVP)
- Auth (needed — OAuth for calendar access)
- Business model (freemium SaaS)
