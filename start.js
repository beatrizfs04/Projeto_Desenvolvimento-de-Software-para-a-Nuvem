const SSH = require('simple-ssh');
const path = require('path');
const { Client } = require('node-scp')

// Chamar o Supabase
// const supabase = require('./config/supabase');

const remoteCsvFilePath = '/home/hadoop/catalog.csv'; //localização para onde vai o ficheiro csv
const hadoopInputPath = '/user/Hadoop/input'; //input do hadoop
const hadoopOutputPath = '/user/Hadoop/output'; //output do hadoop

var ssh = new SSH({
    host: '192.168.43.6', //IP Local Casa: 10.0.0.128
    user: 'hadoop',
    pass: '1234'
});

let hadoopCommands = function() {
  return new Promise((resolve, reject) => {
      ssh.exec(`/home/hadoop/hadoop/bin/hdfs dfs -rm -r -f ${hadoopOutputPath}`, {
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

Client({
  host: '192.168.43.6', //IP Local Casa: 10.0.0.128
  port: 22,
  username: 'hadoop',
  password: '1234',
}).then(async client => {
  client.uploadFile('./catalog.csv', `${remoteCsvFilePath}`).then(async response => {
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


// Fomos procurar onde o ficheiro start-all.sh se localizava para podermos por a iniciar com a máquina virtual:
// find / -name start-all.sh 2>/dev/null
// O output foi: /home/hadoop/hadoop/sbin/


// Adicionamos o start-all.sh a iniciar com a máquina para que não seja sempre necessário acessá-la para iniciar:
// crontab -e
// @reboot /home/hadoop/hadoop/sbin/start-all.sh
// crontab -l
// sudo nano /etc/systemd/system/start-all.service
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


// Resolver Supabase em caso de falha permissões do Docker:
// sudo chown paiva:docker /var/run/docker.sock
// ls -l /var/run/docker.sock