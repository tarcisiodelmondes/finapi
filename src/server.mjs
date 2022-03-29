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

function getBalance(statement) {
  return statement.reduce((acc, current) => {
    if (current.type === "credit") {
      return acc + current.amount;
    }

    return acc - current.amount;
  }, 0);
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
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const accountBalance = getBalance(customer.statement);

  if (accountBalance < amount) {
    return res.status(400).json({ error: "Insufficient funds!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.get("/statement/date", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter((statement) => {
    const statementDateString = statement.created_at.toDateString();
    const dateFormatString = new Date(dateFormat).toDateString();

    return statementDateString === dateFormatString;
  });

  res.json(statement);
});

app.listen(3333, () => {
  console.log("http://localhost:3333");
});
