const express = require('express');
const app = express();
var api = express.Router();
const books = require('./books');

api.get('/showBooks/', async(req, res) => {
    // Executar a informação de obter todos os livros e aguardar a informação
    const bookList = await books.mostrarLivros();
    return res.status(200).json(bookList);
});

api.get('/showBook/', async(req, res) => {
    // Verificar o campo do ID enviado pela query
    const id = (req.query && req.query.id ? req.query.id : null);
    // Verificar se existe algum ID de livro enviado, senão, retroceder
    if (!id || id === null) { return res.status(400).json({message: "No ID Defined." })}
    // Executar a função de obter o livro pelo seu id e aguardar a informação
    const bookInfo = await books.showBookByID(id);
    return res.status(200).json(JSON.parse(JSON.stringify(bookInfo)));
});

api.post('/updateBook/', async(req, res) => {
    // Verificar se todos os campos são enviados pela query
    const id = (req.query && req.query.id ? req.query.id : null);
    const date = (req.query && req.query.date ? req.query.date : null);
    const title = (req.query && req.query.title ? req.query.title : null);
    const language = (req.query && req.query.language ? req.query.language : null);
    const authors = (req.query && req.query.authors ? req.query.authors : null);
    // Verificar se existe algum ID de livro enviado, senão, retroceder
    if (!id || id === null) { return res.status(400).json({message: "No ID Defined." })}
    // Definir a variável data com toda a informação definida anteriormente
    const data = {date: date, title: title, language: language, authors: authors}
    // Executar a função de atualizar o livro e aguardar a devolução da informação
    const bookInfo = await books.updateBookByID(id, data);
    return res.status(200).json(JSON.parse(JSON.stringify(bookInfo)));
});

api.post('/insertBook/', async(req, res) => {
    // Verificar se todos os campos são enviados pela query
    const date = (req.query && req.query.date ? req.query.date : null);
    const title = (req.query && req.query.title ? req.query.title : null);
    const language = (req.query && req.query.language ? req.query.language : null);
    const authors = (req.query && req.query.authors ? req.query.authors : null);
    // Definir a variável data com toda a informação definida anteriormente
    const data = {date: date, title: title, language: language, authors: authors}
    // Executar a função de atualizar o livro e aguardar a devolução da informação
    const bookInfo = await books.insertBook(data);
    return res.status(200).json(JSON.parse(JSON.stringify(bookInfo)));
});

api.delete('/deleteBook/', async(req,res) => {
    // Verificar o campo do ID enviado pela query
    const id = (req.query && req.query.id ? req.query.id : null);
    // Verificar se existe algum ID de livro enviado, senão, retroceder
    if (!id || id === null) { return res.status(400).json({message: "No ID Defined." })}
    // Executar a função de atualizar o livro e aguardar a devolução da informação
    const bookInfo = await books.deleteBookByID(id);
    return res.status(200).json(JSON.parse(JSON.stringify(bookInfo)));
});

module.exports = api;