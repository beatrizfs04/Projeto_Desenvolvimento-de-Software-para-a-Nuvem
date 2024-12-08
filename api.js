const express = require('express');
const app = express();
var api = express.Router();
const books = require('./books');

api.get('/showBooks/', async(req, res) => {
    const bookList = await books.mostrarLivros();
    return res.status(200).json(bookList);
});

api.get('/showBook/', async(req, res) => {
    const id = (req.query && req.query.id ? req.query.id : null);
    if (!id || id === null) { return res.status(400).json({message: "No ID Defined." })}
    const bookInfo = await books.showBookByID(id);
    return res.status(200).json(JSON.parse(JSON.stringify(bookInfo)));
});

api.post('/updateBook/', async(req, res) => {
    const id = (req.query && req.query.id ? req.query.id : null);
    const date = (req.query && req.query.date ? req.query.date : null);
    const title = (req.query && req.query.title ? req.query.title : null);
    const language = (req.query && req.query.language ? req.query.language : null);
    const authors = (req.query && req.query.authors ? req.query.authors : null);
    if (!id || id === null) { return res.status(400).json({message: "No ID Defined." })}
    const data = {date: date, title: title, language: language, authors: authors}
    const bookInfo = await books.updateBookByID(id, data);
    return res.status(200).json(JSON.parse(JSON.stringify(bookInfo)));
});

/* api.post('/adicionarLivro', catalogoController.adicionarLivro);
api.put('/atualizarLivro', catalogoController.atualizarLivro);
api.delete('/apagarLivro', catalogoController.apagarLivro); */

module.exports = api;