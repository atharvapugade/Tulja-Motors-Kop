export type UserRole =
  | 'super_admin'
  | 'director'
  | 'body_shop_manager'
  | 'admin'
  | 'hr'
  | 'advisor'
  | 'supervisor'
  | 'accounts'
  | 'digital_marketing'
  | 'technician'
  | 'spare_parts_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: string;
  phone?: string;
  avatar?: string;
  reportingManager?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  designation: string;
  reportingManager: string;
  joiningDate: string;
  salary?: {
    basic: number;
    allowances: number;
    total: number;
  };
  status: 'active' | 'on_leave' | 'resigned' | 'terminated';
  avatar?: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  registrationNumber: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
  odometer: number;
  vin: string;
  engineNumber?: string;
  createdAt: string;
}

export type RepairStage =
  | 'Vehicle Received'
  | 'Initial Inspection'
  | 'Estimation'
  | 'Customer Approval'
  | 'Dismantling'
  | 'Denting & Bodywork'
  | 'Mechanical Work'
  | 'Painting'
  | 'Reassembly'
  | 'Quality Inspection'
  | 'Final Approval'
  | 'Ready for Delivery'
  | 'Delivered';

export interface RepairStageHistory {
  stage: RepairStage;
  status: 'completed' | 'in_progress' | 'pending' | 'skipped';
  updatedBy: string;
  timestamp: string;
  notes?: string;
}

export interface InspectionDetail {
  intakeDate: string;
  accidentDescription: string;
  customerComplaints: string[];
  visibleDamages: string[];
  inspectionNotes: string;
  photographs: string[];
  insuranceProvider?: string;
  policyNumber?: string;
  claimNumber?: string;
  surveyorName?: string;
  surveyorPhone?: string;
}

export interface RepairTask {
  id: string;
  title: string;
  description: string;
  department: 'Denting' | 'Painting' | 'Mechanical' | 'Electrical' | 'Detailing' | 'Assembly';
  assignedTechnicianId: string;
  assignedTechnicianName?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Under Review' | 'Completed';
  estimatedHours: number;
  completedAt?: string;
  notes?: string;
}

export interface QualityInspectionReport {
  status: 'Pending' | 'Passed' | 'Rework Required';
  inspectedBy?: string;
  inspectedAt?: string;
  checklist: {
    panelAlignment: boolean;
    paintFinishColorMatch: boolean;
    mechanicalRoadTest: boolean;
    electricalLightsSensors: boolean;
    waterLeakDetailing: boolean;
  };
  notes?: string;
  reworkReason?: string;
}

export interface BottleneckInfo {
  isDelayed: boolean;
  category:
    | 'Spare Parts Pending'
    | 'Insurance Surveyor Approval'
    | 'Customer Approval Pending'
    | 'Paint Booth Queue'
    | 'Technician Bandwidth'
    | 'QC Rework'
    | 'Other';
  reason: string;
  actionPlan?: string;
  revisedCompletionDate?: string;
  flaggedBy?: string;
  flaggedAt?: string;
  resolvedAt?: string;
}

export interface JobCard {
  id: string;
  jobCardNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleModel: string;
  intakeDate: string;
  estimatedCompletionDate: string;
  currentStage: RepairStage;
  stageHistory: RepairStageHistory[];
  inspection: InspectionDetail;
  tasks: RepairTask[];
  assignedSupervisorId: string;
  assignedSupervisorName: string;
  assignedTechnicianIds: string[];
  costEstimate: {
    labour: number;
    spareParts: number;
    painting: number;
    additionalCharges: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  };
  customerApproved: boolean;
  approvalDate?: string;
  advisorName?: string;
  priority?: 'Normal' | 'Urgent' | 'Insurance Express';
  handoverToSupervisor?: boolean;
  handoverDate?: string;
  handoverNotes?: string;
  qualityInspection?: QualityInspectionReport;
  bottleneckInfo?: BottleneckInfo;
  jobStatus: 'Active' | 'On Hold' | 'Completed' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobCardId: string;
  jobCardNumber: string;
  customerId: string;
  customerName: string;
  vehicleRegistration: string;
  issueDate: string;
  dueDate: string;
  labourCharges: number;
  partsCharges: number;
  paintCharges: number;
  otherCharges: number;
  discount: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue';
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  jobCardId: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Debit/Credit Card' | 'Cheque';
  transactionReference: string;
  date: string;
  receivedBy: string;
  receiptNotes?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  title: string;
  category: 'Spare Parts' | 'Paints & Consumables' | 'Workshop Tools' | 'Utilities' | 'Salaries' | 'Maintenance' | 'Miscellaneous';
  amount: number;
  date: string;
  department: string;
  vendorName: string;
  approvedBy: string;
  paymentMode: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'On Leave';
  checkIn?: string;
  checkOut?: string;
  leaveType?: 'Casual' | 'Sick' | 'Earned' | 'Emergency';
}

export interface MarketingLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'Google Search' | 'Instagram' | 'Facebook' | 'Walk-in' | 'Customer Referral' | 'WhatsApp';
  interest: 'Accidental Repair' | 'Full Repainting' | 'Ceramic Coating' | 'Mechanical Service' | 'Car Renovation';
  status: 'New' | 'Contacted' | 'Follow-up Scheduled' | 'Converted to Job' | 'Lost';
  notes: string;
  followUpDate: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'User' | 'Employee' | 'JobCard' | 'Invoice' | 'Payment' | 'Inspection' | 'Task' | 'MarketingLead' | 'Attendance' | 'System' | 'SparePart' | 'PartRequisition' | 'PurchaseOrder';
  entityId: string;
  performedBy: string;
  userRole: UserRole;
  details: string;
  timestamp: string;
}

export type SparePartCategory =
  | 'Denting & Body'
  | 'Body Panels'
  | 'Electrical & Lights'
  | 'Paints & Consumables'
  | 'Lubricants & Oils'
  | 'Mechanical Bay'
  | 'Body Glass'
  | 'Fasteners & Clips'
  | 'Other';

export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: SparePartCategory;
  compatibleModels: string;
  stockQuantity: number;
  minThreshold: number;
  unitPrice: number;
  locationBin: string;
  supplierName: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: string;
  updatedAt: string;
}

export interface PartRequisition {
  id: string;
  jobCardId: string;
  jobCardNumber: string;
  vehicleRegistration: string;
  vehicleModel: string;
  partId: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'Requested' | 'Allocated' | 'Issued' | 'Pending Stock';
  requestedBy: string;
  requestedAt: string;
  issuedAt?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  partId: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierContact?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Draft' | 'Placed' | 'Received' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

