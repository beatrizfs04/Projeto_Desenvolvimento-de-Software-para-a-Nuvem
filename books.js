const express = require('express');
var functions = {};
const fs = require('fs');
const path = require('path');
const supabase = require('./config/supabase');
const { type } = require('os');

// Função responsável por devolver todos os livros da base de dados
functions.mostrarLivros = async function() {
    try {
        // Procurar na base de dados toda a informação de todos os livros e devolver por ordem ascendente de ID
        const {data, error} = await supabase.from('books').select().order('ID', {ascending: true});
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        return {message: 'Erro ao Mostrar os Livros'};
    }
};

// Função responsável por devolver o livro da base de dados
functions.showBookByID = async function(id) {
    try {
        // Procurar na base de dados toda a informação sobre o livro com tal ID e devolver
        const {data, error} = await supabase.from('books').select().eq('ID', id);
        if (data.length === 0) { return {message: 'Livro Inexistente'}; }
        return data[0];
    } catch (error) {
        console.error(error);
        return {message: 'Erro ao Mostrar os Livros'};
    }
};

// Função responsável por atualizar o livro na base de dados
functions.updateBookByID = async function(id, newdata) {
    try {
        // Procurar o livro na base de dados pelo seu ID e se existe ou não.
        var {data, error} = await supabase.from('books').select().eq('ID', id);
        if (data.length === 0) { return {message: 'Livro Inexistente'}; }
        // Criar a nova informação a ser atualizada no campo de dados com campos novos ou o já existente com condições "if-else"
        const dataToUpdate = {date: (newdata.date ? newdata.date : data[0].YEAR),
            title: (newdata.title ? newdata.title : data[0].TITLE),
            language: (newdata.language ? newdata.language : data[0].LANGUAGE),
            authors: (newdata.authors ? newdata.authors : data[0].AUTHORS)}
        try {
            // Atualizar os campos do livro por novos dados com a informação anteriormente definida
            const {error} = await supabase.from('books').update({YEAR: dataToUpdate.date,
                                                                                TITLE: dataToUpdate.title,
                                                                                LANGUAGE: dataToUpdate.language,
                                                                                AUTHORS: dataToUpdate.authors}).eq('ID', id);
            try {
                // Pesquisar o livro novamente na base de dados, na qual já está atualizado e será devolvido.
                const {data, error} = await supabase.from('books').select().eq('ID', id);
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

module.exports = functions;