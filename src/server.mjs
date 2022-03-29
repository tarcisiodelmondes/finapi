import express from "express";
import crypto from "crypto";

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => {
    return customer.cpf === cpf;
  });

  if (!customer) {
    return res.status(400).json({ error: "Customer not found!" });
  }

  req.customer = customer;

  return next();
}

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some((customer) => {
    return customer.cpf === cpf;
  });

  if (customerAlreadyExists) {
    res.status(400).json({ error: "Customer already Exists!" });
    return;
  }

  customers.push({
    id: crypto.randomUUID(),
    cpf: cpf,
    name,
    statement: [],
  });

  console.log(customers);

  return res.status(201).send();
});

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => {
  const { statement } = req.customer;

  res.json(statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    create_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.listen(3333, () => {
  console.log("http://localhost:3333");
});
