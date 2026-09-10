import { ConflictException, NotFoundException } from '@nestjs/common';
import { ControlStatus } from './control.enums';
import { ControlsService } from './controls.service';

describe('ControlsService', () => {
  const control = {
    id: 'control-1',
    controlCode: 'AC-01',
    title: 'Multi-Factor Authentication',
    category: 'Access Control',
    effectiveness: 50,
    status: ControlStatus.PARTIAL,
    owner: 'Security'
  };

  function service(overrides: {
    controlsRepository?: Record<string, jest.Mock>;
    riskControlsRepository?: Record<string, jest.Mock>;
    risksService?: Record<string, jest.Mock>;
  } = {}) {
    const controlsRepository = {
      create: jest.fn((input) => input),
      save: jest.fn((input) => Promise.resolve(input)),
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(control),
      remove: jest.fn(),
      ...overrides.controlsRepository
    };
    const riskControlsRepository = {
      count: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockResolvedValue([]),
      ...overrides.riskControlsRepository
    };
    const risksService = {
      recalculateRisk: jest.fn(),
      ...overrides.risksService
    };

    return {
      instance: new ControlsService(controlsRepository as any, riskControlsRepository as any, risksService as any),
      controlsRepository,
      riskControlsRepository,
      risksService
    };
  }

  it('throws when a control is not found', async () => {
    const { instance } = service({ controlsRepository: { findOne: jest.fn().mockResolvedValue(null) } });

    await expect(instance.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('recalculates linked risks when effectiveness changes', async () => {
    const { instance, risksService } = service({
      riskControlsRepository: { find: jest.fn().mockResolvedValue([{ risk: { id: 'risk-1' } }, { risk: { id: 'risk-2' } }]) }
    });

    await instance.update('control-1', { effectiveness: 75 });

    expect(risksService.recalculateRisk).toHaveBeenCalledWith('risk-1');
    expect(risksService.recalculateRisk).toHaveBeenCalledWith('risk-2');
  });

  it('blocks deletion when the control is linked to risks', async () => {
    const { instance } = service({ riskControlsRepository: { count: jest.fn().mockResolvedValue(1) } });

    await expect(instance.remove('control-1')).rejects.toBeInstanceOf(ConflictException);
  });
});
