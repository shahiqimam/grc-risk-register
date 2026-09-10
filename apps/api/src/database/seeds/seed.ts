import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { Asset } from '../../modules/assets/asset.entity';
import { AssetCriticality, AssetStatus, AssetType } from '../../modules/assets/asset.enums';
import { Control } from '../../modules/controls/control.entity';
import { ControlStatus } from '../../modules/controls/control.enums';
import { RiskAsset } from '../../modules/risks/risk-asset.entity';
import { RiskControl } from '../../modules/risks/risk-control.entity';
import { RiskHistory } from '../../modules/risks/risk-history.entity';
import { Risk } from '../../modules/risks/risk.entity';
import { RiskCategory, RiskHistoryEventType, RiskRating, RiskStatus } from '../../modules/risks/risk.enums';
import { Treatment } from '../../modules/treatments/treatment.entity';
import { TreatmentStatus, TreatmentStrategy } from '../../modules/treatments/treatment.enums';
import { UserRole } from '../../modules/users/user-role.enum';
import { User } from '../../modules/users/user.entity';

function ratingFor(score: number): RiskRating {
  if (score <= 4) return RiskRating.LOW;
  if (score <= 9) return RiskRating.MEDIUM;
  if (score <= 14) return RiskRating.HIGH;
  if (score <= 19) return RiskRating.VERY_HIGH;
  return RiskRating.CRITICAL;
}

function scores(likelihood: number, impact: number, effectiveness: number[]) {
  const inherentRiskScore = likelihood * impact;
  const average = effectiveness.length ? effectiveness.reduce((sum, value) => sum + value, 0) / effectiveness.length : 0;
  const residualRiskScore = effectiveness.length ? Math.max(1, Math.round(inherentRiskScore * (1 - average / 100))) : inherentRiskScore;
  return {
    inherentRiskScore,
    inherentRiskRating: ratingFor(inherentRiskScore),
    residualRiskScore,
    residualRiskRating: ratingFor(residualRiskScore)
  };
}

