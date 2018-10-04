import '../shim';

// Set dynamic env variable
window.env = 'development';

const req = require.context('./spec/', true, /\.js$/);
req.keys().forEach(key => req(key));
