/**
 * Landing-page feature catalog — single source of truth for the pricing
 * section's "what you get" grid and the Subscribe plans' deep feature trees.
 * Pure data so the sections stay lean and the lists stay easy to edit.
 */

// ─── Pricing catalog: "What doctors get for ₹9 + GST" ────────────────────

export interface CatalogCategory {
  title: string;
  note?: string;
  items: string[];
}

export const PRICING_CATALOG: CatalogCategory[] = [
  {
    title: 'Smart Queue Management',
    items: [
      'Walk-In Token Management', 'QR Code Based Token Booking', 'Online Token Booking',
      'Live Queue Tracking', 'Real-Time Queue Updates', 'Emergency Token Priority',
      'Estimated Wait Time',
    ],
  },
  {
    title: 'Multiple Patient Entry Options',
    note: 'All managed from one dashboard.',
    items: ['Offline Patients (Walk-In)', 'QR Scan Patients', 'Online App Bookings'],
  },
  {
    title: 'Doctor Dashboard',
    items: [
      "Today's Queue", 'Current Patient', 'Patients Waiting', 'Completed Patients',
      'Daily Analytics', 'Patient Search',
    ],
  },
  {
    title: 'Patient Mobile Experience',
    items: [
      'Patient App / PWA', 'Book Token Online', 'Track Live Queue',
      'View Visits History', 'Health Records Access', 'Notifications & Alerts',
    ],
  },
  {
    title: 'Clinic Operations',
    items: [
      'Compounder Dashboard', 'Queue Control Panel', 'Token Recall', 'Skip Token',
      'No Show Management', 'Queue Pause & Resume',
    ],
  },
  {
    title: 'Prescription & Patient History',
    items: [
      'Patient Visit History', 'Doctor Consultation History',
      'Previous Visit Records', 'Follow-Up Tracking',
    ],
  },
  {
    title: 'QR Code System',
    items: [
      'Unique Clinic QR Code', 'Unique Doctor QR Code',
      '100 Meter Radius Validation', 'Prevents Misuse',
    ],
  },
  {
    title: 'TV Display System',
    items: [
      'Live Queue TV Display', 'Current Token Display', 'Upcoming Tokens Display',
      'Full Screen Mode', 'Waiting Area Display',
    ],
  },
  {
    title: 'Notifications',
    items: ['Queue Updates', 'Token Alerts', 'Visit Completion Notifications', 'Wallet Alerts'],
  },
  {
    title: 'Wallet & Billing',
    items: [
      'Transparent Billing', 'Auto Deduction', 'Recharge Wallet Anytime',
      'GST Invoices', 'Complete Transaction History',
    ],
  },
  {
    title: 'Reports & Analytics',
    items: ['Daily Reports', 'Monthly Reports', 'Queue Analytics', 'Patient Statistics'],
  },
];

// ─── Assurance bands ───────────────────────────────────────────────────────

export const INCLUDED_FREE = [
  'No Setup Fee', 'No Installation Charges', 'No Monthly Subscription',
  'No Annual Subscription', 'No AMC Charges', 'No Hidden Charges',
  'No Per Doctor License Fee', 'No Hardware Requirement',
  'No Server Purchase Required', 'No IT Team Required',
];

export const CLOUD_PLATFORM = [
  'Access from Anywhere', 'Works on Mobile', 'Works on Tablet',
  'Works on Desktop', 'Automatic Updates', 'Secure Cloud Backup',
];

export const SUPPORT = [
  '24×7 Customer Support', 'WhatsApp Support', 'Phone Support',
  'Email Support', 'Remote Assistance', 'Onboarding Support',
];

export const SECURITY = [
  'Secure Cloud Infrastructure', 'Role-Based Access Control',
  'Encrypted Data Transmission', 'Audit Logs', 'Regular Backups',
];

export const WHY_DALAN = [
  'Pay Only for Completed Patients', 'Zero Risk to Start', 'No Fixed Cost',
  'Improve Patient Experience', 'Reduce Waiting Time',
  'Increase Clinic Efficiency', 'Modernize Your Clinic Digitally',
];

// ─── Subscribe plans: deep feature trees ───────────────────────────────────

export interface FeatureSubgroup {
  name?: string;
  items: string[];
}

export interface FeatureGroup {
  emoji: string;
  title: string;
  subgroups: FeatureSubgroup[];
}

export interface SubscribePlan {
  id: string;
  audience: string;
  price: string;
  period: string;
  tagline: string;
  groups: FeatureGroup[];
}

