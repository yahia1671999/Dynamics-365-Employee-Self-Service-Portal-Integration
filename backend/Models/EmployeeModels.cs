using System.Text.Json.Serialization;

namespace D365.Ess.Api.Models;

public class PersonalDetailsDto
{
    [JsonPropertyName("maritalStatus")]
    public string MaritalStatus { get; set; } = "متزوجة";

    [JsonPropertyName("maritalStatusDate")]
    public string? MaritalStatusDate { get; set; }

    [JsonPropertyName("dependentsCount")]
    public int DependentsCount { get; set; } = 2;

    [JsonPropertyName("spouseWorking")]
    public string SpouseWorking { get; set; } = "نعم";

    [JsonPropertyName("religion")]
    public string Religion { get; set; } = "مسلم";

    [JsonPropertyName("educationQualification")]
    public string EducationQualification { get; set; } = "بكالوريوس حاسبات ومعلومات - علوم الحاسب";

    [JsonPropertyName("retirementDate")]
    public string RetirementDate { get; set; } = "2045-09-18";

    [JsonPropertyName("isDisabled")]
    public string IsDisabled { get; set; } = "لا";

    [JsonPropertyName("verificationDate")]
    public string? VerificationDate { get; set; }
}

public class EmployeeDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("jobTitle")]
    public string JobTitle { get; set; } = string.Empty;

    [JsonPropertyName("department")]
    public string Department { get; set; } = string.Empty;

    [JsonPropertyName("division")]
    public string Division { get; set; } = string.Empty;

    [JsonPropertyName("hireDate")]
    public string HireDate { get; set; } = string.Empty;

    [JsonPropertyName("directManager")]
    public string DirectManager { get; set; } = string.Empty;

    [JsonPropertyName("jobGrade")]
    public string JobGrade { get; set; } = string.Empty;

    [JsonPropertyName("employmentStatus")]
    public string EmploymentStatus { get; set; } = "Active";

    [JsonPropertyName("employmentStatusAr")]
    public string EmploymentStatusAr { get; set; } = "قائم بالعمل";

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("legalEntity")]
    public string LegalEntity { get; set; } = string.Empty;

    [JsonPropertyName("civilId")]
    public string CivilId { get; set; } = string.Empty;

    [JsonPropertyName("avatarUrl")]
    public string? AvatarUrl { get; set; }

    [JsonPropertyName("yearsOfService")]
    public string? YearsOfService { get; set; }

    [JsonPropertyName("personalDetails")]
    public PersonalDetailsDto? PersonalDetails { get; set; }

    [JsonPropertyName("secondmentDetails")]
    public SecondmentDetailsDto? SecondmentDetails { get; set; }

    [JsonPropertyName("loanDetails")]
    public LoanDetailsDto? LoanDetails { get; set; }
}

public class SecondmentDetailsDto
{
    [JsonPropertyName("entity")]
    public string Entity { get; set; } = string.Empty;

    [JsonPropertyName("startDate")]
    public string StartDate { get; set; } = string.Empty;

    [JsonPropertyName("endDate")]
    public string? EndDate { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; } = "ندب كلي";

    [JsonPropertyName("referenceNumber")]
    public string? ReferenceNumber { get; set; }

    [JsonPropertyName("isRenewal")]
    public bool IsRenewal { get; set; } = false;
}

public class LoanDetailsDto
{
    [JsonPropertyName("entity")]
    public string Entity { get; set; } = string.Empty;

    [JsonPropertyName("startDate")]
    public string StartDate { get; set; } = string.Empty;

    [JsonPropertyName("endDate")]
    public string? EndDate { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; } = "إعارة وظيفية";

    [JsonPropertyName("referenceNumber")]
    public string? ReferenceNumber { get; set; }

    [JsonPropertyName("isRenewal")]
    public bool IsRenewal { get; set; } = false;
}

public class PerformanceEvaluationDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("year")]
    public int Year { get; set; }

    [JsonPropertyName("rating")]
    public string Rating { get; set; } = string.Empty;

    [JsonPropertyName("score")]
    public double Score { get; set; }

    [JsonPropertyName("evaluatorName")]
    public string EvaluatorName { get; set; } = string.Empty;

    [JsonPropertyName("evaluationDate")]
    public string EvaluationDate { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Approved";

    [JsonPropertyName("strengths")]
    public List<string> Strengths { get; set; } = new();

    [JsonPropertyName("developmentAreas")]
    public List<string> DevelopmentAreas { get; set; } = new();
}

public class D365NotificationDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = string.Empty;

    [JsonPropertyName("isRead")]
    public bool IsRead { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "info";
}

public class EmploymentStatusUpdateDto
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = "Active";

    [JsonPropertyName("entity")]
    public string? Entity { get; set; }
}

public class ApproveRequestInputDto
{
    [JsonPropertyName("requestType")]
    public string? RequestType { get; set; }

    [JsonPropertyName("entity")]
    public string? Entity { get; set; }

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }
}

