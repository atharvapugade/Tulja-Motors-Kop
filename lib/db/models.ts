import mongoose, { Schema, Model } from 'mongoose';
import {
  User,
  Employee,
  Customer,
  Vehicle,
  JobCard,
  Invoice,
  Payment,
  Expense,
  AttendanceRecord,
  MarketingLead,
  ActivityLog,
} from '../models/types';

// ==============================================================================
// 1. USER SCHEMA & MODEL
// ==============================================================================
const UserSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, index: true },
    department: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    reportingManager: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'users', timestamps: false }
);

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) || mongoose.model<User>('User', UserSchema);

// ==============================================================================
// 2. EMPLOYEE SCHEMA & MODEL
// ==============================================================================
const EmployeeSchema = new Schema<Employee>(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeCode: { type: String, required: true, unique: true, index: true },
    userId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true, index: true },
    designation: { type: String, required: true },
    reportingManager: { type: String, required: true },
    joiningDate: { type: String, required: true },
    salary: {
      basic: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['active', 'on_leave', 'resigned', 'terminated'],
      default: 'active',
      index: true,
    },
    avatar: { type: String },
  },
  { collection: 'employees', timestamps: false }
);

export const EmployeeModel: Model<Employee> =
  (mongoose.models.Employee as Model<Employee>) || mongoose.model<Employee>('Employee', EmployeeSchema);

// ==============================================================================
// 3. CUSTOMER SCHEMA & MODEL
// ==============================================================================
const CustomerSchema = new Schema<Customer>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: 'Kolhapur' },
    state: { type: String, default: 'Maharashtra' },
    pincode: { type: String, default: '416001' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'customers', timestamps: false }
);

export const CustomerModel: Model<Customer> =
  (mongoose.models.Customer as Model<Customer>) || mongoose.model<Customer>('Customer', CustomerSchema);

// ==============================================================================
// 4. VEHICLE SCHEMA & MODEL
// ==============================================================================
const VehicleSchema = new Schema<Vehicle>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    registrationNumber: { type: String, required: true, unique: true, index: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    variant: { type: String, default: '' },
    year: { type: Number, required: true },
    color: { type: String, required: true },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
      default: 'Diesel',
    },
    odometer: { type: Number, default: 0 },
    vin: { type: String, default: '' },
    engineNumber: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'vehicles', timestamps: false }
);

export const VehicleModel: Model<Vehicle> =
  (mongoose.models.Vehicle as Model<Vehicle>) || mongoose.model<Vehicle>('Vehicle', VehicleSchema);

// ==============================================================================
// 5. JOB CARD SCHEMA & MODEL
// ==============================================================================
const JobCardSchema = new Schema<JobCard>(
  {
    id: { type: String, required: true, unique: true, index: true },
    jobCardNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    vehicleId: { type: String, required: true, index: true },
    vehicleRegistration: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    intakeDate: { type: String, required: true },
    estimatedCompletionDate: { type: String, default: '' },
    currentStage: { type: String, required: true, index: true },
    stageHistory: [
      {
        stage: { type: String, required: true },
        status: { type: String, enum: ['completed', 'in_progress', 'pending', 'skipped'], required: true },
        updatedBy: { type: String, required: true },
        timestamp: { type: String, required: true },
        notes: { type: String },
      },
    ],
    inspection: {
      intakeDate: { type: String, default: '' },
      accidentDescription: { type: String, default: '' },
      customerComplaints: [{ type: String }],
      visibleDamages: [{ type: String }],
      inspectionNotes: { type: String, default: '' },
      photographs: [{ type: String }],
      insuranceProvider: { type: String },
      policyNumber: { type: String },
      claimNumber: { type: String },
      surveyorName: { type: String },
      surveyorPhone: { type: String },
    },
    tasks: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        department: { type: String, required: true },
        assignedTechnicianId: { type: String, required: true },
        assignedTechnicianName: { type: String },
        priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
        status: { type: String, enum: ['Pending', 'In Progress', 'Under Review', 'Completed'], default: 'Pending' },
        estimatedHours: { type: Number, default: 0 },
        completedAt: { type: String },
        notes: { type: String },
      },
    ],
    assignedSupervisorId: { type: String, required: true },
    assignedSupervisorName: { type: String, required: true },
    assignedTechnicianIds: [{ type: String }],
    costEstimate: {
      labour: { type: Number, default: 0 },
      spareParts: { type: Number, default: 0 },
      painting: { type: Number, default: 0 },
      additionalCharges: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      taxRate: { type: Number, default: 18 },
      taxAmount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    customerApproved: { type: Boolean, default: false },
    approvalDate: { type: String },
    advisorName: { type: String },
    priority: {
      type: String,
      enum: ['Normal', 'Urgent', 'Insurance Express'],
      default: 'Normal',
    },
    handoverToSupervisor: { type: Boolean, default: false },
    handoverDate: { type: String },
    handoverNotes: { type: String },
    qualityInspection: {
      status: {
        type: String,
        enum: ['Pending', 'Passed', 'Rework Required'],
        default: 'Pending',
      },
      inspectedBy: { type: String },
      inspectedAt: { type: String },
      checklist: {
        panelAlignment: { type: Boolean, default: false },
        paintFinishColorMatch: { type: Boolean, default: false },
        mechanicalRoadTest: { type: Boolean, default: false },
        electricalLightsSensors: { type: Boolean, default: false },
        waterLeakDetailing: { type: Boolean, default: false },
      },
      notes: { type: String },
      reworkReason: { type: String },
    },
    bottleneckInfo: {
      isDelayed: { type: Boolean, default: false },
      category: {
        type: String,
        enum: [
          'Spare Parts Pending',
          'Insurance Surveyor Approval',
          'Customer Approval Pending',
          'Paint Booth Queue',
          'Technician Bandwidth',
          'QC Rework',
          'Other',
        ],
      },
      reason: { type: String },
      actionPlan: { type: String },
      revisedCompletionDate: { type: String },
      flaggedBy: { type: String },
      flaggedAt: { type: String },
      resolvedAt: { type: String },
    },
    jobStatus: {
      type: String,
      enum: ['Active', 'On Hold', 'Completed', 'Delivered', 'Cancelled'],
      default: 'Active',
      index: true,
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'jobcards', timestamps: false }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models.JobCard) {
  delete mongoose.models.JobCard;
}

