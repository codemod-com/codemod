import { randomBytes } from 'node:crypto';
import type { CaseHash } from '../cases/types';

export const buildCaseHash = (): CaseHash =>
	randomBytes(20).toString('base64url') as CaseHash;
