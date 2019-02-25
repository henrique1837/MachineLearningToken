pragma solidity ^0.5.0;



import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/** @title ClassificationLib.
  * @dev The RestrictAssignableFileStore Contract refer some IPFS hash to an wallet that is
  * allowed to do it.
  * An IPFS hash should not be able to be inserted in the File struct when it already has an owner.
  * This contract has an owner that can add others wallets to become admins and be able to use it
  * too.
  * The files inserted can be verified by other admin as a signature that this content was checked 
  * and passed. A file is consedered verified when it has been verified by a minimum number of
  * admins especified when publishing contract.
  */


library ClassificationLib {
    // -------- Variables ----------- //
    using SafeMath for uint256;

    struct Classification {
	bool hasClassifiedFile;
	uint classification;
	uint totalVerifyClass;
	bool classVerified;
	mapping(address => bool) hasVerifiedClass;
        address owner;
    }

  
    // ---------- Events --------------- //

    event ClassificationDone(address indexed user,bytes32 indexed fileId,string fileIpfs,uint indexed class);
    event ClassificationVerifiedBy(address indexed admin,address indexed user,bytes32 indexed fileId,string ipfsFile,uint classification,uint totalVerifications);
    event ClassificationIsVerified(address indexed user,bytes32 indexed fileId,string ipfsFile,uint classification);

    // ----------- Functions ----------- //


    function classifyFile(Classification storage c,bytes32 _fhash,string memory _ipfs,uint _class)
		public {
         c.hasClassifiedFile = true;
	 c.classification = _class;
         c.owner = msg.sender;
         emit ClassificationDone(msg.sender,_fhash,_ipfs,_class);

    }


    function verifyClassification(Classification storage c,address _addr,bytes32 _fileId,string memory _ipfs) 
	public {
	 c.totalVerifyClass = c.totalVerifyClass.add(1);
	 c.hasVerifiedClass[msg.sender] = true;
	 emit ClassificationVerifiedBy(msg.sender,_addr,_fileId,_ipfs,c.classification,c.totalVerifyClass);
    }


    function setVerified(Classification storage c,address _addr,bytes32 _fileId,string memory _ipfs) public {
	c.classVerified = true;
	emit ClassificationIsVerified(_addr,_fileId,_ipfs,c.classification);
    }
   
}
