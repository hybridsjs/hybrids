import 'core-js/shim';
import '../packages/shim';
import './rafIt';

const req = require.context('../packages', true, /^\.\/[a-z]+\/test\/(.*\.(js$))$/igm);
req.keys().forEach(key => req(key));