async function main() {
  await dataSource.initialize();

  const usersRepository = dataSource.getRepository(User);
  if ((await usersRepository.count()) > 0) {
    console.log('Seed skipped because users already exist.');
    await dataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  const users = await usersRepository.save([
    usersRepository.create({ name: 'Demo Admin', email: 'admin@example.test', passwordHash, role: UserRole.ADMIN }),
    usersRepository.create({ name: 'Risk Manager One', email: 'risk.manager1@example.test', passwordHash, role: UserRole.RISK_MANAGER }),
    usersRepository.create({ name: 'Risk Manager Two', email: 'risk.manager2@example.test', passwordHash, role: UserRole.RISK_MANAGER }),
    usersRepository.create({ name: 'Viewer One', email: 'viewer1@example.test', passwordHash, role: UserRole.VIEWER }),
    usersRepository.create({ name: 'Viewer Two', email: 'viewer2@example.test', passwordHash, role: UserRole.VIEWER })
  ]);

  const assetRepo = dataSource.getRepository(Asset);
  const assets = await assetRepo.save([
    assetRepo.create({ name: 'Finance Application', description: 'Demo payment and invoicing system.', assetType: AssetType.APPLICATION, criticality: AssetCriticality.CRITICAL, owner: 'Finance Operations', status: AssetStatus.ACTIVE }),
    assetRepo.create({ name: 'Customer Records Database', description: 'Demo customer records datastore.', assetType: AssetType.DATABASE, criticality: AssetCriticality.CRITICAL, owner: 'Data Services', status: AssetStatus.ACTIVE }),
    assetRepo.create({ name: 'Customer Portal', description: 'Demo customer-facing web portal.', assetType: AssetType.APPLICATION, criticality: AssetCriticality.HIGH, owner: 'Digital Channels', status: AssetStatus.ACTIVE }),
    assetRepo.create({ name: 'Identity Platform', description: 'Demo identity and access platform.', assetType: AssetType.APPLICATION, criticality: AssetCriticality.CRITICAL, owner: 'Security Operations', status: AssetStatus.ACTIVE }),
    assetRepo.create({ name: 'File Share', description: 'Demo internal collaboration storage.', assetType: AssetType.DATA, criticality: AssetCriticality.MEDIUM, owner: 'Corporate IT', status: AssetStatus.ACTIVE }),
    assetRepo.create({ name: 'Backup Repository', description: 'Demo backup storage environment.', assetType: AssetType.SERVER, criticality: AssetCriticality.HIGH, owner: 'Infrastructure', status: AssetStatus.ACTIVE }),
    assetRepo.create({ name: 'Network Edge', description: 'Demo internet-facing network boundary.', assetType: AssetType.NETWORK, criticality: AssetCriticality.HIGH, owner: 'Network Team', status: AssetStatus.ACTIVE }),
    assetRepo.create({ name: 'Procurement Process', description: 'Demo third-party onboarding workflow.', assetType: AssetType.BUSINESS_PROCESS, criticality: AssetCriticality.MEDIUM, owner: 'Procurement', status: AssetStatus.ACTIVE })
  ]);

  const controlRepo = dataSource.getRepository(Control);
  const controls = await controlRepo.save([
    controlRepo.create({ controlCode: 'AC-01', title: 'Multi-Factor Authentication', description: 'Require a second factor for sensitive application access.', category: 'Access Control', effectiveness: 70, status: ControlStatus.IMPLEMENTED, owner: 'Security Operations' }),
    controlRepo.create({ controlCode: 'AC-02', title: 'Privileged Access Review', description: 'Review privileged access on a regular schedule.', category: 'Access Control', effectiveness: 55, status: ControlStatus.PARTIAL, owner: 'Identity Team' }),
    controlRepo.create({ controlCode: 'BK-01', title: 'Daily Backup', description: 'Run daily backups for critical data stores.', category: 'Resilience', effectiveness: 65, status: ControlStatus.IMPLEMENTED, owner: 'Infrastructure' }),
    controlRepo.create({ controlCode: 'BK-02', title: 'Recovery Test', description: 'Test restoration procedures for key systems.', category: 'Resilience', effectiveness: 45, status: ControlStatus.PARTIAL, owner: 'Infrastructure' }),
    controlRepo.create({ controlCode: 'LG-01', title: 'Centralized Logging', description: 'Collect key system and security logs centrally.', category: 'Monitoring', effectiveness: 60, status: ControlStatus.IMPLEMENTED, owner: 'Security Operations' }),
    controlRepo.create({ controlCode: 'IR-01', title: 'Incident Response Procedure', description: 'Maintain an actionable response procedure for security events.', category: 'Response', effectiveness: 50, status: ControlStatus.IMPLEMENTED, owner: 'Security Operations' }),
    controlRepo.create({ controlCode: 'VM-01', title: 'Patch Review', description: 'Review missing patches and assign remediation owners.', category: 'Vulnerability Management', effectiveness: 52, status: ControlStatus.PARTIAL, owner: 'Corporate IT' }),
    controlRepo.create({ controlCode: 'TR-01', title: 'Security Awareness Training', description: 'Provide recurring security awareness training.', category: 'People', effectiveness: 40, status: ControlStatus.IMPLEMENTED, owner: 'People Operations' }),
    controlRepo.create({ controlCode: 'TP-01', title: 'Supplier Security Questionnaire', description: 'Assess suppliers before onboarding.', category: 'Third Party', effectiveness: 48, status: ControlStatus.PARTIAL, owner: 'Procurement' }),
    controlRepo.create({ controlCode: 'CH-01', title: 'Change Approval', description: 'Review changes before production deployment.', category: 'Change Management', effectiveness: 58, status: ControlStatus.IMPLEMENTED, owner: 'Platform Team' })
  ]);

  const riskRepo = dataSource.getRepository(Risk);
  const riskInputs = [
    ['Unauthorized access to finance application', RiskCategory.CYBERSECURITY, 4, 5, RiskStatus.OPEN, ['Finance Application', 'Identity Platform'], ['AC-01', 'AC-02']],
    ['Loss of customer data due to backup failure', RiskCategory.BUSINESS_CONTINUITY, 3, 5, RiskStatus.UNDER_TREATMENT, ['Customer Records Database', 'Backup Repository'], ['BK-01', 'BK-02']],
    ['Extended outage of customer portal', RiskCategory.OPERATIONAL, 4, 4, RiskStatus.OPEN, ['Customer Portal'], ['CH-01', 'BK-02']],
    ['Third-party service compromise', RiskCategory.THIRD_PARTY, 3, 4, RiskStatus.UNDER_TREATMENT, ['Procurement Process'], ['TP-01']],
    ['Delayed security patching', RiskCategory.CYBERSECURITY, 4, 3, RiskStatus.OPEN, ['Network Edge'], ['VM-01']],
    ['Excessive privileged access', RiskCategory.CYBERSECURITY, 3, 5, RiskStatus.OPEN, ['Identity Platform'], ['AC-02']],
    ['Insufficient logging coverage', RiskCategory.CYBERSECURITY, 3, 4, RiskStatus.UNDER_TREATMENT, ['Customer Portal', 'Network Edge'], ['LG-01']],
    ['Phishing-related account compromise', RiskCategory.CYBERSECURITY, 4, 4, RiskStatus.OPEN, ['Identity Platform'], ['TR-01', 'AC-01']],
    ['Incomplete recovery documentation', RiskCategory.BUSINESS_CONTINUITY, 3, 3, RiskStatus.ACCEPTED, ['Backup Repository'], ['BK-02']],
    ['Manual exception tracking errors', RiskCategory.COMPLIANCE, 2, 4, RiskStatus.OPEN, ['Procurement Process'], ['CH-01']],
    ['Privacy request handling delays', RiskCategory.PRIVACY, 3, 3, RiskStatus.UNDER_TREATMENT, ['Customer Records Database'], ['CH-01']],
    ['Endpoint malware infection', RiskCategory.CYBERSECURITY, 3, 4, RiskStatus.OPEN, ['File Share'], ['LG-01', 'IR-01']],
    ['Network misconfiguration exposure', RiskCategory.OPERATIONAL, 2, 5, RiskStatus.OPEN, ['Network Edge'], ['CH-01']],
    ['Unreviewed shared folder access', RiskCategory.PRIVACY, 3, 3, RiskStatus.ACCEPTED, ['File Share'], ['AC-02']],
    ['Financial reconciliation disruption', RiskCategory.FINANCIAL, 2, 4, RiskStatus.CLOSED, ['Finance Application'], ['BK-01', 'CH-01']]
  ] as const;

  const assetByName = new Map(assets.map((asset) => [asset.name, asset]));
  const controlByCode = new Map(controls.map((control) => [control.controlCode, control]));
  const risks: Risk[] = [];

  for (const [index, input] of riskInputs.entries()) {
    const [title, category, likelihood, impact, status, assetNames, controlCodes] = input;
    const linkedControls = controlCodes.map((code) => controlByCode.get(code)!);
    const risk = await riskRepo.save(
      riskRepo.create({
        riskCode: `RISK-${String(index + 1).padStart(3, '0')}`,
        title,
        description: `${title} in the demo organization. This sample risk is generic and fictional.`,
        category,
        likelihood,
        impact,
        ownerId: users[(index % 2) + 1].id,
        status,
        reviewDate: new Date(Date.UTC(2026, 9 + (index % 4), 15)).toISOString().slice(0, 10),
        ...scores(likelihood, impact, linkedControls.map((control) => control.effectiveness))
      })
    );
    risks.push(risk);

    await dataSource.getRepository(RiskAsset).save(assetNames.map((name) => dataSource.getRepository(RiskAsset).create({ risk, asset: assetByName.get(name)! })));
    await dataSource.getRepository(RiskControl).save(linkedControls.map((control) => dataSource.getRepository(RiskControl).create({ risk, control })));
    await dataSource.getRepository(RiskHistory).save(
      dataSource.getRepository(RiskHistory).create({
        riskId: risk.id,
        changedById: users[0].id,
        eventType: RiskHistoryEventType.RISK_CREATED,
        summary: `Seeded ${risk.riskCode}`,
        beforeState: null,
        afterState: { title: risk.title, status: risk.status, residualRiskScore: risk.residualRiskScore }
      })
    );
  }

  const treatmentRepo = dataSource.getRepository(Treatment);
  await treatmentRepo.save(
    risks.slice(0, 8).map((risk, index) =>
      treatmentRepo.create({
        riskId: risk.id,
        strategy: index % 3 === 0 ? TreatmentStrategy.MITIGATE : index % 3 === 1 ? TreatmentStrategy.TRANSFER : TreatmentStrategy.ACCEPT,
        description: `Demo treatment plan for ${risk.riskCode}.`,
        owner: index % 2 === 0 ? 'Risk Manager One' : 'Risk Manager Two',
        targetDate: new Date(Date.UTC(2026, 11, 1 + index)).toISOString().slice(0, 10),
        status: index % 2 === 0 ? TreatmentStatus.IN_PROGRESS : TreatmentStatus.PLANNED,
        notes: 'Fictional seed data for portfolio demonstration.'
      })
    )
  );

  console.log('Seed completed.');
  console.log('Demo login: admin@example.test / ChangeMe123!');
  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
