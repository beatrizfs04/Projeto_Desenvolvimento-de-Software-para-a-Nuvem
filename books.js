const express = require('express');
var functions = {};
const fs = require('fs');
const path = require('path');
const supabase = require('./config/supabase');
const { type } = require('os');

functions.mostrarLivros = async function() {
    try {
        const {data, error} = await supabase.from('books').select('*').order('ID', {ascending: true});
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        return {message: 'Erro ao Mostrar os Livros'};
    }
};

functions.showBookByID = async function(id) {
    try {
        const {data, error} = await supabase.from('books').select('*').eq('ID', id);
        if (data.length === 0) { return {message: 'Livro Inexistente'}; }
        return data[0];
    } catch (error) {
        console.error(error);
        return {message: 'Erro ao Mostrar os Livros'};
    }
};

functions.updateBookByID = async function(id, newdata) {
    try {
        var {data, error} = await supabase.from('books').select('*').eq('ID', id);
        if (data.length === 0) { return {message: 'Livro Inexistente'}; }
        const dataToUpdate = {date: (newdata.date ? newdata.date : data[0].YEAR),
            title: (newdata.title ? newdata.title : data[0].TITLE),
            language: (newdata.language ? newdata.language : data[0].LANGUAGE),
            authors: (newdata.authors ? newdata.authors : data[0].AUTHORS)}
        try {
            const {error} = await supabase.from('books').update({YEAR: dataToUpdate.date,
                                                                                TITLE: dataToUpdate.title,
                                                                                LANGUAGE: dataToUpdate.language,
                                                                                AUTHORS: dataToUpdate.authors}).eq('ID', id);
            try {
                const {data, error} = await supabase.from('books').select('*').eq('ID', id);
                return data[0];
            } catch(error) {
                console.error(error);
                return {message: 'Erro ao Atualizar o Livro'};
            }
        } catch(error) {
            console.error(error);
            return {message: 'Erro ao Atualizar o Livro'};
        }
    } catch (error) {
        console.error(error);
        return {message: 'Erro ao Mostrar os Livros'};
    }
}

/* exports.adicionarLivro = async (req, res) => {
    const { ID, YEAR, TITLE, LANGUAGE, AUTHORS } = req.body;
    if (ID === undefined || typeof ID !== 'number' || isNaN(ID)) {
        return res.status(400).send('Erro: ID inválido ou não numérico.');
    }
    const newBook = { ID, YEAR, TITLE, LANGUAGE, AUTHORS };

    try {
        const docRef = db.collection('catalogs').doc(String(ID));
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
            return res.status(400).send('Erro: Livro com este ID já existe.');
        }
        await docRef.set(newBook);
        res.status(201).send('Livro Adicionado com Sucesso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao Adicionar Livro');
    }
};

exports.atualizarLivro = async (req, res) => {
    const { ID, YEAR, TITLE, LANGUAGE, AUTHORS } = req.body;
    if (ID === undefined || typeof ID !== 'number' || isNaN(ID)) {
        return res.status(400).send('Erro: ID inválido ou não numérico.');
    }

    try {
        const docRef = db.collection('catalogs').doc(String(ID));
        const docSnapshot = await docRef.get();
        if (!docSnapshot.exists) {
            return res.status(404).send('Erro: Livro não encontrado.');
        }
        await docRef.update({ YEAR, TITLE, LANGUAGE, AUTHORS });
        res.status(200).send('Livro Atualizado com Sucesso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao Atualizar o Livro');
    }
};

exports.apagarLivro = async (req, res) => {
    const { ID } = req.body;
    if (ID === undefined || typeof ID !== 'number' || isNaN(ID)) {
        return res.status(400).send('Erro: ID inválido ou não numérico.');
    }

    try {
        await db.collection('catalogs').doc(String(ID)).delete();
        res.status(200).send('Livro Apagado com Sucesso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao Apagar o Livro');
    }
}; */

module.exports = functions;