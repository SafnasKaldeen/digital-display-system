const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "Safnas2000@";
  const hash = await bcrypt.hash(password, 10);
  console.log("Password:", password);
  console.log("Hash:", hash);
  console.log("\nRun this SQL in Supabase:");
  console.log(
    `UPDATE clients SET password_hash = '${hash}' WHERE email = 'safnas.20@cse.mrt.ac.lk';`
  );
}

generateHash();
