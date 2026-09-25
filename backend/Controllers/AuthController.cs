using System.Security.Claims;
using D365.Ess.Api.Models;
using D365.Ess.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace D365.Ess.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IAuditLogger _auditLogger;

    public AuthController(IAuthService authService, IAuditLogger auditLogger)
    {
        _authService = authService;
        _auditLogger = auditLogger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var response = await _authService.LoginAsync(request, ip, ct);

        if (!response.Success)
        {
            return Unauthorized(response);
        }

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<UserDto> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        var primaryRole = roles.FirstOrDefault() ?? UserRoles.EssUser;

        var user = new UserDto
        {
            Id = userId,
            CivilId = User.FindFirst("civilId")?.Value ?? string.Empty,
            Name = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
            Email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
            JobTitle = User.FindFirst("jobTitle")?.Value ?? string.Empty,
            Department = User.FindFirst("department")?.Value ?? string.Empty,
            Division = User.FindFirst("division")?.Value,
            LegalEntity = User.FindFirst("legalEntity")?.Value,
            Role = primaryRole,
            Roles = roles,
            IsActive = true
        };

        return Ok(user);
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        _auditLogger.LogAction(
            action: "LOGOUT",
            endpoint: "/api/auth/logout",
            method: "POST",
            statusCode: 200,
            durationMs: 1,
            userId: userId,
            userName: userName,
            userRole: userRole,
            ip: ip,
            details: "User logged out successfully",
            isSecurity: true
        );

        return Ok(new { success = true, message = "تم تسجيل الخروج بنجاح" });
    }
}
