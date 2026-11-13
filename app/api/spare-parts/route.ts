import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { SparePart, PartRequisition, PurchaseOrder } from '@/lib/models/types';

export async function GET() {
  try {
    const [parts, requisitions, purchaseOrders] = await Promise.all([
      db.getSpareParts(),
      db.getPartRequisitions(),
      db.getPurchaseOrders(),
    ]);

    const totalStockQty = parts.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
    const inventoryValuation = parts.reduce((acc, p) => acc + (p.stockQuantity || 0) * (p.unitPrice || 0), 0);
    const lowStockCount = parts.filter((p) => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= (p.minThreshold || 2)).length;
    const outOfStockCount = parts.filter((p) => (p.stockQuantity || 0) === 0).length;
    const pendingRequisitions = requisitions.filter((r) => r.status === 'Requested' || r.status === 'Pending Stock').length;
    const issuedRequisitions = requisitions.filter((r) => r.status === 'Issued').length;
    const activePurchaseOrders = purchaseOrders.filter((po) => po.status === 'Placed' || po.status === 'Draft').length;

    return NextResponse.json({
      success: true,
      parts,
      requisitions,
      purchaseOrders,
      stats: {
        totalParts: parts.length,
        totalStockQty,
        inventoryValuation,
        lowStockCount,
        outOfStockCount,
        pendingRequisitions,
        issuedRequisitions,
        activePurchaseOrders,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch spare parts inventory';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. ADD NEW SPARE PART
    if (action === 'add_part') {
      const {
        partNumber,
        name,
        description,
        category,
        compatibleModels,
        stockQuantity,
        minThreshold,
        unitPrice,
        locationBin,
        supplierName,
      } = body;

      if (!partNumber || !name || !category) {
        return NextResponse.json(
          { success: false, message: 'Part Code, Part Name, and Category are required.' },
          { status: 400 }
        );
      }

      const existing = await db.getSparePartById(partNumber.trim());
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Part code "${partNumber}" already exists in the catalog.` },
          { status: 400 }
        );
      }

      const stock = Number(stockQuantity) || 0;
      const min = Number(minThreshold) || 2;
      const price = Number(unitPrice) || 0;

      let status: SparePart['status'] = 'In Stock';
      if (stock === 0) status = 'Out of Stock';
      else if (stock <= min) status = 'Low Stock';

      const newPart = await db.createSparePart({
        partNumber: partNumber.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || '',
        category: category || 'Other',
        compatibleModels: compatibleModels?.trim() || 'Universal',
        stockQuantity: stock,
        minThreshold: min,
        unitPrice: price,
        locationBin: locationBin?.trim() || 'Warehouse Rack',
        supplierName: supplierName?.trim() || 'OEM Supplier',
        status,
      });

      await db.logActivity({
        action: 'SPARE_PART_CREATED',
        entityType: 'SparePart',
        entityId: newPart.id,
        performedBy: body.performedBy || 'Sachin K. Mane (Spare Parts Manager)',
        userRole: 'spare_parts_manager',
        details: `Added new spare part "${newPart.name}" (${newPart.partNumber}) to catalog with initial stock of ${newPart.stockQuantity} units.`,
      });

      return NextResponse.json({
        success: true,
        part: newPart,
        message: `Part "${newPart.name}" (${newPart.partNumber}) registered in catalog!`,
      });
    }

    // 2. UPDATE SPARE PART
    if (action === 'update_part') {
      const { id, updates } = body;
      if (!id) {
        return NextResponse.json({ success: false, message: 'Part ID is required.' }, { status: 400 });
      }

      const updated = await db.updateSparePart(id, updates);
      if (!updated) {
        return NextResponse.json({ success: false, message: 'Part not found.' }, { status: 404 });
      }

      await db.logActivity({
        action: 'SPARE_PART_UPDATED',
        entityType: 'SparePart',
        entityId: updated.id,
        performedBy: body.performedBy || 'Sachin K. Mane (Spare Parts Manager)',
        userRole: 'spare_parts_manager',
        details: `Updated catalog specifications for "${updated.name}" (${updated.partNumber}).`,
      });

      return NextResponse.json({
        success: true,
        part: updated,
        message: `Part "${updated.name}" updated successfully.`,
      });
    }

    // 3. DELETE SPARE PART
    if (action === 'delete_part') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, message: 'Part ID is required.' }, { status: 400 });
      }

      const part = await db.getSparePartById(id);
      await db.deleteSparePart(id);

      await db.logActivity({
        action: 'SPARE_PART_DELETED',
        entityType: 'SparePart',
        entityId: id,
        performedBy: body.performedBy || 'Sachin K. Mane (Spare Parts Manager)',
        userRole: 'spare_parts_manager',
        details: `Removed spare part "${part?.name || id}" (${part?.partNumber || id}) from catalog.`,
      });

      return NextResponse.json({
        success: true,
        message: `Part "${part?.name || id}" removed from inventory catalog.`,
      });
    }

    // 4. ADJUST STOCK QUANTITY
    if (action === 'adjust_stock') {
      const { id, delta, reason } = body;
      if (!id || typeof delta !== 'number') {
        return NextResponse.json({ success: false, message: 'Part ID and adjustment delta are required.' }, { status: 400 });
      }

      const part = await db.getSparePartById(id);
      if (!part) {
        return NextResponse.json({ success: false, message: 'Part not found.' }, { status: 404 });
      }

      const updated = await db.adjustSparePartStock(id, delta);

      await db.logActivity({
        action: 'STOCK_ADJUSTED',
        entityType: 'SparePart',
        entityId: id,
        performedBy: body.performedBy || 'Sachin K. Mane (Spare Parts Manager)',
        userRole: 'spare_parts_manager',
        details: `Adjusted stock for "${part.name}" by ${delta > 0 ? `+${delta}` : delta} units (${reason || 'Manual count audit'}). New stock: ${updated?.stockQuantity || 0}.`,
      });

      return NextResponse.json({
        success: true,
        part: updated,
        message: `Stock updated for "${part.name}". New balance: ${updated?.stockQuantity || 0} units.`,
      });
    }

    // 5. ISSUE PART TO JOB CARD
    if (action === 'issue_to_job') {
      const { jobCardId, partId, quantity, notes, requestedBy } = body;
      if (!jobCardId || !partId) {
        return NextResponse.json({ success: false, message: 'Job Card and Spare Part selections are required.' }, { status: 400 });
      }

      const qty = Math.max(1, Number(quantity) || 1);
      const part = await db.getSparePartById(partId);
      if (!part) {
        return NextResponse.json({ success: false, message: 'Selected spare part not found.' }, { status: 404 });
      }

      if (part.stockQuantity < qty) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${part.name}". Available: ${part.stockQuantity} pcs, Requested: ${qty} pcs.`,
          },
          { status: 400 }
        );
      }

      const allJobs = await db.getJobCards();
      const job = allJobs.find((j) => j.id === jobCardId || j.jobCardNumber === jobCardId);
      if (!job) {
        return NextResponse.json({ success: false, message: 'Selected job card not found.' }, { status: 404 });
      }

      // Deduct stock
      const updatedPart = await db.adjustSparePartStock(partId, -qty);

      // Create Requisition Record
      const lineTotal = part.unitPrice * qty;
      const requisition = await db.createPartRequisition({
        jobCardId: job.id,
        jobCardNumber: job.jobCardNumber,
        vehicleRegistration: job.vehicleRegistration,
        vehicleModel: job.vehicleModel,
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.name,
        quantity: qty,
        unitPrice: part.unitPrice,
        totalPrice: lineTotal,
        status: 'Issued',
        requestedBy: requestedBy || 'Workshop Floor Requisition',
        issuedAt: new Date().toISOString(),
        notes: notes || `Issued to floor for ${job.vehicleModel} (${job.vehicleRegistration}).`,
      });

      // If job had 'Spare Parts Pending' bottleneck, resolve it
      if (job.bottleneckInfo?.category === 'Spare Parts Pending') {
        await db.updateJobCard(job.id, {
          bottleneckInfo: {
            ...job.bottleneckInfo,
            isDelayed: false,
            resolvedAt: new Date().toISOString(),
            actionPlan: `Spare parts (${part.name} x${qty}) issued and delivered to workshop floor.`,
          },
        });
      }

      await db.logActivity({
        action: 'PARTS_ISSUED_TO_JOB',
        entityType: 'PartRequisition',
        entityId: requisition.id,
        performedBy: body.performedBy || 'Sachin K. Mane (Spare Parts Manager)',
        userRole: 'spare_parts_manager',
        details: `Issued ${qty}x "${part.name}" (${part.partNumber}) to Job Card ${job.jobCardNumber} (${job.vehicleRegistration}). Value: ₹${lineTotal.toLocaleString('en-IN')}.`,
      });

      return NextResponse.json({
        success: true,
        requisition,
        part: updatedPart,
        message: `${qty}x "${part.name}" issued to Job Card ${job.jobCardNumber} (${job.vehicleRegistration})!`,
      });
    }

    // 6. CREATE PURCHASE ORDER
    if (action === 'create_po') {
      const { supplierName, supplierContact, expectedDeliveryDate, items, notes } = body;
      if (!supplierName || !items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, message: 'Supplier name and at least one item are required.' }, { status: 400 });
      }

      const poCount = (await db.getPurchaseOrders()).length;
      const poNumber = `PO-2026-${String(poCount + 43).padStart(3, '0')}`;
      const totalAmount = items.reduce(
        (acc: number, item: { quantity: number; unitCost: number }) => acc + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
        0
      );

      const newPo = await db.createPurchaseOrder({
        poNumber,
        supplierName: supplierName.trim(),
        supplierContact: supplierContact?.trim() || '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        items: items.map((i: any) => ({
          partId: i.partId,
          partNumber: i.partNumber,
          partName: i.partName,
          quantity: Number(i.quantity) || 1,
          unitCost: Number(i.unitCost) || 0,
          totalCost: (Number(i.quantity) || 1) * (Number(i.unitCost) || 0),
        })),
        totalAmount,
        status: 'Placed',
        notes: notes?.trim() || '',
      });

      await db.logActivity({
        action: 'PURCHASE_ORDER_CREATED',
        entityType: 'PurchaseOrder',
        entityId: newPo.id,
        performedBy: body.performedBy || 'Sachin K. Mane (Spare Parts Manager)',
        userRole: 'spare_parts_manager',
        details: `Created Purchase Order ${newPo.poNumber} with ${newPo.supplierName} for ${newPo.items.length} items (Total: ₹${totalAmount.toLocaleString('en-IN')}).`,
      });

      return NextResponse.json({
        success: true,
        purchaseOrder: newPo,
        message: `Purchase Order ${newPo.poNumber} created and dispatched to ${newPo.supplierName}!`,
      });
    }

    // 7. RECEIVE PURCHASE ORDER & RESTOCK
    if (action === 'receive_po') {
      const { poId } = body;
      if (!poId) {
        return NextResponse.json({ success: false, message: 'Purchase Order ID is required.' }, { status: 400 });
      }

      const allPos = await db.getPurchaseOrders();
      const po = allPos.find((p) => p.id === poId || p.poNumber === poId);
      if (!po) {
        return NextResponse.json({ success: false, message: 'Purchase order not found.' }, { status: 404 });
      }

      if (po.status === 'Received') {
        return NextResponse.json({ success: false, message: 'Purchase order has already been received and restocked.' }, { status: 400 });
      }

      // Restock all items
      for (const item of po.items) {
        if (item.partId && item.quantity > 0) {
          await db.adjustSparePartStock(item.partId, item.quantity);
        }
      }

      // Mark PO as received
      const updatedPo = await db.updatePurchaseOrder(po.id, {
        status: 'Received',
      });

      await db.logActivity({
        action: 'PURCHASE_ORDER_RECEIVED',
        entityType: 'PurchaseOrder',
        entityId: po.id,
        performedBy: body.performedBy || 'Sachin K. Mane (Spare Parts Manager)',
        userRole: 'spare_parts_manager',
        details: `Goods receipt confirmed for Purchase Order ${po.poNumber}. Automatically restocked ${po.items.length} catalog items into workshop warehouse.`,
      });

      return NextResponse.json({
        success: true,
        purchaseOrder: updatedPo,
        message: `Goods receipt confirmed for ${po.poNumber}! Inventory stock automatically updated.`,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid or unsupported inventory action.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error processing inventory request';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

