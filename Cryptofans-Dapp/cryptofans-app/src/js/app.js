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
  //0xC5Bdf71E29E4E4e3dEA87568CBd8503A2418f958
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
       App.contracts.Cryptofans = TruffleContract(data);
       App.contracts.Cryptofans.setProvider(App.web3Provider);
       console.log("init finished")
       return App.bindEvents();
     });
   }, 
   
   bindEvents: function() {  
     //subs.html + subs_func.html
     $(document).on('click', '#sub_reg', function(){
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
      App.handleCreate(jQuery('#create_name').val(),jQuery('#create_cost').val(),jQuery('#create_period').val(),jQuery('#create_desc').val());
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
      web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then( function(instance) {
        cfans_instance=instance;
        console.log("contract instance formed- subscribers reg");
        return cfans_instance.registerasSubscriber({from: account});
      }).then(function(result, err){
            if(result){
                console.log("function registered as subscriber");
                if(parseInt(result.receipt.status) == 1)
                alert(account + " reg done successfully")
                else
                alert(account + " reg not done successfully due to revert")
            } else {
                alert(account + " reg failed")
            }   
        });
    });
  },

  handleProvReg:function(){
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then( function(instance) {
        cfans_instance=instance;
        console.log("contract instance formed- providers reg");
        return cfans_instance.registerasProvider({from: account});
      }).then(function(result, err){
            if(result){
                console.log("function registered as a provider");
                if(parseInt(result.receipt.status) == 1)
                alert(account + " reg done successfully")
                else
                alert(account + " reg not done successfully due to revert")
            } else {
                alert(account + " reg failed")
            }   
        });
    });
  },

  handleFind:function(SubscriptionName){
    subnameto32=ethers.utils.formatBytes32String(SubscriptionName);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then( function(instance) {
        cfans_instance=instance;
        return cfans_instance.findSubscription(subnameto32, {from: account});
      }).then(function(result, err){
            if(result){
                console.log("proposal found");
                if(parseInt(result.receipt.status) == 1)
                alert(account + " prop found successfully")
                else
                alert(account + " finding not done successfully due to revert")
            } else {
                alert(account + " finding failed")
            }   
        });
    });
  },
  handleUnsub:function(subs_name){
    var str32name;
    str32name=ethers.utils.formatBytes32String(subs_name);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.unsub_to_plan(str32name ,{from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          console.log("unsubbed");
          if(parseInt(result.receipt.status) == 1)
          alert(account + " unsubbing done successfully")
          else
          alert(account + " unsubbing not done successfully due to revert")
      } else {
          alert(account + " unsubbing failed")
      }  
      });
    });
  },
  handleSub:function(subs_name){
    var str32name;
    str32name=ethers.utils.formatBytes32String(subs_name);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.sub_to_plan(str32name,  {from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          console.log("subbed");
          if(parseInt(result.receipt.status) == 1)
          alert(account + " subbing done successfully")
          else
          alert(account + " subbing not done successfully due to revert")
      } else {
          alert(account + " subbing failed")
      }  
      });
    });
  },
  handleAccess:function(subs_name){
    var str32name;
    str32name=ethers.utils.formatBytes32String(subs_name);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.accessSubscription(str32name,  {from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          console.log("access done");
          if(parseInt(result.receipt.status) == 1)
          alert(account + " access done successfully")
          else
          alert(account + " access not done successfully due to revert")
      } else {
          alert(account + " access failed")
      }  
      });
    });
  },
  handleCreate:function(str1, amnt, prd, desc){
    var str32name;
    var weitoEth;
    var desc_32;
    var periodsecs;
    var accessinstance;
    str32name=ethers.utils.formatBytes32String(str1);
      weitoEth=amnt*value;
      if(prd=="month"){
          periodsecs=2628000;
      }
      if(prd=="year"){
        periodsecs=31536000;
      }
      desc_32=ethers.utils.formatBytes32String(desc);
      web3.eth.getAccounts( function(error, accounts){
        var account = accounts[0];
        App.contracts.Cryptofans.deployed().then(function (instance) {
        accessinstance=instance;
        return accessinstance.createSubscription(str32name,weitoEth, desc_32, periodsecs, {from: account}); // added from parameter
        }).then(function (result) {
          if(result){
            console.log("proposal loaded");
            if(parseInt(result.receipt.status) == 1)
            alert(account + " voting done successfully")
            else
            alert(account + " voting not done successfully due to revert")
        } else {
          alert("creation failed")
        }  
        });
      });
  },
  
  handleToggle:function(props_name){
    var str32name;
    str32name=ethers.utils.formatBytes32String(props_name);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.on_off_switch(str32name,  {from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          if(parseInt(result.receipt.status) == 1)
          alert(account + " toggle done successfully")
          else
          alert(account + " toggle not done successfully due to revert")
      } else {
          alert(account + " toggle failed")
      }  
      });
    });
  },
  handleView: function(props_name){
    var str32name;
    str32name=ethers.utils.formatBytes32String(props_name);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.view_subs(str32name,  {from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          console.log(result)
          if(parseInt(result.receipt.status) == 1)
          alert(" view done")
          else
          alert(account + " view not done successfully due to revert")
      } else {
          alert(account + " view failed")
      }  
      });
    });
  },
  handleTransfer:function(addr, amount){
    // function invoked after claiming payments
    //toHex conversion to support big numbers
    var weiamount=App.web3.utils.toWei(amount,'ether');
    var amount=App.web3.utils.toHex(weiamount);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.collect(addr, weiamount,  {from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          console.log("proposal loaded");
          if(parseInt(result.receipt.status) == 1)
          alert(account + " transfer done successfully")
          else
          alert(account + " transfer not done successfully due to revert")
      } else {
          alert(account + " transfer failed")
      }  
      });
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

