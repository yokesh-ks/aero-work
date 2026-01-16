# Aero Work - Product Requirements Document

## Executive Summary

Aero Work is a desktop application designed to enhance developer productivity by providing a centralized interface for managing and orchestrating AI coding agents. As AI-assisted development becomes increasingly prevalent, developers need better tools to plan, review, and coordinate tasks across multiple AI agents. Aero Work addresses this need with an intuitive Kanban-based workflow management system.

---

## Problem Statement

Modern software engineers are spending more time orchestrating AI coding agents rather than writing code directly. Current challenges include:

- **Fragmented Workflows**: Switching between multiple AI coding agents is cumbersome
- **Lack of Visibility**: No centralized view of ongoing AI-assisted tasks
- **Coordination Difficulties**: Running multiple agents in parallel requires manual management
- **Review Overhead**: Reviewing AI-generated code changes is scattered across tools
- **Configuration Complexity**: Managing MCP (Model Context Protocol) configs across agents

---

## Product Vision

Aero Work empowers developers to become 10X more productive by providing a unified command center for AI-assisted software development.

---

## Target Users

### Primary Users
- **Software Engineers** using AI coding assistants (Claude Code, Gemini CLI, Codex, Amp, etc.)
- **Tech Leads** managing AI-assisted development workflows
- **Solo Developers** looking to maximize productivity with AI tools

### User Personas

**Alex - Full Stack Developer**
- Uses multiple AI coding agents daily
- Needs to track tasks assigned to different agents
- Wants quick code review capabilities

**Sam - Engineering Manager**
- Oversees AI-assisted development across teams
- Needs visibility into task progress
- Requires centralized configuration management

---

## Core Features

### 1. Kanban Task Management (GitHub Issues)

**Description**: Visual Kanban board for managing development tasks, powered by GitHub Issues as the backend storage.

**Requirements**:
- Multiple customizable columns mapped to GitHub Issue labels/states (Backlog, In Progress, Review, Done)
- Drag-and-drop task cards between columns (syncs with GitHub)
- Task filtering and search capabilities
- GitHub labels as tags for categorization
- Task priority indicators via GitHub labels
- Assignee tracking (which AI agent is working on what)
- Two-way sync with GitHub Issues
- Create tasks directly as GitHub Issues
- Support for GitHub Issue templates

**Acceptance Criteria**:
- Users can create, edit, and delete tasks (reflected in GitHub Issues)
- Tasks can be moved between columns via drag-and-drop (updates GitHub Issue state/labels)
- Tasks support markdown descriptions (GitHub-flavored markdown)
- Real-time status updates when agents complete work
- Changes made in GitHub are reflected in the Kanban board
- Offline queue for changes when GitHub is unavailable

---

### 2. Multi-Agent Orchestration

**Description**: Support for multiple AI coding agents with ability to run tasks in parallel or sequence.

**Requirements**:
- Integration with popular AI coding agents:
  - Claude Code
  - Gemini CLI
  - OpenAI Codex
  - Amp
  - Other compatible agents
- Agent availability indicators
- Parallel execution mode (multiple agents working simultaneously)
- Sequential execution mode (ordered task execution)
- Agent-specific configuration profiles

**Acceptance Criteria**:
- Users can configure and switch between agents
- System displays agent availability status
- Tasks can be assigned to specific agents
- Multiple agents can execute tasks concurrently

---

### 3. Code Review & Diff Viewer

**Description**: Built-in interface for reviewing AI-generated code changes.

**Requirements**:
- Side-by-side diff view
- Unified diff view
- Syntax highlighting for all major languages
- File tree navigation for multi-file changes
- Accept/reject change functionality
- Inline commenting capabilities

**Acceptance Criteria**:
- Users can view all code changes made by agents
- Diff viewer supports 50+ programming languages
- Changes can be accepted or rejected individually
- Users can switch between diff view modes

---

### 4. Project Management (GitHub-Linked)

**Description**: Organize work across multiple projects, each linked to a GitHub repository for task and code management.

**Requirements**:
- Project creation requires GitHub repository linking
- GitHub OAuth authentication for repository access
- Support for both public and private repositories
- Project-level settings and preferences
- Quick project switching
- Recent projects list
- Project search functionality
- Automatic sync of GitHub repository metadata
- Branch management and visibility

**Acceptance Criteria**:
- Users must link a GitHub repository when creating a new project
- GitHub authentication flow (OAuth) is seamless
- Each project's Kanban board reflects issues from linked GitHub repo
- Projects support both personal repos and organization repos
- Project settings persist across sessions
- Users can unlink/relink GitHub repositories

---

### 5. Dev Server Management

**Description**: Start and monitor development servers directly from the application.

