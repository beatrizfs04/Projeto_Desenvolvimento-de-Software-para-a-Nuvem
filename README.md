# How-To
- Em Windows, Primeiro Que Tudo, Devemos Colocar Todos os Livros na Base de Dados e Fazer o Processamento do Hadoop, Iniciando o Hadoop.bat
- Após Isso, Devemos Inicializar a Base do Node.Js Usando o Initialize.bat e Depois Sim Podermos Usar Tanto os Comandos CURL Como o Front-End

# Comandos Consola Ubuntu

## GET:

### ShowBooks
- curl -X GET http://localhost:5000/api/showBooks -H "Content-Type: application/json"

### ShowBook (ID)
- curl -X GET http://localhost:5000/api/showBook/?id=1 -H "Content-Type: application/json"

## POST:

### UpdateBook (ID, DATE, TITLE, LANGUAGE, AUTHORS):
- curl -X POST http://localhost:5000/api/updateBook/?id=1?date=2000-12-12?title=Titulo Bonito?language=en?authors=Eu -H "Content-Type: application/json"

### InsertBook (DATE, TITLE, LANGUAGE, AUTHORS):
- curl -X POST http://localhost:5000/api/updateBook/?date=2000-12-12?title=Titulo Bonito?language=en?authors=Eu -H "Content-Type: application/json"

## DELETE:

### DeleteBook (ID)
- curl -X DELETE http://localhost:5000/api/deleteBook/?id=1 -H "Content-Type: application/json"