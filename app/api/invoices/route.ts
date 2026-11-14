import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { Invoice, JobCard, Payment } from '@/lib/models/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobCardId = searchParams.get('jobCardId');
    const status = searchParams.get('status');

    let invoices = await db.getInvoices();

    if (jobCardId) {
      invoices = invoices.filter(
        (i) => i.jobCardId === jobCardId || i.jobCardNumber === jobCardId
      );
    }

    if (status && status !== 'ALL') {
      invoices = invoices.filter((i) => i.status === status);
    }

    return NextResponse.json({ success: true, invoices });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching invoices';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. GENERATE INVOICE FROM ACTIVE JOB CARD (Live Billing sync)
    if (action === 'generate_from_job') {
      const { jobCardId, generatedBy } = body;
      if (!jobCardId) {
        return NextResponse.json({ success: false, message: 'Job Card ID is required' }, { status: 400 });
      }

      const allJobs = await db.getJobCards();
      const job = allJobs.find((j) => j.id === jobCardId || j.jobCardNumber === jobCardId);
      if (!job) {
        return NextResponse.json({ success: false, message: 'Job Card not found' }, { status: 404 });
      }

      const existingInvoices = await db.getInvoices();
      const alreadyExists = existingInvoices.find(
        (i) => i.jobCardId === job.id || i.jobCardNumber === job.jobCardNumber
      );
      if (alreadyExists) {
        return NextResponse.json({
          success: true,
          invoice: alreadyExists,
          message: `Invoice ${alreadyExists.invoiceNumber} already exists for this job card.`,
        });
      }

      const year = new Date().getFullYear();
      const maxInvNo = existingInvoices.reduce((max, inv) => {
        const m = inv.invoiceNumber?.match(/TM-INV-\d+-(\d+)/);
        const n = m ? parseInt(m[1], 10) : 0;
        return n > max ? n : max;
      }, 0);
      const nextNumStr = String(maxInvNo + 1).padStart(3, '0');
      const invoiceNumber = `TM-INV-${year}-${nextNumStr}`;

      const est = job.costEstimate || {
        labour: 0,
        spareParts: 0,
        painting: 0,
        additionalCharges: 0,
        discount: 0,
        taxable: 0,
        taxRate: 18,
        taxAmount: 0,
        total: 0,
      };

      const labourCharges = est.labour || 0;
      const partsCharges = est.spareParts || 0;
      const paintCharges = est.painting || 0;
      const otherCharges = est.additionalCharges || 0;
      const discount = est.discount || 0;
      const taxableAmount = Math.max(0, labourCharges + partsCharges + paintCharges + otherCharges - discount);
      const gstRate = est.taxRate || 18;
      const gstAmount = Math.round((taxableAmount * gstRate) / 100);
      const grandTotal = Math.round(taxableAmount + gstAmount);
      const today = new Date().toISOString().split('T')[0];
      const due = job.estimatedCompletionDate || today;

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber,
        jobCardId: job.id,
        jobCardNumber: job.jobCardNumber,
        customerId: job.customerId,
        customerName: job.customerName,
        vehicleRegistration: job.vehicleRegistration,
        issueDate: today,
        dueDate: due,
        labourCharges,
        partsCharges,
        paintCharges,
        otherCharges,
        discount,
        taxableAmount,
        gstRate,
        gstAmount,
        grandTotal,
        amountPaid: 0,
        balanceDue: grandTotal,
        status: 'Sent',
      };

      const saved = await db.createInvoice(newInvoice);

      await db.logActivity({
        action: 'INVOICE_GENERATED',
        entityType: 'Invoice',
        entityId: saved.id,
        performedBy: generatedBy || 'Vikram Deshmukh (Body Shop Manager)',
        userRole: 'body_shop_manager',
        details: `Generated Tax Invoice ${saved.invoiceNumber} for Job Card ${job.jobCardNumber} (${job.vehicleRegistration}). Grand Total: ₹${saved.grandTotal.toLocaleString('en-IN')}.`,
      });

      return NextResponse.json({
        success: true,
        invoice: saved,
        message: `Tax Invoice ${saved.invoiceNumber} generated successfully!`,
      });
    }

    // 2. UPDATE INVOICE DETAILS
    if (action === 'update_invoice') {
      const {
        invoiceId,
        labourCharges,
        partsCharges,
        paintCharges,
        otherCharges,
        discount,
        status,
        updatedBy,
      } = body;

      if (!invoiceId) {
        return NextResponse.json({ success: false, message: 'Invoice ID is required' }, { status: 400 });
      }

      const allInvoices = await db.getInvoices();
      const existing = allInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
      if (!existing) {
        return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
      }

      const labour = labourCharges !== undefined ? Number(labourCharges) : existing.labourCharges;
      const parts = partsCharges !== undefined ? Number(partsCharges) : existing.partsCharges;
      const paint = paintCharges !== undefined ? Number(paintCharges) : existing.paintCharges;
      const other = otherCharges !== undefined ? Number(otherCharges) : existing.otherCharges;
      const disc = discount !== undefined ? Number(discount) : existing.discount;

      const taxableAmount = Math.max(0, labour + parts + paint + other - disc);
      const gstRate = existing.gstRate || 18;
      const gstAmount = Math.round((taxableAmount * gstRate) / 100);
      const grandTotal = Math.round(taxableAmount + gstAmount);
      const amountPaid = existing.amountPaid || 0;
      const balanceDue = Math.max(0, grandTotal - amountPaid);

      let nextStatus = status || existing.status;
      if (!status) {
        if (balanceDue === 0 && grandTotal > 0) nextStatus = 'Paid';
        else if (amountPaid > 0) nextStatus = 'Partially Paid';
      }

      const updates: Partial<Invoice> = {
        labourCharges: labour,
        partsCharges: parts,
        paintCharges: paint,
        otherCharges: other,
        discount: disc,
        taxableAmount,
        gstAmount,
        grandTotal,
        balanceDue,
        status: nextStatus,
      };

      const updated = await db.updateInvoice(existing.id, updates);

      await db.logActivity({
        action: 'INVOICE_UPDATED',
        entityType: 'Invoice',
        entityId: existing.id,
        performedBy: updatedBy || 'Vikram Deshmukh (Body Shop Manager)',
        userRole: 'body_shop_manager',
        details: `Updated Tax Invoice ${existing.invoiceNumber}. Revised Total: ₹${grandTotal.toLocaleString('en-IN')}, Status: ${nextStatus}.`,
      });

      return NextResponse.json({
        success: true,
        invoice: updated,
        message: `Invoice ${existing.invoiceNumber} updated successfully!`,
      });
    }

    // 3. RECORD PAYMENT AGAINST INVOICE
    if (action === 'record_payment') {
      const { invoiceId, amount, paymentMethod, reference, receivedBy } = body;
      const paymentAmount = Number(amount);
      if (!invoiceId || !paymentAmount || paymentAmount <= 0) {
        return NextResponse.json({ success: false, message: 'Valid invoice and positive amount are required' }, { status: 400 });
      }

      const allInvoices = await db.getInvoices();
      const invoice = allInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
      if (!invoice) {
        return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
      }

      const newAmountPaid = (invoice.amountPaid || 0) + paymentAmount;
      const newBalanceDue = Math.max(0, (invoice.grandTotal || 0) - newAmountPaid);
      const newStatus = newBalanceDue === 0 ? 'Paid' : 'Partially Paid';

      const updated = await db.updateInvoice(invoice.id, {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      });

      const newPayment: Payment = {
        id: `pay_${Date.now()}`,
        paymentNumber: `TM-PAY-${Date.now().toString().slice(-6)}`,
        invoiceId: invoice.id,
        jobCardId: invoice.jobCardId,
        amount: paymentAmount,
        paymentMethod: paymentMethod || 'UPI',
        transactionReference: reference || `REF-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        receivedBy: receivedBy || 'Body Shop Manager',
        receiptNotes: `Payment received against ${invoice.invoiceNumber}`,
      };

      await db.createPayment(newPayment);

      await db.logActivity({
        action: 'PAYMENT_COLLECTED',
        entityType: 'Invoice',
        entityId: invoice.id,
        performedBy: receivedBy || 'Vikram Deshmukh (Body Shop Manager)',
        userRole: 'body_shop_manager',
        details: `Recorded ₹${paymentAmount.toLocaleString('en-IN')} payment (${paymentMethod || 'UPI'}) for Invoice ${invoice.invoiceNumber}. Remaining Balance: ₹${newBalanceDue.toLocaleString('en-IN')}.`,
      });

      return NextResponse.json({
        success: true,
        invoice: updated,
        payment: newPayment,
        message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully!`,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error processing invoice request';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

