import * as db from "./server/db";

async function main() {
  try {
    // Usando a função que você descobriu nas exportações
    const novoAdmin = await db.createAdmin({
      username: "admin",
      passwordHash: "admin123", // A própria função deve cuidar do hash, ou o nome do campo é apenas esse
    });
    
    console.log("Admin criado com sucesso!", novoAdmin);
  } catch (error) {
    console.error("Erro ao criar admin:", error);
  } finally {
    process.exit(0);
  }
}

main();