// SPDX-License-Identifier: hasanhenry426
pragma solidity >=0.6.0 <=0.9.0;

import './helper_contracts/IERC20.sol';

contract Cryptofans is IERC20 {
    //subscription periods
    uint constant MONTH= 2628000;
    uint constant YEAR_IN_SECONDS = 31536000;
    //structs
    struct Subscriber {
        address addy;// sub address
        bool registered;
        uint256 start;
    }
    struct Provider{
        address add;
        bool registered; 
        uint numproposal;
    }
    struct subPlan{
        bool in_use;
        uint256 next_payday;
        uint256 start_payday;
    }
    struct Proposal { 
        bytes32 cname;   //(?) short name (up to 32 bytes) X 
        uint cost;
        uint256 period;// (   billed cycle in days )
        bool active; // active or not
        bool name_taken;
        string description;
        uint key;//-> act like a hash 
        address creator; 
    }
    //data 
    mapping(address => Subscriber) subscribers;//subscriber's address to each individual Sub struct
    mapping(bytes32=>Proposal) proposals;//All existing proposals= key:name val:proposal struct  
    mapping(address => Provider) providers;//providers' addresses to an individual provider struct  
    mapping(address=>mapping(uint=>address[])) sub_ids;//provider's address to key to list of subscribers
    mapping(address=>mapping(bytes32=>subPlan)) info_by_prop;//Subs' address mapped to a proposal name mapped to a subscribers' plan 
    
    ////ERC20 INTITIALIZE
    string public constant name = "SubCoin";
    string public constant symbol = "SBC";
    uint8 public constant decimals = 18;


    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;

    uint256 totalSupply_ = 10 ether;

    uint256 ptotalSupply_ = 1 ether;


   

    function totalSupply() public override view returns (uint256) {
    return totalSupply_;
    }


    function getcoins() private{
        if(subscribers[msg.sender].registered == false && providers[msg.sender].registered == true){
            balances[msg.sender] += totalSupply_;
        }else{
            balances[msg.sender] = totalSupply_;
        }
    }

     function getcoinsprov() private{
         if(subscribers[msg.sender].registered == true && providers[msg.sender].registered == false){
            balances[msg.sender] += ptotalSupply_;
        }else{balances[msg.sender] = ptotalSupply_;}
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function checkbalanceOf() public view returns (uint256) {
        if(subscribers[msg.sender].registered == false && providers[msg.sender].registered == false){
            revert("Please register to have a balance.");
        }
        return balances[msg.sender];
    }

    

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender]-numTokens;
        balances[receiver] = balances[receiver]+numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner]-numTokens;
        allowed[owner][msg.sender] = allowed[owner][msg.sender]-numTokens;
        balances[buyer] = balances[buyer]+numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }


    
    ////ERC20 FUNCTIONS
    //re-define:
    //function transfer(address receiver, uint256 numTokens) public override returns (bool) {}
    //function balanceOf(address tokenOwner) public override view returns (uint256) {}
    //function approve(address delegate, uint256 numTokens) public override returns (bool) {}
    //function totalSupply() external view returns (uint256){}
    //function transferFrom(address sender, address recipient, uint256 amount) external returns (bool){}

    //currently unused:
    //function allowance(address owner, address spender) external view returns (uint256);

    //events(implement):
    //event Transfer(address indexed from, address indexed to, uint256 value);
    //event Approval(address indexed owner, address indexed spender, uint256 value);

    //////CRYPTOFANS MARKETPLACE FUNCTIONS//////
    function registerasSubscriber () public {
        // if statement to check if they already registered
        // nested mapping goes here??
        if (subscribers[msg.sender].registered == true){
            revert("You are already registered");
            // change revert function to whatever necessary if it doesnt work
        }
        else{
            getcoins();
            subscribers[msg.sender].registered = true;
            subscribers[msg.sender].addy = msg.sender;
        }
    }
   
    
    function registerasProvider () public {
        // if statement to check if ti exists
        if (providers[msg.sender].registered == true){
            revert("You are already registered");
            // change revert function to whatever necessary if it doesnt work
        }else {
            getcoinsprov();
            providers[msg.sender].registered = true;
            providers[msg.sender].add = msg.sender;
        }
    }

    modifier onlyProvider(){ //modifier for provider
        require(providers[msg.sender].registered == true) ;
        _;
    }
    modifier onlySubscriber(){// Modifier for subscriber
        require(subscribers[msg.sender].registered == true) ;
        _;
    }
    
    function createSubscription(bytes32 cname, uint cost, uint period, string memory description) onlyProvider public {
        //  if statement to check that proposal by this mname does not exist
        if(cname==0x0000000000000000000000000000000000000000000000000000000000000000 || cname==0x0){
            revert("not a valid address");
        }
        if (proposals[cname].name_taken == true){
            revert("A subscription plan with this name already exists, use another name");
        }
        if ((period != MONTH && period != YEAR_IN_SECONDS) ){
            revert("Must be monthly or yearly");
        }
        uint key_num = 0; // index 0 proposal 1
        if (providers[msg.sender].numproposal >= 1){ // if greater than 1 proposal
            key_num = providers[msg.sender].numproposal; // index of latest proposal
        }
        providers[msg.sender].numproposal = providers[msg.sender].numproposal + 1; // proposal count begins at 1
        proposals[cname] = Proposal(cname, cost, period, true, true, description, key_num, msg.sender); // registers proposal
        proposals[cname].active = true ; // turns on activity 
    }

    //################
    function pay(bytes32 prop_h) public payable onlySubscriber{
        if(block.timestamp < info_by_prop[msg.sender][prop_h].next_payday){
            revert("Payment up to date.");
        }else{ 
            address payable payable_creator=payable(proposals[prop_h].creator);
            payable_creator.transfer(proposals[prop_h].cost);
            info_by_prop[msg.sender][prop_h].next_payday= info_by_prop[msg.sender][prop_h].next_payday+ proposals[prop_h].period;
        }
    }
    //##################
    function collect(address newholder, uint256 amount) public payable onlyProvider{
       if(msg.sender.balance<1){
            revert("Your balance is not large enough to transfer.");
       }else{
           transfer(newholder, amount);
       }
    }
    //####################
    function sub_to_plan(bytes32 prop_h) public payable onlySubscriber{
        if(proposals[prop_h].name_taken == false){
            revert("there is no subscription of this name");
        }
        if(proposals[prop_h].active == false){
            revert("this subscription is not active");
        }
        if(info_by_prop[msg.sender][prop_h].in_use == true){
            revert("you are already subscribed.");
        }
        info_by_prop[msg.sender][prop_h]=subPlan(true, block.timestamp, block.timestamp);
        info_by_prop[msg.sender][prop_h].next_payday = block.timestamp;
        info_by_prop[msg.sender][prop_h].in_use = true;
        transfer(proposals[prop_h].creator, proposals[prop_h].cost);// ERC20 transfer()
        sub_ids[proposals[prop_h].creator][proposals[prop_h].key].push(subscribers[msg.sender].addy);
    }
   
    // address 1 = bytes32"netflix" with key 0, "youtube" w key 1
    // address 2 = bytes32"netflix" with key 0, "hulu" w key 1  

    function unsub_to_plan(bytes32 prop_h) public onlySubscriber{
        if(info_by_prop[msg.sender][prop_h].in_use == false){
            revert();
        }else if(sub_ids[proposals[prop_h].creator][proposals[prop_h].key].length==1){
            info_by_prop[msg.sender][prop_h].in_use = false;
            sub_ids[proposals[prop_h].creator][proposals[prop_h].key].pop();
        }else if(sub_ids[proposals[prop_h].creator][proposals[prop_h].key][sub_ids[proposals[prop_h].creator][proposals[prop_h].key].length-1]==msg.sender){
                info_by_prop[msg.sender][prop_h].in_use = false;
                sub_ids[proposals[prop_h].creator][proposals[prop_h].key].pop();
        }else {
        uint index; 
        for(uint i=0;i<sub_ids[proposals[prop_h].creator][proposals[prop_h].key].length;i++){
            if(sub_ids[proposals[prop_h].creator][proposals[prop_h].key][i]==msg.sender){
                index=i;
                break;
            }
        }
        for (uint j = index; j<sub_ids[proposals[prop_h].creator][proposals[prop_h].key].length-1; j++){
            sub_ids[proposals[prop_h].creator][proposals[prop_h].key][j] = sub_ids[proposals[prop_h].creator][proposals[prop_h].key][j+1];
        }
        info_by_prop[msg.sender][prop_h].in_use = false;
        sub_ids[proposals[prop_h].creator][proposals[prop_h].key].pop();
        }
    }

    function findSubscription (bytes32 searchName) public view returns (bytes32,uint, uint,string memory) {
        if (proposals[searchName].active == true){
            return (proposals[searchName].cname,proposals[searchName].cost,proposals[searchName].period, proposals[searchName].description) ;
        }
        else{
            revert("Subscription by that name does not exist") ; 
        }
    }

    function on_off_switch(bytes32 prop_h) public onlyProvider{
        if(msg.sender!=proposals[prop_h].creator){
            revert();
        }else if(msg.sender==proposals[prop_h].creator){
            proposals[prop_h].active=!proposals[prop_h].active;
        }
    }

    function view_subs(bytes32 prop_h) onlyProvider public view returns (address[] memory) {
        if(msg.sender!=proposals[prop_h].creator){
            revert("You do not own this subscription.");
        }
        return sub_ids[proposals[prop_h].creator][proposals[prop_h].key];
        
    }

    //###################
    function accessSubscscription(bytes32 prop_h) public payable onlySubscriber returns(bool){
        if(info_by_prop[msg.sender][prop_h].in_use == false){
            return false;
        }
        if (block.timestamp < info_by_prop[msg.sender][prop_h].next_payday){
            return true;
        }
        if(block.timestamp >= info_by_prop[msg.sender][prop_h].next_payday){
            while(block.timestamp > info_by_prop[msg.sender][prop_h].next_payday){
                transfer(proposals[prop_h].creator, proposals[prop_h].cost);
            }
            return true;
        }
        else{
            return false;
        }   
    }
    
}