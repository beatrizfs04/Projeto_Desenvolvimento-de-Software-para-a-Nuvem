const SSH = require('simple-ssh');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { Client } = require('node-scp');
const csv = require('csv-parser');
const supabase = require('./config/supabase');

const remoteCsvFilePath = '/home/hadoop/catalog.csv'; //localização para onde vai o ficheiro csv
const hadoopInputPath = '/user/Hadoop/input'; //input do hadoop
const hadoopOutputPath = '/user/Hadoop/output'; //output do hadoop

/*async function InsertAllBooks() {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase.from('books').delete();

      fs.createReadStream('./catalog.csv')
        .pipe(csv({ headers: ['ID', 'YEAR', 'TITLE', 'LANGUAGE', 'AUTHORS'] }))
        .on('data', async (row) => {
          const id = row.ID;
          const year = row.YEAR;
          const title = row.TITLE;
          const language = row.LANGUAGE;
          const authors = row.AUTHORS;

          try {
            console.log(`> Inserting All Book Data: ${id}, ${year}, ${title}, ${language}, ${authors}`)
            const { data, error } = await supabase.from('books').insert([{ ID: id, YEAR: year, TITLE: title, LANGUAGE: language, AUTHORS: authors }]);
          } catch(error) {
            console.error('> Error Inserting Book:', error);
          }
      })
      .on('end', async () => {
        await InsertCatalog();
        await hadoopCommands();
        await processHDFSFile();
        resolve({
          success: true,
          message: '> CSV File Processed Successfully',
        });
      })
      .on('error', (error) => {
        reject({
          success: false,
          message: '> Error Processing the CSV File',
          error: error.message,
        });
      });
    } catch(error) {
      console.error("> Error on Deleting All Books From Table!");
    }
  });
} */

/* 
  AVISO!
  Desativada esta função pois em rede doméstica/residencial somos totalmente limitados à largura de banda e nem chegam a entrar metade dos livros por esse mesmo problema.
*/

async function UpdateFileFromInfo() {
  try {
      const { data, error } = await supabase.from('books').select().order('ID', {ascending: true});

      if (error) {
          throw new Error(`> Error Trying to Fetch Data: ${error.message}`);
      }

      if (data && data.length > 0) {
          // Extrair cabeçalhos das colunas
          const headers = Object.keys(data[0]);

          // Escrever todos os dados em um ficheiro CSV
          const csvData = [headers.join(','), ...data.map(row => headers.map(header => row[header]).join(','))].join('\n');

          fs.writeFileSync('./catalog.csv', csvData, 'utf8');

          console.log(`> All Data Exported Successfully.`);

          await InsertCatalog();
          console.log('> Catalog Inserted Successfully and Now Processing Output File.')
          await hadoopCommands();
          await processHDFSFile();
      } else {
          console.log('> Any Data Recieved From the Table.');
      }
  } catch (error) {
      console.error(`> An Error Ocurred: ${error.message}`);
  }
}

async function processHDFSFile() {
  try {
    const { data, error } = await supabase.from("books_info").select();
    for (const dataInfo of data) {
      // Eliminar entradas existentes no Supabase
      const deleteResponse = await supabase.from("books_info").delete().eq('YEAR', dataInfo.YEAR);
      if (deleteResponse.error) {
        console.error(`> Error When Trying to Delete Year ${year}: ${deleteResponse.error.message}`);
      }
    }
  } catch(error) {
    console.error(`> Error Processing Database: ${error.message}`);
  }

  try {
    const fileData = fs.readFileSync('./output_hadoop.txt', 'utf8');

    // Dividir linhas e processar cada uma
    const lines = fileData.trim().split('\n'); // Dividir por linhas
    const data = []; // Array para guardar os dados processados

    for (const line of lines) {
        const [year, amount] = line.split('\t');

        if (!year || !amount) {
            console.error(`> Error Processing Line: ${line}`);
            continue; 
        }

        console.log(`> Processing Line: YEAR=${year}, AMOUNT=${amount}`);
        data.push({ YEAR: parseInt(year), AMOUNT: parseInt(amount) });
    }

    // Enviar dados linha por linha para o Supabase
    for (const row of data) {
        const { error } = await supabase.from("books_info").upsert(row);
        if (error) {
            console.error(`> Error Trying to Insert Line (${row.YEAR}, ${row.AMOUNT}): ${error.message}`);
        }
    }

    console.log('> Process Finished Successfully.');
  } catch (error) {
      console.error(`> Error Processing Database: ${error.message}`);
  }
}

