const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function setAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Conectado ao MongoDB");

    const email = "amorimm.dev@gmail.com";

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`✗ Usuário com email ${email} não encontrado`);
      process.exit(1);
    }

    console.log(`Encontrado usuário: ${user.nome} (${user.email})`);
    console.log(`Role atual: ${user.role}`);

    user.role = "admin";
    await user.save();

    console.log(`✓ Usuário ${user.nome} agora é admin!`);

    process.exit(0);
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  }
}

setAdmin();
