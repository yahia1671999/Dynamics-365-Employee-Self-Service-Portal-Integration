using D365.Ess.Api.Models;
using Microsoft.Extensions.Options;

namespace D365.Ess.Api.Services;

public interface ID365Service
{
    bool IsConfigured { get; }
    string LegalEntity { get; }
    List<string> GetMissingConfigurations();

    Task<EmployeeDto> GetEmployeeAsync(string workerId, CancellationToken ct = default);
    Task<EmployeeDto> UpdateEmployeeAsync(string workerId, EmployeeDto updates, CancellationToken ct = default);
    Task<List<LeaveBalanceDto>> GetLeaveBalancesAsync(string workerId, CancellationToken ct = default);
    Task<List<LeaveRequestDto>> GetLeaveRequestsAsync(string workerId, CancellationToken ct = default);
    Task<List<LeaveMovementTransactionDto>> GetLeaveTransactionsAsync(string? typeCode, string workerId, CancellationToken ct = default);
    Task<List<DelegatedEmployeeDto>> GetDelegatedEmployeesAsync(CancellationToken ct = default);
    Task<LeaveRequestDto> SubmitLeaveRequestAsync(LeaveRequestDto request, CancellationToken ct = default);
    Task<bool> CancelLeaveRequestAsync(string requestId, CancellationToken ct = default);

    Task<List<PenaltyDto>> GetPenaltiesAsync(string workerId, CancellationToken ct = default);
    Task<GrievanceDto> SubmitGrievanceAsync(GrievanceRequestModel model, CancellationToken ct = default);
    Task<List<GrievanceDto>> GetGrievancesAsync(string workerId, CancellationToken ct = default);

    Task<List<TrainingCourseDto>> GetTrainingCoursesAsync(string workerId, CancellationToken ct = default);
    Task<TrainingEvaluationDto> SubmitTrainingEvaluationAsync(TrainingEvaluationRequestModel model, CancellationToken ct = default);

    Task<List<TeamMemberDto>> GetTeamMembersAsync(string managerId, CancellationToken ct = default);
    Task<TeamMemberRequestDto?> ApproveTeamRequestAsync(string requestId, string? notes, CancellationToken ct = default);
    Task<TeamMemberRequestDto?> RejectTeamRequestAsync(string requestId, string reason, CancellationToken ct = default);
    Task<TeamMemberRequestDto?> SubmitLeaveOnBehalfAsync(LeaveOnBehalfModel model, CancellationToken ct = default);
    Task<TeamMemberRequestDto?> SubmitAbsenceOnBehalfAsync(AbsenceOnBehalfModel model, CancellationToken ct = default);

    Task<List<PerformanceEvaluationDto>> GetPerformanceEvaluationsAsync(string workerId, CancellationToken ct = default);
    Task<List<MonitoringOperationDto>> GetMonitoringOperationsAsync(string workerId, CancellationToken ct = default);
    Task<MonitoringOperationDto> SubmitFinancialDisclosureAsync(FinancialDisclosureModel model, CancellationToken ct = default);
    Task<MonitoringOperationDto> SubmitDrugTestAsync(DrugTestModel model, CancellationToken ct = default);
    Task<MonitoringOperationDto?> UpdateMonitoringStatusAsync(string id, string status, string? note, CancellationToken ct = default);

    Task<List<D365NotificationDto>> GetNotificationsAsync(string workerId, CancellationToken ct = default);
    Task<List<UnifiedRequestItemDto>> GetUnifiedRequestsAsync(CancellationToken ct = default);
}

public class D365Service : ID365Service
{
    private readonly ID365Client _client;
    private readonly D365Settings _settings;
    private readonly IAuditLogger _auditLogger;
    private readonly ILogger<D365Service> _logger;

    public bool IsConfigured => _settings.IsConfigured;
    public string LegalEntity => _settings.LegalEntity;
    public List<string> GetMissingConfigurations() => _settings.GetMissingConfigurations();

    public D365Service(
        ID365Client client,
        IOptions<D365Settings> options,
        IAuditLogger auditLogger,
        ILogger<D365Service> logger)
    {
        _client = client;
        _settings = options.Value;
        _auditLogger = auditLogger;
        _logger = logger;
    }

    private void EnsureConfigured()
    {
        if (!_settings.IsConfigured)
        {
            throw new D365ConfigurationException(_settings.GetMissingConfigurations());
        }
    }