export const SUBSCRIBE_PLANS: SubscribePlan[] = [
  {
    id: 'clinic',
    audience: 'Clinics / Hospitals',
    price: '₹9 + GST',
    period: '/visit',
    tagline: 'Everything a doctor and clinic team needs — pay only per completed visit.',
    groups: [
      {
        emoji: '👨‍⚕️', title: 'Doctor Dashboard',
        subgroups: [{
          items: [
            "Today's Patients Count", 'Patients Waiting', 'Current Patient',
            'Completed Visits Today', 'Total Revenue Today', 'Wallet Balance',
            'Queue Status (Open/Paused/Closed)', 'Upcoming Appointments',
            'Notifications Center', 'Quick Actions Panel', 'Recent Activities',
            'Daily Summary Analytics',
          ],
        }],
      },
      {
        emoji: '🏥', title: 'Queue Management',
        subgroups: [
          {
            name: 'Queue Controls',
            items: [
              'View Live Queue', 'Call Next Patient', 'Skip Token', 'Recall Token',
              'Mark No Show', 'Complete Visit', 'Pause Queue', 'Resume Queue',
              'Close Queue', 'Open Queue', 'Emergency Token Priority',
              'View Patients Ahead', 'Search Token', 'Filter Queue by Status',
            ],
          },
          {
            name: 'Queue Insights',
            items: [
              'Current Token Number', 'Total Waiting Patients', 'Average Wait Time',
              'Average Consultation Time', 'Queue Efficiency', 'Queue Completion Rate',
            ],
          },
        ],
      },
      {
        emoji: '📝', title: 'Consultation Management',
        subgroups: [
          {
            name: 'During Consultation',
            items: [
              'Start Consultation', 'End Consultation', 'Add Consultation Notes',
              'Add Diagnosis', 'Add Symptoms', 'Add Clinical Findings', 'Add Follow-up Notes',
            ],
          },
          {
            name: 'Follow-Up',
            items: [
              'Schedule Follow-up Visit', 'Follow-up Reminders',
              'Book Follow-up Token', 'Follow-up Recommendations',
            ],
          },
        ],
      },
      {
        emoji: '💊', title: 'E-Prescription Module',
        subgroups: [
          {
            name: 'Prescription Features',
            items: [
              'Create Prescription', 'Edit Prescription', 'Save Draft',
              'Finalize Prescription', 'Print Prescription', 'Download PDF',
              'Email Prescription', 'WhatsApp Prescription',
            ],
          },
          {
            name: 'Prescription Contents',
            items: [
              'Medicines', 'Dosage', 'Frequency', 'Duration', 'Instructions',
              'Diet Advice', 'Exercise Advice', 'Precautions',
            ],
          },
          {
            name: 'Templates',
            items: [
              'Prescription Templates', 'Favorite Medicines',
              'Frequently Used Prescriptions', 'Disease-Based Templates',
            ],
          },
        ],
      },
      {
        emoji: '📁', title: 'Medical Records',
        subgroups: [{
          items: [
            'Upload Reports', 'Upload Prescriptions', 'Upload Images',
            'Upload Documents', 'Download Records', 'Share Records Securely',
            'View Complete Health Timeline',
          ],
        }],
      },
      {
        emoji: '📅', title: 'Schedule Management',
        subgroups: [
          {
            name: 'Availability',
            items: [
              'Working Days', 'Morning Shift', 'Evening Shift', 'Multiple Shifts',
              'Break Times', 'Holidays', 'Vacation Management', 'Emergency Leave',
            ],
          },
          {
            name: 'Slot Configuration',
            items: [
              'Consultation Duration', 'Patients Per Hour', 'Maximum Daily Patients',
              'Walk-In Limit', 'Online Token Limit', 'QR Token Limit',
            ],
          },
        ],
      },
      {
        emoji: '🎫', title: 'Token Settings',
        subgroups: [{
          items: [
            'Enable Walk-In Tokens', 'Enable QR Tokens', 'Enable Online Tokens',
            'Online Consultation Fee', 'Token Limit Per Day',
            'Queue Auto Close Time', 'Buffer Time Between Patients',
          ],
        }],
      },
      {
        emoji: '📊', title: 'Doctor Analytics',
        subgroups: [
          {
            name: 'Daily Analytics',
            items: [
              'Patients Seen Today', 'Revenue Generated Today',
              'Average Consultation Time', 'Queue Performance',
            ],
          },
          {
            name: 'Monthly Analytics',
            items: [
              'Total Patients', 'Total Revenue', 'Repeat Patients',
              'New Patients', 'Online vs Walk-In Ratio',
            ],
          },
          {
            name: 'Performance Metrics',
            items: [
              'Patient Satisfaction Rating', 'Average Rating', 'No Show Rate',
              'Follow-Up Rate', 'Queue Efficiency',
            ],
          },
        ],
      },
      {
        emoji: '💰', title: 'Wallet & Billing',
        subgroups: [
          {
            name: 'Wallet',
            items: [
              'Current Wallet Balance', 'Recharge Wallet', 'Wallet Transaction History',
              'Low Balance Alerts', 'Auto Recharge Settings',
            ],
          },
          {
            name: 'Billing',
            items: [
              'Completed Patient Charges', 'Daily Billing Summary',
              'Monthly Billing Summary', 'GST Summary', 'Invoice Download',
              'Invoice History',
            ],
          },
        ],
      },
      {
        emoji: '🔔', title: 'Notifications',
        subgroups: [
          {
            name: 'Receive Notifications For',
            items: [
              'New Patient Added', 'Token Called', 'Queue Updates',
              'Low Wallet Balance', 'Wallet Recharge Success',
              'Support Ticket Updates', 'Follow-Up Reminders', 'System Announcements',
            ],
          },
          {
            name: 'Notification Channels',
            items: ['In-App', 'Email', 'WhatsApp', 'SMS'],
          },
        ],
      },
      {
        emoji: '⭐', title: 'Patient Feedback',
        subgroups: [{
          items: [
            'View Ratings', 'View Reviews', 'Patient Satisfaction Score',
            'Feedback Analytics', 'Complaint Management',
          ],
        }],
      },
      {
        emoji: '📈', title: 'Reports',
        subgroups: [
          {
            name: 'Generate Reports',
            items: [
              'Daily Patient Report', 'Monthly Patient Report', 'Revenue Report',
              'Prescription Report', 'Follow-up Report', 'Queue Report',
            ],
          },
          { name: 'Export Formats', items: ['PDF', 'Excel', 'CSV'] },
        ],
      },
      {
        emoji: '🖥️', title: 'TV Display Controls',
        subgroups: [{
          items: [
            'Open TV Display', 'Fullscreen TV Mode', 'Voice Announcements',
            'Control Queue Display', 'Adjust Display Settings', 'Multiple TV Support',
          ],
        }],
      },
      {
        emoji: '🏥', title: 'Multi-Clinic Support',
        subgroups: [{
          items: [
            'Switch Clinics', 'Separate Queue Per Clinic', 'Separate Revenue Per Clinic',
            'Separate Analytics Per Clinic', 'Separate Staff Management',
          ],
        }],
      },
      {
        emoji: '👨‍💼', title: 'Staff Collaboration',
        subgroups: [{
          items: [
            'View Assigned Compounders', 'Assign Queue Managers', 'Internal Notes',
            'Staff Notifications', 'Staff Communication',
          ],
        }],
      },
      {
        emoji: '⚙️', title: 'Doctor Profile Management',
        subgroups: [{
          items: [
            'Edit Profile', 'Update Qualifications', 'Update Specializations',
            'Update Experience', 'Upload Profile Photo', 'Consultation Fee Settings',
            'Languages Spoken', 'Biography / About Section',
          ],
        }],
      },
      {
        emoji: '🔒', title: 'Security Features',
        subgroups: [{
          items: [
            'Change Password', 'Two-Factor Authentication (Future)',
            'View Login History', 'Manage Active Sessions',
            'Logout Other Devices', 'Audit Logs',
          ],
        }],
      },
      {
        emoji: '📱', title: 'Mobile Features (PWA)',
        subgroups: [{
          items: [
            'Mobile Dashboard', 'Queue Notifications', 'Call Next Patient',
            'Complete Visit', 'View Patients', 'Create Prescriptions', 'Wallet Alerts',
          ],
        }],
      },
    ],
  },
  {
    id: 'patient',
    audience: 'Patients',
    price: '₹5',
    period: '/visit',
    tagline: 'Book, track, and keep your complete health history — per visit, nothing more.',
    groups: [
      {
        emoji: '👥', title: 'Patient Management',
        subgroups: [
          {
            name: 'Patient Search',
            items: [
              'Search by Name', 'Search by Mobile Number',
              'Search by Patient ID', 'Search by Token Number',
            ],
          },
          {
            name: 'Patient Profile',
            items: [
              'Basic Details', 'Contact Information', 'Age & Gender', 'Blood Group',
              'Emergency Contact', 'Allergies', 'Chronic Conditions',
            ],
          },
          {
            name: 'Patient History',
            items: [
              'Visit History', 'Doctor Consultation History', 'Previous Prescriptions',
              'Diagnoses History', 'Notes History', 'Attachments / Documents',
            ],
          },
        ],
      },
    ],
  },
];
