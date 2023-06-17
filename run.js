const { exec } = require('child_process');
const fs = require('fs');
const filePath = 'log.txt';
const http = require('http');

fs.writeFile(filePath, '', (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('Empty file created successfully.');
  }
});


exec('ngrok http 80 --log="log.txt"', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error}`);
    return;
  }

  if (stderr) {
    console.error(`Command encountered an error: ${stderr}`);
    return;
  }

});
/*
fs.watch(filePath, (event, filename) => {
  if (event === 'change') {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
      } else {
		  httForword(data);
         console.log('File content:', data);
        // Do something with the file content here
      }
    });
  }
});
*/
function fileRead(){
	fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
      } else {
		  // httForword(data);
		  
		  const lines = data.split('\n');
		  const forwardingLine = lines.find((line) => line.includes('http://localhost:80 url='));
		  const url = forwardingLine.split("url=")
		 sendMSG({url:url[1]})
         console.log('File URL:', url[1]);
         //console.log('File content:', data);
        // Do something with the file content here
      }
    });
}
setTimeout(()=>{
	fileRead()
}, 1000);

function httForword(stdout){ 
  const lines = stdout.split('\n');
  const forwardingLine = lines.find((line) => line.includes('http://localhost:80 url='));

  if (forwardingLine) {
	  console.log(forwardingLine);
    const urlMatch = forwardingLine.match(/http?:\/\/\S+/);
    if (urlMatch) {
      const forwardingUrl = urlMatch[0];
      console.log(`\n ---------------- \n Ngrok forwarding URL: ${forwardingUrl}`);
    }
  }
}

function sendMSG({url}){ 
console.log("Url str - ",url)
var mobile  = "9790608138"; 	
var smsIP  = "192.168.0.104";
var str = "?PhoneNo="+mobile+"&Content= Online url - "+url+"&type=json&mobileip="+smsIP;
var urlStr  =  "http://localhost/mc/studio/static/sms/sms_api.php"+str;	
 
 
http.get(urlStr, (res) => {
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
 
 
}

function cleanupAndExit() {
	

fs.stat(filePath, (err, stats) => {
  if (err) {
    console.error('Error accessing file:', err);
  } else {
    if (stats.size === 0) {
      console.log('The file is empty.');
    } else {
      console.log('The file is not empty.');
    }
  }
});

  // Perform any necessary cleanup or finalization here
  console.log('Exiting application...');
  process.exit();
}

process.on('SIGINT', cleanupAndExit);
