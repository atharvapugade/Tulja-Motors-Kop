import mongoose from 'mongoose';
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
} from './seed-data';
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
} from './models';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tulja_motors';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'tulja_motors';

interface GlobalMongo {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isAvailable: boolean | null;
  lastError: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: GlobalMongo | undefined;
}

const cached: GlobalMongo = global.mongooseCache || {
  conn: null,
  promise: null,
  isAvailable: null,
  lastError: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<{
  isConnected: boolean;
  mongooseInstance?: typeof mongoose;
  error?: string;
}> {
  // If connection is already active and healthy
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return { isConnected: true, mongooseInstance: cached.conn };
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      dbName: MONGODB_DB_NAME,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(async (m) => {
        cached.isAvailable = true;
        cached.lastError = null;
        console.log(`[MongoDB] Connected successfully to MongoDB (${m.connection.name} @ ${m.connection.host})`);

        // Check and seed initial collections if needed
        try {
          await ensureInitialDataSeeded();
        } catch (seedErr) {
          console.warn('[MongoDB] Auto-seeding warning:', seedErr);
        }

        return m;
      })
      .catch((err: Error) => {
        console.warn(`[MongoDB] Connection notice: ${err.message}. Seamlessly serving via resilient local store.`);
        cached.isAvailable = false;
        cached.lastError = err.message;
        cached.promise = null;
        return null as unknown as typeof mongoose;
      });
  }

  try {
    const conn = await cached.promise;
    if (conn && conn.connection.readyState === 1) {
      cached.conn = conn;
      return { isConnected: true, mongooseInstance: conn };
    }
    return { isConnected: false, error: cached.lastError || 'Unable to establish MongoDB connection' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    cached.isAvailable = false;
    cached.lastError = msg;
    return { isConnected: false, error: msg };
  }
}

export async function getDbConnectionStatus() {
  const isConnected = !!(cached.conn && cached.conn.connection.readyState === 1);
  return {
    isConnected,
    source: isConnected ? 'MongoDB Atlas' : 'Resilient Local Store',
    dbName: cached.conn?.connection.name || MONGODB_DB_NAME,
    host: cached.conn?.connection.host || 'cluster0.lpvfxkm.mongodb.net',
    readyState: cached.conn?.connection.readyState ?? 0,
    lastError: cached.lastError,
  };
}

async function ensureInitialDataSeeded() {
  const userCount = await UserModel.countDocuments();
  if (userCount === 0) {
    console.log('[MongoDB] Initializing database with Tulja Motors seed data...');
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
    ]);
    console.log('[MongoDB] Database provisioned with initial workshop dataset.');
    return;
  }

  // Non-destructively ensure multi-trade workshop technicians are available on existing DBs
  const techUserIds = ['usr_tech_02', 'usr_tech_03', 'usr_tech_04'];
  for (const uid of techUserIds) {
    const seedUser = initialUsers.find((u) => u.id === uid);
    if (seedUser) {
      const exists = await UserModel.exists({ $or: [{ id: seedUser.id }, { email: seedUser.email }] });
      if (!exists) {
        await UserModel.create(seedUser).catch(() => {});
      }
    }
    const seedEmp = initialEmployees.find((e) => e.userId === uid);
    if (seedEmp) {
      const empExists = await EmployeeModel.exists({
        $or: [{ id: seedEmp.id }, { employeeCode: seedEmp.employeeCode }, { email: seedEmp.email }],
      });
      if (!empExists) {
        await EmployeeModel.create(seedEmp).catch(() => {});
      }
    }
  }
}
