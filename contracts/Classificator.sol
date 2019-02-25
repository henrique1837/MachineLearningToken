pragma solidity ^0.5.0;

import "./RestrictAssignableFileStore.sol";
import "./ClassificationLib.sol";
import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";

/** @title RestrictAssignableFileStore.
  * @dev The RestrictAssignableFileStore Contract refer some IPFS hash to an wallet that is
  * allowed to do it.
  * An IPFS hash should not be able to be inserted in the File struct when it already has an owner.
  * This contract has an owner that can add others wallets to become admins and be able to use it
  * too.
  * The files inserted can be verified by other admin as a signature that this content was checked 
  * and passed. A file is consedered verified when it has been verified by a minimum number of
  * admins especified when publishing contract.
  */


contract Classificator is RestrictAssignableFileStore,WhitelistedRole{
    // -------- Variables ----------- //
    uint public minVerificationsUser;
    uint public minVerificationsClass;

    mapping(address => bool) internal isUserVerified;
    mapping(address => uint) internal totalVerify;
    mapping(bytes32 => mapping(address => ClassificationLib.Classification)) internal classifications;
    
// ---------- Events --------------- //

    event ClassificatorCreated(address owner,uint minVerificationsUser,uint minVerificationsClass);
    event UserVerified(address indexed admin,address indexed user,bool indexed userVerified);
    event ClassificationDone(address indexed user,bytes32 indexed fileId,string fileIpfs,uint indexed class);
    event ClassificationVerifiedBy(address indexed admin,address indexed user,bytes32 indexed fileId,string ipfsFile,uint classification);
    event ClassificationIsVerified(address indexed user,bytes32 indexed fileId,string ipfsFile,uint classification);

    // ----------- Functions ----------- //
    modifier onlyUserVerified() {
        require(isVerifiedUser(msg.sender));
        _;
    }

    modifier isNotAdmin() {
        require(isPauser(msg.sender) == false && isWhitelistAdmin(msg.sender) == false);
        _;
    }


    modifier hasNotClassified(string memory _ipfs) {
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
	ClassificationLib.Classification storage c = classifications[fhash][msg.sender];
	bool hasClassified = c.hasClassifiedFile;
        require(hasClassified == false);
        _;
    }

    modifier hasNotVerifiedClass(string memory _ipfs,address _addr) {
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
	ClassificationLib.Classification storage c = classifications[fhash][_addr];
	bool hasVerified = c.hasVerifiedClass[msg.sender];
        require(hasVerified == false);
        _;
    }
   
    constructor(uint _minimumSignatures,uint _minVerificationsUser,uint _minVerificationsClass) public RestrictAssignableFileStore(_minimumSignatures) {
      require(_minVerificationsUser > 0 && _minVerificationsClass > 0);
      minVerificationsUser = _minVerificationsUser;
      minVerificationsClass = _minVerificationsClass;
      emit ClassificatorCreated(msg.sender,minVerificationsUser,minVerificationsClass);
    }


    /** @dev Allow user to register in contract.
      */


    function register()
             public
	     isNotAdmin
             whenNotPaused{
        require(isWhitelisted(msg.sender) == false);
        super._addWhitelisted(msg.sender);
     	
    }

    /** @dev Allow admin to add some user.
      * @param account User wallet to be added as registered.
      */

    function addWhitelisted(address account) 
	public 
        onlyWhitelistAdmin
	whenNotPaused {
	   require(isWhitelisted(msg.sender) == false);
	   super.addWhitelisted(account);
	   verifyUser(account);
    }

    /** @dev Allow admin to verify some user.
      * @param _addr User wallet to be verified.
      */


    function verifyUser(address _addr)
             public
             whenNotPaused
             onlyWhitelistAdmin{
        require(isWhitelisted(_addr) == true && isUserVerified[_addr] == false);
        totalVerify[_addr] = totalVerify[_addr].add(1);
        if(totalVerify[_addr] >= minVerificationsUser) {
    		isUserVerified[_addr] = true;
        }
        emit UserVerified(msg.sender,_addr,isUserVerified[_addr]);
    }

    /** @dev Allow verified user to classify some file (news).
      * @param _ipfs The IPFS hash of the file.
      * @param _class The uint classification of the file.
      */

    function classifyFile(string memory _ipfs,uint _class)
		public
		onlyUserVerified
		whenNotPaused
 		hasNotClassified(_ipfs){
         bytes32 fhash = FileStoreLib.getHash(_ipfs);
         FileStoreLib.File storage f = files[fhash];
         FileVerificationLib.Signature storage s = signatures[fhash];
         require(f.hasOwner == true && s.isVerified == true);
	 ClassificationLib.Classification storage c = classifications[fhash][msg.sender];
	 ClassificationLib.classifyFile(c,fhash,_ipfs,_class);
    }

    /** @dev Allow admin to verify classification of a file made by a verified user.
      * @param _addr The verified user address.
      * @param _ipfs The IPFS hash of the file.
      */

    function verifyClassification(address _addr,string memory _ipfs) 
	public
	whenNotPaused
	onlyWhitelistAdmin
	hasNotVerifiedClass(_ipfs,_addr) {
         bytes32 fhash = FileStoreLib.getHash(_ipfs);
	 ClassificationLib.Classification storage c = classifications[fhash][_addr];
	 require(c.hasClassifiedFile == true);
	 uint totVerifyClass = c.totalVerifyClass;
	 bool isVerifyClass = c.classVerified;
	 require(totVerifyClass < minVerificationsClass && isVerifyClass == false);
	 ClassificationLib.verifyClassification(c,_addr,fhash,_ipfs);
	 if(c.totalVerifyClass >= minVerificationsClass){
	 	ClassificationLib.setVerified(c,_addr,fhash,_ipfs);
	 }
    }

    /** @dev Checks if user has classified some file.
      * @param _addr The verified user address.
      * @param _ipfs The IPFS hash of the file.
      * @return bool True if user has classified file
      */


    function hasClassified(address _addr,string memory _ipfs) public view returns(bool){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
	ClassificationLib.Classification storage c = classifications[fhash][_addr];
	return(c.hasClassifiedFile);
    }

    /** @dev Get the classification made by an user to a file.
      * @param _addr The verified user address.
      * @param _ipfs The IPFS hash of the file.
      * @return uint The classification that user made to the file.
      */

    function getClassification(address _addr,string memory _ipfs) public view returns(uint){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
	ClassificationLib.Classification storage c = classifications[fhash][_addr];
	return(c.classification);
    }    

    /** @dev Get the total verifications of classification that a user gave to a file.
      * @param _addr The verified user address.
      * @param _ipfs The IPFS hash of the file.
      * @return uint The total of verifications that admins made to the classification of the file.
      */

    function getTotalClassVerifications(address _addr,string memory _ipfs) public view returns(uint){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
	ClassificationLib.Classification storage c = classifications[fhash][_addr];
	return(c.totalVerifyClass);
    }    

    /** @dev Checks if classification made by an user to a file is verified from admins.
      * @param _addr The verified user address.
      * @param _ipfs The IPFS hash of the file.
      * @return bool True if file classification is verified.
      */

    function isClassificationVerified(address _addr,string memory _ipfs) public view returns(bool){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
	ClassificationLib.Classification storage c = classifications[fhash][_addr];
	return(c.classVerified);
    }    


    function getClassificationOwner(address _addr,string memory _ipfs) public view returns(address){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
	ClassificationLib.Classification storage c = classifications[fhash][_addr];
	return(c.owner);
    }    

    function isVerifiedUser(address _addr) public view returns(bool){
	return(isUserVerified[_addr]);
    }

}
