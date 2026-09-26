using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using D365.Ess.Api.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace D365.Ess.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default);
    Task<UserDto?> GetUserByIdAsync(string id, CancellationToken ct = default);
    string GenerateJwtToken(UserDto user);
}

public class AuthService : IAuthService
{
    private readonly JwtSettings _jwtSettings;
    private readonly D365Settings _d365Settings;
    private readonly ID365Client _d365Client;
    private readonly IAuditLogger _auditLogger;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IOptions<JwtSettings> jwtOptions,
        IOptions<D365Settings> d365Options,
        ID365Client d365Client,
        IAuditLogger auditLogger,
        ILogger<AuthService> logger)
    {
        _jwtSettings = jwtOptions.Value;
        _d365Settings = d365Options.Value;
        _d365Client = d365Client;
        _auditLogger = auditLogger;
        _logger = logger;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default)
    {
        var cleanUsername = request.Username?.Trim().Replace(" ", "") ?? string.Empty;
        var cleanPassword = request.Password?.Trim() ?? string.Empty;

        if (string.IsNullOrEmpty(cleanUsername) || string.IsNullOrEmpty(cleanPassword))
        {
            _auditLogger.LogAction(
                action: "LOGIN_FAILED",
                endpoint: "/api/auth/login",
                method: "POST",
                statusCode: 400,
                durationMs: 5,
                userName: cleanUsername,
                ip: ipAddress,
                details: "Missing username or password",
                isSecurity: true
            );

            return new AuthResponse
            {
                Success = false,
                ErrorMessage = "يرجى إدخال اسم المستخدم وكلمة المرور"
            };
        }

        // Temporary Isolated Demo User for UI Review Only
        // National ID: 28509180102934 | Password: Pass@word1
        if (cleanUsername == "28509180102934" && cleanPassword == "Pass@word1")
        {
            var demoRoles = new List<string> { UserRoles.EssUser, UserRoles.MssMgr };
            var demoUser = new UserDto
            {
                Id = "EMP-2850918",
                CivilId = "28509180102934",
                Name = "م. سارة أحمد المنصوري",
                JobTitle = "كبير أخصائيي التحول الرقمي ونظم المعلومات",
                Department = "الإدارة العامة لتقنية المعلومات",
                Division = "إدارة الحلول وتطبيقات الأعمال",
                Email = "sara.almansoori@contoso.gov.sa",
                Phone = "+966 50 123 4567",
                LegalEntity = "USMF",
                Role = UserRoles.MssMgr,
                Roles = demoRoles,
                IsActive = true
            };

            var demoToken = GenerateJwtToken(demoUser);

            _auditLogger.LogAction(
                action: "DEMO_LOGIN_SUCCESS",
                endpoint: "/api/auth/login",
                method: "POST",
                statusCode: 200,
                durationMs: 5,
                userId: demoUser.Id,
                userName: demoUser.Name,
                userRole: demoUser.Role,
                ip: ipAddress,
                details: "Temporary isolated demo user authenticated for UI review",
                isSecurity: true
            );

            return new AuthResponse
            {
                Success = true,
                Token = demoToken,
                User = demoUser,
                ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes).ToUnixTimeMilliseconds()
            };
        }

        if (!_d365Settings.IsConfigured)
        {
            _logger.LogWarning("Login attempted while Dynamics 365 configuration is incomplete.");
            return new AuthResponse
            {
                Success = false,
                ErrorMessage = "إعدادات الربط مع Microsoft Dynamics 365 غير متوفرة أو غير مكتملة في متغيرات بيئة الخادم."
            };
        }

        try
        {
            // Query Dynamics 365 Workers / Employees OData entity
            var odataFilter = $"PersonnelNumber eq '{cleanUsername}' or IdentificationNumber eq '{cleanUsername}'";
            var result = await _d365Client.GetAsync<ODataListResponse<EmployeeDto>>(
                "Employees",
                $"$filter={Uri.EscapeDataString(odataFilter)}&$top=1",
                ct
            );

            var employee = result?.Value?.FirstOrDefault();
            if (employee == null)
            {
                _auditLogger.LogAction(
                    action: "LOGIN_FAILED",
                    endpoint: "/api/auth/login",
                    method: "POST",
                    statusCode: 401,
                    durationMs: 20,
                    userName: cleanUsername,
                    ip: ipAddress,
                    details: "Employee not found in Dynamics 365 directory",
                    isSecurity: true
                );

                return new AuthResponse
                {
                    Success = false,
                    ErrorMessage = "الرقم القومي أو اسم المستخدم غير مسجل بنظام Dynamics 365"
                };
            }

            // Derive roles dynamically from Dynamics 365 data
            var roles = new List<string> { UserRoles.EssUser };
            
            // Check if worker has direct reports in Dynamics 365
            var reportsQuery = $"$filter=ManagerPersonnelNumber eq '{employee.Id}'&$top=1";
            var teamMembers = await _d365Client.GetAsync<ODataListResponse<TeamMemberDto>>("TeamMembers", reportsQuery, ct);
            if (teamMembers?.Value != null && teamMembers.Value.Count > 0)
            {
                roles.Add(UserRoles.MssMgr);
            }

            var primaryRole = roles.Contains(UserRoles.MssMgr) ? UserRoles.MssMgr : UserRoles.EssUser;

            var user = new UserDto
            {
                Id = employee.Id,
                CivilId = employee.CivilId,
                Name = employee.Name,
                JobTitle = employee.JobTitle,
                Department = employee.Department,
                Division = employee.Division,
                Email = employee.Email,
                Phone = employee.Phone,
                LegalEntity = employee.LegalEntity,
                Role = primaryRole,
                Roles = roles,
                AvatarUrl = employee.AvatarUrl,
                IsActive = employee.EmploymentStatus?.Equals("Active", StringComparison.OrdinalIgnoreCase) ?? true,
            };

            var token = GenerateJwtToken(user);
            var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes).ToUnixTimeMilliseconds();

            _auditLogger.LogAction(
                action: "LOGIN_SUCCESS",
                endpoint: "/api/auth/login",
                method: "POST",
                statusCode: 200,
                durationMs: 35,
                userId: user.Id,
                userName: user.Name,
                userRole: user.Role,
                ip: ipAddress,
                details: $"Authenticated via Dynamics 365 with roles: [{string.Join(", ", user.Roles)}]",
                isSecurity: true
            );

            return new AuthResponse
            {
                Success = true,
                Token = token,
                User = user,
                ExpiresAt = expiresAt
            };
        }
        catch (D365ConfigurationException ex)
        {
            _logger.LogError(ex, "Dynamics 365 configuration error during login");
            return new AuthResponse
            {
                Success = false,
                ErrorMessage = "إعدادات الربط مع Microsoft Dynamics 365 غير متوفرة أو غير مكتملة."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during login authentication with Dynamics 365");
            return new AuthResponse
            {
                Success = false,
                ErrorMessage = "تعذر إتمام عملية تسجيل الدخول عبر خادم Dynamics 365."
            };
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(string id, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(id) || !_d365Settings.IsConfigured)
        {
            return null;
        }

        try
        {
            var emp = await _d365Client.GetAsync<EmployeeDto>($"Employees('{id}')", null, ct);
            if (emp == null) return null;

            return new UserDto
            {
                Id = emp.Id,
                CivilId = emp.CivilId,
                Name = emp.Name,
                JobTitle = emp.JobTitle,
                Department = emp.Department,
                Division = emp.Division,
                Email = emp.Email,
                Phone = emp.Phone,
                LegalEntity = emp.LegalEntity,
                Role = UserRoles.EssUser,
                Roles = new List<string> { UserRoles.EssUser },
                AvatarUrl = emp.AvatarUrl,
                IsActive = true
            };
        }
        catch
        {
            return null;
        }
    }

    public string GenerateJwtToken(UserDto user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email),
            new("civilId", user.CivilId),
            new("jobTitle", user.JobTitle),
            new("department", user.Department),
            new("legalEntity", user.LegalEntity ?? "EG01")
        };

        if (!string.IsNullOrEmpty(user.Division))
        {
            claims.Add(new Claim("division", user.Division));
        }

        // Add standard roles
        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // Guarantee primary role claim
        if (!user.Roles.Contains(user.Role))
        {
            claims.Add(new Claim(ClaimTypes.Role, user.Role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
