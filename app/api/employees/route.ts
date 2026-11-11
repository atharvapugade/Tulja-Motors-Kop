import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { Employee, User, UserRole } from '@/lib/models/types';
import { hashPassword } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let employees = await db.getEmployees();

    if (department) {
      employees = employees.filter((e: Employee) => e.department.toLowerCase().includes(department.toLowerCase()));
    }

    if (role) {
      employees = employees.filter((e: Employee) => e.role === role);
    }

    if (search) {
      employees = employees.filter(
        (e: Employee) =>
          e.name.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search) ||
          e.employeeCode.toLowerCase().includes(search) ||
          e.designation.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, employees });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching employees';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, message: 'Employee name is required.' }, { status: 400 });
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json({ success: false, message: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = body.email.toLowerCase().trim();

    // Check if user account with this email already exists
    const existingUser = await db.getUserByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: `An account with email "${cleanEmail}" is already registered in the system.` },
        { status: 400 }
      );
    }

    // Determine role and department (default to HR if department is Human Resources or specified)
    let userRole: UserRole = 'hr';
    if (body.role) {
      userRole = body.role as UserRole;
    } else if (body.department === 'Human Resources') {
      userRole = 'hr';
    } else if (body.department === 'Workshop Operations') {
      userRole = 'body_shop_manager';
    } else if (body.department === 'Service Advisory & Intake') {
      userRole = 'advisor';
    } else if (body.department === 'Workshop Supervision') {
      userRole = 'supervisor';
    } else if (body.department === 'Spare Parts & Inventory') {
      userRole = 'spare_parts_manager';
    } else if (body.department === 'Technician Team') {
      userRole = 'technician';
    } else {
      userRole = 'hr';
    }

    const dept = body.department || (userRole === 'hr' ? 'Human Resources' : 'Workshop Operations');
    const designation =
      body.designation?.trim() || (userRole === 'hr' ? 'Human Resources Manager' : 'Staff Specialist');
    const plainPassword =
      body.password && body.password.trim().length > 0 ? body.password.trim() : 'Password@123';

    // Hash password for authentication
    const passwordHash = await hashPassword(plainPassword);

    // 1. Create User account in Database
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      id: userId,
      name: body.name.trim(),
      email: cleanEmail,
      passwordHash,
      role: userRole,
      department: dept,
      phone: body.phone?.trim() || '+91 98220 00000',
      reportingManager: body.reportingManager?.trim() || 'Ranjeet B. Patil',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.createUser(newUser);

    // 2. Create Employee directory profile linked to User
    const employees = await db.getEmployees();
    const maxCodeNum = employees.reduce((max, emp) => {
      const m = emp.employeeCode?.match(/TM-EMP-(\d+)/);
      const n = m ? parseInt(m[1], 10) : 0;
      return n > max ? n : max;
    }, employees.length);
    const nextCode = `TM-EMP-${(maxCodeNum + 1).toString().padStart(3, '0')}`;
    const salaryBasic = Number(body.salary?.basic || body.salary) || (userRole === 'hr' ? 38000 : 30000);
    const salaryAllowances = Number(body.salary?.allowances) || 6000;

    const newEmp: Employee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employeeCode: nextCode,
      userId: userId,
      name: body.name.trim(),
      email: cleanEmail,
      phone: body.phone?.trim() || '+91 98220 00000',
      role: userRole,
      department: dept,
      designation: designation,
      reportingManager: body.reportingManager?.trim() || 'Ranjeet B. Patil',
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      salary: {
        basic: salaryBasic,
        allowances: salaryAllowances,
        total: salaryBasic + salaryAllowances,
      },
      status: 'active',
    };

    const savedEmp = await db.createEmployee(newEmp);

    // 3. Log Audit Trail
    const creatorRole: UserRole = body.userRole || 'super_admin';
    await db.logActivity({
      action: 'EMPLOYEE_ADDED',
      entityType: 'Employee',
      entityId: savedEmp.id,
      performedBy: body.createdBy || 'Ranjeet B. Patil (Super Admin)',
      userRole: creatorRole,
      details: `Provisioned new ${userRole.toUpperCase()} account: ${savedEmp.name} (${savedEmp.email}) as ${savedEmp.designation}. Linked User ID ${userId} can now authenticate on /panels/${userRole.replace('_', '-')}.`,
    });

    return NextResponse.json({
      success: true,
      message: `Employee ${savedEmp.name} registered and portal user created successfully. They can now log in at /panels/${userRole.replace('_', '-')}.`,
      employee: savedEmp,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating employee';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
