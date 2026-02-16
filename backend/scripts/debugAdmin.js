const mongoose = require("mongoose");
const User = require("../models/User");
const Programa = require("../models/Programa");
const Instituicao = require("../models/Instituicao");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("=== Verificando Admin ===\n");
    const admin = await User.findOne({ email: "amorimm.dev@gmail.com" }).populate(
      "programas_coordenados",
    );

    console.log(`Nome: ${admin.nome}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`ID: ${admin._id}`);
    console.log(`\nProgramas coordenados no array (${admin.programas_coordenados?.length || 0}):`);
    if (admin.programas_coordenados && admin.programas_coordenados.length > 0) {
      admin.programas_coordenados.forEach((p) => {
        console.log(`  - ${p.nome || p} (ID: ${p._id || p})`);
      });
    } else {
      console.log("  (vazio)");
    }

    console.log("\n=== Programas que têm este admin como coordenador ===\n");
    const programasComoCoord = await Programa.find({
      coordenador: admin._id,
    });

    if (programasComoCoord.length > 0) {
      programasComoCoord.forEach((p) => {
        console.log(`  - ${p.nome} (ID: ${p._id})`);
        console.log(`    Coordenador ID: ${p.coordenador}`);
        console.log(`    Match com admin: ${p.coordenador.toString() === admin._id.toString()}`);
      });
    } else {
      console.log("  (nenhum)");
    }

    console.log("\n=== Testando query findByCoordinator ===\n");
    const programas = await Programa.find({
      $or: [{ coordenador: admin._id }, { vice_coordenadores: admin._id }],
      ativo: true,
    }).populate("instituicao", "nome sigla");

    console.log(`Resultado: ${programas.length} programa(s)`);
    programas.forEach((p) => {
      console.log(`  - ${p.nome} (instituicao: ${p.instituicao?.nome || "N/A"})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Erro:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