**Requirements**:
- One-click dev server start/stop
- Console output streaming
- Port management
- Server status indicators
- Multiple server support per project

**Acceptance Criteria**:
- Users can start dev servers from task context
- Server logs are visible in real-time
- Server status is clearly indicated
- Multiple servers can run simultaneously

---

### 6. MCP Configuration Center

**Description**: Centralized management of Model Context Protocol configurations.

**Requirements**:
- Visual MCP config editor
- Config templates for common setups
- Per-project MCP overrides
- Config validation
- Import/export functionality

**Acceptance Criteria**:
- Users can create and edit MCP configs
- Configs can be applied per-agent or per-project
- Invalid configs show validation errors
- Configs can be shared/exported

---

### 7. Remote Development Support

**Description**: Support for remote development environments via SSH.

**Requirements**:
- SSH connection configuration
- Remote project opening in local IDE (VSCode)
- Remote path mapping
- Connection status monitoring
- SSH key management

**Acceptance Criteria**:
- Users can configure SSH remote hosts
- Projects can be opened remotely in VSCode
- Connection status is displayed
- Supports standard SSH authentication methods

---

## Technical Architecture

### Overview

Aero Work follows a modern desktop application architecture with a Rust backend for performance and reliability, combined with a React-based frontend for a responsive user experience.

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Shell                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   React Frontend    │    │      Rust Backend           │ │
│  │                     │    │                             │ │
│  │  - UI Components    │◄──►│  - API Server (Axum)        │ │
│  │  - State (Zustand)  │    │  - Database (SQLite)        │ │
│  │  - Routing          │    │  - Agent Executors          │ │
│  │  - Real-time Updates│    │  - Git Operations           │ │
│  │                     │    │  - File System              │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| TailwindCSS | Styling |
| Radix UI | Accessible component primitives |
| shadcn/ui | Component library |
| Zustand | State management |
| TanStack Query | Server state & GitHub API caching |
| React Router | Client-side routing |
| @dnd-kit | Drag and drop functionality |
| Octokit | GitHub API client |
| Lexical | Rich text editing |
| Framer Motion | Animations |
| i18next | Internationalization |

### Backend Stack

| Technology | Purpose |
|------------|---------|
| Rust | Systems programming language |
| Axum | Web framework |
| Tokio | Async runtime |
| SQLite/SQLx | Database & ORM |
| git2 | Git operations |
| Serde | Serialization |
| Tower | HTTP middleware |

### Desktop Shell

| Technology | Purpose |
|------------|---------|
| Electron | Cross-platform desktop wrapper |
| electron-builder | Application packaging |

### Data Storage

- **GitHub Issues**: Primary storage for all tasks (synced via GitHub API)
- **GitHub Labels**: Task categorization, status, and priority
- **Local SQLite Database**: Projects metadata, settings, agent configurations, offline cache
- **File System**: Project files, logs, temporary data
- **Git Integration**: Version control operations via libgit2

### GitHub Integration

```
┌─────────────────────────────────────────────────────────────┐
│                     Aero Work                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │   Kanban Board      │◄───────►│    GitHub API       │   │
│  │                     │  sync   │                     │   │
│  │  - Task Cards       │         │  - Issues           │   │
│  │  - Columns          │         │  - Labels           │   │
│  │  - Filters          │         │  - Milestones       │   │
│  └─────────────────────┘         │  - Pull Requests    │   │
│                                  └─────────────────────┘   │
│  ┌─────────────────────┐                                   │
│  │   Local Cache       │                                   │
│  │   (SQLite)          │  ← Offline support & fast reads   │
│  └─────────────────────┘                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**GitHub API Integration**:
| Feature | GitHub API Endpoint |
|---------|---------------------|
| Create Task | `POST /repos/{owner}/{repo}/issues` |
| Update Task | `PATCH /repos/{owner}/{repo}/issues/{issue_number}` |
| List Tasks | `GET /repos/{owner}/{repo}/issues` |
| Add Labels | `POST /repos/{owner}/{repo}/issues/{issue_number}/labels` |
| Get Comments | `GET /repos/{owner}/{repo}/issues/{issue_number}/comments` |
| Link PR | `GET /repos/{owner}/{repo}/pulls` |

---

## Project Structure

```
aero-work/
├── apps/
│   └── desktop/              # Electron application
│       ├── src/
│       │   ├── main/         # Electron main process
│       │   ├── preload/      # Preload scripts
│       │   └── renderer/     # React frontend
│       │       ├── components/
│       │       ├── contexts/
│       │       ├── hooks/
│       │       ├── pages/
│       │       ├── stores/
│       │       ├── types/
│       │       └── utils/
│       └── electron.vite.config.ts
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── utils/                # Shared utilities
│   └── types/                # Shared TypeScript types
├── crates/                   # Rust backend (future)
│   ├── server/               # HTTP API server
│   ├── db/                   # Database operations
│   ├── executors/            # Agent execution logic
│   ├── services/             # Business logic
│   └── utils/                # Rust utilities
├── scripts/                  # Build & dev scripts
└── memory/                   # Project documentation
```

---

## User Interface Design

### Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────┐  Aero Work                        [Settings] [User] │
│  │Logo │  Project: my-app                                    │
├──┴─────┴─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────────────────────────────────────┐│
│ │          │ │                                              ││
│ │ Sidebar  │ │              Main Content Area               ││
│ │          │ │                                              ││
│ │ Projects │ │  ┌─────────┐ ┌─────────┐ ┌─────────┐        ││
│ │ Tasks    │ │  │ Backlog │ │   WIP   │ │  Done   │        ││
│ │ Agents   │ │  │         │ │         │ │         │        ││
│ │ Settings │ │  │  [Card] │ │  [Card] │ │  [Card] │        ││
│ │          │ │  │  [Card] │ │  [Card] │ │         │        ││
│ │          │ │  │  [Card] │ │         │ │         │        ││
│ │          │ │  └─────────┘ └─────────┘ └─────────┘        ││
│ │          │ │                                              ││
│ └──────────┘ └──────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│  Status: 3 agents connected │ Server: Running │ v1.0.0       │
└──────────────────────────────────────────────────────────────┘
```

