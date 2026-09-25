import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  endpoint: string;
  method: string;
  ipAddress?: string;
  statusCode: number;
  executionDurationMs: number;
  details?: string;
  isSecurityEvent: boolean;
}

const auditLogs: AuditLogEntry[] = [];

function logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const log: AuditLogEntry = {
    id: crypto.randomBytes(16).toString('hex'),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 200) {
    auditLogs.pop();
  }
}

function isValidConfigValue(val?: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (trimmed.startsWith('<') || trimmed.endsWith('>')) return false;
  if (trimmed.toLowerCase().includes('<your-environment>')) return false;
  if (trimmed.toLowerCase().includes('your-environment')) return false;
  if (trimmed.toLowerCase().includes('<app registration')) return false;
  if (trimmed.toLowerCase().includes('<microsoft entra')) return false;
  if (trimmed.toLowerCase().includes('contoso')) return false;
  return trimmed.length > 0;
}

export class D365Config {
  public baseUrl: string;
  public odataPath: string;
  public tenantId: string;
  public clientId: string;
  public clientSecret: string;
  public resourceUrl: string;
  public legalEntity: string;
  public timeoutSeconds: number;

  constructor() {
    this.baseUrl = (process.env.D365Settings__BaseUrl || process.env.D365_BASE_URL || '').trim();
    this.odataPath = (process.env.D365Settings__ODataPath || '/data').trim();
    this.tenantId = (process.env.D365Settings__TenantId || process.env.D365_TENANT_ID || '').trim();
    this.clientId = (process.env.D365Settings__ClientId || process.env.D365_CLIENT_ID || '').trim();
    this.clientSecret = (process.env.D365Settings__ClientSecret || process.env.D365_CLIENT_SECRET || '').trim();
    this.resourceUrl = (process.env.D365Settings__ResourceUrl || process.env.D365_RESOURCE_URL || '').trim();
    this.legalEntity = (process.env.D365Settings__LegalEntity || process.env.D365_LEGAL_ENTITY || '').trim();
    this.timeoutSeconds = Number(process.env.D365Settings__TimeoutSeconds) || 30;
  }

  public get isConfigured(): boolean {
    return (
      isValidConfigValue(this.baseUrl) &&
      isValidConfigValue(this.tenantId) &&
      isValidConfigValue(this.clientId) &&
      isValidConfigValue(this.clientSecret) &&
      isValidConfigValue(this.legalEntity)
    );
  }

  public getMissingConfigurations(): string[] {
    const missing: string[] = [];
    if (!isValidConfigValue(this.baseUrl)) missing.push('D365Settings__BaseUrl (BaseUrl - missing or placeholder)');
    if (!isValidConfigValue(this.tenantId)) missing.push('D365Settings__TenantId (TenantId - missing or placeholder)');
    if (!isValidConfigValue(this.clientId)) missing.push('D365Settings__ClientId (ClientId - missing or placeholder)');
    if (!isValidConfigValue(this.clientSecret)) missing.push('D365Settings__ClientSecret (ClientSecret - missing or invalid)');
    if (!isValidConfigValue(this.legalEntity)) missing.push('D365Settings__LegalEntity (LegalEntity - missing)');
    return missing;
  }
}

// Token security
const isProduction = process.env.NODE_ENV === 'production';
const rawJwtSecret =
  process.env.JWT_SECRET ||
  process.env.JwtSettings__SecretKey ||
  process.env.JWT_SECRET_KEY;

if (isProduction && (!rawJwtSecret || rawJwtSecret.trim().length === 0)) {
  console.error('[FATAL] Production startup error: JwtSettings__SecretKey (or JWT_SECRET) is required in production environment.');
  process.exit(1);
}

const JWT_SECRET = rawJwtSecret && rawJwtSecret.trim().length > 0
  ? rawJwtSecret.trim()
  : 'ESS_D365_2026_Secure_JWT_Key_Change_This_In_Production_984521';

const JWT_EXPIRATION_MINUTES = Number(process.env.JwtSettings__ExpirationMinutes) || 120;

function base64UrlEncode(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return Buffer.from(b64, 'base64').toString('utf8');
}

