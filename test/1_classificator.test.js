var Classificator = artifacts.require("./Classificator.sol");
var FileStoreLib = artifacts.require("./FileStoreLib.sol");
var FileVerificationLib = artifacts.require("./FileVerificationLib.sol");
var ClassificationLib = artifacts.require("./ClassificationLib.sol");
contract('Classificator', function(accounts) {

  const pedro = accounts[0];
  const joao = accounts[1];
  const alice = accounts[3];
  const john = accounts[4];

  const ipfsHash1 = "aa";
  const ipfsHash2 = "a";
  const ipfsHash3 = "aaa";
  const filename = "test";
  it("Owner can add ipfs hash", async () => {
    const fs = await Classificator.deployed();
    const fslib = await FileStoreLib.deployed();
    // Test if owner can add ipfs hash to contract //
    await fs.addFile(ipfsHash1,filename,{from: pedro});
    // Check if the file owner is the same that added the file //
    var ownerFile = await fs.getFileOwner(ipfsHash1);
    assert.equal(ownerFile, pedro, 'File owner should be the wallet that added the file in the contract');
  });
  it("Onwer can add admin ",async() => {
    const fs = await Classificator.deployed();
    // Verify if owner can add admin //
    await fs.addWhitelistAdmin(joao,{from: pedro});
    // isAdmin should be true //
    var isAdmin = await fs.isWhitelistAdmin(joao);
    assert.equal(true,isAdmin, 'Admin should be added');

  });
  it("Admin can add file ",async() => {
    const fs = await Classificator.deployed();
    // If transaction was successfull admin can add file to contract //
    var transaction = await fs.addFile(ipfsHash2,filename,{from: joao});
    assert.equal("object",typeof(transaction), 'Admin should be able to add file');

  });
  it("Admin can verify file that is not him's",async()=>{
    const fs = await Classificator.deployed();
    // Verify if file can be verified and is set to verified by admin that is not owner //
    await fs.verifyFile(ipfsHash1,{from:joao});
    // Check if getFileSignatures method is ok //
    const fileSignatures = await fs.getFileSignatures(ipfsHash1);
    assert.equal(joao,fileSignatures[0],'Admin should be able to verify file');
  });
  it("Admin canot verify own file",async()=>{
    const fs = await Classificator.deployed();
    // Check if admin can not verify own file, transaction should fail //
    try{
      var transaction = await fs.verifyFile(ipfsHash2,{from:joao});
    } catch(err){
    }
    assert.equal( "undefined",typeof(transaction), 'Admin should not be able to verify own file');
    // getFileSignatures method should not return any wallet
    const fileSignatures = await fs.getFileSignatures(ipfsHash2);
    assert.equal(fileSignatures.length,0,'fileSignatures length should be 0');
  });
  it("Can check if file is verified",async()=>{
    const fs = await Classificator.deployed();
    const isVerified = await fs.isVerified(ipfsHash1);
    assert.equal(isVerified,true,'File should be verified');
  });
  it("User can register in contract",async()=>{
    const fs = await Classificator.deployed();
    await fs.register({from:alice});
    const isUser = await fs.isWhitelisted(alice);
    assert.equal(isUser,true,'User should be able to register');
  });

  it("Admin can verify user",async()=>{
    const fs = await Classificator.deployed();
    await fs.verifyUser(alice,{from:joao});
    const isUserVerified = await fs.isVerifiedUser(alice);
    assert.equal(isUserVerified,true,'User should be verified');
  });

  it("Admin can add user",async()=>{
    const fs = await Classificator.deployed();
    await fs.addWhitelisted(john,{from:joao});
    const isUser = await fs.isWhitelisted(john);
    assert.equal(isUser,true,'Admin should be able to register a user');
    const isUserVerified = await fs.isVerifiedUser(john);
    assert.equal(isUserVerified,true,'User should be verified');
  });
  it("User can classify ipfs file (news)",async()=>{
    const fs = await Classificator.deployed();
    await fs.classifyFile(ipfsHash1,0,{from:alice});
    const classification = await fs.getClassification(alice,ipfsHash1);
    assert.equal(classification,0,'Wrong uint classification for the file');
  });

  it("Admin can verify the classification",async()=>{
    const fs = await Classificator.deployed();
    await fs.verifyClassification(alice,ipfsHash1,{from:joao});
    const isClassificationVerified = await fs.isClassificationVerified(alice,ipfsHash1);
    assert.equal(isClassificationVerified,true,'Admin should be able to verify some classification');
  });


});
