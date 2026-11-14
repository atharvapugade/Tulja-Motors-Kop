import fs from 'fs';
import os from 'os';
import path from 'path';
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
  SparePart,
  PartRequisition,
  PurchaseOrder,
} from '../models/types';
import {
  initialUsers,
  initialEmployees,
  initialCustomers,
  initialVehicles,
  initialJobCards,
  initialInvoices,
  initialPayments,
  initialExpenses,
  initialAttendance,
  initialMarketingLeads,
  initialActivityLogs,
  initialSpareParts,
  initialPartRequisitions,
  initialPurchaseOrders,
} from './seed-data';
import { connectToDatabase } from './connect';
import {
  UserModel,
  EmployeeModel,
  CustomerModel,
  VehicleModel,
  JobCardModel,
  InvoiceModel,
  PaymentModel,
  ExpenseModel,
  AttendanceModel,
  MarketingLeadModel,
  ActivityLogModel,
  SparePartModel,
  PartRequisitionModel,
  PurchaseOrderModel,
} from './models';

interface DatabaseState {
  users: User[];
  employees: Employee[];
  customers: Customer[];
  vehicles: Vehicle[];
  jobCards: JobCard[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  attendance: AttendanceRecord[];
  leads: MarketingLead[];
  activityLogs: ActivityLog[];
  spareParts: SparePart[];
  partRequisitions: PartRequisition[];
  purchaseOrders: PurchaseOrder[];
}

const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'tulja-motors-data')
  : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'tulja_motors_db.json');

let memoryDb: DatabaseState | null = null;

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // ignore
    }
  }
}

