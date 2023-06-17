const http = require('http');

const url = 'http://127.0.0.1/mc/studio/static/sms/sms_api.php?PhoneNo=9790608138&Content=%20Online%20url%20-%20https://a2e0-49-206-117-125.ngrok-free.app&type=json&mobileip=192.168.0.104';

http.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(data); // Output the received data
  });
}).on('error', (error) => {
  console.error(error);
});