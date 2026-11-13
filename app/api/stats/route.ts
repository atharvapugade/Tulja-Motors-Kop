import { NextResponse, connection } from 'next/server';
import { db } from '@/lib/db/store';
import { JobCard, Invoice, Payment, Expense, AttendanceRecord, MarketingLead } from '@/lib/models/types';

export async function GET() {
  await connection();
  try {
    const [
      users,
      employees,
      customers,
      vehicles,
      jobCards,
      invoices,
      payments,
      expenses,
      attendance,
      leads,
      activityLogs,
      spareParts,
      partRequisitions,
      purchaseOrders,
    ] = await Promise.all([
      db.getUsers(),
      db.getEmployees(),
      db.getCustomers(),
      db.getVehicles(),
      db.getJobCards(),
      db.getInvoices(),
      db.getPayments(),
      db.getExpenses(),
      db.getAttendance(),
      db.getLeads(),
      db.getActivityLogs(),
      db.getSpareParts(),
      db.getPartRequisitions(),
      db.getPurchaseOrders(),
    ]);

    const activeJobCards = jobCards.filter((j: JobCard) => j.jobStatus === 'Active');
    const completedJobCards = jobCards.filter((j: JobCard) => j.jobStatus === 'Completed' || j.jobStatus === 'Delivered');

    const totalBilled = invoices.reduce((acc: number, inv: Invoice) => acc + (inv.grandTotal || 0), 0);
    const totalCollected = payments.reduce((acc: number, pay: Payment) => acc + (pay.amount || 0), 0);
    const pendingPayments = totalBilled - totalCollected;
    const totalExpenses = expenses.reduce((acc: number, exp: Expense) => acc + (exp.amount || 0), 0);

    // Stage counts
    const stageCounts: Record<string, number> = {};
    jobCards.forEach((j: JobCard) => {
      stageCounts[j.currentStage] = (stageCounts[j.currentStage] || 0) + 1;
    });

    // Attendance stats
    const presentToday = attendance.filter((a: AttendanceRecord) => a.status === 'Present').length;
    const absentToday = attendance.filter((a: AttendanceRecord) => a.status === 'Absent' || a.status === 'On Leave').length;

    // Active leads
    const activeLeads = leads.filter((l: MarketingLead) => l.status !== 'Converted to Job' && l.status !== 'Lost').length;

    // Spare parts stats
    const totalParts = spareParts.length;
    const inventoryValuation = spareParts.reduce((acc, p) => acc + (p.stockQuantity || 0) * (p.unitPrice || 0), 0);
    const lowStockParts = spareParts.filter((p) => (p.stockQuantity || 0) <= (p.minThreshold || 2)).length;
    const pendingRequisitions = partRequisitions.filter((r) => r.status === 'Requested' || r.status === 'Pending Stock').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalEmployees: employees.length,
        totalUsers: users.length,
        totalCustomers: customers.length,
        totalVehicles: vehicles.length,
        totalJobCards: jobCards.length,
        activeJobs: activeJobCards.length,
        completedJobs: completedJobCards.length,
        totalRevenue: totalBilled,
        totalCollected,
        pendingPayments,
        totalExpenses,
        netProfitEstimate: totalBilled - totalExpenses,
        presentToday,
        absentToday,
        activeLeads,
        stageCounts,
        totalParts,
        inventoryValuation,
        lowStockParts,
        pendingRequisitions,
      },
      recentJobCards: jobCards.slice(0, 5),
      recentActivityLogs: activityLogs.slice(0, 8),
      recentInvoices: invoices.slice(0, 5),
      allActivityLogs: activityLogs,
      allInvoices: invoices,
      allPayments: payments,
      allExpenses: expenses,
      allAttendance: attendance,
      allLeads: leads,
      allSpareParts: spareParts,
      allPartRequisitions: partRequisitions,
      allPurchaseOrders: purchaseOrders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
