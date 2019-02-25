
App = {
  web3Provider: null,
  contracts: {},
  root: $("#root"),
  menu: $("#menu"),
  userInfo: $("#userInfo"),
  pageText: $("#page_text"),
  transactionInfo: $("#transactionInfo"),
  ipfs: window.IpfsApi({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }),
  sectionContractUse: 
		       "<div class='row'>"+
 			"<div id='div_userFiles'>"+
			 
		           
			   "<div class='row' id='userFiles'>"+
			      "<h4>Articles</h4>"+
			      "<div class='table-responsive'>"+
				  "<table class='table table-hover' id='c_table'>"+
				      "<thead>"+
				          "<tr>"+
				            "<th>IPFS Hash</th>"+
				          "</tr>"+
				      "</thead>"+
				       "<tbody id='t_events'>"+
				       "</tbody>"+
				   "</table>"+
				"</div>"+
			    "</div>"+

			    
			   "</div>"+

		          "</div>"+

			  "<div class='row'>"+
                            "<h3>Aplication</h3>"+
		            "<center class='col-sm-9' id='file_content'></center>"+
		            "<div class='col-sm-3'>"+
				"<h4>Classify file</h4>"+
	  			"<p>Use this section to classify a file from IPFS</p>"+
				"<div class='div_input'>"+
					"<label class='label label-default' for='input_hash'>IPFS hash</label>"+
                  	   	    	"<input id='input_hash' type='text'>"+
				    "</div>"+
				 "<div class='div_input'>"+
					    "<label class='label label-default' for='input_class'>Classification</label>"+
					    "<select id='input_class'>"+
						    "<option value='0'>Bad</option>"+
						    "<option value='1'>Good</option>"+
						    "<option value='2'>Neutral</option>"+
					    "</select>"+
		  			    
				 "</div>"+
				
				"<div><button id='addIPFShashClass' class='btn'>Add classification to contract</button></div>"+
			     "</div>"+
			    
				    
		           "</div>",
  init: async function() {
    return(await App.initWeb3());
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
	return(App.root.html("<div class='alert alert-danger alert-dismissible' role='alert'>"+
		  	                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					    "<span aria-hidden='true'>&times;</span>"+
					  "</button>"+
					"<p>In order to use the dApp you need to confirm account access</p>"+
				    "</div>"));
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      return(App.root.html("<div class='alert alert-danger alert-dismissible' role='alert'>"+
		  	                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					    "<span aria-hidden='true'>&times;</span>"+
					  "</button>"+
					"<p>In order to use the dApp you need to install <a href='https://metamask.io/' target='_blank'>metamask</a> browser extension</p>"+
				    "</div>"));
    }
    return(App.initContract());
  },

  initContract: async function() {

    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var ClassificatorArtifact = await $.getJSON('Classificator.json');
    App.contracts.Classificator = TruffleContract(ClassificatorArtifact);

    // Set the provider for our contract
    App.contracts.Classificator.setProvider(App.web3Provider);
    App.transactionInfo.html("");
    App.root.html('<center><i class="fas fa-sync fa-spin fa-10x"></i></center>');
    App.userInfo.html("");
    App.renderMenu();
    return(App.renderHome());
  },

  renderArticle: async function(){
    // Render preview of file in IPFS //
    $("#file_content").html("IPFS: getting file ...")
    const ipfs = App.ipfs;
    const ipfsHash = $(this).html();
    console.log(ipfsHash);
    $("#input_hash").val(ipfsHash);
    // const stream = ipfs.catReadableStream(ipfsHash);
    // console.log(stream)
    var buffer = await App.ipfs.cat(ipfsHash);
    var obj = JSON.parse(buffer.toString());
    $("#file_content").html("<p>File Hash: <a href='https://ipfs.io/ipfs/"+ipfsHash+"' target='_blank'>"+ipfsHash+"</a></p>"+
                            "<h4>File Preview</h4>"+
                            "<div class='row' style='text-align: left;'>"+
				"<h4>"+obj.title+"</h4>"+
				"<p> Date: "+obj.date+"</p>"+
				"<p> Link: <a href='"+obj.link+"' target='_blank'>"+obj.link+"</a></p>"+
				obj.article+
			     "</div>");

     
  },

  
  // Verify if IPFS hash is ok //
  verifyIPFSHash:  function(ipfsHash){
	
	// For directory the ipfs.cat does not work //
	if((ipfsHash[0]+ipfsHash[1]) == "Qm" && ipfsHash.length == 46 ) {
              var isIPFSHash = true;  
        } else {
              var isIPFSHash = false;
	}	
        return(isIPFSHash);
  },
  // addClassification method //
  addClass: async function(fsContract,ipfsHash,classification){
	var web3 = new Web3(App.web3Provider);
        const filestoreInstance = await fsContract.deployed();
        var isIPFSHash = App.verifyIPFSHash(ipfsHash);
        if(isIPFSHash){
	    // Ask to confirm transaction //
	    App.transactionInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>File hash: "+ipfsHash+"</p>"+
 						"<p>Classification: "+classification+"</p>"+
						'<p>Confirm transaction <i class="fas fa-sync fa-spin fa-2x"></i> </p>'+
			  	                
					    "</div>");
             try{

		  var transaction = await filestoreInstance.classifyFile(ipfsHash,classification,{from:web3.eth.coinbase})

		  // Show message that transaction has been submited and waiting for 1 confirmation //
		  App.transactionInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>File hash: "+ipfsHash+"</p>"+
 						"<p>Classification: "+classification+"</p>"+
						"<p>Transaction hash: "+transaction.tx+" waiting 1 confirmation <i class='fas fa-sync fa-spin fa-2x'></i> </p></p>"+
			  	                
					    "</div>");

		// Clear inputs //
           	$('#input_hash').val("");
	       // Verify if transaction has been confirmed //
               interval = setInterval(function(){
		       web3.eth.getTransactionReceipt(transaction.tx, function(err,res){
			if(res.blockNumber != null){
			   // Show that transaction has been confirmed //
		  	   App.transactionInfo.html("<div class='alert alert-success alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>File hash: "+ipfsHash+"</p>"+
						"<p>Classification: "+classification+"</p>"+
						"<p>Transaction hash: "+transaction.tx+" confirmed </p></p>"+
			  	                
					    "</div>");
			   // Show contract events and stop interval //
			   App.getFilesVerified(fsContract)
			   clearInterval(interval); 
			}
		       });
	       },3000);
	     } catch(err){
		// Transaction refused //
		App.transactionInfo.html("<div class='alert alert-danger alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>Transaction refused</p>"+
			  	                
					    "</div>");
	     }

        } else {
		// Display message that hash is not ipfs hash //
		return(App.transactionInfo.html("<div class='alert alert-danger alert-dismissible' role='alert'>"+
			  	                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						    "<span aria-hidden='true'>&times;</span>"+
						  "</button>"+
						 "<p>Error when checking IPFS hash</p>"+
					    "</div>"));
	}
        $('.alert').alert();

  },
  // getFilesVerified //
  getFilesVerified: async function(fsContract) {
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();

   // Check FileUploaded event //
   var event = filestoreInstance.FileVerified({},
                                              { fromBlock: 0, toBlock: 'latest' });

   
   $("#file_content").html("");
   $("#t_events").html('<center><i class="fas fa-sync fa-spin fa-5x"></i></center>');
   
   await App.renderInfo(fsContract);
   await event.get(async function(err, res){
      if (err){
        console.log('Error in FileVerified event handler: ' + err);
        throw(err);
      } else {
        try{
          $("#t_events").html('');
          console.log(res);
		  
          for(i=0;i<res.length;i++){
             var ipfsHash = res[i].args.ipfs;
	     console.log(ipfsHash);
             var hasClass = await filestoreInstance.hasClassified(web3.eth.coinbase,ipfsHash)
             console.log(hasClass);
             if(!hasClass){
		  $("#t_events").append("<tr>"+
						"<td><a href='#file_content' class='a_ipfs' >"+ipfsHash+"</a></td> "+
					"</tr>");

             }


		

	   }
           $(".a_ipfs").click(App.renderArticle);
  
        } catch(error){
          $("#t_events").html('');
          console.log(error);
        }


      }

    });

    
    //$("#c_table").DataTable();

  },

  getFilesClassified: async function(fsContract){
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();
    $("#t_events").html('<center><i class="fas fa-sync fa-spin fa-5x"></i></center>');
    // Check FileUploaded event //
    var event = filestoreInstance.ClassificationDone({user:web3.eth.coinbase},
                                                     { fromBlock: 0, toBlock: 'latest' });
    await event.get(async function(err,res){
     $("#t_events").html(""); 
     if(res.length > 0){
	console.log(res);
        for(i=0;i<res.length;i++){
             var ipfsHash = res[i].args.fileIpfs;
             var classification = res[i].args.class;
	     console.log(ipfsHash);
             var verified = await filestoreInstance.isClassificationVerified(web3.eth.coinbase,ipfsHash);

	     $("#t_events").append("<tr>"+
						"<td><a href='https://cloudflare-ipfs.com/ipfs/"+ipfsHash+"' target='_blank' >"+ipfsHash+"</a></td> "+			"<td>"+classification.toString()+"</td>"+
						"<td>"+verified+"</td> "+
				   "</tr>");



		

	 }
         //$(".a_ipfs").click(App.renderArticle);
      }

    });


  },
 
  // Register in contract

  register: async function(fsContract){
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();
    // Ask to confirm transaction // 
    App.transactionInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						'<p>Confirm transaction <i class="fas fa-sync fa-spin fa-2x"></i> </p>'+
			  	                
					    "</div>");
    try{
       var transaction = await filestoreInstance.register();
       // Show message that transaction has been submited and waiting for 1 confirmation //
       App.transactionInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>Registration</p>"+
						"<p>Transaction hash: "+transaction.tx+" waiting 1 confirmation <i class='fas fa-sync fa-spin fa-2x'></i> </p></p>"+
			  	                
					    "</div>");


     // Verify if transaction has been confirmed //
     interval = setInterval(function(){
		       web3.eth.getTransactionReceipt(transaction.tx, function(err,res){
			if(res.blockNumber != null){
			   // Show that transaction has been confirmed //
		  	   App.transactionInfo.html("<div class='alert alert-success alert-dismissible' role='alert'>"+

						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>You are registered</p>"+
						"<p>Transaction hash: "+transaction.tx+" confirmed </p></p>"+
			  	                
					    "</div>");
			   clearInterval(interval); 
			}
		       });
       },3000);
       App.renderInfo(fsContract);
    }catch(err){

    }
    $('.alert').alert();
  },

  // GETTER FUNCTIONS //
  getContractAddress: async function(fsContract){
    const fs = await fsContract.deployed();
    var address = fs.address
    return(address);

  },
  isAdmin: async function(fsContract,wallet){
    const fs = await fsContract.deployed();
    var isAdmin = await fs.isWhitelistAdmin(wallet);
    return(isAdmin)
  },

  isRegistered: async function(fsContract,wallet){
    const fs = await fsContract.deployed();
    var isUser = await fs.isWhitelisted(wallet);
    return(isUser)
  },

  isVerifiedUser: async function(fsContract,wallet){
    const fs = await fsContract.deployed();
    var isVerifiedUser = await fs.isVerifiedUser(wallet);
    return(isVerifiedUser)
  },

  // ---------------//

  // ---------------//
  
  // ---------------//

  // Render Info //

  renderInfo: async function(fsContract){
    var web3 = new Web3(App.web3Provider);
    var isAdmin = await App.isAdmin(fsContract,web3.eth.coinbase);
    var isRegUser = await App.isRegistered(fsContract,web3.eth.coinbase);
    var isVerifiedUser = await App.isVerifiedUser(fsContract,web3.eth.coinbase);
    var contractAddress = await App.getContractAddress(fsContract)
    App.userInfo.html("<div class='row'>"+
		        "<p>Your wallet: "+web3.eth.coinbase+"</p>"+
			"<p>Classificator contract address: "+contractAddress+"</p>"+
 			"<p>isAdmin: "+isAdmin+"</p>"+
			"<p>isRegistered User: "+isRegUser+"</p>"+
			"<p>isVerified User: "+isVerifiedUser+"</p>"+
		      "</div>");
  },
  // Render menu for aplication and bind events //
  renderMenu: function(){
    // Render menu //
    App.menu.html('<nav class="navbar navbar-inverse">'+
                    '<div class="container">'+
                      '<div class="navbar-header">'+
                        '<a class="navbar-brand" href="#">Classificator</a>'+
                     '</div>'+
                      '<ul class="nav navbar-nav">'+
                        '<li><a id="a_cf">Classify Files</a></li>'+
                        '<li><a id="a_ycf">Your classifications</a></li>'+
			//'<li><a id="a_ycf">Classifications Verified</a></li>'+
			'<li><a id="a_reg">Register</a></li>'+
                      '</ul>'+
                    '</div>'+
                  '</nav>');
    // Menu events //
    $("#a_cf").click(App.renderHome);
    $("#a_reg").click(App.renderRegister);
    $("#a_ycf").click(App.renderFilesClassified);
  },
 

  // Render home of aplication//

  renderHome: async function(){
    var web3 = new Web3(App.web3Provider);
    App.pageText.html("File Classificator");
    App.transactionInfo.html("");
    var isVerifiedUser = await App.isVerifiedUser(App.contracts.Classificator,web3.eth.coinbase);
    if(!isVerifiedUser){
	    App.transactionInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>You need to be verified user to classify files</p>"+
			  	                
					    "</div>");

    }
    await App.renderInfo(App.contracts.Classificator);
    App.root.html(App.sectionContractUse);
    $("#addIPFShashClass").click(function(){
	App.addClass(App.contracts.Classificator,
		        $("#input_hash").val(),
 			$("#input_class").val());
    });
    
    await App.getFilesVerified(App.contracts.Classificator);
  },

  // Render registration page //
  renderRegister: async function(){
        var web3 = new Web3(App.web3Provider);
        App.transactionInfo.html("");
        var isUser = await App.isRegistered(App.contracts.Classificator,web3.eth.coinbase);
        var isAdmin = await App.isAdmin(App.contracts.Classificator,web3.eth.coinbase);
	App.pageText.html("Registration");
        if(!isUser && !isAdmin){
		App.root.html("<button id='b_reg' class='btn'>Register</button>");
		$("#b_reg").click(function(){
			App.register(App.contracts.Classificator);
		});
        } else if(isAdmin){
		App.root.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>You are admin</p>"+
				"</div>");
        } else{
		App.root.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>You are registered</p>"+
				"</div>");
	}

	
  },
  // Render FilesClassified page //
  renderFilesClassified: async function(){
    var web3 = new Web3(App.web3Provider);
    App.pageText.html("Files Classified");
    App.transactionInfo.html("");
    App.root.html("");
    var isVerifiedUser = await App.isVerifiedUser(App.contracts.Classificator,web3.eth.coinbase);
    if(!isVerifiedUser){
	    App.transactionInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>You need to be verified user to classify files</p>"+
			  	                
					    "</div>");

    }
    await App.renderInfo(App.contracts.Classificator);
    App.root.html( "<div class='row'>"+
 			"<div id='div_userFiles'>"+
			 
		           
			   "<div class='row' id='userFiles'>"+
			      "<h4>Files Classified</h4>"+
			      "<div class='table-responsive'>"+
				  "<table class='table table-hover' id='c_table'>"+
				      "<thead>"+
				          "<tr>"+
				            "<th>IPFS Hash</th>"+
					    "<th>Classification</th>"+
					    "<th>Verified</th>"+
				          "</tr>"+
				      "</thead>"+
				       "<tbody id='t_events'>"+
				       "</tbody>"+
				   "</table>"+
				"</div>"+
			    "</div>"+

			    
			   "</div>"+

		          "</div>");
    await App.getFilesClassified(App.contracts.Classificator);	
  }
  
};

$(function() {
  $(window).load(function() {
    $("#b_load").click(function(){
	App.init();
    });
    window.ethereum.on('accountsChanged', function () {
	  App.init();
    });
    window.ethereum.on('networkChanged', function () {
        App.init();
    });
  });
});
