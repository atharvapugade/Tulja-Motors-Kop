import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { Customer } from '@/lib/models/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    let customers = await db.getCustomers();

    if (search) {
      customers = customers.filter(
        (c: Customer) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.toLowerCase().includes(search) ||
          c.customerCode.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, customers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching customers';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Customer name and phone number are required.' },
        { status: 400 }
      );
    }

    const customers = await db.getCustomers();
    const maxNum = customers.reduce((max, c) => {
      const m = c.customerCode?.match(/TM-CUST-(\d+)/);
      const n = m ? parseInt(m[1], 10) : 100;
      return n > max ? n : max;
    }, 100);
    const nextCode = `TM-CUST-${maxNum + 1}`;

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      customerCode: nextCode,
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || '',
      address: body.address?.trim() || '',
      city: body.city?.trim() || 'Kolhapur',
      state: body.state?.trim() || 'Maharashtra',
      pincode: body.pincode?.trim() || '416001',
      createdAt: new Date().toISOString(),
    };

    const saved = await db.createCustomer(newCust);

    await db.logActivity({
      action: 'CUSTOMER_CREATED',
      entityType: 'User',
      entityId: saved.id,
      performedBy: body.createdBy || 'Service Advisor',
      userRole: 'advisor',
      details: `Registered customer ${saved.name} (${saved.customerCode}) - ${saved.phone}`,
    });

    return NextResponse.json({ success: true, customer: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating customer';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing customer ID' }, { status: 400 });
    }

    const updates: Partial<Customer> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.phone !== undefined) updates.phone = body.phone.trim();
    if (body.email !== undefined) updates.email = body.email.trim();
    if (body.address !== undefined) updates.address = body.address.trim();
    if (body.city !== undefined) updates.city = body.city.trim();
    if (body.state !== undefined) updates.state = body.state.trim();
    if (body.pincode !== undefined) updates.pincode = body.pincode.trim();

    const updated = await db.updateCustomer(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    await db.logActivity({
      action: 'CUSTOMER_UPDATED',
      entityType: 'User',
      entityId: updated.id,
      performedBy: body.updatedBy || 'Service Advisor',
      userRole: 'advisor',
      details: `Updated customer record ${updated.name} (${updated.customerCode})`,
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating customer';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
