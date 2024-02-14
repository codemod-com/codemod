import { loader } from '@monaco-editor/react';
import { monaco } from '~/customMonaco';
import Snippet from './Monaco';

loader.config({ monaco });

export default Snippet;