### Key Screens

1. **Dashboard/Kanban Board** - Primary task management view
2. **Task Detail Panel** - Slide-out panel for task details, logs, and diffs
3. **Project Selector** - Quick project switching modal
4. **Settings** - Application and agent configuration
5. **Agent Configuration** - Per-agent setup and status
6. **Code Review** - Diff viewer for reviewing changes

### Design Principles

- **Dark-first Design**: Optimized for extended coding sessions
- **Keyboard-centric**: Full keyboard navigation support
- **Information Density**: Show relevant information without clutter
- **Real-time Updates**: Immediate feedback on task status changes
- **Responsive Panels**: Resizable panels for flexible workflows

---

## Non-Functional Requirements

### Performance
- Application startup: < 3 seconds
- Task operations: < 100ms response time
- Support 1000+ tasks per project
- Smooth animations at 60fps

### Reliability
- Offline-first architecture
- Automatic data persistence
- Crash recovery with state restoration
- Graceful degradation when agents unavailable

### Security
- Local-only data storage (no cloud sync in v1)
- Secure credential storage for SSH keys
- No telemetry without explicit consent
- API key encryption at rest

### Compatibility
- macOS 12+ (Apple Silicon & Intel)
- Windows 10/11
- Ubuntu 20.04+ / Debian 11+

---

## Release Milestones

### v1.0.0 - Foundation
- Basic Kanban board with GitHub Issues integration
- GitHub OAuth authentication
- Project creation with mandatory GitHub repo linking
- Single agent support (Claude Code)
- Local SQLite cache for offline support
- macOS support

### v1.1.0 - Multi-Agent
- Multiple agent integrations
- Parallel execution
- Agent availability indicators
- Windows support

### v1.2.0 - Code Review
- Diff viewer
- Accept/reject changes
- Conversation history

### v1.3.0 - Advanced Features
- MCP configuration center
- Remote SSH support
- Linux support
- Dev server management

### v2.0.0 - Collaboration (Future)
- Team features
- Cloud sync (optional)
- Shared configurations

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Daily Active Users | 10,000+ within 6 months |
| Task Completion Rate | 85%+ of created tasks completed |
| Agent Utilization | 70%+ time agents are actively working |
| User Retention (30-day) | 60%+ |
| App Store Rating | 4.5+ stars |

---

## Appendix

### Glossary

- **MCP**: Model Context Protocol - standardized way for AI models to interact with external tools
- **Agent**: An AI coding assistant that can execute development tasks
- **Executor**: Backend service that manages agent processes
- **Worktree**: Git feature for multiple working directories from same repo
- **GitHub Issue**: A trackable piece of work in a GitHub repository, used as the primary task storage
- **GitHub OAuth**: Authentication protocol for secure access to GitHub repositories
- **Octokit**: Official GitHub API client library for JavaScript/TypeScript

### References

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [Octokit.js](https://github.com/octokit/octokit.js)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Axum Framework](https://github.com/tokio-rs/axum)
- [TanStack Query](https://tanstack.com/query)

---

*Document Version: 1.1*
*Last Updated: January 2025*
*Author: Aero Work Team*
