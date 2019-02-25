pragma solidity ^0.5.0;

import "./FileStore.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/access/roles/WhitelistAdminRole.sol";


/** @title RestrictFileStore.
  * @dev The RestrictFileStore Contract refer some IPFS hash to an wallet that is allowed to do it.
  * An IPFS hash should not be able to be inserted in the File struct when it already has an owner.
  * This contract has an owner that can add others wallets to become admins and be able to use it
  * too.
  */


contract RestrictFileStore is FileStore,WhitelistAdminRole,Pausable,Ownable{
   
    // ----------- Functions ----------- //
    
    /** @dev The RestrictFileStore constructor set the owner as an admin because
      * inhirit WhitelistAdminRole contract
      */    

    constructor() public {
      
    }

    /** @dev Allow an wallet to refer some IPFS hash to itself if it is an admin    (onlyWhitelistAdmin condition)
      * inside contract, the contract is not paused and the file has no owner.
      * @param _ipfs is the ipfs hash generated when adding file in IPFS.
      * @param _name is a string that user has used to name the content in IPFS.
      * @return uint that is the fileId for the wallet that called the function
      */

    function addFile(string memory _ipfs,string memory _name)
             public
             hasNotOwner(FileStoreLib.getHash(_ipfs))
             whenNotPaused
             onlyWhitelistAdmin
             returns(uint){
        uint idFile = super.addFile(_ipfs,_name);
        return(idFile);
    }

  

    /** @dev Remove some wallet as admin if it not the owner itself.
      * @param _addr The wallet to be removed as admin.
      * @return bool True if wallet has been removed, false if not.
      */

    function removeAdmin(address _addr)
              public
              onlyOwner
              returns(bool) {
      require(isWhitelistAdmin(_addr) == true && _addr != owner());
      _removeWhitelistAdmin(_addr);
      return(true);
    }

    /** @dev Remove some wallet as pauser if is not the owner itself.
      * @param _addr The wallet to be removed as pausable.
      * @return bool True if wallet has been removed, false if not.
      */

    function removePauser(address _addr)
              public
              onlyOwner
              returns(bool) {
      require(isPauser(_addr) == true && _addr != owner());
      _removePauser(_addr);
      return(true);
    }

}
