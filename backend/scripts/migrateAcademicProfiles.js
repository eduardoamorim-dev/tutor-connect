/**
 * Migration Script: Academic Profiles
 *
 * This script adds the new academic profile fields to existing users:
 * - nivel_academico (default: "graduacao")
 * - role (default: "student", or "tutor" if isTutor=true)
 *
 * Run this script once after deploying the new code:
 * node backend/scripts/migrateAcademicProfiles.js
 */

const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function migrateAcademicProfiles() {
  try {
    console.log("Conectando ao MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado\n");

    // Get total users
    const totalUsers = await User.countDocuments();
    console.log(`Total de usuários: ${totalUsers}\n`);

    // Step 1: Add default nivel_academico for users without it
    console.log("Passo 1: Adicionando nivel_academico padrão...");
    const resultNivel = await User.updateMany(
      { nivel_academico: { $exists: false } },
      { $set: { nivel_academico: "graduacao" } },
    );
    console.log(`Nivel acadêmico adicionado a ${resultNivel.modifiedCount} usuários`);

    // Step 2: Add default role for users without it
    console.log("\nPasso 2: Adicionando role padrão...");
    const resultRole = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: "student" } },
    );
    console.log(`Role padrão adicionado a ${resultRole.modifiedCount} usuários`);

    // Step 3: Update users with isTutor=true to have role="tutor"
    console.log("\nPasso 3: Atualizando role para tutores...");
    const resultTutors = await User.updateMany(
      { isTutor: true, role: "student" },
      { $set: { role: "tutor" } },
    );
    console.log(`Role atualizado para "tutor" em ${resultTutors.modifiedCount} usuários`);

    // Step 4: Add empty programas_coordenados array for coordinators
    console.log("\nPasso 4: Inicializando programas_coordenados...");
    const resultCoord = await User.updateMany(
      { programas_coordenados: { $exists: false } },
      { $set: { programas_coordenados: [] } },
    );
    console.log(
      `Campo programas_coordenados inicializado em ${resultCoord.modifiedCount} usuários`,
    );

    // Show summary
    console.log("\n========== RESUMO DA MIGRAÇÃO ==========");
    const counts = await User.aggregate([
      {
        $group: {
          _id: { role: "$role", nivel_academico: "$nivel_academico" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.role": 1, "_id.nivel_academico": 1 },
      },
    ]);

    console.log("\nDistribuição de usuários:");
    counts.forEach((item) => {
      console.log(
        `Role: ${item._id.role}, Nível: ${item._id.nivel_academico} - ${item.count} usuários`,
      );
    });

    console.log("\n✅ Migração concluída com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro durante a migração:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDesconectado do MongoDB");
  }
}

// Run migration
migrateAcademicProfiles();
