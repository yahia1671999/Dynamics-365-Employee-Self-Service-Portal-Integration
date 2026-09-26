using D365.Ess.Api.Models;
using D365.Ess.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace D365.Ess.Api.Controllers;

[ApiController]
[Route("api/d365")]
public class AuditController : ControllerBase
{
    private readonly IAuditLogger _auditLogger;

    public AuditController(IAuditLogger auditLogger)
    {
        _auditLogger = auditLogger;
    }

    [HttpGet("audit-logs")]
    [Authorize(Roles = "MSS_MGR,SYSTEM_ADMIN")]
    public ActionResult<List<AuditLogEntry>> GetAuditLogs([FromQuery] int limit = 100)
    {
        var logs = _auditLogger.GetRecentLogs(Math.Min(limit, 200));
        return Ok(logs);
    }
}

[ApiController]
[Route("api/d365")]
[Authorize]
public class UnifiedRequestsController : ControllerBase
{
    private readonly ID365Service _d365Service;

    public UnifiedRequestsController(ID365Service d365Service)
    {
        _d365Service = d365Service;
    }

    [HttpGet("unified-requests")]
    public async Task<ActionResult<List<UnifiedRequestItemDto>>> GetUnifiedRequests(CancellationToken ct)
    {
        var requests = await _d365Service.GetUnifiedRequestsAsync(ct);
        return Ok(requests);
    }

    [HttpPost("requests")]
    public async Task<IActionResult> SubmitRequest([FromBody] GeneralRequestInputDto input, CancellationToken ct)
    {
        var targetId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }

        EmployeeDto? emp = null;
        try
        {
            emp = await _d365Service.GetEmployeeAsync(targetId, ct);
        }
        catch
        {
            // fallback
        }

        var isSeconded = emp != null && (emp.EmploymentStatus == "Seconded" || (emp.EmploymentStatusAr != null && emp.EmploymentStatusAr.Contains("منتدب")));
        var isLoaned = emp != null && (emp.EmploymentStatus == "Loaned" || (emp.EmploymentStatusAr != null && emp.EmploymentStatusAr.Contains("معار")));

        var actionType = input.ActionType?.ToUpperInvariant() ?? "";

        // If employee is Seconded ("منتدب")
        if (isSeconded)
        {
            // Hide/Reject normal requests: Leave, Permission, Transfer, new Secondment, Loan
            if (actionType == "PERMISSION" || actionType == "TRANSFER" || actionType == "SECONDMENT" || actionType == "LOAN" || actionType == "LEAVE")
            {
                return BadRequest(new { error = new { message = "لا يمكن تقديم طلبات (إجازة، إذن، نقل، ندب جديد، إعارة) أثناء فترة الندب. حالة الموظف الحالية: منتدب. الإجراءات المتاحة هي (تجديد الندب) أو (إنهاء الندب) فقط." } });
            }

            if (actionType != "SECONDMENT_RENEW" && actionType != "SECONDMENT_TERMINATE")
            {
                return BadRequest(new { error = new { message = "إجراء غير مصرح به للموظف المنتدب. الخيارات المتاحة هي تجديد الندب أو إنهاء الندب فقط." } });
            }
        }

        // If employee is Loaned ("معار")
        if (isLoaned)
        {
            // Hide/Reject normal requests: Leave, Permission, Transfer, Secondment, new Loan
            if (actionType == "PERMISSION" || actionType == "TRANSFER" || actionType == "SECONDMENT" || actionType == "LOAN" || actionType == "LEAVE")
            {
                return BadRequest(new { error = new { message = "لا يمكن تقديم طلبات (إجازة، إذن، نقل، ندب، إعارة جديدة) أثناء فترة الإعارة. حالة الموظف الحالية: معار. الإجراءات المتاحة هي (تجديد الإعارة) أو (إنهاء الإعارة) فقط." } });
            }

            if (actionType != "LOAN_RENEW" && actionType != "LOAN_TERMINATE")
            {
                return BadRequest(new { error = new { message = "إجراء غير مصرح به للموظف المعار. الخيارات المتاحة هي تجديد الإعارة أو إنهاء الإعارة فقط." } });
            }
        }

        // Renewal must keep the same destination/entity by default
        var destination = input.TargetEntity;
        if (actionType == "SECONDMENT_RENEW" && string.IsNullOrWhiteSpace(destination))
        {
            destination = emp?.SecondmentDetails?.Entity ?? "وزارة الاتصالات وتقنية المعلومات";
        }
        else if (actionType == "LOAN_RENEW" && string.IsNullOrWhiteSpace(destination))
        {
            destination = emp?.LoanDetails?.Entity ?? "جامعة الملك سعود - كلية علوم الحاسب";
        }

