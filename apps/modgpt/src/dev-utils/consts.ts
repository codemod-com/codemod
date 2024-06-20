import { llmEngines } from '../../../shared';

export let port = process?.env?.PORT || '9999';
export let engines = llmEngines;
export let roles = ['system', 'user', 'assistant', 'function'];
