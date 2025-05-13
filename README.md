# How-To
- Em windows, devemos colocar todos os livros na base de dados e fazer o processamento do Hadoop, iniciando o Hadoop.bat.
- Após isso, devemos inicializar a base do Node.Js usando o initialize.bat e depois sim podermos usar tanto os comandos CURL como o Front-End.

# Comandos Consola Ubuntu

## GET:

### ShowBooks
- curl -X GET "http://localhost:5000/api/showBooks" -H "Content-Type: application/json"

### ShowBook (ID)
- curl -X GET "http://localhost:5000/api/showBook/?id=1" -H "Content-Type: application/json"

## POST:

### UpdateBook (ID, DATE, TITLE, LANGUAGE, AUTHORS):
- curl -X POST "http://localhost:5000/api/updateBook/?id=1&date=12-12-2024&title=Titulo%20Bonito&language=en&authors=Eu" -H "Content-Type: application/json"

### InsertBook (DATE, TITLE, LANGUAGE, AUTHORS):
- curl -X POST "http://localhost:5000/api/insertBook/?date=12-12-2024&title=Titulo%20Bonito&language=en&authors=Eu" -H "Content-Type: application/json"

## DELETE:

### DeleteBook (ID)
- curl -X DELETE "http://localhost:5000/api/deleteBook/?id=1" -H "Content-Type: application/json"