async function hadoopCommands() {
  return new Promise((resolve, reject) => {
    const outputFile = './output_hadoop.txt'; // Caminho para guardar o ficheiro da informação
    let outputData = ''; // Variável para acumular todos os dados do comando cat

    const ssh = new SSH({
      host: '172.17.79.204', //IP Local Casa: 10.0.0.128
      user: 'hadoop',
      pass: '1234'
    });

    ssh.exec(`/home/hadoop/hadoop/bin/hdfs dfs -rm -r -f ${hadoopOutputPath}`, {
            out: console.log.bind(console),
            err: console.error.bind(console),
        })
        .exec(`/home/hadoop/hadoop/bin/hdfs dfs -rm -r ${hadoopInputPath}/catalog.csv`, {
            out: console.log.bind(console),
            err: console.error.bind(console),
        })
        .exec(`/home/hadoop/hadoop/bin/hdfs dfs -put -f ${remoteCsvFilePath} ${hadoopInputPath}`, {
            out: console.log.bind(console),
            err: console.error.bind(console),
        })
        .exec(`/home/hadoop/hadoop/bin/hdfs dfs -test -e ${hadoopInputPath}/catalog.csv`, {
            out: (data) => {
              console.log('File exists:', data);
            },
            err: console.error.bind(console),
        })
        .exec(`/home/hadoop/hadoop/bin/hadoop jar /home/hadoop/hadoop/share/hadoop/tools/lib/hadoop-streaming-3.3.4.jar -mapper /home/hadoop/mapper.py -reducer /home/hadoop/reducer.py -input ${hadoopInputPath}/catalog.csv -output ${hadoopOutputPath}`, {
            out: console.log.bind(console),
            err: console.error.bind(console),
        })
        .exec(`/home/hadoop/hadoop/bin/hdfs dfs -cat ${hadoopOutputPath}/*`, {
            out: (data) => {
                outputData += data;
            },
            err: console.error.bind(console),
        })
        .exec(`/home/hadoop/hadoop/bin/hdfs dfs -rm -r -f ${hadoopOutputPath}`, {
            out: console.log.bind(console),
            err: console.error.bind(console),
        })
        .on('end', () => {
          if (outputData !== '') {
              fs.writeFile(outputFile, outputData, (err) => {
                  if (err) {
                      console.error('Erro ao tentar gravar o arquivo:', err);
                      reject(err);
                  }
                  console.log('Todos os dados foram salvos em:', outputFile);
                  resolve();
              });
          } else {
              console.error('> Any Object as Been Saved in The Cat.');
              resolve();
          }

          ssh.end();
        })
        .on('error', (err) => {
            console.error('> Error Occurred During SSH:', err);
            reject(err);
        })
        .start();
  });
}

async function InsertCatalog() {
  //Inicializar automáticamente a conexão à máquina virtual com o utilizador e executa tudo
  return new Promise((resolve, reject) => {
    Client({
        host: '172.17.79.204', // IP Local Casa: 10.0.0.128
        port: 22,
        username: 'hadoop',
        password: '1234',
    }).then(async (client) => {
      client.uploadFile('./catalog.csv', `${remoteCsvFilePath}`)
      .then(async (response) => {
        console.log('> File Inserted and Now Running Hadoop');
        client.close();
        resolve();
      }).catch((error) => {
          console.error('> File Upload Error: ', error);
          client.close();
          reject(error); // Rejeita a Promise se houver erro no upload
      });
    })
    .catch((error) => {
        console.error('> SSH Connection Error: ', error);
        reject(error); // Rejeita a Promise se houver erro na conexão SSH
    });
  });
}

// Fomos procurar onde o ficheiro start-all.sh se localizava para podermos por a iniciar com a máquina virtual:
// find / -name start-all.sh 2>/dev/null
// O output foi: /home/hadoop/hadoop/sbin/

// Adicionamos o start-all.sh a iniciar com a máquina para que não seja sempre necessário acessá-la para iniciar:
// crontab -e (Editar o cronbat)
// @reboot /home/hadoop/hadoop/sbin/start-all.sh (Adicionar linha ao ficheiro a editar)
// crontab -l (Load do crontab)
// sudo nano /etc/systemd/system/start-all.service (Criar ficheiro de serviço para arranque)
/*
  [Unit]
  Description=Start All Services

  [Service]
  ExecStart=/home/hadoop/hadoop/sbin/start-all.sh
  Restart=on-failure
  User=hadoop
  Group=hadoop

  [Install]
  WantedBy=multi-user.target
*/
// sudo systemctl daemon-reload
// sudo systemctl enable start-all.service
// sudo systemctl start start-all.service

module.exports = {/* InsertAllBooks, */ UpdateFileFromInfo, processHDFSFile, hadoopCommands, InsertCatalog};