export function createJwtToken(payload: Record<string, any>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRATION_MINUTES * 60,
    iss: 'D365.Ess.Api',
    aud: 'D365.Ess.Client',
  };
  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${encHeader}.${encPayload}`).digest();
  const encSignature = base64UrlEncode(signature);
  return `${encHeader}.${encPayload}.${encSignature}`;
}

export function verifyJwtToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encHeader, encPayload, encSignature] = parts;
    const expectedSig = base64UrlEncode(crypto.createHmac('sha256', JWT_SECRET).update(`${encHeader}.${encPayload}`).digest());
    if (expectedSig !== encSignature) return null;
    const payload = JSON.parse(base64UrlDecode(encPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// OAuth Client for D365
class D365OAuthClient {
  private config: D365Config;
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: D365Config) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() + 5 * 60 * 1000 < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    if (!this.config.isConfigured) {
      throw new Error(`D365 configuration missing: ${this.config.getMissingConfigurations().join(', ')}`);
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
    const resource = this.config.resourceUrl || this.config.baseUrl;
    const scope = `${resource.replace(/\/+$/, '')}/.default`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[D365 OAuth Error]', res.status, errText);
      throw new Error(`OAuth token failed: ${res.statusText}`);
    }

    const data = await res.json();
    this.cachedToken = data.access_token;
    const expiresIn = Number(data.expires_in) || 3599;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;
    return this.cachedToken!;
  }

  public async request<T = any>(method: string, path: string, body?: any): Promise<T> {
    const token = await this.getAccessToken();
    const cleanBase = this.config.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${cleanBase}${this.config.odataPath}${cleanPath}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Prefer: 'return=representation',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.config.timeoutSeconds * 1000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[D365 OData ${method} ${path}] Error ${res.status}:`, errText);
      throw new Error(`D365 OData request failed (${res.status}): ${errText}`);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  }
}

