App = {
  web3Provider: null,
  receiver: null,
  contracts: {},
  currentAccount:null,
  url: 'http://127.0.0.1:7545',
  network_id: 5777, // for local,
  handler:null,
  value:1000000000000000000,
  init: function() {
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
    ethereum.enable();//ex
    return App.initContract();
  },

  initContract: function() { 
    // let deploy_cont = new web3.eth.Contract(JSON.parse(abi))
     $.getJSON('Cryptofans.json', function (data) {
       App.contracts.Cryptofans = TruffleContract(data);
       App.contracts.Cryptofans.setProvider(App.web3Provider);
       console.log("init finished")
       return App.bindEvents();
     });
   }, 
   
   bindEvents: function() {  
     //subs.html + subs_func.html
     $(document).on('click', '#sub_reg', function(){// working
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleSubReg();
   });
     $(document).on('click', '#sub_find', function(){// working
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleFind(jQuery('#sub_namesub').val());
   });
     $(document).on('click', '#sub_plan', function(){// NEEDS IMPLEMENTATION
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleSub(jQuery('#sub_namesub1').val());
   });
     $(document).on('click', '#sub_access', function(){// NEEDS IMPLEMENTATION
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleAccess(jQuery('#sub_namesub2').val());
   });
     $(document).on('click', '#unsub_plan', function(){//working when sub_plan works
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleUnsub(jQuery('#sub_namesub3').val());
   });

     //prov.html + prov_func.html
     $(document).on('click', '#prov_reg', function(){//working
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleProvReg();
   });
     $(document).on('click', '#prov_create', function(){//working
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleCreate(jQuery('#create_name').val(),jQuery('#create_cost').val(),jQuery('#create_period').val(),jQuery('#create_desc').val());
   });
     $(document).on('click', '#prov_onoff', function(){//working
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleToggle(jQuery('#sub_toggle').val());
   });
     $(document).on('click', '#prov_view', function(){//working
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleView(jQuery('#sub_toview').val());
   });
     $(document).on('click', '#prov_collect', function(){//NEEDS IMPLEMENTATION
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleTransfer(jQuery('#eth_coll_add').val(), jQuery('#eth_amount').val());
   });
      $(document).on('click', '#get_balance', function(){//fortesting
      App.populateAddress().then(r => App.handler = r[0]);
      App.handleBalance();
 });
   },

   populateAddress : async function(){
    // App.handler=App.web3.givenProvider.selectedAddress;
      return await ethereum.request({method : 'eth_requestAccounts'});
  },  

  handleBalance:function(){//works
    $('#disp_balance').text("Please register to have a balance");
    var cfans_instance;
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then( function(instance) {
        cfans_instance=instance;
        return cfans_instance.checkbalanceOf({from: account});
      }).then(function(result, err){
            console.log(result);
            if(result){
                $('#disp_balance').text(parseInt(result)+" SBC");
                console.log("balance displayed");
            } else {
                alert(account + " balance failed")
            }   
        });
    });
  },
  
  handleSubReg: function(){//works
    var cfans_instance;
    web3.eth.getAccounts( function(error, accounts){
    var account = accounts[0];
    App.contracts.Cryptofans.deployed().then( function(instance) {
      cfans_instance=instance;
      return cfans_instance.registerasSubscriber({from: account});
    }).then(function(result, err){
      if(result){
        console.log("function registered as subscriber");
        if(parseInt(result.receipt.status) == 1)
          alert(account + " subscriber register done successfully")
          else
          alert(account + " subscriber register not done successfully due to revert")
          } else {
          alert(account + " subscriber register failed")
          }   
      });
    });
  },

  handleProvReg:function(){//works
    var cfans_instance;
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      console.log(accounts[0]);
      App.contracts.Cryptofans.deployed().then( function(instance) {
        cfans_instance=instance;
        return cfans_instance.registerasProvider({from: account});
      }).then(function(result, err){
            if(result){
                console.log("function registered as a provider");
                if(parseInt(result.receipt.status) == 1)
                alert(account + " provider register done successfully")
                else
                alert(account + " provider register not done successfully due to revert")
            } else {
                alert(account + " provider register failed")
            }   
        });
    });
  },

  handleFind:function(SubscriptionName){//find works
    $('#search_title').text("Subscription does not exist");
    $('#search_cost').text(" ");
    $('#search_period').text(" ");
    $('#search_info').text(" ");
    var cfans_instance;
    var subnameto32=ethers.utils.formatBytes32String(SubscriptionName);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then( function(instance) {
        cfans_instance=instance;
        return cfans_instance.findSubscription(subnameto32, {from: account});
      }).then(function(result, err){
            if(result){
              var title=ethers.utils.parseBytes32String(result[0]);
              var cost=parseInt(result[1])/1000000000000000000;
              var period=Math.floor(parseInt(result[2])/86400);
              var time;
              if(period==30){
                time='Monthly (30-day)';
              }
             if(period==365){
                time='Annual (365-day)';
              }
              var desc=result[3];
              console.log(title+" "+cost+" "+period+" "+desc);
              var title='Title: '+title;
              var cost='Cost: '+cost;
              var period='Subcription Period: '+period;
              var desc= 'About: '+desc;
              $('#search_title').text(title);
              $('#search_cost').text(cost);
              $('#search_period').text(period);
              $('#search_info').text(desc);
              console.log("Subcripton name found");
            }else {
              alert("name searching failed")
            }   
        });
    });
  },

  handleUnsub:function(subs_name){// subscribe needs to work first otherwise it works
    var str32name;
    var accessinstance;
    str32name=ethers.utils.formatBytes32String(subs_name);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.unsub_to_plan(str32name ,{from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          console.log("address unsubbed from proposal");
          if(parseInt(result.receipt.status) == 1)
          alert(account + " unsub done successfully")
          else
          alert(account + " unsub not done successfully due to revert")
      } else {
          alert(account + " unsub failed")
      }  
      });
    });
  },
  // handleSub not working
  handleSub:function(subs_name){//params:proposal name   o/inputs: eth amount, account to send to
    
  },
  handleAccess:function(subs_name){// does not work
  
  },

  handleCreate:function(str1, amnt, prd, desc){// create is working
    var str32name;
    var weitoEth;
    var periodsecs;
    var accessinstance;
    str32name=ethers.utils.formatBytes32String(str1);
    weitoEth=amnt*App.value;
    if(prd=="Monthly"){
      periodsecs= 2628000;
    }
    else if(prd=="Yearly"){
      periodsecs= 31536000;
    } else{
      periodsecs= -1;
    }
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
    App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      console.log(str32name);
      return accessinstance.createSubscription(str32name, weitoEth, periodsecs, desc, {from: account}); // added from parameter
    }).then(function (result) {
      if(result){
        console.log("proposal created");
        if(parseInt(result.receipt.status) == 1)
        alert(account + " proposal created successfully")
        else
        alert(account + " creation not done successfully due to revert")
        } else {
        alert(account + " creation failed")
        }  
        });
    });
  },
  
  handleToggle:function(props_name){//toggle is working
    var str32name;
    var accessinstance;
    str32name=ethers.utils.formatBytes32String(props_name);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.on_off_switch(str32name,  {from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          console.log(result);
          console.log("proposal toggled");
          if(parseInt(result.receipt.status) == 1)
          alert(account + " toggling done successfully")
          else
          alert(account + " toggling not done successfully due to revert")
      } else {
        alert(account + " toggling failed")
      }  
      });
    });
  },

  handleView:function(props_name){// viewsubs working
    $('#subs_display').text("Please enter a subscription you own.");
    $('#subs_listing').text("");
    var str32name;
    var accessinstance;
    str32name=ethers.utils.formatBytes32String(props_name);
    web3.eth.getAccounts( function(error, accounts){
      var account = accounts[0];
      App.contracts.Cryptofans.deployed().then(function (instance) {
      accessinstance=instance;
      return accessinstance.view_subs(str32name,  {from: account}); // added from parameter
      }).then(function (result) {
        if(result){
          if(result.length==0){
            $('#subs_display').text("No subscribers yet!");
            $('#subs_listing').text(" ");
          }else{
            $('#subs_display').text("Current Subscribers:" +result.length);
            for (let i = 0; i < result.length; i++) {
              jQuery('#subs_listing').append(result[i] +'<br/>'); 
            }
          }
          console.log("view done");
        } else {
          alert("view subs failed")
        }  
        });
    });
  },

  handleTransfer:function(addr, amount){// transfer is a payment // not working
    
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

