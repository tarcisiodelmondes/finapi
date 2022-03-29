import express from "express";
import crypto from "crypto";

const app = express();

app.use(express.json());

const customers = [];

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

app.get("/statement/:cpf", (req, res) => {
  const { cpf } = req.params;

  const customer = customers.find((customer) => {
    return customer.cpf === cpf;
  });

  if (!customer) {
    res.status(400).json({ error: "Customer not found!" });
  }

  res.json(customer.statement);
});

app.listen(3333, () => {
  console.log("http://localhost:3333");
});
