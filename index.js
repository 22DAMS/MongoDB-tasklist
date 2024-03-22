const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT;
const userDb = process.env.userDb;
const passwordDb = process.env.passwordDb;
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongodb");

const uri = `mongodb+srv://${userDb}:${passwordDb}@cluster0.iewxzdn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true });

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Inicio, bienvenido");
});

app.post("/task", async (req, res) => {
  const defaultTask = {
    title: "",
    description: "",
    priority: "",
    completed: false,
  };

  const newUser = { ...defaultTask, ...req.body };

  try {
    await client.connect();

    const db = client.db("Task_List");
    const collection = db.collection("Tasks");
    const taskCreated = await collection.insertOne(newUser);

    await client.close();

    res.status(201).send(taskCreated);
  } catch (e) {
    console.error("Task not created: ", e);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/tasks", async (req, res) => {
  try {
    await client.connect();

    const db = client.db("Task_List");
    const collection = db.collection("Tasks");
    const tasks = await collection.find().toArray();

    await client.close();

    res.status(201).send(tasks);
  } catch (e) {
    console.error("Error en listado de tareas: ", e);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/task/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    await client.connect();

    const db = client.db("Task_List");
    const collection = db.collection("Tasks");
    const task = await collection.findOne({ _id: new ObjectId(taskId) });

    await client.close();

    if (task) {
      res.status(200).send(task);
    } else {
      res.status(404).send("Task not found");
    }
  } catch (e) {
    console.error("Error en la conexión: ", e);
    res.status(500).send("Error en el servidor");
  }
});

app.put("/task/:id", async (req, res) => {
  const taskId = req.params.id;
  const updateTaskData = req.body;

  try {
    await client.connect();

    const db = client.db("Task_List");
    const collection = db.collection("Tasks");
    const result = await collection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updateTaskData }
    );

    await client.close();

    if (result.modifiedCount > 0) {
      res.status(302).send("Task data updated successfully.");
    } else {
      res.status(404).send("User not found.");
    }
  } catch (e) {
    console.error("Error en la conexión:", e);
    res.status(500).send("Error en el servidor");
  }
});

app.delete("/task/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    await client.connect();

    const db = client.db("Task_List");
    const collection = db.collection("Tasks");
    const result = await collection.deleteOne({ _id: new ObjectId(taskId) });

    await client.close();

    if (result.deletedCount > 0) {
      res.status(302).send("Task deleted successfully.");
    } else {
      res.status(404).send("Task not found");
    }
  } catch (e) {
    console.error("Error en la conexión: ", e);
    res.status(500).send("Error en el servidor.");
  }
});

app.listen(PORT, () => {
  console.log(`servidor corriendo en el puerto: ${PORT}`);
});
