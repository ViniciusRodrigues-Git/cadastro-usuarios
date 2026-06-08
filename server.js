const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

let db;

(async () => {
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `);
    console.log("Banco de dados pronto para uso.");
})();

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        await db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        if (error.message.includes("UNIQUE")) {
            return res.status(400).json({ error: "Este email já está cadastrado." });
        }
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});