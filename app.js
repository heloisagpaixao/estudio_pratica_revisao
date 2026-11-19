require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cookieparser = require("cookie-parser");
const Mustache = require("mustache");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());

app.use((req, res, next) => {
  const metodo = String(req.body?._method || "").toUpperCase();
  if (req.method === "POST" && ["PUT", "DELETE"].includes(metodo)) {
    req.method = metodo;
  }
  next();
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

// =================================== FUNÇÕES INICIAIS =================================== //

function mostrar(nome, dados = {}) {
  const arquivo = path.join(__dirname, "paginas", `${nome}.html`);
  return Mustache.render(fs.readFileSync(arquivo, "utf-8"), dados);
}

function criptografar(texto) {
  const cifra = crypto.createCipheriv(
    "aes-256-cbc",
    process.env.CRIPTO_CHAVE,
    process.env.CRIPTO_IV,
  );
  return cifra.update(texto, "utf-8", "hex") + cifra.final("hex");
}

function descriptografar(texto) {
  const decifra = crypto.createDecipheriv(
    "aes-256-cbc",
    process.env.CRIPTO_CHAVE,
    process.env.CRIPTO_IV,
  );
  return decifra.update(texto, "hex", "utf-8") + decifra.final("utf-8");
}

async function excluir(res, tabela, id, volta, motivo) {
  try {
    await db.query(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
    res.redirect(volta);
  } catch (erro) {
    if (erro.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(409)
        .send(
          `<p> Não foi possível excluir: ${motivo} </p> <p><a href="${volta}"> Voltar </a> </p>`,
        );
    }
    console.error(erro);
    res
      .status(500)
      .send(
        `<p> Erro ao excluir. </p> <p><a href="${volta}"> Voltar </a> </p>`,
      );
  }
}

async function mostrarProjetos(req, res, erro = "") {
  const [projetos] = await db.query("SELECT * FROM projetos_de_tatuagem");
  const [listaClientes] = await db.query("SELECT id, nome FROM clientes");
  const editar = projetos.find((p) => String(p.id) === req.query.editar);

  const clientes = listaClientes.map((cliente) => ({
    ...cliente,
    selecionado: editar && cliente.id === editar.cliente_id ? "selected" : "",
  }));

  res.send(
    mostrar("projetos", {
      projetos,
      clientes,
      erro,
      editando: Boolean(editar),
      acao: editar ? `/projetos/${editar.id}` : "/projetos",
      form: editar || {},
    }),
  );
}

// =================================== LOGIN =================================== //
app.get("/", (req, res) => res.send(mostrar("login")));
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const [usuarios] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
    email,
  ]);
  const usuario = usuarios[0];

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.send(mostrar("login", { erro: "E-mail ou senha inválidos." }));
  }
  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.cookie("token", token, { httpOnly: true });
  res.redirect("/principal");
});

app.post("/sair", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.use((req, res, next) => {
  try {
    req.usuario = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    next();
  } catch (erro) {
    res.redirect("/");
  }
});

app.get("/principal", (req, res) =>
  res.send(mostrar("principal", { nome: req.usuario.nome })),
);

// =================================== BANCO DE DADOS =================================== //
const porta = process.env.PORT || 3000;
app.listen(porta, () =>
  console.log(`Estúdio rodando em http://localhost:${porta}`),
);
