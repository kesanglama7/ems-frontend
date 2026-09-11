import { api } from "@/lib/api";
import type {
    AdminLeaveQueryParams,
    AdminLeaveRequestListResponse,
    LeaveRequestDetailResponse,
    ReviewLeavePayload,
    ReviewLeaveResponse,
    AdminBalancesResponse,
    AdminCreateLeavePayload,
    AdminLeaveSummaryResponse,
    AdjustBalancePayload,
    CreateLeaveRequestResponse,
    InitializeBalancesResponse,
} from "../types/leave.types";

export async function getAdminLeaves(
    params?: AdminLeaveQueryParams,
): Promise<AdminLeaveRequestListResponse> {
    const response = await api.get<AdminLeaveRequestListResponse>(
        "/admin/leaves",
        { params },
    );
    return response.data;
}

export async function getAdminLeaveSummary(
    year: number,
): Promise<AdminLeaveSummaryResponse> {
    return (
        await api.get<AdminLeaveSummaryResponse>("/admin/leaves/summary", {
            params: { year },
        })
    ).data;
}
export async function getAdminBalances(
    year: number,
): Promise<AdminBalancesResponse> {
    return (
        await api.get<AdminBalancesResponse>("/admin/leaves/balances", {
            params: { year },
        })
    ).data;
}
export async function initializeBalances(
    year: number,
): Promise<InitializeBalancesResponse> {
    return (
        await api.post<InitializeBalancesResponse>(
            "/admin/leaves/balances/initialize",
            { year },
        )
    ).data;
}
export async function createAdminLeave(
    payload: AdminCreateLeavePayload,
): Promise<CreateLeaveRequestResponse> {
    return (
        await api.post<CreateLeaveRequestResponse>("/admin/leaves", payload)
    ).data;
}
export async function adjustBalance(payload: AdjustBalancePayload) {
    const { employeeId, leaveTypeId, year, ...body } = payload;
    return (
        await api.patch(
            `/admin/leaves/employees/${employeeId}/balance/${leaveTypeId}`,
            body,
            { params: { year } },
        )
    ).data;
}
export async function cancelAdminLeave({
    leaveId,
    payload,
}: {
    leaveId: string;
    payload: ReviewLeavePayload;
}): Promise<ReviewLeaveResponse> {
    return (
        await api.patch<ReviewLeaveResponse>(
            `/admin/leaves/${leaveId}/cancel`,
            payload,
        )
    ).data;
}

export async function getAdminLeaveDetail(
    leaveId: string,
): Promise<LeaveRequestDetailResponse> {
    const response = await api.get<LeaveRequestDetailResponse>(
        `/admin/leaves/${leaveId}`,
    );
    return response.data;
}

export async function approveLeave({
    leaveId,
    payload,
}: {
    leaveId: string;
    payload?: ReviewLeavePayload;
}): Promise<ReviewLeaveResponse> {
    const response = await api.patch<ReviewLeaveResponse>(
        `/admin/leaves/${leaveId}/approve`,
        payload,
    );
    return response.data;
}

export async function rejectLeave({
    leaveId,
    payload,
}: {
    leaveId: string;
    payload?: ReviewLeavePayload;
}): Promise<ReviewLeaveResponse> {
    const response = await api.patch<ReviewLeaveResponse>(
        `/admin/leaves/${leaveId}/reject`,
        payload,
    );
    return response.data;
}


export async function getEmployeeLeaveBalance(
    employeeId: string,
    year: number,
) {

}