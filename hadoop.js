const SSH = require('simple-ssh');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { Client } = require('node-scp');
const supabase = require('./config/supabase');

const remoteCsvFilePath = '/home/hadoop/catalog.csv'; //localização para onde vai o ficheiro csv
const hadoopInputPath = '/user/Hadoop/input'; //input do hadoop
const hadoopOutputPath = '/user/Hadoop/output'; //output do hadoop

var ssh = new SSH({
  host: '172.20.51.1', //IP Local Casa: 10.0.0.128
  user: 'hadoop',
  pass: '1234'
});

let UpdateFileFromInfo = async function() {
  try {
      // Buscar dados da tabela
      const { data, error } = await supabase.from('books').select().order('ID', {ascending: true});

      if (error) {
          throw new Error(`Erro ao buscar dados: ${error.message}`);
      }

      if (data && data.length > 0) {
          // Extrair cabeçalhos das colunas
          const headers = Object.keys(data[0]);

          // Escrever dados em um ficheiro CSV
          const csvData = [headers.join(','), ...data.map(row => headers.map(header => row[header]).join(','))].join('\n');

          fs.writeFileSync('./catalog-test.csv', csvData, 'utf8');

          console.log(`Dados exportados com sucesso.`);
      } else {
          console.log('Nenhum dado encontrado na tabela.');
      }
  } catch (error) {
      console.error(`Ocorreu um erro: ${error.message}`);
  }
}

let processHDFSFile = async function() {
  try {
    // Ler ficheiro de saída
    const fileData = fs.readFileSync(hadoopOutputPath, 'utf8');

    // Dividir linhas e processar cada uma como um objeto
    const lines = fileData.trim().split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });

    const response = await supabase.from("books_info").delete();

    // Enviar dados linha por linha para o Supabase
    for (const row of data) {
      const { error } = await supabase.from("books_info").insert({YEAR: row[0], AMOUNT: row[1]});
    }
  } catch (error) {
      console.error(`Erro ao processar o ficheiro: ${error.message}`);
  }
}

let hadoopCommands = function() {
  return new Promise((resolve, reject) => {
    //faz os comandos que fazemos à mão 
    //esse comando apaga o diretório que lá tem o ficheiro pra fazer de novo
      ssh.exec(`/home/hadoop/hadoop/bin/hdfs dfs -rm -r -f ${hadoopOutputPath}`, {
        out: console.log.bind(console),
        err: console.error.bind(console),
      }).exec(`/home/hadoop/hadoop/bin/hdfs dfs -rm -r ${hadoopInputPath}/catalog.csv`, {
        out: console.log.bind(console),
        err: console.error.bind(console),
      }).exec(`/home/hadoop/hadoop/bin/hdfs dfs -put -f ${remoteCsvFilePath} ${hadoopInputPath}`, {
          out: console.log.bind(console),
          err: console.error.bind(console),
      }).exec(`/home/hadoop/hadoop/bin/hadoop jar /home/hadoop/hadoop/share/hadoop/tools/lib/hadoop-streaming-3.3.4.jar \
                -mapper /home/hadoop/mapper.py \
                -reducer /home/hadoop/reducer.py \
                -input ${hadoopInputPath}/catalog.csv \
                -output ${hadoopOutputPath}`, {
          out: console.log.bind(console),
          err: console.error.bind(console),
      }).exec(`/home/hadoop/hadoop/bin/hdfs dfs -cat ${hadoopOutputPath}/*`, {
          out: console.log.bind(console),
          err: console.error.bind(console),
      }).start({
          success: resolve,
          failure: reject,
      });
  });
}

let Initialize = function() {
  //Inicializar automáticamente a conexão à máquina virtual com o utilizador e executa tudo
  Client({
    host: '172.20.51.1', //IP Local Casa: 10.0.0.128
    port: 22,
    username: 'hadoop',
    password: '1234',
  }).then(async client => {
    // Aguardar que o cliente seja conectado e enviar o ficheiro catalog.csv para o trabalhar
    //enquanto espera a conexão do cliente, vai buscar o catalog que ta no diretório
    client.uploadFile('./catalog.csv', `${remoteCsvFilePath}`).then(async response => {
      //insere o ficheiro na máquina virtual
        console.log("> File Inserted and Now Running Hadoop");
        client.close();
        try {
            await hadoopCommands();
            console.log("> Hadoop Commands Executed Successfully!");
        } catch (err) {
            console.error("> Hadoop Commands Failed: ", err);
        }
    }).catch(error => console.error("> File Upload Error: ", error))
  }).catch(e => console.log(e))
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

module.exports = {UpdateFileFromInfo, processHDFSFile, hadoopCommands, Initialize};