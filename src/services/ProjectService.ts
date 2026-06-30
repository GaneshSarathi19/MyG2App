import {
  Project,
  ProjectDocument,
  ChatMessage,
  Highlight,
} from '../api/interfaces/ProjectTypes';

const MOCK_PROJECTS: Project[] = [
  {
    id: 'prj1',
    name: 'G2 Mobile App Redesign',
    description: 'Redesigning the mobile app UI/UX with a focus on improved navigation, modern design language, and better user engagement metrics across all screens and workflows.',
    status: 'in_progress',
    deadline: '2026-08-15',
    teamMembers: 5,
    members: [
      { name: 'Rahul Sharma', role: 'Lead Developer', initials: 'RS' },
      { name: 'Priya Patel', role: 'UI/UX Designer', initials: 'PP' },
      { name: 'Ananya Gupta', role: 'Frontend Developer', initials: 'AG' },
      { name: 'Vikram Singh', role: 'Backend Developer', initials: 'VS' },
      { name: 'Neha Reddy', role: 'QA Engineer', initials: 'NR' },
    ],
    progress: 65,
    priority: 'high',
  },
  {
    id: 'prj2',
    name: 'CG-Vak Dashboard Revamp',
    description: 'Complete overhaul of the CG-Vak analytics dashboard including real-time data visualisation, export capabilities, and role-based access for all stakeholders.',
    status: 'completed',
    deadline: '2026-05-30',
    teamMembers: 3,
    members: [
      { name: 'Arun Kumar', role: 'Project Lead', initials: 'AK' },
      { name: 'Meera Nair', role: 'Product Manager', initials: 'MN' },
      { name: 'Suresh Iyer', role: 'Full Stack Developer', initials: 'SI' },
    ],
    progress: 100,
    priority: 'medium',
  },
  {
    id: 'prj3',
    name: 'Employee Self-Service Portal',
    description: 'Building a self-service portal for onboarding, leave requests, payslip downloads, and profile management with automated approval workflows and role-based dashboards.',
    status: 'in_progress',
    deadline: '2026-09-01',
    teamMembers: 4,
    members: [
      { name: 'Suman Rao', role: 'Project Manager', initials: 'SR' },
      { name: 'Karthik Menon', role: 'Backend Developer', initials: 'KM' },
      { name: 'Divya Krishnan', role: 'Frontend Developer', initials: 'DK' },
      { name: 'Rohit Joshi', role: 'UI Designer', initials: 'RJ' },
    ],
    progress: 40,
    priority: 'high',
  },
  {
    id: 'prj4',
    name: 'Synergy Analytics Platform',
    description: 'Data analytics platform providing business intelligence dashboards, predictive insights, and custom report generation for stakeholders across all departments.',
    status: 'on_hold',
    deadline: '2026-12-31',
    teamMembers: 6,
    members: [
      { name: 'Deepa Iyer', role: 'Product Owner', initials: 'DI' },
      { name: 'Ajay Nair', role: 'Data Engineer', initials: 'AN' },
      { name: 'Lakshmi Prasad', role: 'Data Scientist', initials: 'LP' },
      { name: 'Manoj Tiwari', role: 'Backend Developer', initials: 'MT' },
      { name: 'Shweta Verma', role: 'Frontend Developer', initials: 'SV' },
      { name: 'Gaurav Mehta', role: 'DevOps Engineer', initials: 'GM' },
    ],
    progress: 25,
    priority: 'low',
  },
];

