import { roomService, tenantService } from '@/services';
import { CreateContractForm } from '@/components/create-contract-form';

export default async function NewContractPage() {
  const [vacantRooms, tenants] = await Promise.all([
    roomService.findVacant(),
    tenantService.findAll(),
  ]);

  return (
    <div className="max-w-lg mx-auto py-2">
      <CreateContractForm vacantRooms={vacantRooms} tenants={tenants} />
    </div>
  );
}
