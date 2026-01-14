import { createAdmin } from "./server/db";
import bcrypt from "bcryptjs";

async function main() {
    try {
        const hash = await bcrypt.hash("admin123", 10);
        // Usamos a função do seu código para garantir a conexão
        await createAdmin({
            username: "admin_novo",
            passwordHash: hash
        });
        console.log("Admin 'admin_novo' criado! Tente logar com senha: admin123");
    } catch (e) {
        console.error("Erro:", e);
    } finally {
        process.exit(0);
    }
}

main();