const MOCK_DOCUMENTS: ProjectDocument[] = [
  {
    id: 'doc1',
    projectId: 'prj1',
    name: 'UI_UX_Design_Specs_v2.pdf',
    type: 'pdf',
    uploadDate: '2026-06-10',
    size: '4.2 MB',
    content: `G2 Mobile App Redesign - UI/UX Design Specifications v2.0

Prepared by: Priya Patel
Date: 10 June 2026
Version: 2.0

1. Design Overview
   This document outlines the design specifications for the G2 Mobile App Redesign. The primary goal is to deliver a modern, intuitive interface that improves user engagement and reduces friction in daily workflows.

2. Colour Palette
   Primary: #003C64 (Navy Blue)
   Secondary: #F86F18 (Orange)
   Accent: #FF9B50
   Background: #FFFFFF
   Surface: #F5F6F8
   Text Primary: #1A1A2E
   Text Secondary: #706B6B

   All interactive elements must use the primary colour for default states and the accent colour for hover or active states.

3. Typography
   Font Family: System (SF Pro on iOS, Roboto on Android)
   Headings: Bold, 22px
   Subheadings: Semi-Bold, 16px
   Body: Regular, 14px
   Captions: Regular, 12px

   Line height should be set to 1.5x the font size for optimal readability.

4. Component Library
   All reusable components are defined in Figma under the "G2 Mobile v2" project. Key components include:
   - Action Cards: Rounded rectangles with elevation, used for quick actions on dashboard.
   - Info Rows: Label-value pair rows used in profile and detail screens.
   - Section Cards: Grouped content containers with consistent padding and shadow.
   - Avatar Badge: Circular initials badge with optional image overlay.
   - Status Pills: Colour-coded badges for status indicators.

5. Navigation Architecture
   The app uses a native stack navigator with a custom side panel drawer. The drawer is rendered as an absolute overlay above the stack. Bottom navigation was considered but the side panel approach was chosen for consistency with the web dashboard.

6. Interaction Patterns
   - Pull-to-refresh on all list screens.
   - Swipe gestures on cards for quick actions (future scope).
   - Haptic feedback on primary actions (iOS only).
   - Loading skeletons for async content.

7. Accessibility
   - All touch targets must be at least 44x44 points.
   - Colour contrast ratios must meet WCAG AA standards (4.5:1 for normal text).
   - Screen reader labels must be provided for all icon-only buttons.`,
  },
  {
    id: 'doc2',
    projectId: 'prj1',
    name: 'User_Research_Summary.docx',
    type: 'doc',
    uploadDate: '2026-05-28',
    size: '1.8 MB',
    content: `User Research Summary - G2 Mobile App Redesign

Conducted by: Ananya Gupta
Participants: 40
Period: May 2026

Methodology
   Remote moderated usability testing and in-person interviews were conducted with 40 participants representing the target user base. Participants included employees from G2 and CG-Vak across various departments.

Key Findings

1. Navigation Complexity (82% of participants)
   The current navigation structure was identified as the single biggest friction point. Users reported difficulty finding features and switching between sections. The side panel approach received positive feedback, but users want quicker access to frequently used sections like Attendance and Snack Bar.

2. Dark Mode Demand (68% of participants)
   A significant majority expressed the need for a dark mode option, especially for evening usage. This matches industry trends and should be prioritised in the Q3 roadmap.

3. Gesture-Based Interactions (57% of participants)
   Users familiar with modern apps expressed a preference for gesture-based navigation over button-heavy interfaces. Swipe-to-go-back and swipe-to-delete were the most requested gestures.

4. Performance Concerns (45% of participants)
   Screen transition lag and slow data loading were noted as pain points. Optimising API response times and implementing skeleton loading states were the most requested improvements.

5. Feature Requests
   - Biometric authentication (fingerprint / face ID)
   - Offline access to payslips and holiday calendar
   - In-app chat with HR and IT support
   - Customisable dashboard widgets

Recommendations
   - Simplify the navigation to reduce the depth of menu hierarchy.
   - Implement dark mode as a high-priority feature.
   - Introduce gesture-based interactions where appropriate.
   - Optimise screen transition animations.
   - Consider an in-app messaging feature for internal communication.`,
  },
  {
    id: 'doc3',
    projectId: 'prj1',
    name: 'Sprint_Plan_Q3_2026.xlsx',
    type: 'spreadsheet',
    uploadDate: '2026-06-01',
    size: '980 KB',
    content: `Sprint Plan Q3 2026 - G2 Mobile App Redesign

Sprint 1 (Jul 1 - Jul 14)
   Focus: Authentication & Profile
   - Login screen UI updates
   - Biometric authentication integration
   - Profile screen redesign
   - Avatar upload functionality
   Team: Rahul, Priya

Sprint 2 (Jul 15 - Jul 28)
   Focus: Dashboard & Notifications
   - Dashboard widget redesign
   - Quick actions grid updates
   - Notification centre improvements
   - Pull-to-refresh implementation
   Team: Rahul, Ananya, Vikram

Sprint 3 (Jul 29 - Aug 11)
   Focus: Snack Bar & Settings
   - Snack Bar wallet UI overhaul
   - Menu browsing and ordering flow
   - Settings screen redesign
   - Dark mode toggle
   Team: Ananya, Vikram

Sprint 4 (Aug 12 - Aug 25)
   Focus: QA & Bug Fixes
   - Cross-platform regression testing
   - Performance optimisation
   - Accessibility audit
   - Final UAT sign-off
   Team: All members

Sprint 5 (Aug 26 - Aug 31)
   Focus: Release
   - App store submission preparation
   - Release notes documentation
   - Post-release monitoring
   Team: All members`,
  },
  {
    id: 'doc4',
    projectId: 'prj2',
    name: 'Dashboard_Architecture_Diagram.png',
    type: 'image',
    uploadDate: '2026-04-15',
    size: '2.1 MB',
    content: `CG-Vak Dashboard Revamp - Architecture Overview

Layers

   Presentation Layer
   - React components for each dashboard widget
   - Reusable chart components (bar, line, pie)
   - Real-time data indicators
   - Responsive grid layout system

   State Management Layer
   - Redux store for global application state
   - Redux slices for each data domain
   - Middleware for API call handling
   - Persisted state for offline access

   Service Layer
   - REST API client with Axios
   - WebSocket connections for real-time updates
   - Data transformation utilities
   - Cache management for frequently accessed data

   Data Layer
   - Backend API endpoints
   - Real-time data streams via WebSocket
   - Local storage for offline support

Data Flow
   User Interaction -> Component Event -> Redux Action -> API Call -> Response -> Redux Reducer -> Component Re-render

Integration Points
   - Employee Master API for user data
   - Attendance API for check-in logs
   - Leave Management API
   - Snack Bar Wallet API
   - Holiday Calendar API`,
  },
  {
    id: 'doc5',
    projectId: 'prj2',
    name: 'Final_Deployment_Report.pdf',
    type: 'pdf',
    uploadDate: '2026-05-30',
    size: '3.5 MB',
    content: `Final Deployment Report - CG-Vak Dashboard Revamp

Deployment Date: 30 May 2026
Status: SUCCESS

Pre-Deployment Checklist
   [x] All unit tests passing (247 / 247)
   [x] Integration tests passing (56 / 56)
   [x] Accessibility audit completed (WCAG AA compliant)
   [x] Performance benchmarks verified
   [x] Security scan completed (0 critical, 2 low)
   [x] Database migrations applied
   [x] Rollback procedures documented

Performance Benchmarks
   Metric                Before          After
   Page Load Time       3.2s            1.1s
   Time to Interactive  4.5s            1.8s
   API Response Time    850ms           320ms
   Memory Usage         180MB           120MB

Rollback Procedure
   In case of critical issues, the following rollback steps should be executed:
   1. Revert the deployment tag to v1.8.3
   2. Run database rollback migration
   3. Verify all services are operational
   4. Notify stakeholders via email

Sign-Off
   Arun Kumar (Lead)          - Approved
   Meera Nair (Product)       - Approved
   Client Representative      - Approved`,
  },
  {
    id: 'doc6',
    projectId: 'prj3',
    name: 'Portal_Requirements_v1.pdf',
    type: 'pdf',
    uploadDate: '2026-06-05',
    size: '2.7 MB',
    content: `Employee Self-Service Portal - Requirements Document v1.0

1. Purpose
   The Employee Self-Service Portal aims to provide employees with a centralised platform to manage their HR-related tasks without manual intervention from the HR team.

2. Functional Requirements

   2.1 Leave Management
   - Apply for leave with type selection (sick, casual, annual, personal)
   - Upload supporting documents for medical leave
   - View leave balance and history
   - Cancel pending leave requests
   - Approval chain: Team Lead -> Manager -> HR

   2.2 Payslip Downloads
   - View and download monthly payslips (PDF format)
   - View payslip history for the last 12 months
   - Request duplicate payslips for previous employment years

   2.3 Profile Management
   - Edit personal details (address, phone, email)
   - Update emergency contact information
   - Upload and change profile picture
   - View employment history and documents

   2.4 Onboarding Workflows
   - New hire document submission (PAN, Aadhaar, bank details)
   - Policy acknowledgment and digital signing
   - IT asset request (laptop, accessories)
   - Orientation schedule view

   2.5 Admin Dashboard
   - Pending approval requests view
   - Bulk action support for leave approvals
   - Employee search and filter
   - Report generation and export (CSV, PDF)

3. Non-Functional Requirements
   - 99.9% uptime during business hours (9 AM - 6 PM)
   - Page load time under 2 seconds
   - Support for 500 concurrent users
   - Data encryption at rest and in transit`,
  },
  {
    id: 'doc7',
    projectId: 'prj4',
    name: 'Analytics_Platform_Proposal.pptx',
    type: 'presentation',
    uploadDate: '2026-05-20',
    size: '5.1 MB',
    content: `Synergy Analytics Platform - Stakeholder Proposal

Proposed Tech Stack
   Frontend: React with TypeScript, Recharts for visualisation
   Backend: Node.js with Express, Python for data processing
   Database: PostgreSQL (primary), Redis (cache), ClickHouse (analytics)
   Infrastructure: AWS EC2, S3, Lambda, CloudWatch

Implementation Roadmap

Phase 1 (Q3 2026)
   - Data pipeline setup and ETL processes
   - Basic dashboard with key metrics
   - User authentication and role-based access

Phase 2 (Q4 2026)
   - Advanced visualisations and drill-down capabilities
   - Custom report builder
   - Export to PDF and Excel

Phase 3 (Q1 2027)
   - Predictive analytics using ML models
   - Automated alerting and notifications
   - Integration with existing data sources

Resource Estimates
   - 3 backend developers
   - 2 frontend developers
   - 1 data engineer
   - 1 QA engineer
   - 1 project manager

Budget Estimate: $450,000 - $550,000

Projected ROI
   Year 1: 15% reduction in reporting time
   Year 2: 30% improvement in data-driven decision making
   Year 3: Full ROI realisation with operational cost savings`,
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'chat1', projectId: 'prj1', senderName: 'Rahul Sharma', senderInitials: 'RS', message: 'Team, I have pushed the latest UI changes to the develop branch. Please pull and review.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'chat2', projectId: 'prj1', senderName: 'Priya Patel', senderInitials: 'PP', message: 'Looks good overall. The navigation drawer animation needs a bit of smoothing though.', timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString() },
  { id: 'chat3', projectId: 'prj1', senderName: 'Rahul Sharma', senderInitials: 'RS', message: 'Agreed. I will adjust the easing curve and push a fix by EOD.', timestamp: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString() },
  { id: 'chat4', projectId: 'prj1', senderName: 'Ananya Gupta', senderInitials: 'AG', message: 'The snack bar wallet section is ready for integration testing whenever you are.', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'chat5', projectId: 'prj1', senderName: 'Vikram Singh', senderInitials: 'VS', message: 'I will start the integration tomorrow morning. Please share the API contracts.', timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString() },
  { id: 'chat6', projectId: 'prj1', senderName: 'Priya Patel', senderInitials: 'PP', message: 'Sprint retrospective is scheduled for Friday at 3 PM. Please come prepared.', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'chat7', projectId: 'prj2', senderName: 'Arun Kumar', senderInitials: 'AK', message: 'Dashboard deployment is complete. All services are green.', timestamp: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'chat8', projectId: 'prj2', senderName: 'Meera Nair', senderInitials: 'MN', message: 'Excellent work everyone. The client has confirmed sign-off.', timestamp: new Date(Date.now() - 86400000 * 30 + 3600000).toISOString() },
  { id: 'chat9', projectId: 'prj3', senderName: 'Suman Rao', senderInitials: 'SR', message: 'I have drafted the requirements document. Please review when you get a chance.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'chat10', projectId: 'prj3', senderName: 'Karthik Menon', senderInitials: 'KM', message: 'Will review by tomorrow. The onboarding workflow section needs more detail on approval routing.', timestamp: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString() },
  { id: 'chat11', projectId: 'prj4', senderName: 'Deepa Iyer', senderInitials: 'DI', message: 'The platform proposal has been submitted to the steering committee.', timestamp: new Date(Date.now() - 86400000 * 9).toISOString() },
];

const MOCK_HIGHLIGHTS: Highlight[] = [
  { id: 'hl1', projectId: 'prj1', title: 'Client Feedback: Colour Palette', description: 'Client requested softer primary colour tones. Suggested switching from navy #003C64 to a slightly lighter shade for better accessibility.', type: 'feedback', date: '2026-06-25', author: 'Priya Patel' },
  { id: 'hl2', projectId: 'prj1', title: 'Reminder: Accessibility Audit', description: 'Schedule WCAG compliance audit before the UAT phase. Must ensure contrast ratios meet AA standards across all screens.', type: 'reminder', date: '2026-07-01', author: 'Rahul Sharma' },
  { id: 'hl3', projectId: 'prj1', title: 'Design Pointer: Bottom Navigation', description: 'Consider using a bottom navigation bar instead of a side drawer for quicker access to primary sections on mobile.', type: 'pointer', date: '2026-06-20', author: 'Ananya Gupta' },
  { id: 'hl4', projectId: 'prj3', title: 'Stakeholder Feedback: Leave Workflow', description: 'HR wants the leave approval chain to include team lead, then manager, then HR. Update the workflow diagram accordingly.', type: 'feedback', date: '2026-06-27', author: 'Suman Rao' },
  { id: 'hl5', projectId: 'prj4', title: 'Reminder: Budget Approval Deadline', description: 'Proposal budget needs final approval by July 15. Follow up with finance team if no response by July 5.', type: 'reminder', date: '2026-07-03', author: 'Deepa Iyer' },
];

export const ProjectService = {
  getProjects: (): Project[] => MOCK_PROJECTS,
  getProjectById: (id: string): Project | undefined =>
    MOCK_PROJECTS.find((p) => p.id === id),
  getDocuments: (projectId: string): ProjectDocument[] =>
    MOCK_DOCUMENTS.filter((d) => d.projectId === projectId),
  getHighlights: (projectId: string): Highlight[] =>
    MOCK_HIGHLIGHTS.filter((h) => h.projectId === projectId),
};
