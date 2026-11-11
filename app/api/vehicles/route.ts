import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { Vehicle } from '@/lib/models/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let vehicles = await db.getVehicles();

    if (customerId) {
      vehicles = vehicles.filter((v: Vehicle) => v.customerId === customerId);
    }

    if (search) {
      vehicles = vehicles.filter(
        (v: Vehicle) =>
          v.registrationNumber.toLowerCase().includes(search) ||
          v.make.toLowerCase().includes(search) ||
          v.model.toLowerCase().includes(search) ||
          v.vin.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, vehicles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching vehicles';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.registrationNumber?.trim() || !body.make?.trim() || !body.model?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Registration number, vehicle make, and model are required.' },
        { status: 400 }
      );
    }

    const regNo = body.registrationNumber.toUpperCase().trim();
    const existingVehicles = await db.getVehicles();
    const duplicate = existingVehicles.find(
      (v) => v.registrationNumber.toUpperCase().trim() === regNo
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: `Vehicle ${regNo} is already registered (${duplicate.make} ${duplicate.model}). Please select it or edit its record.`,
        },
        { status: 400 }
      );
    }

    const newVehicle: Vehicle = {
      id: `veh_${Date.now()}`,
      customerId: body.customerId || 'cust_001',
      registrationNumber: regNo,
      make: body.make.trim(),
      model: body.model.trim(),
      variant: body.variant?.trim() || '',
      year: Number(body.year) || new Date().getFullYear(),
      color: body.color?.trim() || 'White',
      fuelType: body.fuelType || 'Petrol',
      odometer: Number(body.odometer) || 0,
      vin: body.vin?.toUpperCase().trim() || 'NOT_RECORDED',
      engineNumber: body.engineNumber?.toUpperCase().trim() || '',
      createdAt: new Date().toISOString(),
    };

    const saved = await db.createVehicle(newVehicle);

    await db.logActivity({
      action: 'VEHICLE_REGISTERED',
      entityType: 'JobCard',
      entityId: saved.id,
      performedBy: body.createdBy || 'Service Advisor',
      userRole: 'advisor',
      details: `Registered vehicle ${saved.registrationNumber} (${saved.make} ${saved.model})`,
    });

    return NextResponse.json({ success: true, vehicle: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error registering vehicle';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing vehicle ID' }, { status: 400 });
    }

    const updates: Partial<Vehicle> = {};
    if (body.customerId !== undefined) updates.customerId = body.customerId;
    if (body.registrationNumber !== undefined)
      updates.registrationNumber = body.registrationNumber.toUpperCase().trim();
    if (body.make !== undefined) updates.make = body.make.trim();
    if (body.model !== undefined) updates.model = body.model.trim();
    if (body.variant !== undefined) updates.variant = body.variant.trim();
    if (body.year !== undefined) updates.year = Number(body.year);
    if (body.color !== undefined) updates.color = body.color.trim();
    if (body.fuelType !== undefined) updates.fuelType = body.fuelType;
    if (body.odometer !== undefined) updates.odometer = Number(body.odometer);
    if (body.vin !== undefined) updates.vin = body.vin.toUpperCase().trim();
    if (body.engineNumber !== undefined) updates.engineNumber = body.engineNumber.toUpperCase().trim();

    const updated = await db.updateVehicle(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
    }

    await db.logActivity({
      action: 'VEHICLE_UPDATED',
      entityType: 'JobCard',
      entityId: updated.id,
      performedBy: body.updatedBy || 'Service Advisor',
      userRole: 'advisor',
      details: `Updated vehicle intake details for ${updated.registrationNumber}`,
    });

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating vehicle';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
