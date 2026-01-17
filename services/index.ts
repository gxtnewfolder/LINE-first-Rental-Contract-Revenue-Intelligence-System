// Services layer - business logic orchestration
export { buildingService } from './building.service';
export { roomService } from './room.service';
export { tenantService } from './tenant.service';
export { contractService } from './contract.service';
export { signatureService } from './signature.service';
export { notificationService } from './notification.service';
export { analyticsService } from './analytics.service';
export { inflationService } from './inflation.service';
export { paymentService } from './payment.service';

// Re-export types
export type { CreateBuildingInput, UpdateBuildingInput } from './building.service';
export type { CreateRoomInput, UpdateRoomInput, RoomWithBuilding } from './room.service';
export type { CreateTenantInput, UpdateTenantInput, TenantWithContracts } from './tenant.service';
export type { CreateContractInput, UpdateContractInput, ContractWithRelations } from './contract.service';
export type { CreateSignatureInput } from './signature.service';
export type { CreatePaymentInput, RecordPaymentInput } from './payment.service';
