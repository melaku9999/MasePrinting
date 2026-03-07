import { Task, SubTask } from "./auth";

/**
 * Maps a backend task response to the frontend Task interface.
 */
export function mapBackendTaskToFrontend(backendTask: any): Task {
    return {
        id: backendTask.id.toString(),
        title: backendTask.title,
        description: backendTask.description || "",
        customerId: backendTask.customer?.id?.toString() || "",
        serviceId: backendTask.service?.id?.toString() || "",
        assignedTo: backendTask.assigned_to?.id?.toString() || "",
        status: mapBackendStatus(backendTask.status),
        priority: mapBackendPriority(backendTask.priority),
        dueDate: backendTask.due_date || backendTask.dueDate || "",
        createdAt: backendTask.created_at || backendTask.createdAt || "",
        updatedAt: backendTask.updated_at || backendTask.updatedAt || "",
        completedAt: backendTask.completed_at || backendTask.completedAt || "",
        progress: backendTask.progress || 0,
        price: parseFloat(backendTask.base_price || "0"),
        customer_name: backendTask.customer?.name,
        service_name: backendTask.service?.name,
        subtasks: (backendTask.subtasks || []).map(mapBackendSubtaskToFrontend),
        customer: backendTask.customer,
        service: backendTask.service,
        assigned_to: backendTask.assigned_to,
    };
}

/**
 * Maps a backend subtask to the frontend SubTask interface.
 */
export function mapBackendSubtaskToFrontend(backendSubtask: any): SubTask {
    return {
        id: backendSubtask.id.toString(),
        title: backendSubtask.title,
        description: backendSubtask.description || "",
        completed: backendSubtask.status === "completed",
        requiresProof: backendSubtask.requires_proof,
        proofFiles: backendSubtask.proof_files_list ? backendSubtask.proof_files_list.map((p: any) => ({
            id: p.id,
            file: p.file,
            original_name: p.original_name,
            uploaded_at: p.uploaded_at
        })) : (backendSubtask.proof_file ? [{
            id: 0,
            file: backendSubtask.proof_file,
            original_name: backendSubtask.proof_file.split('/').pop() || "proof",
            uploaded_at: backendSubtask.updated_at || ""
        }] : []),
        additionalCost: backendSubtask.additional_cost ? {
            amount: parseFloat(backendSubtask.additional_cost),
            comment: backendSubtask.additional_cost_notes || ""
        } : undefined,
    };
}

/**
 * Maps backend status (usually with underscores) to frontend status (usually with hyphens).
 */
function mapBackendStatus(status: string): Task["status"] {
    if (status === "in_progress") return "in-progress";
    return status as Task["status"];
}

/**
 * Maps backend priority (integer) to frontend priority (string or number).
 */
function mapBackendPriority(priority: number | string): Task["priority"] {
    const p = typeof priority === 'string' ? parseInt(priority) : priority;
    switch (p) {
        case 1: return "low";
        case 2: return "medium";
        case 3: return "high";
        case 4: return "high"; // Assuming 4 (Urgent) maps to high for now
        default: return "medium";
    }
}

/**
 * Maps frontend status back to backend format.
 */
export function mapFrontendStatusToBackend(status: string): string {
    if (status === "in-progress") return "in_progress";
    return status;
}

/**
 * Maps frontend priority back to backend integer.
 */
export function mapFrontendPriorityToBackend(priority: string | number): number {
    if (typeof priority === 'number') return priority;
    switch (priority.toLowerCase()) {
        case "low": return 1;
        case "medium": return 2;
        case "high": return 3;
        case "urgent": return 4;
        default: return 2;
    }
}