export const JobCardModel: Model<JobCard> =
  (mongoose.models.JobCard as Model<JobCard>) || mongoose.model<JobCard>('JobCard', JobCardSchema);

// ==============================================================================
// 6. INVOICE SCHEMA & MODEL
// ==============================================================================
const InvoiceSchema = new Schema<Invoice>(
  {
    id: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    jobCardId: { type: String, required: true, index: true },
    jobCardNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    vehicleRegistration: { type: String, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    labourCharges: { type: Number, default: 0 },
    partsCharges: { type: Number, default: 0 },
    paintCharges: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    gstRate: { type: Number, default: 18 },
    gstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue'],
      default: 'Draft',
      index: true,
    },
  },
  { collection: 'invoices', timestamps: false }
);

export const InvoiceModel: Model<Invoice> =
  (mongoose.models.Invoice as Model<Invoice>) || mongoose.model<Invoice>('Invoice', InvoiceSchema);

// ==============================================================================
// 7. PAYMENT SCHEMA & MODEL
// ==============================================================================
const PaymentSchema = new Schema<Payment>(
  {
    id: { type: String, required: true, unique: true, index: true },
    paymentNumber: { type: String, required: true, unique: true, index: true },
    invoiceId: { type: String, required: true, index: true },
    jobCardId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Debit/Credit Card', 'Cheque'],
      required: true,
    },
    transactionReference: { type: String, default: '' },
    date: { type: String, required: true },
    receivedBy: { type: String, required: true },
    receiptNotes: { type: String },
  },
  { collection: 'payments', timestamps: false }
);

export const PaymentModel: Model<Payment> =
  (mongoose.models.Payment as Model<Payment>) || mongoose.model<Payment>('Payment', PaymentSchema);

// ==============================================================================
// 8. EXPENSE SCHEMA & MODEL
// ==============================================================================
const ExpenseSchema = new Schema<Expense>(
  {
    id: { type: String, required: true, unique: true, index: true },
    expenseNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Spare Parts',
        'Paints & Consumables',
        'Workshop Tools',
        'Utilities',
        'Salaries',
        'Maintenance',
        'Miscellaneous',
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    department: { type: String, required: true },
    vendorName: { type: String, required: true },
    approvedBy: { type: String, required: true },
    paymentMode: { type: String, default: 'Bank Transfer' },
  },
  { collection: 'expenses', timestamps: false }
);

export const ExpenseModel: Model<Expense> =
  (mongoose.models.Expense as Model<Expense>) || mongoose.model<Expense>('Expense', ExpenseSchema);

// ==============================================================================
// 9. ATTENDANCE SCHEMA & MODEL
// ==============================================================================
const AttendanceSchema = new Schema<AttendanceRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'On Leave'],
      required: true,
    },
    checkIn: { type: String },
    checkOut: { type: String },
    leaveType: {
      type: String,
      enum: ['Casual', 'Sick', 'Earned', 'Emergency'],
    },
  },
  { collection: 'attendance', timestamps: false }
);

export const AttendanceModel: Model<AttendanceRecord> =
  (mongoose.models.Attendance as Model<AttendanceRecord>) ||
  mongoose.model<AttendanceRecord>('Attendance', AttendanceSchema);

// ==============================================================================
// 10. MARKETING LEAD SCHEMA & MODEL
// ==============================================================================
const MarketingLeadSchema = new Schema<MarketingLead>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    source: {
      type: String,
      enum: ['Google Search', 'Instagram', 'Facebook', 'Walk-in', 'Customer Referral', 'WhatsApp'],
      required: true,
      index: true,
    },
    interest: {
      type: String,
      enum: ['Accidental Repair', 'Full Repainting', 'Ceramic Coating', 'Mechanical Service', 'Car Renovation'],
      required: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Follow-up Scheduled', 'Converted to Job', 'Lost'],
      default: 'New',
      index: true,
    },
    notes: { type: String, default: '' },
    followUpDate: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'leads', timestamps: false }
);

export const MarketingLeadModel: Model<MarketingLead> =
  (mongoose.models.MarketingLead as Model<MarketingLead>) ||
  mongoose.model<MarketingLead>('MarketingLead', MarketingLeadSchema);

// ==============================================================================
// 11. ACTIVITY LOG SCHEMA & MODEL
// ==============================================================================
const ActivityLogSchema = new Schema<ActivityLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: [
        'User',
        'Employee',
        'JobCard',
        'Invoice',
        'Payment',
        'Inspection',
        'Task',
        'MarketingLead',
        'Attendance',
        'System',
      ],
      required: true,
    },
    entityId: { type: String, required: true },
    performedBy: { type: String, required: true },
    userRole: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'activitylogs', timestamps: false }
);

export const ActivityLogModel: Model<ActivityLog> =
  (mongoose.models.ActivityLog as Model<ActivityLog>) ||
  mongoose.model<ActivityLog>('ActivityLog', ActivityLogSchema);

