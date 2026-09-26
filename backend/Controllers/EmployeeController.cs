using System.Security.Claims;
using D365.Ess.Api.Models;
using D365.Ess.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace D365.Ess.Api.Controllers;

[ApiController]
[Route("api/d365")]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly ID365Service _d365Service;

    public EmployeeController(ID365Service d365Service)
    {
        _d365Service = d365Service;
    }

    [HttpGet("employees/{id}")]
    [HttpGet("employee")]
    public async Task<ActionResult<EmployeeDto>> GetEmployee(string? id, CancellationToken ct)
    {
        var targetId = !string.IsNullOrWhiteSpace(id) ? id : User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }
        var employee = await _d365Service.GetEmployeeAsync(targetId, ct);
        return Ok(employee);
    }

    [HttpPut("employees/{id}")]
    public async Task<ActionResult<EmployeeDto>> UpdateEmployee(string id, [FromBody] EmployeeDto updates, CancellationToken ct)
    {
        var updated = await _d365Service.UpdateEmployeeAsync(id, updates, ct);
        return Ok(updated);
    }

    [HttpPost("employees/status")]
    public async Task<ActionResult<EmployeeDto>> UpdateEmploymentStatus([FromBody] EmploymentStatusUpdateDto statusUpdate, CancellationToken ct)
    {
        var targetId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }

        var emp = await _d365Service.GetEmployeeAsync(targetId, ct);
        if (emp == null)
        {
            return NotFound(new { error = new { message = "الموظف غير موجود بنظام Dynamics 365." } });
        }

        if (statusUpdate.Status == "Seconded")
        {
            emp.EmploymentStatus = "Seconded";
            emp.EmploymentStatusAr = "منتدب";
            emp.SecondmentDetails = new SecondmentDetailsDto
            {
                Entity = !string.IsNullOrWhiteSpace(statusUpdate.Entity)
                    ? statusUpdate.Entity
                    : (!string.IsNullOrWhiteSpace(emp.SecondmentDetails?.Entity) ? emp.SecondmentDetails.Entity : "وزارة الاتصالات وتقنية المعلومات"),
                StartDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Type = "ندب كلي",
                ReferenceNumber = $"SEC-{DateTime.UtcNow.Ticks % 10000}"
            };
            emp.LoanDetails = null;
        }
        else if (statusUpdate.Status == "Loaned")
        {
            emp.EmploymentStatus = "Loaned";
            emp.EmploymentStatusAr = "معار";
            emp.LoanDetails = new LoanDetailsDto
            {
                Entity = !string.IsNullOrWhiteSpace(statusUpdate.Entity)
                    ? statusUpdate.Entity
                    : (!string.IsNullOrWhiteSpace(emp.LoanDetails?.Entity) ? emp.LoanDetails.Entity : "جامعة الملك سعود - كلية علوم الحاسب"),
                StartDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Type = "إعارة وظيفية",
                ReferenceNumber = $"LOAN-{DateTime.UtcNow.Ticks % 10000}"
            };
            emp.SecondmentDetails = null;
        }
        else
        {
            // Return to normal active status and restore all standard request buttons
            emp.EmploymentStatus = "Active";
            emp.EmploymentStatusAr = "على رأس العمل - نشط";
            emp.SecondmentDetails = null;
            emp.LoanDetails = null;
        }

        var updated = await _d365Service.UpdateEmployeeAsync(targetId, emp, ct);
        return Ok(updated);
    }

    [HttpGet("performance-evaluations")]
    public async Task<ActionResult<List<PerformanceEvaluationDto>>> GetPerformanceEvaluations([FromQuery] string? workerId, CancellationToken ct)
    {
        var targetId = !string.IsNullOrWhiteSpace(workerId) ? workerId : User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }
        var evals = await _d365Service.GetPerformanceEvaluationsAsync(targetId, ct);
        return Ok(evals);
    }

    [HttpGet("notifications")]
    public async Task<ActionResult<List<D365NotificationDto>>> GetNotifications([FromQuery] string? workerId, CancellationToken ct)
    {
        var targetId = !string.IsNullOrWhiteSpace(workerId) ? workerId : User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }
        var notifs = await _d365Service.GetNotificationsAsync(targetId, ct);
        return Ok(notifs);
    }
}
