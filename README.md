# Projeto de Desenvolvimento de Software para a Nuvem
## O que foi feito?
Esta é uma aplicação em ambiente na nuvem para a gestão e análise
de um catálogo de livros da coleção digital do Projeto
Gutenberg.

O objetivo principal é fornecer um sistema para organizar,
catalogar e analisar informações sobre os livros em grande
escala de dados. A aplicação utiliza tecnologias como a
framework Hadoop para o processamento em larga escala
com a aplicação da função MapReduce. Utiliza também
a plataforma de base de dados em nuvem Supabase para
armazenamento e gestão de dados.

O sistema permite, também, a inserção, atualização e
consulta de livros. A abordagem em ambiente nuvem
garante escalabilidade e flexibilidade no processamento e
armazenamento de grandes volumes de dados, permitindo
que o catálogo de livros seja constantemente atualizado e
analisado de forma eficaz.

## Quem participou?
Este projeto foi realizado por 3 alunos da Lincenciatura de Informática Web, Móvel e na Nuvem.

- Beatriz Santos 
- Manoela Azevedo 
- Rodrigo Paiva 

## Que linguagens de programação foram utilizadas?
- JavaScript
- HTML

## Como inicializar o projeto?
- Em windows, devemos colocar todos os livros na base de dados e fazer o processamento do Hadoop, iniciando o Hadoop.bat.
- Após isso, devemos inicializar a base do Node.Js usando o Initialize.bat e depois sim podermos usar tanto os comandos CURL como o Front-End.

<br>
<br>
<br>
<br>
<br>

---

## Comandos - Consola Ubuntu

### GET:

#### ShowBooks
- curl -X GET "http://localhost:5000/api/showBooks" -H "Content-Type: application/json"

#### ShowBook (ID)
- curl -X GET "http://localhost:5000/api/showBook/?id=1" -H "Content-Type: application/json"

### POST:

#### UpdateBook (ID, DATE, TITLE, LANGUAGE, AUTHORS):
- curl -X POST "http://localhost:5000/api/updateBook/?id=1&date=12-12-2024&title=Titulo%20Bonito&language=en&authors=Eu" -H "Content-Type: application/json"

#### InsertBook (DATE, TITLE, LANGUAGE, AUTHORS):
- curl -X POST "http://localhost:5000/api/insertBook/?date=12-12-2024&title=Titulo%20Bonito&language=en&authors=Eu" -H "Content-Type: application/json"

### DELETE:

#### DeleteBook (ID)
- curl -X DELETE "http://localhost:5000/api/deleteBook/?id=1" -H "Content-Type: application/json"
