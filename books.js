const express = require('express');
var functions = {};
const fs = require('fs');
const path = require('path');
const supabase = require('./config/supabase');
const Hadoop = require('./hadoop.js');

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
            const { data, error} = await supabase.from('books').update({YEAR: dataToUpdate.date,
                                                                                TITLE: dataToUpdate.title,
                                                                                LANGUAGE: dataToUpdate.language,
                                                                                AUTHORS: dataToUpdate.authors}).eq('ID', id).select();
            return data[0];
        } catch(error) {
            console.error(error);
            return {message: 'Erro ao Atualizar o Livro'};
        }
    } catch (error) {
        console.error(error);
        return {message: 'Erro ao Mostrar os Livros'};
    }
}

// Função responsável por apagar o livro da base de dados
functions.deleteBookByID = async function(id) {
    try {
        // Procurar na base de dados toda a informação sobre o livro com tal ID para apagar e devolver
        const { data, error } = await supabase.from('books').delete().eq('ID', id).select();
        if (data.length === 0) { return {message: 'Livro Inexistente'}; }
        return data[0];
    } catch (error) {
        console.error(error);
        return {message: 'Erro ao Apagar o Livro'};
    }
};

// Função responsável por inserir um livro na base de dados
functions.insertBook = async function(newdata) {
    try {
        // Procurar o livro na base de dados pelo seu ID e se existe ou não.
        const {data, error} = await supabase.from('books').select().order('ID', {ascending: false});
        // Criar a nova informação a ser inserida no campo de dados com campos novos ou "defaults" com condições "if-else"
        const dataToUpdate = {id: (parseInt(data[0].ID)+1),
                              date: (newdata.date ? newdata.date : "0000-00-00"),
                              title: (newdata.title ? newdata.title : ""),
                              language: (newdata.language ? newdata.language : ""),
                              authors: (newdata.authors ? newdata.authors : "")}
        try {
            // Inserir novo livro na base de dados após obter o seu ID e depois devolvê-lo
            const { data, error} = await supabase.from('books').insert({ID: dataToUpdate.id,
                                                                        YEAR: dataToUpdate.date,
                                                                        TITLE: dataToUpdate.title,
                                                                        LANGUAGE: dataToUpdate.language,
                                                                        AUTHORS: dataToUpdate.authors}).select();
            await Hadoop.UpdateFileFromInfo();
            return data[0];
        } catch(error) {
            console.error(error);
            return {message: 'Erro ao Inserir o Livro'};
        }
    } catch (error) {
        console.error(error);
        return {message: 'Erro ao Mostrar os Livros'};
    }
}

module.exports = functions;