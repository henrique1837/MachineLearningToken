pragma solidity ^0.5.0;

import "./RestrictFileStore.sol";
import "./FileVerificationLib.sol";

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


contract RestrictAssignableFileStore is RestrictFileStore{
    // -------- Variables ----------- //
    
    uint public minimumSignatures; 
    mapping(bytes32 => FileVerificationLib.Signature) internal signatures;

 
    // ---------- Events --------------- //

    event AdminSignFile(address indexed admin,string ipfs,uint totalSignatures);
    event FileVerified(address indexed fileOwner,string ipfs);

    // ----------- Functions ----------- //

    constructor(uint _minimumSignatures) public RestrictFileStore() {
      require(_minimumSignatures > 0);
      minimumSignatures = _minimumSignatures;
    }

    /** @dev Allow admin to verify some file content that is not from him.
      * @param _ipfs IPFS hash keccak256 generated when adding file in IPFS.
      * @return bool True if file has been verified
      */


    function verifyFile(string memory _ipfs)
             public
             whenNotPaused
             onlyWhitelistAdmin
             returns(bool){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
	FileStoreLib.File storage f = files[fhash];
        FileVerificationLib.Signature storage s = signatures[fhash];
        require(f.hasOwner == true && 
                f.owner != msg.sender &&
                s.isVerified == false &&
                s.hasSigned[msg.sender] == false);
        FileVerificationLib.verifyFile(s,f.owner,_ipfs,minimumSignatures);
        return(true);
    }

    /** @dev Return wallets that have verified a file.
      * @param _ipfs IPFS hash generated when adding file in IPFS.
      * @return address[] Wallets that verified the file.
      */

   function getFileSignatures(string memory _ipfs) public view returns(address[] memory){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
        FileVerificationLib.Signature storage s = signatures[fhash];
        return(s.signatures);
   }

    /** @dev Check if file is verified.
      * @param _ipfs IPFS hash generated when adding file in IPFS.
      * @return bool True if file is verified.
      */

   function isVerified(string memory _ipfs) public view returns(bool){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
        FileVerificationLib.Signature storage s = signatures[fhash];
        return(s.isVerified);
   } 

}
