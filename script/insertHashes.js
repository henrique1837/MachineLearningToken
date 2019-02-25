// Use this script to be able to test in localhost //
module.exports = async function(callback) {
  const Web3 = require('web3');
  const TruffleContract = require('truffle-contract');

  var fs = require('fs')
  



  var web3 = new Web3("http://localhost:8545");
   
  var accounts = await web3.eth.getAccounts();
 
  const ClassificatorArtifact = require('../build/contracts/Classificator.json');
  const Classificator = TruffleContract(ClassificatorArtifact);
  console.log("Your wallet:"+accounts[0]);
  Classificator.setProvider(web3.currentProvider);    
  var c = await Classificator.deployed();
  const pedro = accounts[0];
  const joao = accounts[1];
  const alice = accounts[2];
  const john = accounts[3];
  
  console.log("Contract address: "+c.address);
  console.log("Adding admin");
  await c.addWhitelistAdmin(joao,{from: pedro});
  // Add user //
  console.log("Adding user "+alice);
  await c.addWhitelisted(alice,{from:pedro});
  const isUserVerified = await c.isVerifiedUser(alice);
  console.log("This user is verified: "+isUserVerified);

  fs.readFile('script/1_json_hashes.json','utf8', async function(err,res){
	if(err){
	  throw err	
	} else {
	  
          var data = JSON.parse(res)
          for(i=0;i<data.ipfsHash.length;i++){
                var filename = "";
		var ipfsHash = data.ipfsHash[i];
		console.log("Inserting ipfs hash "+ipfsHash);
  		await c.addFile(ipfsHash,filename,{from: pedro});
  		console.log("Verify hash "+ipfsHash);
		await c.verifyFile(ipfsHash,{from: joao});

                
	  }
	}

  });
  
}