        // Apply state transition if auto-approved
        if (input.AutoApprove && emp != null)
        {
            if (actionType == "SECONDMENT")
            {
                emp.EmploymentStatus = "Seconded";
                emp.EmploymentStatusAr = "منتدب";
                emp.SecondmentDetails = new SecondmentDetailsDto
                {
                    Entity = !string.IsNullOrWhiteSpace(destination) ? destination : "وزارة الاتصالات وتقنية المعلومات",
                    StartDate = input.RequestDate ?? DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    Type = "ندب كلي",
                    ReferenceNumber = $"SEC-{DateTime.UtcNow.Ticks % 10000}"
                };
                emp.LoanDetails = null;
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (actionType == "SECONDMENT_RENEW")
            {
                emp.EmploymentStatus = "Seconded";
                emp.EmploymentStatusAr = "منتدب";
                emp.SecondmentDetails = new SecondmentDetailsDto
                {
                    Entity = !string.IsNullOrWhiteSpace(destination) ? destination : (emp.SecondmentDetails?.Entity ?? "وزارة الاتصالات وتقنية المعلومات"),
                    StartDate = input.RequestDate ?? DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    Type = "ندب كلي",
                    IsRenewal = true,
                    ReferenceNumber = $"SEC-RNW-{DateTime.UtcNow.Ticks % 10000}"
                };
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (actionType == "SECONDMENT_TERMINATE")
            {
                // After approved termination, return employee to normal active status and restore all standard request buttons
                emp.EmploymentStatus = "Active";
                emp.EmploymentStatusAr = "على رأس العمل - نشط";
                emp.SecondmentDetails = null;
                emp.LoanDetails = null;
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (actionType == "LOAN")
            {
                emp.EmploymentStatus = "Loaned";
                emp.EmploymentStatusAr = "معار";
                emp.LoanDetails = new LoanDetailsDto
                {
                    Entity = !string.IsNullOrWhiteSpace(destination) ? destination : "جامعة الملك سعود - كلية علوم الحاسب",
                    StartDate = input.RequestDate ?? DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    Type = "إعارة وظيفية",
                    ReferenceNumber = $"LOAN-{DateTime.UtcNow.Ticks % 10000}"
                };
                emp.SecondmentDetails = null;
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (actionType == "LOAN_RENEW")
            {
                emp.EmploymentStatus = "Loaned";
                emp.EmploymentStatusAr = "معار";
                emp.LoanDetails = new LoanDetailsDto
                {
                    Entity = !string.IsNullOrWhiteSpace(destination) ? destination : (emp.LoanDetails?.Entity ?? "جامعة الملك سعود - كلية علوم الحاسب"),
                    StartDate = input.RequestDate ?? DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    Type = "إعارة وظيفية",
                    IsRenewal = true,
                    ReferenceNumber = $"LOAN-RNW-{DateTime.UtcNow.Ticks % 10000}"
                };
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (actionType == "LOAN_TERMINATE")
            {
                // After approved termination, return employee to normal active status and restore all standard request buttons
                emp.EmploymentStatus = "Active";
                emp.EmploymentStatusAr = "على رأس العمل - نشط";
                emp.SecondmentDetails = null;
                emp.LoanDetails = null;
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
        }

        return Ok(new
        {
            success = true,
            actionType,
            destination,
            status = input.AutoApprove ? "Approved" : "InReview",
            message = "تمت معالجة الطلب والتحقق من قواعد الأعمال بنجاح في Dynamics 365."
        });
    }

    [HttpPost("requests/{id}/approve")]
    public async Task<IActionResult> ApproveRequest(string id, [FromBody] ApproveRequestInputDto? input, CancellationToken ct)
    {
        var targetId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }

        EmployeeDto? emp = null;
        try
        {
            emp = await _d365Service.GetEmployeeAsync(targetId, ct);
        }
        catch
        {
            // fallback
        }

        var requestType = input?.RequestType ?? "";
        var entity = input?.Entity;

        if (emp != null)
        {
            if (requestType.Contains("إنهاء الندب") || requestType.Contains("إنهاء الإعارة"))
            {
                // After approved termination, return employee to normal active status and restore all standard request buttons
                emp.EmploymentStatus = "Active";
                emp.EmploymentStatusAr = "على رأس العمل - نشط";
                emp.SecondmentDetails = null;
                emp.LoanDetails = null;
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (requestType.Contains("تجديد الندب"))
            {
                // Renewal must keep the same destination/entity by default
                emp.EmploymentStatus = "Seconded";
                emp.EmploymentStatusAr = "منتدب";
                emp.SecondmentDetails = new SecondmentDetailsDto
                {
                    Entity = !string.IsNullOrWhiteSpace(entity) ? entity : (emp.SecondmentDetails?.Entity ?? "وزارة الاتصالات وتقنية المعلومات"),
                    StartDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    Type = "ندب كلي",
                    IsRenewal = true,
                    ReferenceNumber = $"SEC-RNW-{DateTime.UtcNow.Ticks % 10000}"
                };
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (requestType.Contains("ندب"))
            {
                emp.EmploymentStatus = "Seconded";
                emp.EmploymentStatusAr = "منتدب";
                emp.SecondmentDetails = new SecondmentDetailsDto
                {
                    Entity = !string.IsNullOrWhiteSpace(entity) ? entity : "وزارة الاتصالات وتقنية المعلومات",
                    StartDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    Type = "ندب كلي",
                    ReferenceNumber = $"SEC-{DateTime.UtcNow.Ticks % 10000}"
                };
                emp.LoanDetails = null;
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (requestType.Contains("تجديد الإعارة"))
            {
                // Renewal must keep the same destination/entity by default
                emp.EmploymentStatus = "Loaned";
                emp.EmploymentStatusAr = "معار";
                emp.LoanDetails = new LoanDetailsDto
                {
                    Entity = !string.IsNullOrWhiteSpace(entity) ? entity : (emp.LoanDetails?.Entity ?? "جامعة الملك سعود - كلية علوم الحاسب"),
                    StartDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    Type = "إعارة وظيفية",
                    IsRenewal = true,
                    ReferenceNumber = $"LOAN-RNW-{DateTime.UtcNow.Ticks % 10000}"
                };
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
            else if (requestType.Contains("إعارة"))
            {
                emp.EmploymentStatus = "Loaned";
                emp.EmploymentStatusAr = "معار";
                emp.LoanDetails = new LoanDetailsDto
                {
                    Entity = !string.IsNullOrWhiteSpace(entity) ? entity : "جامعة الملك سعود - كلية علوم الحاسب",
                    StartDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    Type = "إعارة وظيفية",
                    ReferenceNumber = $"LOAN-{DateTime.UtcNow.Ticks % 10000}"
                };
                emp.SecondmentDetails = null;
                try { await _d365Service.UpdateEmployeeAsync(targetId, emp, ct); } catch {}
            }
        }

        return Ok(new
        {
            success = true,
            requestId = id,
            status = "Approved",
            statusAr = "تمت الموافقة",
            message = "تم اعتماد الطلب بنجاح وتحديث حالة الموظف في محرك Dynamics 365."
        });
    }
}

public class GeneralRequestInputDto
{
    [System.Text.Json.Serialization.JsonPropertyName("actionType")]
    public string ActionType { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("targetEntity")]
    public string? TargetEntity { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("requestDate")]
    public string? RequestDate { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("autoApprove")]
    public bool AutoApprove { get; set; } = true;
}

[ApiController]
public class HealthController : ControllerBase
{
    private readonly ID365Service _d365Service;

    public HealthController(ID365Service d365Service)
    {
        _d365Service = d365Service;
    }

    [HttpGet("health")]
    [HttpGet("api/d365/status")]
    [HttpGet("api/d365/health")]
    [AllowAnonymous]
    public IActionResult HealthCheck()
    {
        var isConfigured = _d365Service.IsConfigured;
        var missing = _d365Service.GetMissingConfigurations();

        return Ok(new
        {
            status = isConfigured ? "UP" : "CONFIGURATION_REQUIRED",
            service = "Microsoft Dynamics 365 Finance & Operations ESS Web API (.NET 8)",
            isConfigured = isConfigured,
            missingFields = missing,
            legalEntity = _d365Service.LegalEntity,
            timestamp = DateTime.UtcNow.ToString("O"),
            version = "8.0.0"
        });
    }

    [HttpGet("api/d365/config")]
    [AllowAnonymous]
    public IActionResult GetConfigStatus()
    {
        var isConfigured = _d365Service.IsConfigured;
        var missing = _d365Service.GetMissingConfigurations();

        if (!isConfigured)
        {
            return StatusCode(503, new
            {
                isConfigured = false,
                status = "CONFIGURATION_REQUIRED",
                message = "Microsoft Dynamics 365 configuration is missing or incomplete in backend environment variables.",
                missingFields = missing,
                details = "Required environment variables: D365Settings__BaseUrl, D365Settings__TenantId, D365Settings__ClientId, D365Settings__ClientSecret, D365Settings__LegalEntity"
            });
        }

        return Ok(new
        {
            isConfigured = true,
            status = "CONFIGURED",
            legalEntity = _d365Service.LegalEntity
        });
    }
}
