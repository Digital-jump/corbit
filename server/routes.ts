import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { systemDb, getTenantDb } from './db';
import { authenticate, AuthRequest, validateTenantAccess } from './middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'corbit-secret-key-change-in-prod';

// --- Auth Routes ---

router.post('/register', async (req, res) => {
  const { companyName, subdomain, email, password } = req.body;

  try {
    // 1. Check if subdomain or email exists
    const existingTenant = systemDb.prepare('SELECT id FROM tenants WHERE subdomain = ?').get(subdomain);
    if (existingTenant) return res.status(400).json({ error: 'Subdomain already taken' });

    const existingUser = systemDb.prepare('SELECT email FROM users_lookup WHERE email = ?').get(email);
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    // 2. Create Tenant
    const tenantId = uuidv4();
    const trialEndsAt = addDays(new Date(), 3).toISOString();
    
    systemDb.prepare(`
      INSERT INTO tenants (id, name, subdomain, plan, trial_ends_at)
      VALUES (?, ?, ?, 'trial', ?)
    `).run(tenantId, companyName, subdomain, trialEndsAt);

    // 3. Create Super Admin User in Lookup
    const hashedPassword = await bcrypt.hash(password, 10);
    systemDb.prepare(`
      INSERT INTO users_lookup (email, tenant_id, password_hash, role)
      VALUES (?, ?, ?, 'super_admin')
    `).run(email, tenantId, hashedPassword);

    // 4. Initialize Tenant DB and add Admin to Employee table
    const tenantDb = getTenantDb(tenantId);
    const employeeId = uuidv4();
    tenantDb.prepare(`
      INSERT INTO employees (id, email, full_name, role, department, job_title)
      VALUES (?, ?, ?, 'super_admin', 'Executive', 'CEO')
    `).run(employeeId, email, 'Super Admin'); // Simplified name

    // 5. Generate Token
    const token = jwt.sign({ email, tenantId, role: 'super_admin', userId: employeeId }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' }); // Secure false for dev
    res.json({ success: true, tenantId, subdomain });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = systemDb.prepare('SELECT * FROM users_lookup WHERE email = ?').get(email) as any;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    // Get user ID from tenant DB
    const tenantDb = getTenantDb(user.tenant_id);
    const employee = tenantDb.prepare('SELECT id, full_name FROM employees WHERE email = ?').get(email) as any;

    const token = jwt.sign({ 
      email, 
      tenantId: user.tenant_id, 
      role: user.role,
      userId: employee?.id 
    }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
    res.json({ success: true, tenantId: user.tenant_id, role: user.role });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', authenticate, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  
  const tenant = systemDb.prepare('SELECT * FROM tenants WHERE id = ?').get(req.user.tenantId) as any;
  const tenantDb = getTenantDb(req.user.tenantId);
  const employee = tenantDb.prepare('SELECT * FROM employees WHERE id = ?').get(req.user.userId) as any;

  res.json({
    user: {
      ...req.user,
      name: employee?.full_name,
      department: employee?.department
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      plan: tenant.plan,
      trialEndsAt: tenant.trial_ends_at
    }
  });
});

// --- Tenant Data Routes ---

router.get('/employees', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const db = getTenantDb(req.user!.tenantId);
  const employees = db.prepare('SELECT * FROM employees').all();
  res.json(employees);
});

router.post('/employees', authenticate, validateTenantAccess, async (req: AuthRequest, res) => {
  // Only admins can add employees
  if (!['super_admin', 'admin', 'hr'].includes(req.user!.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { email, fullName, department, jobTitle, role, password } = req.body;
  const db = getTenantDb(req.user!.tenantId);

  try {
    // Check if email exists in global lookup
    const existingUser = systemDb.prepare('SELECT email FROM users_lookup WHERE email = ?').get(email);
    if (existingUser) return res.status(400).json({ error: 'Email already registered in system' });

    const hashedPassword = await bcrypt.hash(password || 'Welcome123!', 10);
    const newId = uuidv4();

    // Add to global lookup
    systemDb.prepare(`
      INSERT INTO users_lookup (email, tenant_id, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run(email, req.user!.tenantId, hashedPassword, role);

    // Add to tenant DB
    db.prepare(`
      INSERT INTO employees (id, email, full_name, department, job_title, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(newId, email, fullName, department, jobTitle, role);

    res.json({ success: true, id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

router.get('/stats', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const db = getTenantDb(req.user!.tenantId);
  
  const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get() as any;
  const activeTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'completed'").get() as any;
  // Mock payroll sum for demo
  const payrollSum = db.prepare('SELECT SUM(net_pay) as total FROM payroll').get() as any;

  res.json({
    employees: employeeCount.count,
    activeTasks: activeTasks.count,
    payrollTotal: payrollSum.total || 0
  });
});

// --- Attendance ---

router.get('/attendance', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const db = getTenantDb(req.user!.tenantId);
  const logs = db.prepare(`
    SELECT a.*, e.full_name 
    FROM attendance a 
    JOIN employees e ON a.employee_id = e.id 
    ORDER BY a.date DESC, a.check_in DESC
  `).all();
  res.json(logs);
});

router.post('/attendance/checkin', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const db = getTenantDb(req.user!.tenantId);
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const id = uuidv4();

  try {
    const existing = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND date = ?').get(req.user!.userId, today);
    if (existing) return res.status(400).json({ error: 'Already checked in today' });

    db.prepare(`
      INSERT INTO attendance (id, employee_id, date, check_in, status)
      VALUES (?, ?, ?, ?, 'present')
    `).run(id, req.user!.userId, today, now);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Check-in failed' });
  }
});

router.post('/attendance/checkout', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const db = getTenantDb(req.user!.tenantId);
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  try {
    const result = db.prepare(`
      UPDATE attendance SET check_out = ? WHERE employee_id = ? AND date = ?
    `).run(now, req.user!.userId, today);

    if (result.changes === 0) return res.status(400).json({ error: 'No check-in found for today' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Check-out failed' });
  }
});

// --- Payroll ---

router.get('/payroll', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const db = getTenantDb(req.user!.tenantId);
  const payrolls = db.prepare(`
    SELECT p.*, e.full_name 
    FROM payroll p 
    JOIN employees e ON p.employee_id = e.id 
    ORDER BY p.generated_at DESC
  `).all();
  res.json(payrolls);
});

router.post('/payroll/run', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  if (!['super_admin', 'admin', 'hr'].includes(req.user!.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const db = getTenantDb(req.user!.tenantId);
  const employees = db.prepare('SELECT id FROM employees WHERE status = "active"').all() as any[];
  
  const periodStart = new Date();
  periodStart.setDate(1); // 1st of month
  const periodEnd = new Date(); // Today

  const created = [];

  const insertStmt = db.prepare(`
    INSERT INTO payroll (id, employee_id, period_start, period_end, base_salary, net_pay, status)
    VALUES (?, ?, ?, ?, ?, ?, 'processed')
  `);

  const transaction = db.transaction(() => {
    for (const emp of employees) {
      const id = uuidv4();
      // Mock calculation
      const base = 5000;
      const net = 4200; 
      insertStmt.run(id, emp.id, periodStart.toISOString(), periodEnd.toISOString(), base, net);
      created.push(id);
    }
  });

  try {
    transaction();
    res.json({ success: true, count: created.length });
  } catch (err) {
    res.status(500).json({ error: 'Payroll run failed' });
  }
});

// --- Tasks ---

router.get('/tasks', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const db = getTenantDb(req.user!.tenantId);
  try {
    const tasks = db.prepare(`
      SELECT t.*, 
             e_to.full_name as assigned_to_name,
             e_by.full_name as assigned_by_name
      FROM tasks t
      LEFT JOIN employees e_to ON t.assigned_to = e_to.id
      LEFT JOIN employees e_by ON t.assigned_by = e_by.id
      ORDER BY 
        CASE 
          WHEN t.status = 'pending' THEN 1
          WHEN t.status = 'in_progress' THEN 2
          ELSE 3
        END,
        t.due_date ASC
    `).all();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const { title, description, assignedTo, priority, dueDate } = req.body;
  const db = getTenantDb(req.user!.tenantId);
  const id = uuidv4();

  try {
    db.prepare(`
      INSERT INTO tasks (id, title, description, assigned_to, assigned_by, priority, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(id, title, description, assignedTo, req.user!.userId, priority || 'medium', dueDate);
    
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/tasks/:id', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, priority, assignedTo } = req.body;
  const db = getTenantDb(req.user!.tenantId);

  try {
    // Dynamic update query construction could be better, but for now:
    const updates = [];
    const values = [];

    if (status) { updates.push('status = ?'); values.push(status); }
    if (priority) { updates.push('priority = ?'); values.push(priority); }
    if (assignedTo) { updates.push('assigned_to = ?'); values.push(assignedTo); }

    if (updates.length === 0) return res.json({ success: true });

    values.push(id);
    
    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/tasks/:id', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const { id } = req.params;
  const db = getTenantDb(req.user!.tenantId);

  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// --- Chat ---

router.get('/chat/messages', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const db = getTenantDb(req.user!.tenantId);
  const messages = db.prepare(`
    SELECT m.*, e.full_name as sender_name 
    FROM chat_messages m 
    JOIN employees e ON m.sender_id = e.id 
    ORDER BY m.created_at ASC 
    LIMIT 50
  `).all();
  res.json(messages);
});

router.post('/chat/messages', authenticate, validateTenantAccess, (req: AuthRequest, res) => {
  const { content, channel } = req.body;
  const db = getTenantDb(req.user!.tenantId);
  const id = uuidv4();

  try {
    db.prepare(`
      INSERT INTO chat_messages (id, channel, sender_id, content)
      VALUES (?, ?, ?, ?)
    `).run(id, channel || 'general', req.user!.userId, content);
    
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Message failed' });
  }
});

import { generateAIResponse } from './services/gemini';

// --- AI Assistant ---

router.post('/ai/chat', authenticate, validateTenantAccess, async (req: AuthRequest, res) => {
  const { prompt, context } = req.body;
  
  try {
    // Enrich context with user role/department
    const userContext = `User Role: ${req.user?.role}, Department: ${req.user?.role === 'super_admin' ? 'Executive' : 'Employee'}. ${context || ''}`;
    
    const response = await generateAIResponse(prompt, userContext);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: 'AI processing failed' });
  }
});

export default router;
