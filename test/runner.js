import '../polyfill';
import './test';

const req = require.context('./spec/', true, /\.js$/);
req.keys().forEach(key => req(key));
