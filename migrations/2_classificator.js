
var Classificator = artifacts.require("./Classificator.sol");
var FileStoreLib = artifacts.require("./FileStoreLib.sol");
var FileVerificationLib = artifacts.require("./FileVerificationLib.sol");
var ClassificationLib = artifacts.require("./ClassificationLib.sol");

module.exports =  function(deployer) {
  deployer.deploy(FileStoreLib);

  deployer.deploy(FileVerificationLib);

  deployer.deploy(ClassificationLib);

  deployer.link(FileStoreLib, Classificator);

  deployer.link(FileVerificationLib, Classificator);

  deployer.link(ClassificationLib, Classificator);

  deployer.deploy(Classificator,1,1,1);
};