function loadDatabase(): DatabaseState {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      if (content && content.trim().length > 0) {
        memoryDb = JSON.parse(content) as DatabaseState;
        let modified = false;
        if (!memoryDb.spareParts || memoryDb.spareParts.length === 0) {
          memoryDb.spareParts = [...initialSpareParts];
          modified = true;
        }
        if (!memoryDb.partRequisitions || memoryDb.partRequisitions.length === 0) {
          memoryDb.partRequisitions = [...initialPartRequisitions];
          modified = true;
        }
        if (!memoryDb.purchaseOrders || memoryDb.purchaseOrders.length === 0) {
          memoryDb.purchaseOrders = [...initialPurchaseOrders];
          modified = true;
        }
        if (modified) {
          saveDatabase(memoryDb);
        }
        return memoryDb;
      }
    }
  } catch (err) {
    console.warn('Could not read existing database file, initializing with seed data.', err);
  }

  // Fallback to fresh seed data
  memoryDb = {
    users: [...initialUsers],
    employees: [...initialEmployees],
    customers: [...initialCustomers],
    vehicles: [...initialVehicles],
    jobCards: [...initialJobCards],
    invoices: [...initialInvoices],
    payments: [...initialPayments],
    expenses: [...initialExpenses],
    attendance: [...initialAttendance],
    leads: [...initialMarketingLeads],
    activityLogs: [...initialActivityLogs],
    spareParts: [...initialSpareParts],
    partRequisitions: [...initialPartRequisitions],
    purchaseOrders: [...initialPurchaseOrders],
  };

  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(dbState: DatabaseState) {
  memoryDb = dbState;
  try {
    ensureDirectoryExists(DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file to disk:', err);
  }
}

// Strip Mongoose internal properties like _id and __v
function cleanMongoDoc<T>(doc: unknown): T {
  if (!doc) return doc as T;
  const raw = JSON.parse(JSON.stringify(doc));
  if (raw && typeof raw === 'object' && '_id' in raw) {
    delete raw._id;
  }
  if (raw && typeof raw === 'object' && '__v' in raw) {
    delete raw.__v;
  }
  return raw as T;
}

export const db = {
  // ==========================================
  // USERS
  // ==========================================
  getUsers: async (): Promise<User[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const users = await UserModel.find({}).lean();
        if (users && users.length > 0) {
          return users.map((u) => cleanMongoDoc<User>(u));
        }
      }
    } catch (err) {
      console.warn('Error reading users from MongoDB, falling back to local store:', err);
    }
    return loadDatabase().users;
  },

  getUserByEmail: async (email: string): Promise<User | undefined> => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const user = await UserModel.findOne({ email: cleanEmail }).lean();
        if (user) {
          return cleanMongoDoc<User>(user);
        }
      }
    } catch (err) {
      console.warn('Error reading user by email from MongoDB, falling back:', err);
    }
    const users = loadDatabase().users;
    return users.find((u) => u.email.toLowerCase() === cleanEmail);
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const user = await UserModel.findOne({ id }).lean();
        if (user) {
          return cleanMongoDoc<User>(user);
        }
      }
    } catch (err) {
      console.warn('Error reading user by id from MongoDB, falling back:', err);
    }
    const users = loadDatabase().users;
    return users.find((u) => u.id === id);
  },

  createUser: async (user: User): Promise<User> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await UserModel.create(user);
      }
    } catch (err) {
      console.warn('Error saving user to MongoDB:', err);
    }
    const state = loadDatabase();
    state.users.push(user);
    saveDatabase(state);
    return user;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await UserModel.findOneAndUpdate(
          { id },
          { ...updates, updatedAt: new Date().toISOString() },
          { new: true }
        ).lean();
        if (updated) {
          return cleanMongoDoc<User>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating user in MongoDB:', err);
    }
    const state = loadDatabase();
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    state.users[idx] = { ...state.users[idx], ...updates, updatedAt: new Date().toISOString() };
    saveDatabase(state);
    return state.users[idx];
  },

  // ==========================================
  // EMPLOYEES
  // ==========================================
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const emps = await EmployeeModel.find({}).lean();
        if (emps && emps.length > 0) {
          return emps.map((e) => cleanMongoDoc<Employee>(e));
        }
      }
    } catch (err) {
      console.warn('Error reading employees from MongoDB, falling back:', err);
    }
    return loadDatabase().employees;
  },

  getEmployeeById: async (id: string): Promise<Employee | undefined> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const emp = await EmployeeModel.findOne({ $or: [{ id }, { employeeCode: id }] }).lean();
        if (emp) {
          return cleanMongoDoc<Employee>(emp);
        }
      }
    } catch (err) {
      console.warn('Error reading employee from MongoDB:', err);
    }
    return loadDatabase().employees.find((e) => e.id === id || e.employeeCode === id);
  },

  createEmployee: async (emp: Employee): Promise<Employee> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await EmployeeModel.create(emp);
      }
    } catch (err) {
      console.warn('Error creating employee in MongoDB:', err);
    }
    const state = loadDatabase();
    state.employees.push(emp);
    saveDatabase(state);
    return emp;
  },

  updateEmployee: async (id: string, updates: Partial<Employee>): Promise<Employee | null> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await EmployeeModel.findOneAndUpdate(
          { $or: [{ id }, { employeeCode: id }] },
          updates,
          { new: true }
        ).lean();
        if (updated) {
          return cleanMongoDoc<Employee>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating employee in MongoDB:', err);
    }
    const state = loadDatabase();
    const idx = state.employees.findIndex((e) => e.id === id || e.employeeCode === id);
    if (idx === -1) return null;
    state.employees[idx] = { ...state.employees[idx], ...updates };
    saveDatabase(state);
    return state.employees[idx];
  },

  // ==========================================
  // CUSTOMERS
  // ==========================================
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const custs = await CustomerModel.find({}).lean();
        if (custs && custs.length > 0) {
          return custs.map((c) => cleanMongoDoc<Customer>(c));
        }
      }
    } catch (err) {
      console.warn('Error reading customers from MongoDB:', err);
    }
    return loadDatabase().customers;
  },

  getCustomerById: async (id: string): Promise<Customer | undefined> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const cust = await CustomerModel.findOne({ $or: [{ id }, { customerCode: id }] }).lean();
        if (cust) {
          return cleanMongoDoc<Customer>(cust);
        }
      }
    } catch (err) {
      console.warn('Error reading customer from MongoDB:', err);
    }
    return loadDatabase().customers.find((c) => c.id === id || c.customerCode === id);
  },

  createCustomer: async (cust: Customer): Promise<Customer> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await CustomerModel.create(cust);
      }
    } catch (err) {
      console.warn('Error creating customer in MongoDB:', err);
    }
    const state = loadDatabase();
    state.customers.unshift(cust);
    saveDatabase(state);
    return cust;
  },

  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<Customer | null> => {
    let mongoUpdated: Customer | null = null;
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await CustomerModel.findOneAndUpdate(
          { $or: [{ id }, { customerCode: id }] },
          updates,
          { new: true }
        ).lean();
        if (updated) {
          mongoUpdated = cleanMongoDoc<Customer>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating customer in MongoDB:', err);
    }
    const state = loadDatabase();
    const idx = state.customers.findIndex((c) => c.id === id || c.customerCode === id);
    if (idx !== -1) {
      state.customers[idx] = { ...state.customers[idx], ...updates };
      saveDatabase(state);
    }
    return mongoUpdated || (idx !== -1 ? state.customers[idx] : null);
  },

  // ==========================================
  // VEHICLES
  // ==========================================
  getVehicles: async (): Promise<Vehicle[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const vehs = await VehicleModel.find({}).sort({ createdAt: -1 }).lean();
        if (vehs && vehs.length > 0) {
          return vehs.map((v) => cleanMongoDoc<Vehicle>(v));
        }
      }
    } catch (err) {
      console.warn('Error reading vehicles from MongoDB:', err);
    }
    return loadDatabase().vehicles;
  },

  getVehicleById: async (id: string): Promise<Vehicle | undefined> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const veh = await VehicleModel.findOne({ id }).lean();
        if (veh) {
          return cleanMongoDoc<Vehicle>(veh);
        }
      }
    } catch (err) {
      console.warn('Error reading vehicle from MongoDB:', err);
    }
    return loadDatabase().vehicles.find((v) => v.id === id);
  },

  getVehiclesByCustomer: async (customerId: string): Promise<Vehicle[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const vehs = await VehicleModel.find({ customerId }).lean();
        if (vehs && vehs.length > 0) {
          return vehs.map((v) => cleanMongoDoc<Vehicle>(v));
        }
      }
    } catch (err) {
      console.warn('Error reading vehicles by customer from MongoDB:', err);
    }
    return loadDatabase().vehicles.filter((v) => v.customerId === customerId);
  },

  createVehicle: async (veh: Vehicle): Promise<Vehicle> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await VehicleModel.create(veh);
      }
    } catch (err) {
      console.warn('Error creating vehicle in MongoDB:', err);
    }
    const state = loadDatabase();
    state.vehicles.unshift(veh);
    saveDatabase(state);
    return veh;
  },

  updateVehicle: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> => {
    let mongoUpdated: Vehicle | null = null;
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await VehicleModel.findOneAndUpdate(
          { $or: [{ id }, { registrationNumber: id }] },
          updates,
          { new: true }
        ).lean();
        if (updated) {
          mongoUpdated = cleanMongoDoc<Vehicle>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating vehicle in MongoDB:', err);
    }
    const state = loadDatabase();
    const idx = state.vehicles.findIndex((v) => v.id === id || v.registrationNumber === id);
    if (idx !== -1) {
      state.vehicles[idx] = { ...state.vehicles[idx], ...updates };
      saveDatabase(state);
    }
    return mongoUpdated || (idx !== -1 ? state.vehicles[idx] : null);
  },

  // ==========================================
  // JOB CARDS
  // ==========================================
  getJobCards: async (): Promise<JobCard[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const jcs = await JobCardModel.find({}).sort({ createdAt: -1 }).lean();
        if (jcs && jcs.length > 0) {
          return jcs.map((j) => cleanMongoDoc<JobCard>(j));
        }
      }
    } catch (err) {
      console.warn('Error reading job cards from MongoDB:', err);
    }
    return loadDatabase().jobCards;
  },

  getJobCardById: async (id: string): Promise<JobCard | undefined> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const jc = await JobCardModel.findOne({ $or: [{ id }, { jobCardNumber: id }] }).lean();
        if (jc) {
          return cleanMongoDoc<JobCard>(jc);
        }
      }
    } catch (err) {
      console.warn('Error reading job card by id from MongoDB:', err);
    }
    return loadDatabase().jobCards.find((j) => j.id === id || j.jobCardNumber === id);
  },

  createJobCard: async (jc: JobCard): Promise<JobCard> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await JobCardModel.create(jc);
      }
    } catch (err) {
      console.warn('Error creating job card in MongoDB:', err);
    }
    const state = loadDatabase();
    state.jobCards.unshift(jc);
    saveDatabase(state);
    return jc;
  },

  updateJobCard: async (id: string, updates: Partial<JobCard>): Promise<JobCard | null> => {
    let mongoUpdated: JobCard | null = null;
    const timestamp = new Date().toISOString();
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await JobCardModel.findOneAndUpdate(
          { $or: [{ id }, { jobCardNumber: id }] },
          { ...updates, updatedAt: timestamp },
          { new: true }
        ).lean();
        if (updated) {
          mongoUpdated = cleanMongoDoc<JobCard>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating job card in MongoDB:', err);
    }
    const state = loadDatabase();
    const idx = state.jobCards.findIndex((j) => j.id === id || j.jobCardNumber === id);
    if (idx !== -1) {
      state.jobCards[idx] = { ...state.jobCards[idx], ...updates, updatedAt: timestamp };
      saveDatabase(state);
    }
    return mongoUpdated || (idx !== -1 ? state.jobCards[idx] : null);
  },

  // ==========================================
  // INVOICES
  // ==========================================
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const invs = await InvoiceModel.find({}).sort({ issueDate: -1 }).lean();
        if (invs && invs.length > 0) {
          return invs.map((i) => cleanMongoDoc<Invoice>(i));
        }
      }
    } catch (err) {
      console.warn('Error reading invoices from MongoDB:', err);
    }
    return loadDatabase().invoices;
  },

  createInvoice: async (inv: Invoice): Promise<Invoice> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await InvoiceModel.create(inv);
      }
    } catch (err) {
      console.warn('Error creating invoice in MongoDB:', err);
    }
    const state = loadDatabase();
    state.invoices.unshift(inv);
    saveDatabase(state);
    return inv;
  },

  updateInvoice: async (id: string, updates: Partial<Invoice>): Promise<Invoice | null> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await InvoiceModel.findOneAndUpdate(
          { $or: [{ id }, { invoiceNumber: id }] },
          { ...updates },
          { new: true }
        ).lean();
        if (updated) {
          return cleanMongoDoc<Invoice>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating invoice in MongoDB:', err);
    }
    const state = loadDatabase();
    const idx = state.invoices.findIndex((i) => i.id === id || i.invoiceNumber === id);
    if (idx !== -1) {
      state.invoices[idx] = { ...state.invoices[idx], ...updates };
      saveDatabase(state);
      return state.invoices[idx];
    }
    return null;
  },

  // ==========================================
  // PAYMENTS
  // ==========================================
  getPayments: async (): Promise<Payment[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const pays = await PaymentModel.find({}).sort({ date: -1 }).lean();
        if (pays && pays.length > 0) {
          return pays.map((p) => cleanMongoDoc<Payment>(p));
        }
      }
    } catch (err) {
      console.warn('Error reading payments from MongoDB:', err);
    }
    return loadDatabase().payments;
  },

  createPayment: async (pay: Payment): Promise<Payment> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await PaymentModel.create(pay);
      }
    } catch (err) {
      console.warn('Error creating payment in MongoDB:', err);
    }
    const state = loadDatabase();
    state.payments.unshift(pay);
    saveDatabase(state);
    return pay;
  },

  // ==========================================
  // EXPENSES
  // ==========================================
  getExpenses: async (): Promise<Expense[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const exps = await ExpenseModel.find({}).sort({ date: -1 }).lean();
        if (exps && exps.length > 0) {
          return exps.map((e) => cleanMongoDoc<Expense>(e));
        }
      }
    } catch (err) {
      console.warn('Error reading expenses from MongoDB:', err);
    }
    return loadDatabase().expenses;
  },

  createExpense: async (exp: Expense): Promise<Expense> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await ExpenseModel.create(exp);
      }
    } catch (err) {
      console.warn('Error creating expense in MongoDB:', err);
    }
    const state = loadDatabase();
    state.expenses.unshift(exp);
    saveDatabase(state);
    return exp;
  },

  // ==========================================
  // ATTENDANCE
  // ==========================================
  getAttendance: async (): Promise<AttendanceRecord[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const att = await AttendanceModel.find({}).sort({ date: -1 }).lean();
        if (att && att.length > 0) {
          return att.map((a) => cleanMongoDoc<AttendanceRecord>(a));
        }
      }
    } catch (err) {
      console.warn('Error reading attendance from MongoDB:', err);
    }
    return loadDatabase().attendance;
  },

  recordAttendance: async (rec: AttendanceRecord): Promise<AttendanceRecord> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await AttendanceModel.create(rec);
      }
    } catch (err) {
      console.warn('Error recording attendance in MongoDB:', err);
    }
    const state = loadDatabase();
    state.attendance.unshift(rec);
    saveDatabase(state);
    return rec;
  },

  // ==========================================
  // LEADS
  // ==========================================
  getLeads: async (): Promise<MarketingLead[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const lds = await MarketingLeadModel.find({}).sort({ createdAt: -1 }).lean();
        if (lds && lds.length > 0) {
          return lds.map((l) => cleanMongoDoc<MarketingLead>(l));
        }
      }
    } catch (err) {
      console.warn('Error reading leads from MongoDB:', err);
    }
    return loadDatabase().leads;
  },

  createLead: async (lead: MarketingLead): Promise<MarketingLead> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await MarketingLeadModel.create(lead);
      }
    } catch (err) {
      console.warn('Error creating lead in MongoDB:', err);
    }
    const state = loadDatabase();
    state.leads.unshift(lead);
    saveDatabase(state);
    return lead;
  },

  // ==========================================
  // ACTIVITY LOGS
  // ==========================================
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const logs = await ActivityLogModel.find({}).sort({ timestamp: -1 }).limit(100).lean();
        if (logs && logs.length > 0) {
          return logs.map((l) => cleanMongoDoc<ActivityLog>(l));
        }
      }
    } catch (err) {
      console.warn('Error reading activity logs from MongoDB:', err);
    }
    return loadDatabase().activityLogs;
  },

  logActivity: async (log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> => {
    const newLog: ActivityLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await ActivityLogModel.create(newLog);
      }
    } catch (err) {
      console.warn('Error logging activity to MongoDB:', err);
    }
    const state = loadDatabase();
    state.activityLogs.unshift(newLog);
    if (state.activityLogs.length > 100) {
      state.activityLogs = state.activityLogs.slice(0, 100);
    }
    saveDatabase(state);
    return newLog;
  },

  // ==========================================
  // SEED RESET
  // ==========================================
  resetToSeed: async (): Promise<void> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await Promise.all([
          UserModel.deleteMany({}),
          EmployeeModel.deleteMany({}),
          CustomerModel.deleteMany({}),
          VehicleModel.deleteMany({}),
          JobCardModel.deleteMany({}),
          InvoiceModel.deleteMany({}),
          PaymentModel.deleteMany({}),
          ExpenseModel.deleteMany({}),
          AttendanceModel.deleteMany({}),
          MarketingLeadModel.deleteMany({}),
          ActivityLogModel.deleteMany({}),
          SparePartModel.deleteMany({}),
          PartRequisitionModel.deleteMany({}),
          PurchaseOrderModel.deleteMany({}),
        ]);
        await Promise.all([
          UserModel.insertMany(initialUsers),
          EmployeeModel.insertMany(initialEmployees),
          CustomerModel.insertMany(initialCustomers),
          VehicleModel.insertMany(initialVehicles),
          JobCardModel.insertMany(initialJobCards),
          InvoiceModel.insertMany(initialInvoices),
          PaymentModel.insertMany(initialPayments),
          ExpenseModel.insertMany(initialExpenses),
          AttendanceModel.insertMany(initialAttendance),
          MarketingLeadModel.insertMany(initialMarketingLeads),
          ActivityLogModel.insertMany(initialActivityLogs),
          SparePartModel.insertMany(initialSpareParts),
          PartRequisitionModel.insertMany(initialPartRequisitions),
          PurchaseOrderModel.insertMany(initialPurchaseOrders),
        ]);
      }
    } catch (err) {
      console.warn('Error resetting MongoDB seed data:', err);
    }

    memoryDb = {
      users: [...initialUsers],
      employees: [...initialEmployees],
      customers: [...initialCustomers],
      vehicles: [...initialVehicles],
      jobCards: [...initialJobCards],
      invoices: [...initialInvoices],
      payments: [...initialPayments],
      expenses: [...initialExpenses],
      attendance: [...initialAttendance],
      leads: [...initialMarketingLeads],
      activityLogs: [...initialActivityLogs],
      spareParts: [...initialSpareParts],
      partRequisitions: [...initialPartRequisitions],
      purchaseOrders: [...initialPurchaseOrders],
    };
    saveDatabase(memoryDb);
  },

  // ==========================================
  // SPARE PARTS & INVENTORY
  // ==========================================
  getSpareParts: async (): Promise<SparePart[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const parts = await SparePartModel.find({}).sort({ partNumber: 1 }).lean();
        if (parts && parts.length > 0) {
          return parts.map((p) => cleanMongoDoc<SparePart>(p));
        }
      }
    } catch (err) {
      console.warn('Error reading spare parts from MongoDB:', err);
    }
    return loadDatabase().spareParts || [];
  },

  getSparePartById: async (id: string): Promise<SparePart | undefined> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const part = await SparePartModel.findOne({ $or: [{ id }, { partNumber: id }] }).lean();
        if (part) {
          return cleanMongoDoc<SparePart>(part);
        }
      }
    } catch (err) {
      console.warn('Error reading spare part by id from MongoDB:', err);
    }
    const parts = loadDatabase().spareParts || [];
    return parts.find((p) => p.id === id || p.partNumber === id);
  },

  createSparePart: async (part: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<SparePart> => {
    const timestamp = new Date().toISOString();
    const newPart: SparePart = {
      ...part,
      id: part.id || `prt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await SparePartModel.create(newPart);
      }
    } catch (err) {
      console.warn('Error creating spare part in MongoDB:', err);
    }
    const state = loadDatabase();
    if (!state.spareParts) state.spareParts = [];
    state.spareParts.unshift(newPart);
    saveDatabase(state);
    return newPart;
  },

  updateSparePart: async (id: string, updates: Partial<SparePart>): Promise<SparePart | null> => {
    let mongoUpdated: SparePart | null = null;
    const timestamp = new Date().toISOString();
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await SparePartModel.findOneAndUpdate(
          { $or: [{ id }, { partNumber: id }] },
          { ...updates, updatedAt: timestamp },
          { new: true }
        ).lean();
        if (updated) {
          mongoUpdated = cleanMongoDoc<SparePart>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating spare part in MongoDB:', err);
    }
    const state = loadDatabase();
    if (!state.spareParts) state.spareParts = [];
    const idx = state.spareParts.findIndex((p) => p.id === id || p.partNumber === id);
    if (idx !== -1) {
      const current = state.spareParts[idx];
      const newStock = updates.stockQuantity !== undefined ? updates.stockQuantity : current.stockQuantity;
      const minThresh = updates.minThreshold !== undefined ? updates.minThreshold : current.minThreshold;
      let status: SparePart['status'] = 'In Stock';
      if (newStock <= 0) {
        status = 'Out of Stock';
      } else if (newStock <= minThresh) {
        status = 'Low Stock';
      }
      state.spareParts[idx] = {
        ...current,
        ...updates,
        status: updates.status || status,
        updatedAt: timestamp,
      };
      saveDatabase(state);
    }
    return mongoUpdated || (idx !== -1 ? state.spareParts[idx] : null);
  },

  deleteSparePart: async (id: string): Promise<boolean> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await SparePartModel.deleteOne({ $or: [{ id }, { partNumber: id }] });
      }
    } catch (err) {
      console.warn('Error deleting spare part in MongoDB:', err);
    }
    const state = loadDatabase();
    if (!state.spareParts) return false;
    const initialLen = state.spareParts.length;
    state.spareParts = state.spareParts.filter((p) => p.id !== id && p.partNumber !== id);
    saveDatabase(state);
    return state.spareParts.length < initialLen;
  },

  adjustSparePartStock: async (id: string, delta: number): Promise<SparePart | null> => {
    const state = loadDatabase();
    if (!state.spareParts) state.spareParts = [];
    const part = state.spareParts.find((p) => p.id === id || p.partNumber === id);
    if (!part) return null;
    const newQuantity = Math.max(0, part.stockQuantity + delta);
    let newStatus: SparePart['status'] = 'In Stock';
    if (newQuantity <= 0) {
      newStatus = 'Out of Stock';
    } else if (newQuantity <= part.minThreshold) {
      newStatus = 'Low Stock';
    }
    return await db.updateSparePart(id, { stockQuantity: newQuantity, status: newStatus });
  },

  // ==========================================
  // PART REQUISITIONS
  // ==========================================
  getPartRequisitions: async (): Promise<PartRequisition[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const reqs = await PartRequisitionModel.find({}).sort({ requestedAt: -1 }).lean();
        if (reqs && reqs.length > 0) {
          return reqs.map((r) => cleanMongoDoc<PartRequisition>(r));
        }
      }
    } catch (err) {
      console.warn('Error reading part requisitions from MongoDB:', err);
    }
    return loadDatabase().partRequisitions || [];
  },

  createPartRequisition: async (req: Omit<PartRequisition, 'id' | 'requestedAt'> & { id?: string }): Promise<PartRequisition> => {
    const timestamp = new Date().toISOString();
    const newReq: PartRequisition = {
      ...req,
      id: req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      requestedAt: timestamp,
    };
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await PartRequisitionModel.create(newReq);
      }
    } catch (err) {
      console.warn('Error creating part requisition in MongoDB:', err);
    }
    const state = loadDatabase();
    if (!state.partRequisitions) state.partRequisitions = [];
    state.partRequisitions.unshift(newReq);
    saveDatabase(state);
    return newReq;
  },

  updatePartRequisition: async (id: string, updates: Partial<PartRequisition>): Promise<PartRequisition | null> => {
    let mongoUpdated: PartRequisition | null = null;
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await PartRequisitionModel.findOneAndUpdate(
          { id },
          updates,
          { new: true }
        ).lean();
        if (updated) {
          mongoUpdated = cleanMongoDoc<PartRequisition>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating part requisition in MongoDB:', err);
    }
    const state = loadDatabase();
    if (!state.partRequisitions) state.partRequisitions = [];
    const idx = state.partRequisitions.findIndex((r) => r.id === id);
    if (idx !== -1) {
      state.partRequisitions[idx] = { ...state.partRequisitions[idx], ...updates };
      saveDatabase(state);
    }
    return mongoUpdated || (idx !== -1 ? state.partRequisitions[idx] : null);
  },

  // ==========================================
  // PURCHASE ORDERS
  // ==========================================
  getPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const pos = await PurchaseOrderModel.find({}).sort({ orderDate: -1 }).lean();
        if (pos && pos.length > 0) {
          return pos.map((p) => cleanMongoDoc<PurchaseOrder>(p));
        }
      }
    } catch (err) {
      console.warn('Error reading purchase orders from MongoDB:', err);
    }
    return loadDatabase().purchaseOrders || [];
  },

  createPurchaseOrder: async (po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<PurchaseOrder> => {
    const timestamp = new Date().toISOString();
    const newPo: PurchaseOrder = {
      ...po,
      id: po.id || `po_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await PurchaseOrderModel.create(newPo);
      }
    } catch (err) {
      console.warn('Error creating purchase order in MongoDB:', err);
    }
    const state = loadDatabase();
    if (!state.purchaseOrders) state.purchaseOrders = [];
    state.purchaseOrders.unshift(newPo);
    saveDatabase(state);
    return newPo;
  },

  updatePurchaseOrder: async (id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
    let mongoUpdated: PurchaseOrder | null = null;
    const timestamp = new Date().toISOString();
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        const updated = await PurchaseOrderModel.findOneAndUpdate(
          { $or: [{ id }, { poNumber: id }] },
          { ...updates, updatedAt: timestamp },
          { new: true }
        ).lean();
        if (updated) {
          mongoUpdated = cleanMongoDoc<PurchaseOrder>(updated);
        }
      }
    } catch (err) {
      console.warn('Error updating purchase order in MongoDB:', err);
    }
    const state = loadDatabase();
    if (!state.purchaseOrders) state.purchaseOrders = [];
    const idx = state.purchaseOrders.findIndex((p) => p.id === id || p.poNumber === id);
    if (idx !== -1) {
      state.purchaseOrders[idx] = { ...state.purchaseOrders[idx], ...updates, updatedAt: timestamp };
      saveDatabase(state);
    }
    return mongoUpdated || (idx !== -1 ? state.purchaseOrders[idx] : null);
  },
};
