import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { Customer, JobCard, Vehicle } from '@/lib/models/types';

function computeCostEstimate(raw: Partial<JobCard['costEstimate']> = {}) {
  const labour = Number(raw.labour) || 0;
  const spareParts = Number(raw.spareParts) || 0;
  const painting = Number(raw.painting) || 0;
  const additionalCharges = Number(raw.additionalCharges) || 0;
  const discount = Number(raw.discount) || 0;
  const taxRate = raw.taxRate !== undefined ? Number(raw.taxRate) : 18;
  const taxable = Math.max(0, labour + spareParts + painting + additionalCharges - discount);
  const taxAmount = Math.round((taxable * taxRate) / 100);
  const total = Math.round(taxable + taxAmount);

  return {
    labour,
    spareParts,
    painting,
    additionalCharges,
    discount,
    taxRate,
    taxAmount,
    total,
  };
}

const PRE_FLOOR_STAGES = [
  'Vehicle Received',
  'Initial Inspection',
  'Estimation',
  'Customer Approval',
];

function isHandedOverJob(job: JobCard): boolean {
  if (job.handoverToSupervisor === true) return true;
  if (job.handoverToSupervisor === false) return false;
  return !PRE_FLOOR_STAGES.includes(job.currentStage);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const stage = searchParams.get('stage') || '';
    const status = searchParams.get('status') || '';
    const supervisorId = searchParams.get('supervisorId') || '';
    const supervisorEmpId = searchParams.get('supervisorEmpId') || '';
    const supervisorName = searchParams.get('supervisorName')?.toLowerCase().trim() || '';
    const handedOverOnly = searchParams.get('handedOverOnly') === 'true';

    let jobCards = await db.getJobCards();

    if (handedOverOnly) {
      jobCards = jobCards.filter((j: JobCard) => isHandedOverJob(j));
    }

    if (supervisorId || supervisorEmpId || supervisorName) {
      jobCards = jobCards.filter((j: JobCard) => {
        const idMatches =
          (supervisorId && j.assignedSupervisorId === supervisorId) ||
          (supervisorEmpId && j.assignedSupervisorId === supervisorEmpId);
        const nameMatches =
          Boolean(supervisorName) &&
          j.assignedSupervisorName?.toLowerCase().trim() === supervisorName;
        return Boolean(idMatches || nameMatches);
      });
    }

    if (search) {
      jobCards = jobCards.filter(
        (j: JobCard) =>
          j.jobCardNumber.toLowerCase().includes(search) ||
          j.customerName.toLowerCase().includes(search) ||
          j.vehicleRegistration.toLowerCase().includes(search) ||
          j.vehicleModel.toLowerCase().includes(search)
      );
    }

    if (stage) {
      jobCards = jobCards.filter((j: JobCard) => j.currentStage === stage);
    }

    if (status) {
      jobCards = jobCards.filter((j: JobCard) => j.jobStatus === status);
    }

    return NextResponse.json({ success: true, jobCards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching job cards';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Optional inline Customer creation
    let customerId = body.customerId || '';
    let customerName = body.customerName || '';
    let customerPhone = body.customerPhone || '';

    if (body.newCustomer && body.newCustomer.name && body.newCustomer.phone) {
      const existingCustomers = await db.getCustomers();
      const maxCust = existingCustomers.reduce((max, c) => {
        const m = c.customerCode?.match(/TM-CUST-(\d+)/);
        const n = m ? parseInt(m[1], 10) : 100;
        return n > max ? n : max;
      }, 100);

      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        customerCode: `TM-CUST-${maxCust + 1}`,
        name: body.newCustomer.name.trim(),
        phone: body.newCustomer.phone.trim(),
        email: body.newCustomer.email?.trim() || '',
        address: body.newCustomer.address?.trim() || '',
        city: body.newCustomer.city?.trim() || 'Kolhapur',
        state: body.newCustomer.state?.trim() || 'Maharashtra',
        pincode: body.newCustomer.pincode?.trim() || '416001',
        createdAt: new Date().toISOString(),
      };
      const savedCust = await db.createCustomer(newCust);
      customerId = savedCust.id;
      customerName = savedCust.name;
      customerPhone = savedCust.phone;
    }

    // 2. Optional inline Vehicle creation
    let vehicleId = body.vehicleId || '';
    let vehicleRegistration = body.vehicleRegistration || '';
    let vehicleModel = body.vehicleModel || '';

    if (body.newVehicle && body.newVehicle.registrationNumber && body.newVehicle.make && body.newVehicle.model) {
      const regNo = body.newVehicle.registrationNumber.toUpperCase().trim();
      const existingVehicles = await db.getVehicles();
      const matched = existingVehicles.find((v) => v.registrationNumber.toUpperCase().trim() === regNo);

      if (matched) {
        vehicleId = matched.id;
        vehicleRegistration = matched.registrationNumber;
        vehicleModel = `${matched.make} ${matched.model}${matched.variant ? ' ' + matched.variant : ''}`.trim();
      } else {
        const newVeh: Vehicle = {
          id: `veh_${Date.now()}`,
          customerId: customerId || 'cust_001',
          registrationNumber: regNo,
          make: body.newVehicle.make.trim(),
          model: body.newVehicle.model.trim(),
          variant: body.newVehicle.variant?.trim() || '',
          year: Number(body.newVehicle.year) || new Date().getFullYear(),
          color: body.newVehicle.color?.trim() || 'White',
          fuelType: body.newVehicle.fuelType || 'Petrol',
          odometer: Number(body.newVehicle.odometer) || 0,
          vin: body.newVehicle.vin?.toUpperCase().trim() || 'NOT_RECORDED',
          engineNumber: body.newVehicle.engineNumber?.toUpperCase().trim() || '',
          createdAt: new Date().toISOString(),
        };
        const savedVeh = await db.createVehicle(newVeh);
        vehicleId = savedVeh.id;
        vehicleRegistration = savedVeh.registrationNumber;
        vehicleModel = `${savedVeh.make} ${savedVeh.model}${savedVeh.variant ? ' ' + savedVeh.variant : ''}`.trim();
      }
    }

    // 3. Unique sequential Job Card number
    const jobCards = await db.getJobCards();
    const maxNum = jobCards.reduce((max, j) => {
      const m = j.jobCardNumber?.match(/TM-JC-\d+-(\d+)/);
      const n = m ? parseInt(m[1], 10) : 0;
      return n > max ? n : max;
    }, 0);
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    const year = new Date().getFullYear();
    const jobCardNumber = `TM-JC-${year}-${nextNum}`;

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];
    const intakeDate = body.intakeDate || todayDate;
    const parsedIntake = new Date(intakeDate);
    const estBaseTime = Number.isNaN(parsedIntake.getTime()) ? Date.now() : parsedIntake.getTime();
    const defaultEstDate = new Date(estBaseTime + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const isHandover = Boolean(body.handoverToSupervisor);
    const initialStage = body.currentStage || (isHandover ? 'Initial Inspection' : 'Vehicle Received');

    const costEstimate = computeCostEstimate(body.costEstimate);

    const stageHistory: JobCard['stageHistory'] = [
      {
        stage: initialStage,
        status: isHandover ? 'completed' : 'in_progress',
        updatedBy: body.createdBy || body.advisorName || 'Amit Kulkarni (Advisor)',
        timestamp: nowIso,
        notes: body.notes || 'Detailed job card created at Service Advisory Intake Desk.',
      },
    ];

    if (isHandover && body.assignedSupervisorName) {
      stageHistory.push({
        stage: initialStage,
        status: 'in_progress',
        updatedBy: body.createdBy || body.advisorName || 'Amit Kulkarni (Advisor)',
        timestamp: nowIso,
        notes: `Handed over to Workshop Supervisor ${body.assignedSupervisorName}. ${body.handoverNotes || ''}`.trim(),
      });
    }

    const newJobCard: JobCard = {
      id: `jc_${Date.now()}`,
      jobCardNumber,
      customerId: customerId || 'cust_001',
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      vehicleId: vehicleId || 'veh_001',
      vehicleRegistration: vehicleRegistration || 'MH-09-NEW',
      vehicleModel: vehicleModel || 'Vehicle Model',
      intakeDate,
      estimatedCompletionDate: body.estimatedCompletionDate || defaultEstDate,
      currentStage: initialStage,
      stageHistory,
      inspection: {
        intakeDate,
        accidentDescription: body.inspection?.accidentDescription ?? body.accidentDescription ?? '',
        customerComplaints: body.inspection?.customerComplaints ?? body.customerComplaints ?? [],
        visibleDamages: body.inspection?.visibleDamages ?? body.visibleDamages ?? [],
        inspectionNotes: body.inspection?.inspectionNotes ?? body.inspectionNotes ?? '',
        photographs: body.inspection?.photographs ?? [],
        insuranceProvider: body.inspection?.insuranceProvider || '',
        policyNumber: body.inspection?.policyNumber || '',
        claimNumber: body.inspection?.claimNumber || '',
        surveyorName: body.inspection?.surveyorName || '',
        surveyorPhone: body.inspection?.surveyorPhone || '',
      },
      tasks: body.tasks || [],
      assignedSupervisorId: body.assignedSupervisorId || 'usr_sup_01',
      assignedSupervisorName: body.assignedSupervisorName || 'Mahesh Jadhav',
      assignedTechnicianIds:
        body.assignedTechnicianIds ||
        (Array.isArray(body.tasks)
          ? Array.from(
              new Set(
                body.tasks
                  .map((t: { assignedTechnicianId?: string }) => t.assignedTechnicianId)
                  .filter((tid: unknown): tid is string => typeof tid === 'string' && Boolean(tid))
              )
            )
          : []),
      costEstimate,
      customerApproved: Boolean(body.customerApproved),
      approvalDate: body.customerApproved ? body.approvalDate || todayDate : undefined,
      advisorName: body.advisorName || body.createdBy || 'Amit Kulkarni',
      priority: body.priority || 'Normal',
      handoverToSupervisor: isHandover,
      handoverDate: isHandover ? nowIso : undefined,
      handoverNotes: body.handoverNotes || '',
      jobStatus: body.jobStatus || 'Active',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const saved = await db.createJobCard(newJobCard);

    await db.logActivity({
      action: isHandover ? 'JOB_CREATED_AND_HANDED_OVER' : 'JOB_CARD_CREATED',
      entityType: 'JobCard',
      entityId: saved.id,
      performedBy: body.createdBy || saved.advisorName || 'Service Advisor',
      userRole: body.userRole || 'advisor',
      details: `Created job card ${saved.jobCardNumber} for ${saved.vehicleRegistration} (${saved.vehicleModel}) - Estimate ₹${saved.costEstimate.total.toLocaleString('en-IN')}${isHandover ? ` & handed over to ${saved.assignedSupervisorName}` : ''}`,
    });

    return NextResponse.json({ success: true, jobCard: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating job card';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      currentStage,
      stageNote,
      updatedBy,
      userRole,
      costEstimate,
      tasks,
      jobStatus,
      customerId,
      customerName,
      customerPhone,
      vehicleId,
      vehicleRegistration,
      vehicleModel,
      intakeDate,
      estimatedCompletionDate,
      inspection,
      customerApproved,
      approvalDate,
      assignedSupervisorId,
      assignedSupervisorName,
      assignedTechnicianIds,
      advisorName,
      priority,
      handoverToSupervisor,
      handoverNotes,
      qualityInspection,
      bottleneckInfo,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing job card ID' }, { status: 400 });
    }

    const existing = await db.getJobCardById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Job card not found' }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];
    const updates: Partial<JobCard> = {};
    const nextHistory = [...(existing.stageHistory || [])];

    if (customerId !== undefined) updates.customerId = customerId;
    if (customerName !== undefined) updates.customerName = customerName;
    if (customerPhone !== undefined) updates.customerPhone = customerPhone;
    if (vehicleId !== undefined) updates.vehicleId = vehicleId;
    if (vehicleRegistration !== undefined) updates.vehicleRegistration = vehicleRegistration;
    if (vehicleModel !== undefined) updates.vehicleModel = vehicleModel;
    if (intakeDate !== undefined) updates.intakeDate = intakeDate;
    if (estimatedCompletionDate !== undefined) updates.estimatedCompletionDate = estimatedCompletionDate;
    if (advisorName !== undefined) updates.advisorName = advisorName;
    if (priority !== undefined) updates.priority = priority;

    if (inspection !== undefined) {
      updates.inspection = {
        ...(existing.inspection || {}),
        ...inspection,
      };
    }

    if (costEstimate !== undefined) {
      updates.costEstimate = computeCostEstimate(costEstimate);
    }

    if (tasks !== undefined) {
      updates.tasks = tasks;
      if (assignedTechnicianIds === undefined && Array.isArray(tasks)) {
        const derivedTechIds = Array.from(
          new Set(
            tasks
              .map((t: { assignedTechnicianId?: string }) => t.assignedTechnicianId)
              .filter((tid): tid is string => Boolean(tid))
          )
        );
        updates.assignedTechnicianIds = derivedTechIds;
      }
    }
    if (jobStatus !== undefined) updates.jobStatus = jobStatus;

    if (customerApproved !== undefined) {
      updates.customerApproved = Boolean(customerApproved);
      if (customerApproved && !existing.approvalDate) {
        updates.approvalDate = approvalDate || todayDate;
      } else if (approvalDate !== undefined) {
        updates.approvalDate = approvalDate;
      }
    }

    if (assignedSupervisorId !== undefined) updates.assignedSupervisorId = assignedSupervisorId;
    if (assignedSupervisorName !== undefined) updates.assignedSupervisorName = assignedSupervisorName;
    if (assignedTechnicianIds !== undefined) updates.assignedTechnicianIds = assignedTechnicianIds;
    if (qualityInspection !== undefined) updates.qualityInspection = qualityInspection;
    if (bottleneckInfo !== undefined) updates.bottleneckInfo = bottleneckInfo;

    const isPerformingHandover = handoverToSupervisor === true;
    const isFreshHandover = isPerformingHandover && !existing.handoverToSupervisor;
    const isSupervisorReassigned =
      assignedSupervisorId !== undefined &&
      assignedSupervisorId !== existing.assignedSupervisorId &&
      !isFreshHandover;

    if (handoverToSupervisor !== undefined) {
      updates.handoverToSupervisor = Boolean(handoverToSupervisor);
    }
    if (handoverNotes !== undefined) {
      updates.handoverNotes = handoverNotes;
    }
    if (isFreshHandover) {
      updates.handoverDate = nowIso;
    }

    if (currentStage && currentStage !== existing.currentStage) {
      updates.currentStage = currentStage;
      nextHistory.push({
        stage: currentStage,
        status: 'in_progress',
        updatedBy: updatedBy || 'Staff',
        timestamp: nowIso,
        notes:
          stageNote ||
          (isPerformingHandover
            ? `Handed over to supervisor ${assignedSupervisorName || existing.assignedSupervisorName}. ${handoverNotes || ''}`.trim()
            : `Advanced repair stage to ${currentStage}`),
      });
    } else if (isFreshHandover) {
      nextHistory.push({
        stage: existing.currentStage,
        status: 'in_progress',
        updatedBy: updatedBy || 'Service Advisor',
        timestamp: nowIso,
        notes: `Formally handed over to Supervisor ${assignedSupervisorName || existing.assignedSupervisorName}. ${handoverNotes || ''}`.trim(),
      });
    } else if (isSupervisorReassigned) {
      nextHistory.push({
        stage: existing.currentStage,
        status: 'in_progress',
        updatedBy: updatedBy || 'Body Shop Manager',
        timestamp: nowIso,
        notes:
          stageNote ||
          `Reassigned floor supervision from ${existing.assignedSupervisorName || 'Previous Supervisor'} to ${assignedSupervisorName || assignedSupervisorId}.`,
      });
    } else if (bottleneckInfo !== undefined) {
      nextHistory.push({
        stage: existing.currentStage,
        status: bottleneckInfo?.isDelayed ? 'pending' : 'in_progress',
        updatedBy: updatedBy || 'Body Shop Manager',
        timestamp: nowIso,
        notes:
          stageNote ||
          (bottleneckInfo?.isDelayed
            ? `BOTTLENECK ESCALATED [${bottleneckInfo.category}]: ${bottleneckInfo.reason}`
            : `Bottleneck resolved and floor work resumed by ${updatedBy || 'Body Shop Manager'}.`),
      });
    }

    updates.stageHistory = nextHistory;

    const updated = await db.updateJobCard(id, updates);

    let logAction = 'JOB_CARD_UPDATED';
    let logDetails = `Updated job card ${existing.jobCardNumber}${currentStage && currentStage !== existing.currentStage ? ' (Stage -> ' + currentStage + ')' : ' details & estimates'}`;

    if (isFreshHandover) {
      logAction = 'JOB_HANDOVER_TO_SUPERVISOR';
      logDetails = `Handed over job card ${existing.jobCardNumber} (${existing.vehicleRegistration}) to supervisor ${assignedSupervisorName || existing.assignedSupervisorName}`;
    } else if (bottleneckInfo?.isDelayed) {
      logAction = 'BOTTLENECK_FLAGGED';
      logDetails = `Escalated floor delay [${bottleneckInfo.category}] on ${existing.jobCardNumber} (${existing.vehicleRegistration}): ${bottleneckInfo.reason}`;
    } else if (bottleneckInfo && bottleneckInfo.isDelayed === false && existing.bottleneckInfo?.isDelayed) {
      logAction = 'BOTTLENECK_RESOLVED';
      logDetails = `Resolved floor bottleneck on ${existing.jobCardNumber} (${existing.vehicleRegistration}) and resumed bay work.`;
    } else if (isSupervisorReassigned) {
      logAction = 'SUPERVISOR_REASSIGNED';
      logDetails = `Reassigned ${existing.jobCardNumber} (${existing.vehicleRegistration}) from ${existing.assignedSupervisorName} to ${assignedSupervisorName || assignedSupervisorId}`;
    } else if (qualityInspection?.status === 'Passed') {
      logAction = 'QC_PASSED';
      logDetails = `Quality Inspection PASSED on ${existing.jobCardNumber} (${existing.vehicleRegistration}) by ${updatedBy || 'Workshop Supervisor'}${currentStage ? ' -> ' + currentStage : ''}`;
    } else if (qualityInspection?.status === 'Rework Required') {
      logAction = 'QC_REWORK_FLAGGED';
      logDetails = `Quality Inspection flagged REWORK on ${existing.jobCardNumber} (${existing.vehicleRegistration}): ${qualityInspection.reworkReason || qualityInspection.notes || 'Returned to repair bay'}`;
    } else if (
      userRole === 'body_shop_manager' &&
      (currentStage === 'Final Approval' || currentStage === 'Ready for Delivery')
    ) {
      logAction = 'MANAGER_FINAL_APPROVAL';
      logDetails = `Body Shop Manager approved ${existing.jobCardNumber} (${existing.vehicleRegistration}) -> ${currentStage}`;
    } else if (tasks !== undefined && (userRole === 'supervisor' || userRole === 'body_shop_manager')) {
      logAction = 'SUPERVISOR_TASKS_UPDATED';
      logDetails = `${userRole === 'body_shop_manager' ? 'Body Shop Manager' : 'Supervisor'} updated ${Array.isArray(tasks) ? tasks.length : 0} technician task(s) on job card ${existing.jobCardNumber} (${existing.vehicleRegistration})`;
    }

    await db.logActivity({
      action: logAction,
      entityType: 'JobCard',
      entityId: existing.id,
      performedBy: updatedBy || 'Staff',
      userRole: userRole || 'advisor',
      details: logDetails,
    });

    return NextResponse.json({ success: true, jobCard: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating job card';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
