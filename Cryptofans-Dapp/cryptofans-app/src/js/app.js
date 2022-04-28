App = {
  web3Provider: null,
  contracts: {},
  currentAccount:null,
  url: 'http://127.0.0.1:7545',
  network_id: 5777, // for local,
  handler:null,
  value:1000000000000000000,
  init: function() {
    console.log("Checkpoint 0");
    return App.initWeb3();
  },

  initWeb3: function () {
    // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    console.log("Checkpoint 1");
    ethereum.enable();//ex
    return App.initContract();
  },

  initContract: function() { 
    // let deploy_cont = new web3.eth.Contract(JSON.parse(abi))
    console.log("Checkpoint 2");
     $.getJSON('Cryptofans.json', function (data) {
       console.log(TruffleContract("Cryptofans"));
       App.contracts.Cryptofans = TruffleContract(data);
       App.contracts.Cryptofans.setProvider(App.web3Provider);
       console.log("init finished")
       return App.bindEvents();
     });
   }, 
   
   bindEvents: function() {  
     //subs.html + subs_func.html
     $(document).on('click', '#sub_reg', function(){
       console.log("press");
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleSubReg();
   });
     $(document).on('click', '#sub_find', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleFind(jQuery('#sub_namesub').val());
   });
     $(document).on('click', '#sub_plan', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleSub(jQuery('#sub_namesub1').val());
   });
     $(document).on('click', '#sub_access', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleAccess(jQuery('#sub_namesub2').val());
   });
     $(document).on('click', '#unsub_plan', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleUnsub(jQuery('#sub_namesub3').val());
   });
     //prov.html + prov_func.html
     $(document).on('click', '#prov_reg', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleProvReg();
   });
     $(document).on('click', '#prov_create', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleCreate(jQuery('#create_name').val(),jQuery('#create_cost').val(),jQuery('#create_period').val(),jQuery('#create_desc').val(),);
   });
     $(document).on('click', '#prov_onoff', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleToggleS(jQuery('#sub_toggle').val());
   });
     $(document).on('click', '#prov_view', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleView(jQuery('#sub_toview').val());
   });
     $(document).on('click', '#prov_collect', function(){
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleTransfer(jQuery('#eth_coll_add').val(),jQuery('#eth_amount').val());
   });
   },

   populateAddress : async function(){
    // App.handler=App.web3.givenProvider.selectedAddress;
      return await ethereum.request({method : 'eth_requestAccounts'});
  },  
  

  handleSubReg: function(){
    console.log("called handler");
    console.log(App.web3);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then( function(instance) {
        cfans_instance=instance;
        console.log("contract instance formed")
        return cfans_instance.registerasSubscriber({from: account});
      }).then(function(result, err){
            if(result){
                console.log("function registered");
                if(parseInt(result.receipt.status) == 1)
                alert(account + " voting done successfully")
                else
                alert(account + " voting not done successfully due to revert")
            } else {
                alert(account + " voting failed")
            }   
        });
    });
    /*(*App.contracts.Cryptofans.methods.registerasSubscriber.call().then((receipt)=>{
      if(receipt.status){
        console.log("success")
    }})
    .on('error',(err)=>{
      console.log("error");
    })*/
  },

  handleProvReg:function(addr){
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then( function(instance) {
        cfans_instance=instance;
        console.log("instance created");
        return cfans_instance.registerasSubscriber({from: account});
      }).then(function(result, err){
            if(result){
                console.log("function registered");
                if(parseInt(result.receipt.status) == 1)
                alert(account + " voting done successfully")
                else
                alert(account + " voting not done successfully due to revert")
            } else {
                alert(account + " voting failed")
            }   
        });
    });
  },
  handleFind:function(SubscriptionName){
    if (SubscriptionName===''){
      alert("Please enter a subscription name.")
      return false
    }
    var strname32;
    strname32=ethers.utils.formatBytes32String(SubscriptionName);
    App.contracts.Cryptofans.methods.findSubscription(strname32).call().on('receipt',(receipt)=> {
      if(receipt.status){
        console.log("subscription found")
    }})
  },
  handleUnsub:function(){
    var str32name;
    var accessinstance;
    App.contracts.Cryptofans.deployed().then(function (instance, str) {
      accessinstance=instance;
      str32name=ethers.utils.formatBytes32String(str);
      return accessinstance.unsub_to_plan(strname); // added from parameter
    }).then(function (result) {
      console.log(result);
    }).catch(function (err) {
      console.log(err.message);
    });
  },
  handleSub:function(){
    var str32name;
    var accessinstance;
    App.contracts.Cryptofans.deployed().then(function (instance, str) {
      accessinstance=instance;
      str32name=ethers.utils.formatBytes32String(str);
      return accessinstance.sub_to_plan(strname); // added from parameter
    }).then(function (result) {
      console.log(result);
    }).catch(function (err) {
      console.log(err.message);
    });
  },
  handleAccess:function(){
    var str32name;
    var accessinstance;
    App.contracts.Cryptofans.deployed().then(function (instance, str) {
      accessinstance=instance;
      str32name=ethers.utils.formatBytes32String(str);
      return accessinstance.accessSubscription(strname); // added from parameter
    }).then(function (result) {
      console.log(result);
    }).catch(function (err) {
      console.log(err.message);
    });
  },
  handleCreate:function(){
    var str32name;
    var weitoEth;
    var desc_32;
    var periodsecs;
    var accessinstance;
    App.contracts.Cryptofans.deployed().then(function (instance, str1, amnt, prd, desc) {
      accessinstance=instance;
      str32name=ethers.utils.formatBytes32String(str1);
      weitoEth=amnt*value;
      if(prd=="month"){
          periodsecs=2628000;
      }
      if(prd=="year"){
        periodsecs=31536000;
      }
      desc_32=ethers.utils.formatBytes32String(str1);
      return accessinstance.createSubscription(str32name,weitoEth,periodsecs,desc_32); // added from parameter
    }).then(function (result) {
      console.log(result);
    }).catch(function (err) {
      console.log(err.message);
    });
  },
  handleToggle:function(){
    App.contracts.Cryptofans.methods.on_off_switch().call().on('receipt',(receipt)=> {
      if(receipt.status){
        console.log("subscription toggled.")
    }})
  },
  handleView:function(){
    var str32name;
    var accessinstance;
    App.contracts.Cryptofans.deployed().then(function (instance, str) {
      accessinstance=instance;
      str32name=ethers.utils.formatBytes32String(str);
      return accessinstance.view_subs(strname); // added from parameter
    }).then(function (result) {
      console.log(result);
    }).catch(function (err) {
      console.log(err.message);
    });
  },
  handleTransfer:function(amount){
    // function invoked after claiming payments
    //toHex conversion to support big numbers
    var weiamount=App.web3.utils.toWei(amount,'ether')
    var amount=App.web3.utils.toHex(weiamount)
    var option={from:App.receiver}
    App.contracts.Cryptofans.methods.collect(amount).send(option).on('receipt', (receipt) => {
      if(receipt.status){
          App.populateAddress();
          App.web3.eth.getBalance(App.contracts.Cryptofans.getBalance).then((res)=>{ jQuery('#eth_coll_amount').text(App.web3.utils.fromWei(res),"ether");})                                
        }
      else{
        console.log("Error in transfer");
        }
      })
    .on('error',(err)=>{
      if(err.message.indexOf('Signed')!=-1){
        console.log("Error: Not a valid signed message");
        return false;
      }else if(err.message.indexOf('recipient')!=-1){
        console.log("Error: Not an intended recipient");
        return false;
      }else if(err.message.indexOf('Insufficient')!=-1){
        console.log("Error: Insufficient funds");
        return false;
      }else{
        console.log("error");
        return false;
      }
    });  
},

abi:[
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "prop_h",
				"type": "bytes32"
			}
		],
		"name": "accessSubscscription",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newholder",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "collect",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "name",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "cost",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "period",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"name": "createSubscription",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "searchName",
				"type": "bytes32"
			}
		],
		"name": "findSubscription",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "prop_h",
				"type": "bytes32"
			}
		],
		"name": "on_off_switch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "prop_h",
				"type": "bytes32"
			}
		],
		"name": "pay",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "registerasProvider",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "registerasSubscriber",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "prop_h",
				"type": "bytes32"
			}
		],
		"name": "sub_to_plan",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "prop_h",
				"type": "bytes32"
			}
		],
		"name": "unsub_to_plan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "prop_h",
				"type": "bytes32"
			}
		],
		"name": "view_subs",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
}
    
$(function() {
  $(window).load(function() {
    App.init();
  });
});

window.ethereum.on('accountsChanged', function (){
  location.reload();
})

