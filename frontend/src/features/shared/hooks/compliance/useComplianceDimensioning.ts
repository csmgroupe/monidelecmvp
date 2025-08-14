import { useMutation } from '@tanstack/react-query';
import { Compliance } from '@/api/generated/Compliance';
import {
  RoomEquipmentValidationRequestDtoContract,
  GlobalValidationWithDimensioningResponseDtoContract,
} from '@/api/generated/data-contracts';

const complianceApi = new Compliance();

export interface ComplianceDimensioningParams
  extends Omit<RoomEquipmentValidationRequestDtoContract, 'rooms'> {
  rooms: RoomEquipmentValidationRequestDtoContract['rooms'];
  number_of_people?: number;
}

/**
 * React-Query mutation that triggers the global validation with electrical dimensioning
 * calculations and returns the complete response from the compliance service.
 */
export const useComplianceDimensioning = () => {
  return useMutation<
    GlobalValidationWithDimensioningResponseDtoContract,
    Error,
    ComplianceDimensioningParams
  >({
    mutationFn: async (data: ComplianceDimensioningParams) => {
      return complianceApi.complianceControllerValidateGlobalWithDimensioning(
        data,
      );
    },
  });
}; 