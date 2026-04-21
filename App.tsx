import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ViewState, UserRole, Invoice, Organization, Project, Task, User, TaskStatus, Proposal, ProposalStatus, SupportTicket, DriveItem } from './types';
import { ProposalBuilder } from './components/ProposalBuilder';
import { OperationsHub } from './components/OperationsHub';
import { InvoiceSystem } from './components/InvoiceSystem';
import { SupportBot } from './components/SupportBot';
import { UserManagement } from './components/UserManagement';
import { SupportCenter } from './components/SupportCenter';
import { MarketingStrategist } from './components/MarketingStrategist';
import { CommunicationHub } from './components/CommunicationHub';
import { 
  LayoutDashboard, 
  FileEdit, 
  CreditCard, 
  Briefcase, 
  BarChart, 
  Settings, 
  Bell, 
  UserCircle,
  LogOut,
  Menu,
  Users,
  CheckCircle,
  FileText,
  Plus,
  Clock,
  ShieldAlert,
  LifeBuoy,
  Ban,
  MessageSquare,
  AlertCircle,
  Zap,
  Phone,
  PenTool,
  Activity,
  Server,
  Database,
  TrendingUp,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';

// ... (INITIAL_DRIVE_ITEMS const remains the same)
const INITIAL_DRIVE_ITEMS: DriveItem[] = [
    // ROOT FOLDERS
    { id: '1', parentId: null, name: 'Brand Assets', type: 'folder', updatedAt: '2023-10-25' },
    { id: '2', parentId: null, name: 'Legal Documents', type: 'folder', updatedAt: '2023-10-22' },
    { id: '3', parentId: null, name: 'Project Intake Forms', type: 'folder', updatedAt: '2023-10-24' },
    
    // ROOT FILES
    { 
        id: '4', 
        parentId: null, 
        name: 'Client_Logins_Master.xlsx', 
        type: 'spreadsheet', 
        size: '15 KB', 
        updatedAt: '2023-10-20', 
        tags: ['sensitive'],
        content: [
            { platform: 'Wordpress Admin', url: 'https://site.com/wp-admin', username: 'admin_refiniti', password: 'secure_password_123', notes: 'Main CMS access' },
            { platform: 'Google Analytics', url: 'https://analytics.google.com', username: 'marketing@client.com', password: 'shared_access_2024', notes: 'View only' },
            { platform: 'Meta Business Suite', url: 'https://business.facebook.com', username: 'social@client.com', password: 'fb_ads_manager_key', notes: 'Ad account ID: 123456789' },
            { platform: 'Mailchimp', url: 'https://mailchimp.com', username: 'newsletter@client.com', password: 'email_blast_key_99', notes: '2FA enabled' },
            { platform: 'Stripe Dashboard', url: 'https://dashboard.stripe.com', username: 'billing@client.com', password: 'finance_key_secure', notes: 'Finance team only' },
        ]
    },
    
    // BRAND ASSETS CONTENT
    { id: '11', parentId: '1', name: 'Logo_Pack_Vector.zip', type: 'file', size: '24 MB', updatedAt: '2023-10-25' },
    { id: '12', parentId: '1', name: 'Brand_Guidelines_V2.pdf', type: 'file', size: '4.2 MB', updatedAt: '2023-10-25' },
    { id: '13', parentId: '1', name: 'Social_Media_Kit', type: 'folder', updatedAt: '2023-10-26' },

    // SOCIAL MEDIA KIT CONTENT
    { id: '131', parentId: '13', name: 'Instagram_Templates.psd', type: 'file', size: '120 MB', updatedAt: '2023-10-26' },
    { id: '132', parentId: '13', name: 'LinkedIn_Banners.ai', type: 'file', size: '45 MB', updatedAt: '2023-10-26' },

    // LEGAL CONTENT
    { id: '21', parentId: '2', name: 'MSA_Signed.pdf', type: 'file', size: '1.2 MB', updatedAt: '2023-09-15' },
    { id: '22', parentId: '2', name: 'NDA_Executed.pdf', type: 'file', size: '850 KB', updatedAt: '2023-09-10' },

    // INTAKE CONTENT
    { id: '31', parentId: '3', name: 'Q4_Marketing_Brief.docx', type: 'file', size: '24 KB', updatedAt: '2023-10-24' },
    { id: '32', parentId: '3', name: 'Website_Requirements.pdf', type: 'file', size: '1.5 MB', updatedAt: '2023-10-24' },
    { id: '33', parentId: '3', name: 'User_Personas.pdf', type: 'file', size: '2.1 MB', updatedAt: '2023-10-23' },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Notification Settings State
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
      proposals: true,
      invoices: true,
      tasks: true,
      tickets: true
  });

  // Refs for click outside
  const notificationRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
              setShowNotifications(false);
          }
          if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
              setShowQuickActions(false);
          }
          if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
              setShowProfileSettings(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper for dates
  const getFutureDate = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
  }

  // --- DATA STATE ---
  
  // Drive State (Lifted from OperationsHub)
  const [driveItems, setDriveItems] = useState<DriveItem[]>(INITIAL_DRIVE_ITEMS);

  // Organizations & Users
  const [organizations, setOrganizations] = useState<Organization[]>([
      { 
          id: 'org1', name: 'Apex Innovations', industry: 'FinTech', status: 'Active',
          logo: '',
          assignedEmployees: ['2', '3'], // Sarah & Mike
          users: [
              { id: 'c1', name: 'John Apex', email: 'john@apex.com', phone: '555-0201', role: UserRole.CLIENT, status: 'Active', permissions: ['view_dashboard', 'view_proposals', 'view_operations', 'view_finance', 'view_support', 'view_users', 'view_marketing'] },
              { id: 'c3', name: 'Jane Finance', email: 'jane@apex.com', phone: '555-0203', role: UserRole.CLIENT, status: 'Active', permissions: ['view_dashboard', 'view_finance', 'view_users'] }
          ]
      },
      { 
          id: 'org2', name: 'Zenith Health', industry: 'Healthcare', status: 'Onboarding',
          assignedEmployees: ['2'], // Sarah only
          users: [
              { id: 'c2', name: 'Dr. Smith', email: 'smith@zenith.com', phone: '555-0202', role: UserRole.CLIENT, status: 'Active', permissions: ['view_dashboard', 'view_proposals', 'view_support', 'view_marketing', 'view_users'] }
          ]
      },
      { id: 'org3', name: 'Vortex Logistics', industry: 'Supply Chain', status: 'Active', assignedEmployees: [], users: [] },
  ]);

  const [teamMembers, setTeamMembers] = useState<User[]>([
      { 
          id: '1', name: 'Varia Admin', email: 'admin@refiniti.ai', phone: '555-0101', role: UserRole.SUPER_ADMIN, status: 'Active',
          permissions: ['view_dashboard', 'view_proposals', 'edit_proposals', 'view_operations', 'edit_operations', 'view_finance', 'edit_finance', 'view_users', 'edit_users', 'view_marketing', 'edit_marketing', 'view_support', 'edit_support'] 
      },
      { 
          id: '2', name: 'Sarah Designer', email: 'sarah@refiniti.ai', phone: '555-0102', role: UserRole.EMPLOYEE, status: 'Active',
          permissions: ['view_dashboard', 'view_operations', 'edit_operations', 'view_proposals'] 
      },
      { 
          id: '3', name: 'Mike Sales', email: 'mike@refiniti.ai', phone: '555-0103', role: UserRole.SALES, status: 'Active',
          permissions: ['view_dashboard', 'view_proposals', 'edit_proposals', 'view_invoices', 'view_users'] 
      },
  ]);

  // Current User State
  const [currentUser, setCurrentUser] = useState<User>(teamMembers[0]);
  const [originalUser, setOriginalUser] = useState<User | null>(null); // For reverting "Login As"

  // Projects & Tasks
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', clientId: 'org1', title: 'Website Redesign V2', description: 'Complete overhaul of landing pages.', status: 'Active', progress: 65, dueDate: getFutureDate(14), members: ['Sarah Designer', 'Mike Sales'] },
    { id: 'p2', clientId: 'org1', title: 'Q4 Marketing Push', description: 'Paid ad campaigns and asset gen.', status: 'Active', progress: 30, dueDate: getFutureDate(30), members: ['Mike Sales', 'Varia Admin'] },
    { id: 'p3', clientId: 'org2', title: 'Onboarding & Setup', description: 'Initial CRM and Drive setup.', status: 'Active', progress: 90, dueDate: getFutureDate(5), members: ['Varia Admin'] },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 't1', projectId: 'p1', clientId: 'org1', title: 'Homepage Hero Animation', description: 'Create Lottie animation for hero section.', status: TaskStatus.IN_PROGRESS, assignee: 'Sarah Designer', dueDate: getFutureDate(1), priority: 'High',
      checklist: [{id: 'c1', text: 'Draft storyboard', completed: true}, {id: 'c2', text: 'Vectorize assets', completed: true}, {id: 'c3', text: 'Final Animation', completed: false}]
    },
    { 
      id: 't2', projectId: 'p1', clientId: 'org1', title: 'Mobile Responsiveness', description: 'Fix padding issues on iOS Safari.', status: TaskStatus.TODO, assignee: 'Mike Sales', dueDate: getFutureDate(5), priority: 'Medium',
      checklist: [{id: 'c4', text: 'Audit padding on iPhone 14', completed: false}, {id: 'c5', text: 'Fix navigation overlap', completed: false}]
    },
    { 
      id: 't3', projectId: 'p1', clientId: 'org1', title: 'SEO Audit', description: 'Review meta tags and sitemap.', status: TaskStatus.DONE, assignee: 'Varia Admin', dueDate: getFutureDate(-2), priority: 'Low',
      checklist: []
    },
    { 
      id: 't4', projectId: 'p2', clientId: 'org1', title: 'Ad Creative Set A', description: 'Static banners for LinkedIn @Sarah Designer', status: TaskStatus.REVIEW, assignee: 'Sarah Designer', dueDate: getFutureDate(10), priority: 'High',
      checklist: [{id: 'c6', text: 'Source imagery', completed: true}, {id: 'c7', text: 'Draft copy', completed: false}]
    },
    // New Tasks for Gantt Visualization
    {
      id: 't5', projectId: 'p1', clientId: 'org1', title: 'Backend API Integration', description: 'Connect form endpoints to CRM.', status: TaskStatus.TODO, assignee: 'Varia Admin', dueDate: getFutureDate(8), priority: 'High',
      checklist: [{id: 'c8', text: 'Define schemas', completed: false}, {id: 'c9', text: 'Setup webhooks', completed: false}]
    },
    {
      id: 't6', projectId: 'p1', clientId: 'org1', title: 'User Acceptance Testing', description: 'Coordinate with client for beta testing.', status: TaskStatus.TODO, assignee: 'Mike Sales', dueDate: getFutureDate(12), priority: 'Medium',
      checklist: [{id: 'c10', text: 'Prepare UAT script', completed: false}, {id: 'c11', text: 'Schedule session', completed: false}]
    },
    {
      id: 't7', projectId: 'p2', clientId: 'org1', title: 'Copywriting for Email Drip', description: 'Sequence of 5 emails.', status: TaskStatus.IN_PROGRESS, assignee: 'Mike Sales', dueDate: getFutureDate(15), priority: 'Medium',
      checklist: [{id: 'c12', text: 'Welcome email', completed: true}, {id: 'c13', text: 'Value prop email', completed: false}, {id: 'c14', text: 'Closing email', completed: false}]
    },
    {
      id: 't8', projectId: 'p1', clientId: 'org1', title: 'Analytics Setup', description: 'Configure GA4 events.', status: TaskStatus.DONE, assignee: 'Varia Admin', dueDate: getFutureDate(-1), priority: 'Low',
      checklist: []
    }
  ]);

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
      {
          id: 'TCK-1001',
          clientId: 'c1',
          clientName: 'John Apex',
          organizationName: 'Apex Innovations',
          subject: 'Login Issue for New User',
          status: 'Open',
          priority: 'High',
          createdAt: 'Oct 24, 2023',
          lastUpdated: '2 hours ago',
          messages: [
              { id: 'm1', senderId: 'c1', senderName: 'John Apex', text: 'We just added Jane to the team but she cannot access the portal.', timestamp: '10:00 AM', isAdmin: false },
              { id: 'm2', senderId: '1', senderName: 'Varia Admin', text: 'Checking her permissions now. Please hold.', timestamp: '10:05 AM', isAdmin: true }
          ]
      },
      {
          id: 'TCK-1002',
          clientId: 'c2',
          clientName: 'Dr. Smith',
          organizationName: 'Zenith Health',
          subject: 'Invoice Discrepancy',
          status: 'Resolved',
          priority: 'Medium',
          createdAt: 'Oct 22, 2023',
          lastUpdated: '1 day ago',
          messages: [
              { id: 'm3', senderId: 'c2', senderName: 'Dr. Smith', text: 'The last invoice shows an extra charge.', timestamp: '09:00 AM', isAdmin: false }
          ]
      }
  ]);

  // Proposals
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      clientId: 'org1',
      clientName: 'Apex Innovations',
      clientEmail: 'john@apex.com',
      services: ['Web Dev', 'SEO'],
      customDetails: 'Client wants a dark mode aesthetic with high contrast.',
      estimatedUpfront: 5000,
      estimatedRetainer: 2000,
      content: {
         hero: { title: "Proposal for Apex Innovations", subtitle: "Draft V1" },
         engine: { generatedValue: 15000, description: "Optimization engine active." },
         phases: [
            {
                title: "Phase 1: Foundation",
                description: "Initial setup",
                items: ["Setup server", "Install CMS"]
            }
         ], 
         investment: [
             { item: 'Foundation Setup', costInitial: 5000, costMonthly: 0 },
             { item: 'SEO Retainer', costInitial: 0, costMonthly: 2000 }
         ], 
         strategy: [{ title: 'SEO Strategy', content: 'Focus on long-tail keywords.'}], 
         adSpend: []
      },
      status: ProposalStatus.SENT_TO_CLIENT,
      createdAt: '2023-10-24'
    },
    {
      id: '2',
      clientId: 'org2',
      clientName: 'Zenith Health',
      services: ['Social Media'],
      customDetails: '',
      estimatedUpfront: 3000,
      estimatedRetainer: 1500,
      content: {
         hero: { title: "Proposal for Zenith Health", subtitle: "Draft V1" },
         engine: { generatedValue: 12000, description: "Optimization engine active." },
         phases: [], 
         investment: [], 
         strategy: [], 
         adSpend: []
      },
      status: ProposalStatus.DRAFT,
      createdAt: '2023-10-25'
    }
  ]);

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-0024-A',
      proposalId: 'p1',
      clientName: 'Apex Innovations',
      amount: 5000,
      type: 'Upfront',
      status: 'Paid',
      dueDate: getFutureDate(-5),
      issueDate: '2023-09-15',
      terms: 'Net 14',
      items: [
        {description: 'Digital Infrastructure Setup', cost: 2000},
        {description: 'Brand Identity Vectorization', cost: 1500},
        {description: 'Initial Strategy Development', cost: 1500},
      ]
    },
    {
      id: 'INV-0024-B',
      proposalId: 'p1',
      clientName: 'Apex Innovations',
      amount: 2500,
      type: 'Retainer',
      status: 'Pending',
      dueDate: getFutureDate(15),
      issueDate: '2023-10-01',
      terms: 'Net 30',
      items: [
        {description: 'Monthly Performance Marketing Suite', cost: 2500}
      ]
    },
    {
      id: 'INV-0025-A',
      proposalId: 'p2',
      clientName: 'Zenith Health',
      amount: 12500,
      type: 'Upfront',
      status: 'Draft',
      dueDate: getFutureDate(30),
      issueDate: '',
      terms: 'Net 30',
      items: [
        {description: 'Enterprise Web Development', cost: 8000},
        {description: 'Video Production (3D Animation)', cost: 4500}
      ]
    }
  ]);

  // Handle Permissions
  const hasPermission = (module: string) => currentUser.permissions.includes(module);

  // Handle Login As
  const handleLoginAs = (user: User) => {
    if (user.status === 'Suspended') {
        alert("Access Denied: This user account is currently suspended.");
        return;
    }
    if (!originalUser) {
        setOriginalUser(currentUser);
    }
    setCurrentUser(user);
    // Reset view to dashboard to avoid permission conflict on current view
    setView('dashboard');
  };

  const handleRevertLogin = () => {
      if (originalUser) {
          setCurrentUser(originalUser);
          setOriginalUser(null);
          setView('dashboard');
      }
  };

  // ... (Rest of component remains the same)
  // ... (ACTIONS, FILTERS, ACTIVITY FEED logic remains same)
  // --- ACTIONS ---
  const handleProposalAccepted = (proposalId: string) => {
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) return;

      // 1. Update Proposal Status
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: ProposalStatus.ACCEPTED } : p));

      // 2. Generate Invoice (Draft/Review Status)
      const upfrontItems = proposal.content.investment.filter(i => i.costInitial > 0);
      const newInvoice: Invoice = {
          id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          proposalId: proposal.id,
          clientName: proposal.clientName,
          type: 'Upfront',
          amount: upfrontItems.reduce((acc, i) => acc + i.costInitial, 0),
          status: 'Draft',
          dueDate: getFutureDate(30), // Default Net 30
          issueDate: getFutureDate(0), // Today
          terms: 'Net 30',
          items: upfrontItems.map(i => ({ description: i.item, cost: i.costInitial }))
      };

      setInvoices(prev => [newInvoice, ...prev]);
  };

  // --- FILTERS ---
  const getFilteredProposals = () => {
      if (currentUser.role === UserRole.CLIENT) {
          const userOrg = organizations.find(o => o.users.some(u => u.id === currentUser.id));
          return proposals.filter(p => p.clientId === userOrg?.id);
      }
      return proposals;
  };

  const getFilteredInvoices = () => {
      if (currentUser.role === UserRole.CLIENT) {
          const userOrg = organizations.find(o => o.users.some(u => u.id === currentUser.id));
          return invoices.filter(i => i.clientName === userOrg?.name && i.status !== 'Draft');
      }
      return invoices;
  };

  const getFilteredTickets = () => {
      if (currentUser.role === UserRole.CLIENT) {
          const userOrg = organizations.find(o => o.users.some(u => u.id === currentUser.id));
          return tickets.filter(t => t.organizationName === userOrg?.name);
      }
      return tickets;
  }

  const getFilteredProjects = () => {
      if (currentUser.role === UserRole.CLIENT) {
          const userOrg = organizations.find(o => o.users.some(u => u.id === currentUser.id));
          return projects.filter(p => p.clientId === userOrg?.id);
      }
      // For employees, show projects they are a member of OR if they are admin
      if (currentUser.role === UserRole.SUPER_ADMIN) return projects;
      return projects.filter(p => p.members.includes(currentUser.name) || p.members.includes(currentUser.id));
  }

  // --- DYNAMIC NOTIFICATIONS & FEED ---
  const activityFeed = useMemo(() => {
      const feed = [];
      const now = new Date();
      const nowTime = now.getTime();

      // 1. Proposals
      if (notificationPreferences.proposals) {
          getFilteredProposals().forEach(p => {
              if (new Date(p.createdAt).getTime() > nowTime - 86400000 * 2) {
                  feed.push({ id: `np-${p.id}`, type: 'proposal', title: 'New Proposal Created', desc: `${p.clientName} - ${p.services.join(', ')}`, time: 'Recently', timestamp: new Date(p.createdAt).getTime(), linkView: 'proposals', icon: FileText, color: 'text-blue-400' });
              }
              if (p.status === ProposalStatus.ACCEPTED) {
                  feed.push({ id: `ap-${p.id}`, type: 'proposal', title: 'Proposal Accepted', desc: `${p.clientName} accepted proposal`, time: 'Recently', timestamp: new Date(p.createdAt).getTime(), linkView: 'proposals', icon: CheckCircle, color: 'text-green-400' });
              }
          });
      }

      // 2. Tasks
      if (notificationPreferences.tasks) {
          tasks.forEach(t => {
              if (t.assignee === currentUser.name || t.description.includes(`@${currentUser.name}`)) {
                  feed.push({ id: `nt-${t.id}`, type: 'task', title: 'Task Assignment', desc: `${t.title} assigned to you`, time: 'Recently', timestamp: Date.now(), linkView: 'operations', icon: Briefcase, color: 'text-yellow-400' });
              }
              const due = new Date(t.dueDate);
              if (due.getTime() > nowTime && due.getTime() < nowTime + 86400000 * 2 && t.status !== TaskStatus.DONE) {
                  // Sort based on current time (notification trigger), not due date, so it doesn't float to top forever
                  feed.push({ id: `dl-${t.id}`, type: 'task', title: 'Approaching Deadline', desc: `${t.title} due soon`, time: t.dueDate, timestamp: nowTime, linkView: 'operations', icon: AlertCircle, color: 'text-red-400' });
              }
          });
      }

      // 3. Invoices
      if (notificationPreferences.invoices) {
          const allInvoices = currentUser.role === UserRole.CLIENT ? getFilteredInvoices() : invoices;
          allInvoices.forEach(i => {
              if (i.status === 'Paid') {
                  feed.push({ id: `ip-${i.id}`, type: 'invoice', title: 'Invoice Paid', desc: `#${i.id} - $${i.amount.toLocaleString()}`, time: 'Recently', timestamp: Date.now() - 3600000, linkView: 'invoices', icon: CheckCircle, color: 'text-green-400' });
              }
              if (i.status === 'Pending' && new Date(i.issueDate || '').getTime() > nowTime - 86400000 * 2) {
                  feed.push({ id: `ni-${i.id}`, type: 'invoice', title: 'New Invoice Issued', desc: `#${i.id} to ${i.clientName}`, time: 'Recently', timestamp: new Date(i.issueDate || '').getTime(), linkView: 'invoices', icon: CreditCard, color: 'text-purple-400' });
              }
              if (i.status === 'Draft' && currentUser.role !== UserRole.CLIENT) {
                   // Offset timestamp slightly so it appears at top if generated concurrently with other actions
                   feed.push({ id: `dr-${i.id}`, type: 'invoice', title: 'Invoice Needs Review', desc: `#${i.id} for ${i.clientName} generated. Review before sending.`, time: 'Action Required', timestamp: nowTime + 100, linkView: 'invoices', icon: FileEdit, color: 'text-orange-400' });
              }
          });
      }

      // 4. Tickets
      if (notificationPreferences.tickets) {
          getFilteredTickets().forEach(t => {
              if (t.status === 'Open') {
                  feed.push({ id: `tk-${t.id}`, type: 'ticket', title: 'New Support Ticket', desc: `${t.subject} (${t.priority})`, time: t.lastUpdated, timestamp: Date.now(), linkView: 'support_center', icon: LifeBuoy, color: 'text-orange-400' });
              }
          });
      }

      return feed.sort((a, b) => b.timestamp - a.timestamp);
  }, [proposals, tasks, invoices, tickets, currentUser, notificationPreferences]);

  // Logo Component
  const Logo = () => (
    <div className="flex items-center gap-2 font-display select-none">
       <div className="relative">
         <span className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-refiniti-cyan to-refiniti-blue filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
           REFINITI
         </span>
         <span className="text-2xl font-light text-slate-400 ml-1">AI</span>
       </div>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon, reqPerm }: { id: ViewState, label: string, icon: any, reqPerm: string }) => {
    if (!hasPermission(reqPerm)) return null;
    return (
        <button
          onClick={() => {
              setView(id);
              if (window.innerWidth < 1024) setSidebarOpen(false); // Close on mobile click
          }}
          className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg transition-all duration-200 group relative overflow-hidden ${
            view === id 
              ? 'text-white bg-white/10 border-r-2 border-refiniti-cyan' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Icon className={`w-5 h-5 mr-3 ${view === id ? 'text-refiniti-cyan' : 'group-hover:text-refiniti-cyan'}`} />
          <span className="font-medium tracking-wide font-headline">{label}</span>
          {view === id && (
            <div className="absolute inset-0 bg-gradient-to-r from-refiniti-cyan/10 to-transparent pointer-events-none" />
          )}
        </button>
    );
  };

  if (currentUser.status === 'Suspended') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-refiniti-dark text-white">
              <div className="glass-panel p-12 rounded-2xl text-center max-w-md">
                  <Ban className="w-16 h-16 text-red-500 mx-auto mb-6"/>
                  <h1 className="text-2xl font-headline font-bold mb-2">Access Suspended</h1>
                  <p className="text-slate-400 font-body mb-8">Your account has been suspended by the administrator. Please contact support for assistance.</p>
                  {originalUser && (
                      <button 
                        onClick={handleRevertLogin}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold"
                      >
                          Revert to Admin
                      </button>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex bg-refiniti-dark text-slate-200 font-sans selection:bg-refiniti-cyan selection:text-black overflow-hidden">
      {/* ... (Rest of render code remains the same) ... */}
      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
          <div className="fixed inset-0 bg-black/80 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/10 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <Logo />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><LogOut className="w-5 h-5 rotate-180"/></button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-headline">Core Engine</p>
            <NavItem id="dashboard" label="Command Center" icon={LayoutDashboard} reqPerm="view_dashboard" />
            <NavItem id="proposals" label="Proposal Builder" icon={FileEdit} reqPerm="view_proposals" />
            <NavItem id="operations" label="Operations Hub" icon={Briefcase} reqPerm="view_operations" />
            <NavItem id="invoices" label="Finance" icon={CreditCard} reqPerm="view_finance" />
            <NavItem id="support_center" label="Support Center" icon={LifeBuoy} reqPerm="view_support" />
            <NavItem id="users" label={currentUser.role === UserRole.CLIENT ? "Account & Users" : "Users & Access"} icon={Users} reqPerm="view_users" />
          </div>
          
          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-headline">Strategy</p>
            <NavItem id="marketing" label="Marketing AI" icon={BarChart} reqPerm="view_marketing" />
            <NavItem id="communication" label="Communication" icon={MessageCircle} reqPerm="view_operations" />
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20 relative" ref={profileRef}>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-refiniti-cyan to-blue-600 p-[1px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-refiniti-cyan"/>
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate font-headline">{currentUser.name}</p>
                        <p className="text-xs text-refiniti-cyan truncate font-body">{currentUser.role}</p>
                    </div>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileSettings(!showProfileSettings);
                    }}
                    className="p-1 text-slate-500 hover:text-white"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            {/* Profile Settings Dropdown */}
            {showProfileSettings && (
                <div className="absolute bottom-full left-0 w-full mb-2 px-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Notification Preferences</h4>
                        <div className="space-y-2">
                            {Object.entries(notificationPreferences).map(([key, enabled]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400 capitalize">{key}</span>
                                    <button 
                                        onClick={() => setNotificationPreferences({...notificationPreferences, [key]: !enabled})}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${enabled ? 'bg-refiniti-cyan' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${enabled ? 'left-4.5' : 'left-0.5'}`} style={{left: enabled ? '18px' : '2px'}}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {originalUser && (
                <button 
                    onClick={handleRevertLogin}
                    className="mt-2 w-full py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors flex items-center justify-center"
                >
                    <ShieldAlert className="w-3 h-3 mr-1"/> Revert to Admin
                </button>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
         {/* Top Header */}
         <header className="h-16 border-b border-white/5 bg-refiniti-dark/80 backdrop-blur-md flex justify-between items-center px-4 md:px-6 z-30 shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400"><Menu className="w-6 h-6"/></button>
            {originalUser && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse"></div>
            )}
            {originalUser && (
                 <div className="hidden md:flex bg-red-500/10 border border-red-500/20 px-3 py-1 rounded text-red-400 text-xs font-bold items-center ml-4">
                     <ShieldAlert className="w-3 h-3 mr-2"/> VIEWING AS {currentUser.name.toUpperCase()}
                 </div>
            )}

            <div className="flex items-center gap-4 ml-auto">
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <Bell className="w-5 h-5"/>
                        {activityFeed.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-refiniti-cyan rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {activityFeed.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => {
                                            setView(n.linkView as ViewState);
                                            setShowNotifications(false);
                                        }}
                                        className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                <n.icon className={`w-3 h-3 ${n.color}`}/> {n.title}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{n.desc}</p>
                                        <div className="flex items-center text-[10px] text-slate-600">
                                            <Clock className="w-3 h-3 mr-1"/> {n.time}
                                        </div>
                                    </div>
                                ))}
                                {activityFeed.length === 0 && (
                                    <div className="p-6 text-center text-xs text-slate-500">No new notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={quickActionsRef}>
                    <button 
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className={`p-2 text-slate-400 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5 ${showQuickActions ? 'bg-white/5 text-white' : ''}`} 
                        title="Quick Actions"
                    >
                        <Zap className="w-5 h-5"/>
                    </button>
                    {showQuickActions && (
                        <div className="absolute right-0 mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="p-1">
                                <button onClick={() => { setView('proposals'); setShowQuickActions(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center transition-colors">
                                    <FileEdit className="w-4 h-4 mr-3 text-refiniti-cyan"/> New Proposal
                                </button>
                                <button onClick={() => { setView('invoices'); setShowQuickActions(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center transition-colors">
                                    <CreditCard className="w-4 h-4 mr-3 text-purple-400"/> Draft Invoice
                                </button>
                                <button onClick={() => { setView('support_center'); setShowQuickActions(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center transition-colors">
                                    <LifeBuoy className="w-4 h-4 mr-3 text-orange-400"/> Log Ticket
                                </button>
                                <div className="h-px bg-white/10 my-1"></div>
                                <button onClick={() => { alert("Quick Note feature coming soon."); setShowQuickActions(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-white/10 hover:text-white rounded-lg flex items-center transition-colors">
                                    <PenTool className="w-4 h-4 mr-3"/> Quick Note
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         </header>

         {/* Content Viewport */}
         <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
             <div className="max-w-7xl mx-auto h-full">
                
                {/* Dashboard View */}
                {view === 'dashboard' && hasPermission('view_dashboard') && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-refiniti-cyan/10 to-refiniti-blue/5 rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-refiniti-cyan/10 blur-[80px] rounded-full pointer-events-none"></div>
                            <div className="relative z-10">
                                <h1 className="text-2xl md:text-3xl font-headline font-bold text-white mb-2">
                                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-refiniti-cyan to-refiniti-blue">{currentUser.name.split(' ')[0]}</span>
                                </h1>
                                <p className="text-slate-400 font-body font-light max-w-xl text-sm md:text-base">
                                    {currentUser.role === UserRole.CLIENT 
                                        ? "Here is the real-time overview of your digital ecosystem performance and active projects."
                                        : "System status is nominal. You have pending items in the Operations Hub requiring attention."
                                    }
                                </p>
                            </div>
                        </div>

                        {/* KPI Cards (Clickable) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div 
                            onClick={() => hasPermission('view_proposals') && setView('proposals')}
                            className={`bg-[#0f172a] p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-32 relative overflow-hidden group transition-all ${hasPermission('view_proposals') ? 'cursor-pointer hover:border-refiniti-cyan/30' : ''}`}
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-refiniti-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-refiniti-cyan/10 transition-all"></div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest font-headline">Active Proposals</h3>
                            <div className="flex items-end gap-3">
                              <span className="text-4xl font-headline font-medium text-white">{getFilteredProposals().length}</span>
                              <span className="bg-refiniti-blue/20 text-refiniti-blue text-xs font-bold px-2 py-1 rounded-full mb-1 border border-refiniti-blue/20">View</span>
                            </div>
                          </div>
                           <div 
                             onClick={() => hasPermission('view_finance') && setView('invoices')}
                             className={`bg-[#0f172a] p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-32 relative overflow-hidden group transition-all ${hasPermission('view_finance') ? 'cursor-pointer hover:border-refiniti-cyan/30' : ''}`}
                           >
                             <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-orange-500/10 transition-all"></div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest font-headline">Outstanding Invoices</h3>
                            <div className="flex items-end gap-3">
                              <span className="text-4xl font-headline font-medium text-white">${getFilteredInvoices().filter(i => i.status !== 'Paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}</span>
                              <span className="bg-orange-500/10 text-orange-400 text-xs font-bold px-2 py-1 rounded-full mb-1 border border-orange-500/20">Due</span>
                            </div>
                          </div>
                          <div 
                            onClick={() => hasPermission('view_operations') && setView('operations')}
                            className={`bg-[#0f172a] p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-32 relative overflow-hidden group transition-all ${hasPermission('view_operations') ? 'cursor-pointer hover:border-refiniti-cyan/30' : ''}`}
                          >
                             <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-green-500/10 transition-all"></div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest font-headline">Active Projects</h3>
                            <div className="flex items-end gap-3">
                              <span className="text-4xl font-headline font-medium text-white">{getFilteredProjects().length}</span>
                              <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-full mb-1 border border-green-500/20">Ops</span>
                            </div>
                          </div>
                          <div 
                            onClick={() => hasPermission('view_support') && setView('support_center')}
                            className={`bg-[#0f172a] p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-32 relative overflow-hidden group transition-all ${hasPermission('view_support') ? 'cursor-pointer hover:border-refiniti-cyan/30' : ''}`}
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest font-headline">Support Tickets</h3>
                            <div className="flex items-end gap-3">
                              <span className="text-4xl font-headline font-medium text-white">{getFilteredTickets().filter(t => t.status === 'Open').length}</span>
                              <span className="bg-purple-500/10 text-purple-400 text-xs font-bold px-2 py-1 rounded-full mb-1 border border-purple-500/20">Open</span>
                            </div>
                          </div>
                        </div>

                        {/* ANALYTICS & HEALTH SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Analytics Chart (Simulated) */}
                            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-white font-headline flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-refiniti-cyan"/> Financial Performance
                                    </h3>
                                    <select className="bg-white/5 border border-white/10 rounded text-xs text-slate-300 p-1 outline-none">
                                        <option>Last 6 Months</option>
                                        <option>Year to Date</option>
                                    </select>
                                </div>
                                <div className="h-48 flex items-end justify-between gap-2 px-2">
                                    {[35, 55, 40, 70, 50, 85].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                            <div 
                                                className="w-full bg-slate-800 rounded-t-sm relative overflow-hidden group-hover:bg-slate-700 transition-colors"
                                                style={{height: '100%'}}
                                            >
                                                <div 
                                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-refiniti-cyan to-refiniti-blue transition-all duration-1000 group-hover:opacity-80" 
                                                    style={{height: `${h}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* System Health */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                                <h3 className="text-lg font-bold text-white font-headline flex items-center gap-2 mb-4">
                                    <Activity className="w-5 h-5 text-green-400"/> System Health
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Server className="w-4 h-4 text-slate-400"/>
                                            <div className="text-sm font-medium text-white">Varia AI Engine</div>
                                        </div>
                                        <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Operational
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Database className="w-4 h-4 text-slate-400"/>
                                            <div className="text-sm font-medium text-white">Drive Storage</div>
                                        </div>
                                        <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-400"></span> Healthy (45%)
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-4 h-4 text-slate-400"/>
                                            <div className="text-sm font-medium text-white">API Gateway</div>
                                        </div>
                                        <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-400"></span> 99.9% Uptime
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Priority Action Feed */}
                        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                                <h3 className="text-lg font-bold text-white font-headline flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500"/> Priority Actions
                                </h3>
                                <button className="text-xs text-refiniti-cyan hover:underline">View All</button>
                            </div>
                            <div className="divide-y divide-white/5">
                                {tasks.filter(t => t.priority === 'High' && t.status !== TaskStatus.DONE).slice(0, 3).map(t => (
                                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                                <Briefcase className="w-5 h-5 text-red-400"/>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{t.title}</div>
                                                <div className="text-xs text-slate-500">Project Task • Due {t.dueDate}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setView('operations')}
                                            className="px-3 py-1.5 border border-white/10 text-slate-300 text-xs rounded hover:bg-white/10"
                                        >
                                            View Task
                                        </button>
                                    </div>
                                ))}
                                {tickets.filter(t => t.status === 'Open').slice(0, 2).map(t => (
                                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                                <LifeBuoy className="w-5 h-5 text-purple-400"/>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{t.subject}</div>
                                                <div className="text-xs text-slate-500">Support Ticket • {t.clientName}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setView('support_center')}
                                            className="px-3 py-1.5 border border-white/10 text-slate-300 text-xs rounded hover:bg-white/10"
                                        >
                                            View Ticket
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Views ... */}
                {view === 'proposals' && hasPermission('view_proposals') && (
                  <ProposalBuilder 
                    organizations={organizations}
                    proposals={getFilteredProposals()}
                    setProposals={setProposals}
                    onSave={() => setView('proposals')}
                    currentUser={currentUser}
                    onProposalAccepted={handleProposalAccepted}
                  />
                )}
                
                {view === 'operations' && hasPermission('view_operations') && (
                    <OperationsHub 
                        organizations={organizations}
                        setOrganizations={setOrganizations}
                        projects={projects}
                        setProjects={setProjects}
                        tasks={tasks}
                        setTasks={setTasks}
                        teamMembers={teamMembers}
                        currentUserRole={currentUser.role}
                        currentUser={currentUser}
                        driveItems={driveItems}
                        setDriveItems={setDriveItems}
                    />
                )}
                {view === 'invoices' && hasPermission('view_finance') && (
                    <InvoiceSystem 
                        invoices={getFilteredInvoices()} 
                        onUpdateInvoices={setInvoices}
                        currentUser={currentUser}
                    />
                )}
                {view === 'support_center' && hasPermission('view_support') && (
                    <SupportCenter 
                        tickets={getFilteredTickets()}
                        setTickets={setTickets}
                        currentUser={currentUser}
                        organizations={organizations}
                    />
                )}
                {view === 'users' && hasPermission('view_users') && (
                    <UserManagement 
                        organizations={organizations} 
                        setOrganizations={setOrganizations}
                        teamMembers={teamMembers}
                        setTeamMembers={setTeamMembers}
                        currentUser={currentUser}
                        onLoginAs={handleLoginAs}
                    />
                )}
                
                {view === 'marketing' && hasPermission('view_marketing') && (
                    <MarketingStrategist 
                        organizations={organizations}
                        invoices={invoices}
                        setProjects={setProjects}
                        setTasks={setTasks}
                        driveItems={driveItems}
                        setDriveItems={setDriveItems}
                        proposals={getFilteredProposals()}
                    />
                )}

                {view === 'communication' && hasPermission('view_operations') && (
                    <CommunicationHub 
                        organizations={organizations}
                        teamMembers={teamMembers}
                        currentUser={currentUser}
                    />
                )}

             </div>
         </div>
      </main>

      {/* Support Widget */}
      <SupportBot />

    </div>
  );
};

export default App;
