using System.Security.Claims;
using D365.Ess.Api.Models;
using D365.Ess.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace D365.Ess.Api.Controllers;

[ApiController]
[Route("api/d365")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ID365Service _d365Service;

    public LeaveController(ID365Service d365Service)
    {
        _d365Service = d365Service;
    }

    [HttpGet("leave-balances")]
    public async Task<ActionResult<List<LeaveBalanceDto>>> GetLeaveBalances([FromQuery] string? workerId, CancellationToken ct)
    {
        var targetId = !string.IsNullOrWhiteSpace(workerId) ? workerId : User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }
        var balances = await _d365Service.GetLeaveBalancesAsync(targetId, ct);
        return Ok(balances);
    }

    [HttpGet("leave-requests")]
    public async Task<ActionResult<List<LeaveRequestDto>>> GetLeaveRequests([FromQuery] string? workerId, CancellationToken ct)
    {
        var targetId = !string.IsNullOrWhiteSpace(workerId) ? workerId : User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }
        var requests = await _d365Service.GetLeaveRequestsAsync(targetId, ct);
        return Ok(requests);
    }

    [HttpGet("leave-transactions")]
    public async Task<ActionResult<List<LeaveMovementTransactionDto>>> GetLeaveTransactions([FromQuery] string? typeCode, [FromQuery] string? workerId, CancellationToken ct)
    {
        var targetId = !string.IsNullOrWhiteSpace(workerId) ? workerId : User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(targetId))
        {
            return BadRequest(new { error = new { message = "معرف الموظف مطلوب أو يجب تسجيل الدخول." } });
        }
        var txs = await _d365Service.GetLeaveTransactionsAsync(typeCode, targetId, ct);
        return Ok(txs);
    }

    [HttpGet("delegated-employees")]
    public async Task<ActionResult<List<DelegatedEmployeeDto>>> GetDelegatedEmployees(CancellationToken ct)
    {
        var delegates = await _d365Service.GetDelegatedEmployeesAsync(ct);
        return Ok(delegates);
    }

    [HttpPost("leave-requests")]
    public async Task<ActionResult<LeaveRequestDto>> SubmitLeaveRequest([FromBody] LeaveRequestDto request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.LeaveTypeCode) || string.IsNullOrWhiteSpace(request.StartDate) || string.IsNullOrWhiteSpace(request.EndDate))
        {
            return BadRequest(new { error = new { message = "بيانات طلب الإجازة غير مكتملة (نوع الإجازة وتاريخ البدء والانتهاء إلزامية)." } });
        }

        // Validate employee status according to Secondment/Loan business rules
        var targetId = !string.IsNullOrWhiteSpace(request.EmployeeId) ? request.EmployeeId : User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrWhiteSpace(targetId))
        {
            try
            {
                var emp = await _d365Service.GetEmployeeAsync(targetId, ct);
                if (emp != null)
                {
                    if (emp.EmploymentStatus == "Seconded" || (emp.EmploymentStatusAr != null && emp.EmploymentStatusAr.Contains("منتدب")))
                    {
                        return BadRequest(new { error = new { message = "لا يمكن تقديم طلب إجازة أثناء فترة الندب. حالة الموظف الحالية: منتدب. وفقاً لقواعد الأعمال، الإجراءات المتاحة هي (تجديد الندب) أو (إنهاء الندب) فقط." } });
                    }
                    if (emp.EmploymentStatus == "Loaned" || (emp.EmploymentStatusAr != null && emp.EmploymentStatusAr.Contains("معار")))
                    {
                        return BadRequest(new { error = new { message = "لا يمكن تقديم طلب إجازة أثناء فترة الإعارة. حالة الموظف الحالية: معار. وفقاً لقواعد الأعمال، الإجراءات المتاحة هي (تجديد الإعارة) أو (إنهاء الإعارة) فقط." } });
                    }
                }
            }
            catch
            {
                // Continue if employee check is unavailable
            }
        }

        var created = await _d365Service.SubmitLeaveRequestAsync(request, ct);
        return Created($"/api/d365/leave-requests/{created.Id}", created);
    }

    [HttpDelete("leave-requests/{id}")]
    public async Task<IActionResult> CancelLeaveRequest(string id, CancellationToken ct)
    {
        var success = await _d365Service.CancelLeaveRequestAsync(id, ct);
        if (success)
        {
            return Ok(new { success = true });
        }
        return NotFound(new { error = new { message = "طلب الإجازة غير موجود" } });
    }
}
