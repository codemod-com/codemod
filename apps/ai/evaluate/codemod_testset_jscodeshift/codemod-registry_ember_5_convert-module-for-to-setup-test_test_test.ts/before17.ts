import { start } from 'ember-cli-qunit';
import {
    setResolver
} from 'ember-qunit';
import resolver from './helpers/resolver';

setResolver(resolver);
start();