export function setupD365Backend(app: express.Express) {
  const d365Config = new D365Config();
  const d365Client = new D365OAuthClient(d365Config);

  // Authentication Middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'غير مصرح: يجب تسجيل الدخول.' } });
    }
    const token = authHeader.substring(7).trim();
    const claims = verifyJwtToken(token);
    if (!claims) {
      return res.status(401).json({ error: { message: 'انتهت صلاحية جلسة العمل أو رمز المصادقة غير صالح.' } });
    }
    (req as any).user = claims;
    next();
  };

  // Health and Status endpoints
  app.get(['/health', '/api/d365/health', '/api/d365/status'], (_req: Request, res: Response) => {
    const isConfigured = d365Config.isConfigured;
    const missing = d365Config.getMissingConfigurations();

    res.json({
      status: isConfigured ? 'UP' : 'CONFIGURATION_REQUIRED',
      service: 'Microsoft Dynamics 365 Finance & Operations ESS Web API',
      isConfigured,
      missingFields: missing,
      legalEntity: d365Config.legalEntity,
      timestamp: new Date().toISOString(),
      version: '8.0.0',
    });
  });

  // Configuration endpoint
  app.get('/api/d365/config', (_req: Request, res: Response) => {
    const isConfigured = d365Config.isConfigured;
    const missing = d365Config.getMissingConfigurations();

    if (!isConfigured) {
      return res.status(503).json({
        isConfigured: false,
        status: 'CONFIGURATION_REQUIRED',
        message: 'Microsoft Dynamics 365 configuration is missing or incomplete in backend environment variables.',
        missingFields: missing,
        details: 'Required environment variables: D365Settings__BaseUrl, D365Settings__TenantId, D365Settings__ClientId, D365Settings__ClientSecret, D365Settings__LegalEntity',
      });
    }

    res.json({
      isConfigured: true,
      status: 'CONFIGURED',
      legalEntity: d365Config.legalEntity,
    });
  });

  // Auth: Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { username, password } = req.body || {};
    const cleanUsername = (username || '').trim().replace(/\s/g, '');
    const cleanPassword = (password || '').trim();
    const ip = req.ip || req.socket.remoteAddress;

    if (!cleanUsername || !cleanPassword) {
      logAudit({
        action: 'LOGIN_FAILED',
        endpoint: '/api/auth/login',
        method: 'POST',
        statusCode: 400,
        executionDurationMs: Date.now() - startTime,
        userName: cleanUsername,
        ipAddress: ip,
        details: 'Missing username or password',
        isSecurityEvent: true,
      });

      return res.status(400).json({
        success: false,
        errorMessage: 'يرجى إدخال اسم المستخدم وكلمة المرور',
      });
    }

    if (!d365Config.isConfigured) {
      return res.status(401).json({
        success: false,
        errorMessage: 'إعدادات الربط مع Microsoft Dynamics 365 غير متوفرة أو غير مكتملة في متغيرات بيئة الخادم.',
      });
    }

    try {
      // Query Dynamics 365 Employees
      const odataFilter = `PersonnelNumber eq '${cleanUsername}' or IdentificationNumber eq '${cleanUsername}'`;
      const query = `Employees?$filter=${encodeURIComponent(odataFilter)}&$top=1`;
      const result = await d365Client.request('GET', query);
      const employees = result?.value || [];
      const employee = employees[0];

      if (!employee) {
        logAudit({
          action: 'LOGIN_FAILED',
          endpoint: '/api/auth/login',
          method: 'POST',
          statusCode: 401,
          executionDurationMs: Date.now() - startTime,
          userName: cleanUsername,
          ipAddress: ip,
          details: 'Employee not found in Dynamics 365 directory',
          isSecurityEvent: true,
        });

        return res.status(401).json({
          success: false,
          errorMessage: 'الرقم القومي أو اسم المستخدم غير مسجل بنظام Dynamics 365',
        });
      }

      // Check for manager role
      const roles = ['ESS_USER'];
      try {
        const teamCheck = await d365Client.request('GET', `TeamMembers?$filter=${encodeURIComponent(`ManagerPersonnelNumber eq '${employee.PersonnelNumber || employee.Id}'`)}&$top=1`);
        if (teamCheck?.value && teamCheck.value.length > 0) {
          roles.push('MSS_MGR');
        }
      } catch {
        // Continue with ESS_USER if team check fails
      }

      const primaryRole = roles.includes('MSS_MGR') ? 'MSS_MGR' : 'ESS_USER';

      const user = {
        id: employee.PersonnelNumber || employee.Id || cleanUsername,
        civilId: employee.IdentificationNumber || employee.CivilId || cleanUsername,
        name: employee.Name || employee.WorkerName || cleanUsername,
        jobTitle: employee.JobTitle || employee.JobDescription || 'موظف',
        department: employee.Department || employee.DepartmentName || '',
        division: employee.Division || '',
        email: employee.Email || employee.WorkerEmail || '',
        phone: employee.Phone || employee.WorkerPhone || '',
        legalEntity: employee.LegalEntity || d365Config.legalEntity,
        role: primaryRole,
        roles,
        avatarUrl: employee.AvatarUrl || '',
        isActive: employee.EmploymentStatus?.toLowerCase() !== 'terminated',
      };

      const token = createJwtToken({
        nameid: user.id,
        unique_name: user.name,
        email: user.email,
        civilId: user.civilId,
        jobTitle: user.jobTitle,
        department: user.department,
        division: user.division,
        legalEntity: user.legalEntity,
        role: user.role,
        roles: user.roles,
      });

      const expiresAt = Date.now() + JWT_EXPIRATION_MINUTES * 60 * 1000;

      logAudit({
        action: 'LOGIN_SUCCESS',
        endpoint: '/api/auth/login',
        method: 'POST',
        statusCode: 200,
        executionDurationMs: Date.now() - startTime,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        ipAddress: ip,
        details: `Authenticated via Dynamics 365 with roles: [${roles.join(', ')}]`,
        isSecurityEvent: true,
      });

      return res.json({
        success: true,
        token,
        user,
        expiresAt,
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      return res.status(500).json({
        success: false,
        errorMessage: 'تعذر إتمام عملية تسجيل الدخول عبر خادم Dynamics 365.',
      });
    }
  });

  // Auth: Me
  app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
    const claims = (req as any).user;
    const roles = Array.isArray(claims.roles) ? claims.roles : [claims.role || 'ESS_USER'];

    res.json({
      id: claims.nameid || claims.sub || claims.id,
      civilId: claims.civilId || '',
      name: claims.unique_name || claims.name || '',
      email: claims.email || '',
      jobTitle: claims.jobTitle || '',
      department: claims.department || '',
      division: claims.division || '',
      legalEntity: claims.legalEntity || d365Config.legalEntity,
      role: claims.role || roles[0],
      roles,
      isActive: true,
    });
  });

  // Auth: Logout
  app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
    const claims = (req as any).user;
    logAudit({
      action: 'LOGOUT',
      endpoint: '/api/auth/logout',
      method: 'POST',
      statusCode: 200,
      executionDurationMs: 1,
      userId: claims?.nameid,
      userName: claims?.unique_name,
      userRole: claims?.role,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: 'User logged out successfully',
      isSecurityEvent: true,
    });

    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  });

  // D365 Employees
  app.get(['/api/d365/employees/:id', '/api/d365/employee'], requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = req.params.id || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=PersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `Employees?${filter}`);
      const employee = data?.value?.[0] || data;
      if (!employee) {
        return res.status(404).json({ error: { message: `الموظف رقم '${targetId}' غير موجود بنظام Dynamics 365.` } });
      }
      res.json(employee);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.put('/api/d365/employees/:id', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const id = req.params.id;
    try {
      const data = await d365Client.request('PATCH', `Employees(PersonnelNumber='${id}',dataAreaId='${d365Config.legalEntity}')`, req.body);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/employees/status', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const { status } = req.body || {};
    try {
      const targetId = (req as any).user.nameid;
      const data = await d365Client.request('PATCH', `Employees(PersonnelNumber='${targetId}',dataAreaId='${d365Config.legalEntity}')`, {
        EmploymentStatus: status,
      });
      return res.json({ success: true, employee: data });
    } catch (err: any) {
      return res.status(500).json({ error: { message: err.message } });
    }
  });

  // Leave Balances
  app.get('/api/d365/leave-balances', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `LeaveAndAbsenceBankTransactions?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Leave Requests
  app.get('/api/d365/leave-requests', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'&$orderby=SubmissionDate desc`;
      const data = await d365Client.request('GET', `LeaveAndAbsenceRequests?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/leave-requests', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const { leaveTypeCode, startDate, endDate } = req.body || {};
    if (!leaveTypeCode || !startDate || !endDate) {
      return res.status(400).json({ error: { message: 'بيانات طلب الإجازة غير مكتملة (نوع الإجازة وتاريخ البدء والانتهاء إلزامية).' } });
    }
    try {
      const created = await d365Client.request('POST', 'LeaveAndAbsenceRequests', req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // General Requests with Secondment / Loan Validation against Dynamics 365
  app.post('/api/d365/requests', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const { actionType, targetEntity, requestDate, notes } = req.body || {};
    const normType = String(actionType || '').toUpperCase();
    const destination = targetEntity || 'الجهة المختصة';
    let title = 'طلب عام';

    if (normType === 'SECONDMENT') {
      title = `طلب ندب وظيفي (${destination})`;
    } else if (normType === 'SECONDMENT_RENEW') {
      title = `طلب تجديد الندب الوظيفي (${destination})`;
    } else if (normType === 'SECONDMENT_TERMINATE') {
      title = `طلب إنهاء الندب والعودة للعمل (${destination})`;
    } else if (normType === 'LOAN') {
      title = `طلب إعارة وظيفية (${destination})`;
    } else if (normType === 'LOAN_RENEW') {
      title = `طلب تجديد الإعارة الوظيفية (${destination})`;
    } else if (normType === 'LOAN_TERMINATE') {
      title = `طلب إنهاء الإعارة والعودة للعمل (${destination})`;
    } else if (normType === 'PERMISSION') {
      title = `طلب إذن غياب / انصراف (${destination})`;
    } else if (normType === 'TRANSFER') {
      title = `طلب نقل وظيفي (${destination})`;
    }

    try {
      const created = await d365Client.request('POST', 'UnifiedWorkflowWorkItems', {
        RequestType: title,
        Category: normType,
        SubmissionDate: new Date().toISOString(),
        Notes: notes || '',
        FromDate: requestDate,
        ToDate: requestDate,
      });
      return res.status(201).json({
        success: true,
        request: created,
        message: 'تم إرسال الطلب إلى نظام Dynamics 365 بنجاح.',
      });
    } catch (err: any) {
      return res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/requests/:id/approve', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const id = req.params.id;
    try {
      const updated = await d365Client.request('PATCH', `UnifiedWorkflowWorkItems('${id}')`, {
        Status: 'Approved',
        ApprovedAt: new Date().toISOString(),
      });
      return res.json({ success: true, request: updated, message: 'تم اعتماد الطلب بنجاح.' });
    } catch (err: any) {
      return res.status(500).json({ error: { message: err.message } });
    }
  });

  app.delete('/api/d365/leave-requests/:id', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const id = req.params.id;
    try {
      await d365Client.request('DELETE', `LeaveAndAbsenceRequests('${id}')`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Leave Transactions
  app.get('/api/d365/leave-transactions', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    const typeCode = req.query.typeCode as string;
    let filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'`;
    if (typeCode) {
      filter += ` and LeaveTypeId eq '${typeCode}'`;
    }
    try {
      const data = await d365Client.request('GET', `LeaveAndAbsenceBankTransactions?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Delegated Employees
  app.get('/api/d365/delegated-employees', requireAuth, async (_req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    try {
      const filter = `cross-company=true&$filter=dataAreaId eq '${d365Config.legalEntity}'`;
      const data = await d365Client.request('GET', `HcmDelegatedEmployees?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Penalties
  app.get('/api/d365/penalties', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `DisciplinaryPenalties?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/penalties/grievance', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const { penaltyId, reasons, grievanceDetails } = req.body || {};
    if (!penaltyId || (!reasons && !grievanceDetails)) {
      return res.status(400).json({ error: { message: 'بيانات التظلم غير مكتملة (معرف الجزاء وأسباب التظلم مطلوبة).' } });
    }
    try {
      const created = await d365Client.request('POST', 'DisciplinaryGrievances', req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.get('/api/d365/penalties/grievances', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `DisciplinaryGrievances?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Team
  app.get('/api/d365/team-members', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.managerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=ReportsToPersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `HcmWorkerReportingHierarchy?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/team-requests/:id/approve', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const id = req.params.id;
    try {
      const body = { Status: 'معتمدة', ApprovalNotes: req.body?.notes, ApprovedAt: new Date().toISOString() };
      const updated = await d365Client.request('PATCH', `TeamMemberRequests('${id}')`, body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/team-requests/:id/reject', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const id = req.params.id;
    if (!req.body?.reason) {
      return res.status(400).json({ error: { message: 'سبب الرفض إلزامي وفقاً لتعليمات Dynamics 365.' } });
    }
    try {
      const body = { Status: 'مرفوضة', RejectionReason: req.body.reason, RejectedAt: new Date().toISOString() };
      const updated = await d365Client.request('PATCH', `TeamMemberRequests('${id}')`, body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/team-requests/on-behalf/leave', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const { memberId, startDate, endDate } = req.body || {};
    if (!memberId || !startDate || !endDate) {
      return res.status(400).json({ error: { message: 'بيانات طلب الإجازة بالنيابة غير مكتملة.' } });
    }
    try {
      const created = await d365Client.request('POST', 'TeamMemberRequests', req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/team-requests/on-behalf/absence', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const { memberId, reason } = req.body || {};
    if (!memberId || !reason) {
      return res.status(400).json({ error: { message: 'بيانات إذن الغياب بالنيابة غير مكتملة (الموظف وسبب الغياب إلزامي).' } });
    }
    try {
      const created = await d365Client.request('POST', 'TeamMemberRequests', req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Training
  app.get('/api/d365/training-courses', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `CourseAttendances?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/training-courses/evaluation', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    if (!req.body?.courseId) {
      return res.status(400).json({ error: { message: 'معرف الدورة التدريبية إلزامي.' } });
    }
    try {
      const created = await d365Client.request('POST', 'CourseEvaluations', req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Performance Evaluations
  app.get('/api/d365/performance-evaluations', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `HcmPerformanceGoals?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Monitoring Operations
  app.get('/api/d365/monitoring-operations', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `ComplianceMonitoringOperations?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/monitoring-operations/disclosure', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    try {
      const created = await d365Client.request('POST', 'ComplianceMonitoringOperations', req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/monitoring-operations/test', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    try {
      const created = await d365Client.request('POST', 'ComplianceMonitoringOperations', req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.post('/api/d365/monitoring-operations/:id/status', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const id = req.params.id;
    try {
      const body = { Status: req.body?.status, ReviewNote: req.body?.note, UpdatedAt: new Date().toISOString() };
      const updated = await d365Client.request('PATCH', `ComplianceMonitoringOperations('${id}')`, body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Notifications
  app.get('/api/d365/notifications', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    const targetId = (req.query.workerId as string) || (req as any).user.nameid;
    try {
      const filter = `cross-company=true&$filter=WorkerPersonnelNumber eq '${targetId}'`;
      const data = await d365Client.request('GET', `HcmSystemAlertNotifications?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Unified Requests
  app.get('/api/d365/unified-requests', requireAuth, async (req: Request, res: Response) => {
    if (!d365Config.isConfigured) {
      return res.status(503).json({ error: { message: 'إعدادات الربط مع Dynamics 365 غير متوفرة.' } });
    }
    try {
      const filter = `cross-company=true&$filter=dataAreaId eq '${d365Config.legalEntity}'`;
      const data = await d365Client.request('GET', `UnifiedWorkflowWorkItems?${filter}`);
      res.json(data?.value || []);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  // Audit Logs
  app.get('/api/d365/audit-logs', requireAuth, (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    res.json(auditLogs.slice(0, limit));
  });
}
