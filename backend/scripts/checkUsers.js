const mongoose = require("mongoose");
const User = require("../models/User");
const Programa = require("../models/Programa");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("=== Usuários com roles especiais ===\n");
    const users = await User.find({ role: { $in: ["coordinator", "tutor", "admin"] } }).select(
      "nome email role programas_coordenados programa",
    );

    for (const u of users) {
      console.log(`• ${u.nome} (${u.email})`);
      console.log(`  Role: ${u.role}`);
      console.log(`  Programa: ${u.programa || "Nenhum"}`);
      console.log(`  Programas coordenados: ${u.programas_coordenados?.length || 0}`);
      console.log("");
    }

    console.log("\n=== Programas existentes ===\n");
    const programas = await Programa.find().select("nome nivel coordenador ativo");

    if (programas.length === 0) {
      console.log("Nenhum programa cadastrado no sistema");
    } else {
      for (const p of programas) {
        console.log(`• ${p.nome} (${p.nivel})`);
        console.log(`  Coordenador: ${p.coordenador || "Nenhum"}`);
        console.log(`  Ativo: ${p.ativo}`);
        console.log("");
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
})();
