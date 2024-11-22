import { error } from "console";
import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import { parse } from "path";





const app = express();
app.use(bodyParser.json());

// Leer los datos del archivo JSON
const readData = () => {
    try {
        const data = fs.readFileSync("./db.json", "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error al leer el archivo:", err);
        return { books: [] }; // Retorna un estado inicial vacío si falla
    }
};


// Escribir los datos actualizados en el archivo
// Escribir los datos actualizados en el archivo
const writeData = (data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile("./db.json", JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.log("Error al escribir el archivo:", err);
                reject(err);
            } else {
                console.log("Datos escritos exitosamente en db.json");
                resolve();
            }
        });
    });
};


// Endpoint para obtener todos los libros
app.get("/books", (req, res) => {
    const data = readData();
    res.json(data.books);
});

// Buscar un libro por ID
app.get("/books/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const book = data.books.find((book) => book.id === id);
    res.json(book);
});

// Endpoint para agregar un libro
app.post("/books", (req, res) => {
    const data = readData();
    const body = req.body;

    if (!body.name || !body.author || !body.year) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const newBook = {
        id: data.books.length + 1,
        ...body,
    };
    data.books.push(newBook);
    writeData(data);
    res.status(201).json(newBook);
});

// Endpoint para actualizar un libro por ID
app.put("/books/:id", async (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const body = req.body;

    // Verifica si el libro existe
    const bookIndex = data.books.findIndex((book) => book.id === id);
    if (bookIndex === -1) {
        return res.status(404).json({ error: "Book not found" });
    }

    // Validar que 'year' sea un número positivo
    if (!body.year || typeof body.year !== "number" || body.year <= 0) {
        return res.status(400).json({ error: "Invalid year" });
    }

    // Actualizar el libro
    data.books[bookIndex] = {
        ...data.books[bookIndex],
        ...body,
    };

    try {
        await writeData(data);
        res.json({ message: "Book updated successfully", book: data.books[bookIndex] });
    } catch (error) {
        res.status(500).json({ error: "Error updating book" });
    }
});

app.delete("/books/:id",(req,res)=>{
    const data=readData();
    const id= parseInt(req.params.id);
    const bookIndex=data.books.findIndex((book)=> book.id ===id);
    data.books.splice(bookIndex,1);
    writeData(data);
    res.json({messag:"book deleted successfuly"})
})


app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
