import '../shim';
import './test';

const req = require.context('./spec', true, /\.js$/igm);
req.keys().forEach(key => req(key));
