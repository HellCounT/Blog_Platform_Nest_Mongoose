import { DevicesRepository } from './devices.repository';

export class DevicesService {
  constructor(protected devicesRepo: DevicesRepository) {}
}
