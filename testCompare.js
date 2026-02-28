const bcrypt = require("bcryptjs");

const hash = "$2b$10$/GmXGLJelMFVifoxpVl8ne2xx8FazuAu4WNI14PoWLgLph4Mqr1q2";

(async () => {
  const result = await bcrypt.compare("123456", hash);
  console.log("bcrypt result:", result);
})();
