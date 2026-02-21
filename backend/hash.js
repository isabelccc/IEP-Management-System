import bcrypt from "bcrypt";

const password = "cxl458881";

bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});