    public async Task<EmployeeDto> GetEmployeeAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=PersonnelNumber eq '{workerId}'";
        var liveData = await _client.GetAsync<EmployeeDto>("Employees", filter, ct);
        if (liveData == null)
        {
            throw new KeyNotFoundException($"Employee with PersonnelNumber '{workerId}' was not found in Dynamics 365.");
        }
        return liveData;
    }

    public async Task<EmployeeDto> UpdateEmployeeAsync(string workerId, EmployeeDto updates, CancellationToken ct = default)
    {
        EnsureConfigured();

        var res = await _client.PatchAsync<EmployeeDto, EmployeeDto>($"Employees(PersonnelNumber='{workerId}',dataAreaId='{_settings.LegalEntity}')", updates, ct);
        if (res == null)
        {
            throw new InvalidOperationException($"Failed to update employee '{workerId}' in Dynamics 365.");
        }
        return res;
    }

    public async Task<List<LeaveBalanceDto>> GetLeaveBalancesAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'";
        var balances = await _client.GetAsync<List<LeaveBalanceDto>>("LeaveAndAbsenceBankTransactions", filter, ct);
        return balances ?? new List<LeaveBalanceDto>();
    }

    public async Task<List<LeaveRequestDto>> GetLeaveRequestsAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'&$orderby=SubmissionDate desc";
        var requests = await _client.GetAsync<List<LeaveRequestDto>>("LeaveAndAbsenceRequests", filter, ct);
        return requests ?? new List<LeaveRequestDto>();
    }

    public async Task<List<LeaveMovementTransactionDto>> GetLeaveTransactionsAsync(string? typeCode, string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'";
        if (!string.IsNullOrEmpty(typeCode))
        {
            filter += $" and LeaveTypeId eq '{typeCode}'";
        }
        var transactions = await _client.GetAsync<List<LeaveMovementTransactionDto>>("LeaveAndAbsenceBankTransactions", filter, ct);
        return transactions ?? new List<LeaveMovementTransactionDto>();
    }

    public async Task<List<DelegatedEmployeeDto>> GetDelegatedEmployeesAsync(CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=dataAreaId eq '{_settings.LegalEntity}'";
        var list = await _client.GetAsync<List<DelegatedEmployeeDto>>("HcmDelegatedEmployees", filter, ct);
        return list ?? new List<DelegatedEmployeeDto>();
    }

    public async Task<LeaveRequestDto> SubmitLeaveRequestAsync(LeaveRequestDto request, CancellationToken ct = default)
    {
        EnsureConfigured();

        var submitted = await _client.PostAsync<LeaveRequestDto, LeaveRequestDto>("LeaveAndAbsenceRequests", request, ct);
        if (submitted == null)
        {
            throw new InvalidOperationException("Failed to submit leave request to Dynamics 365.");
        }
        return submitted;
    }

    public async Task<bool> CancelLeaveRequestAsync(string requestId, CancellationToken ct = default)
    {
        EnsureConfigured();

        return await _client.DeleteAsync($"LeaveAndAbsenceRequests('{requestId}')", ct);
    }

    public async Task<List<PenaltyDto>> GetPenaltiesAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'";
        var penalties = await _client.GetAsync<List<PenaltyDto>>("DisciplinaryPenalties", filter, ct);
        return penalties ?? new List<PenaltyDto>();
    }

    public async Task<GrievanceDto> SubmitGrievanceAsync(GrievanceRequestModel model, CancellationToken ct = default)
    {
        EnsureConfigured();

        var grievance = await _client.PostAsync<GrievanceRequestModel, GrievanceDto>("DisciplinaryGrievances", model, ct);
        if (grievance == null)
        {
            throw new InvalidOperationException("Failed to submit grievance to Dynamics 365.");
        }
        return grievance;
    }

    public async Task<List<GrievanceDto>> GetGrievancesAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'";
        var grievances = await _client.GetAsync<List<GrievanceDto>>("DisciplinaryGrievances", filter, ct);
        return grievances ?? new List<GrievanceDto>();
    }

    public async Task<List<TrainingCourseDto>> GetTrainingCoursesAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'";
        var courses = await _client.GetAsync<List<TrainingCourseDto>>("CourseAttendances", filter, ct);
        return courses ?? new List<TrainingCourseDto>();
    }

    public async Task<TrainingEvaluationDto> SubmitTrainingEvaluationAsync(TrainingEvaluationRequestModel model, CancellationToken ct = default)
    {
        EnsureConfigured();

        var eval = await _client.PostAsync<TrainingEvaluationRequestModel, TrainingEvaluationDto>("CourseEvaluations", model, ct);
        if (eval == null)
        {
            throw new InvalidOperationException("Failed to submit training evaluation to Dynamics 365.");
        }
        return eval;
    }

    public async Task<List<TeamMemberDto>> GetTeamMembersAsync(string managerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=ReportsToPersonnelNumber eq '{managerId}'";
        var members = await _client.GetAsync<List<TeamMemberDto>>("HcmWorkerReportingHierarchy", filter, ct);
        return members ?? new List<TeamMemberDto>();
    }

    public async Task<TeamMemberRequestDto?> ApproveTeamRequestAsync(string requestId, string? notes, CancellationToken ct = default)
    {
        EnsureConfigured();

        var body = new { Status = "معتمدة", ApprovalNotes = notes, ApprovedAt = DateTime.UtcNow };
        return await _client.PatchAsync<object, TeamMemberRequestDto>($"TeamMemberRequests('{requestId}')", body, ct);
    }

    public async Task<TeamMemberRequestDto?> RejectTeamRequestAsync(string requestId, string reason, CancellationToken ct = default)
    {
        EnsureConfigured();

        var body = new { Status = "مرفوضة", RejectionReason = reason, RejectedAt = DateTime.UtcNow };
        return await _client.PatchAsync<object, TeamMemberRequestDto>($"TeamMemberRequests('{requestId}')", body, ct);
    }

    public async Task<TeamMemberRequestDto?> SubmitLeaveOnBehalfAsync(LeaveOnBehalfModel model, CancellationToken ct = default)
    {
        EnsureConfigured();

        return await _client.PostAsync<LeaveOnBehalfModel, TeamMemberRequestDto>("TeamMemberRequests", model, ct);
    }

    public async Task<TeamMemberRequestDto?> SubmitAbsenceOnBehalfAsync(AbsenceOnBehalfModel model, CancellationToken ct = default)
    {
        EnsureConfigured();

        return await _client.PostAsync<AbsenceOnBehalfModel, TeamMemberRequestDto>("TeamMemberRequests", model, ct);
    }

    public async Task<List<PerformanceEvaluationDto>> GetPerformanceEvaluationsAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'";
        var evals = await _client.GetAsync<List<PerformanceEvaluationDto>>("HcmPerformanceGoals", filter, ct);
        return evals ?? new List<PerformanceEvaluationDto>();
    }

    public async Task<List<MonitoringOperationDto>> GetMonitoringOperationsAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'";
        var ops = await _client.GetAsync<List<MonitoringOperationDto>>("ComplianceMonitoringOperations", filter, ct);
        return ops ?? new List<MonitoringOperationDto>();
    }

    public async Task<MonitoringOperationDto> SubmitFinancialDisclosureAsync(FinancialDisclosureModel model, CancellationToken ct = default)
    {
        EnsureConfigured();

        var res = await _client.PostAsync<FinancialDisclosureModel, MonitoringOperationDto>("ComplianceMonitoringOperations", model, ct);
        if (res == null)
        {
            throw new InvalidOperationException("Failed to submit financial disclosure to Dynamics 365.");
        }
        return res;
    }

    public async Task<MonitoringOperationDto> SubmitDrugTestAsync(DrugTestModel model, CancellationToken ct = default)
    {
        EnsureConfigured();

        var res = await _client.PostAsync<DrugTestModel, MonitoringOperationDto>("ComplianceMonitoringOperations", model, ct);
        if (res == null)
        {
            throw new InvalidOperationException("Failed to submit drug test result to Dynamics 365.");
        }
        return res;
    }

    public async Task<MonitoringOperationDto?> UpdateMonitoringStatusAsync(string id, string status, string? note, CancellationToken ct = default)
    {
        EnsureConfigured();

        var body = new { Status = status, ReviewNote = note, UpdatedAt = DateTime.UtcNow };
        return await _client.PatchAsync<object, MonitoringOperationDto>($"ComplianceMonitoringOperations('{id}')", body, ct);
    }

    public async Task<List<D365NotificationDto>> GetNotificationsAsync(string workerId, CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=WorkerPersonnelNumber eq '{workerId}'";
        var notifs = await _client.GetAsync<List<D365NotificationDto>>("HcmSystemAlertNotifications", filter, ct);
        return notifs ?? new List<D365NotificationDto>();
    }

    public async Task<List<UnifiedRequestItemDto>> GetUnifiedRequestsAsync(CancellationToken ct = default)
    {
        EnsureConfigured();

        var filter = $"cross-company=true&$filter=dataAreaId eq '{_settings.LegalEntity}'";
        var list = await _client.GetAsync<List<UnifiedRequestItemDto>>("UnifiedWorkflowWorkItems", filter, ct);
        return list ?? new List<UnifiedRequestItemDto>();
    }
}
