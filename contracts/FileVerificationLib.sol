pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/** @title FileVerificationLib.
  * @dev The FileVerificationLib Library refer some IPFS hash to an wallet 
  * An IPFS hash should not be able to be inserted in the File struct when it already has an owner.
  * This contract has an owner that can add others wallets to become admins and be able to use it
  * too.
  * The files inserted can be verified by other admin as a signature that this content was checked 
  * and passed. A file is consedered verified when it has been verified by a minimum number of
  * admins especified when publishing contract.
  */


library FileVerificationLib {
    // -------- Variables ----------- //
    using SafeMath for uint256;

    struct Signature{
      address[] signatures;
      mapping(address => bool) hasSigned;
      uint totalSignatures;
      bool isVerified;
    }
 
    event AdminSignFile(address indexed admin,string ipfs,uint totalSignatures);
    event FileVerified(address indexed fileOwner,string ipfs);
 
    /** @dev Allow to verify some file content that is not from the same wallet.
      * @param s Signature struct.
      * @param _ipfs IPFS hash keccak256 generated when adding file in IPFS.
      * @return bool True if file has been verified
      */

    function verifyFile(Signature storage s,address fileowner,string memory _ipfs,uint _minimumSignatures)
             public
             returns(bool){
        s.signatures.push(msg.sender);
        s.totalSignatures = s.totalSignatures.add(1);
        emit AdminSignFile(msg.sender,_ipfs,s.totalSignatures);        
	if(s.totalSignatures == _minimumSignatures){
	   s.isVerified	= true;
           emit FileVerified(fileowner,_ipfs);
	}
        return(true);
    }

}
