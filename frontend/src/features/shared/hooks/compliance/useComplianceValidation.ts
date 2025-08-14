import { useMutation } from '@tanstack/react-query';
import { Compliance } from '@/api/generated/Compliance';
import { 
  RoomEquipmentValidationRequestDtoContract,
  RoomEquipmentValidationResponseDtoContract 
} from '@/api/generated/data-contracts';

const complianceApi = new Compliance();

export interface ComplianceValidationParams {
  installation_id: string;
  postal_code?: string;
  '@context': object;
  rooms: Array<{
    room_id: string;
    room_type: string;
    room_area: number;
    equipment: Array<{
      equipment_type: string;
      quantity: number;
      specifications: object;
    }>;
  }>;
}

export const useComplianceValidation = () => {
  return useMutation<RoomEquipmentValidationResponseDtoContract, Error, ComplianceValidationParams>({
    mutationFn: async (data: ComplianceValidationParams) => {
      return complianceApi.complianceControllerValidateRoomEquipment(data);
    },
  });
}; 