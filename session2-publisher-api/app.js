require('dotenv').config();

const express = require('express');
const sql = require('mssql');
const app = express();
app.use(express.json());

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { trustServerCertificate: true }
};

app.get('/', (req, res) => {
  res.send('Welcome to the Book Category API');
});

app.get('/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Biography' }
  ]);
});

app.get('/about', (req, res) => {
  res.send('Hi, I am Javier from IT03. I am learning backend development. This is my first API!');
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});

// GET all publishers
app.get('/publishers', async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    const result = await request.query('SELECT PublisherID, Name FROM Publisher');
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  } finally {
    if (connection) await connection.close();
  }
});

// GET one publisher
app.get('/publishers/:id', async (req, res) => {
  const publisherId = parseInt(req.params.id);
  if (isNaN(publisherId)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', publisherId);
    const result = await request.query('SELECT PublisherID, Name FROM Publisher WHERE PublisherID = @id');
    if (!result.recordset[0]) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// POST - add a new publisher
app.post('/publishers', async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', req.body.id);
    request.input('name', req.body.name);
    const result = await request.query(
      `INSERT INTO Publisher (PublisherID, Name)
       OUTPUT INSERTED.*
       VALUES (@id, @name)`
    );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT - change a publisher's name
app.put('/publishers/:id', async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', parseInt(req.params.id));
    request.input('name', req.body.name);
    const result = await request.query('UPDATE Publisher SET Name = @name WHERE PublisherID = @id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE - remove a publisher
app.delete('/publishers/:id', async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', parseInt(req.params.id));
    const result = await request.query('DELETE FROM Publisher WHERE PublisherID = @id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.close();
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});