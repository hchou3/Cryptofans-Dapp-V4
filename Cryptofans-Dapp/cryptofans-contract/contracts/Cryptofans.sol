// SPDX-License-Identifier: hasanhenry426

pragma solidity >=0.6.0 <0.9.0;

contract Cryptofans{


 uint constant MONTH= 2628000;
    uint constant YEAR_IN_SECONDS = 31536000;
    

    struct Subscriber {
        address addy;// sub address
        bool registered;
        uint256 start;
    }

    mapping(address => Subscriber) subscribers;//subscriber's address to each individual Sub struct
    mapping(bytes32=>Proposal) proposals;//All existing proposals= key:name val:proposal struct  
    mapping(address => Provider) providers;//providers' addresses to an individual provider struct  
    mapping(address=>mapping(uint=>address[])) sub_ids;//provider's address to key to list of subscribers
    mapping(address=>mapping(bytes32=>subPlan)) info_by_prop;//Subs' address mapped to a proposal name mapped to a subscribers' plan 
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
        bytes32 name;   //(?) short name (up to 32 bytes) X 
        //uint idvalue ;
        uint cost;
        uint256 period;// (   billed cycle in days )
        bool active; // active or not
        bool name_taken;
        string description;
        //mapping(uint256 => address[]) ;
        uint key;//-> act like a hash 
        address creator; 
    }
    
    function registerasSubscriber () public {
        // if statement to check if they already registered
        // nested mapping goes here??
        if (subscribers[msg.sender].registered == true){

            revert("You are already registered to subscribers");

            // change revert function to whatever necessary if it doesnt work
        }
        else{
            subscribers[msg.sender].registered = true;
            subscribers[msg.sender].addy = msg.sender;
        }

    }
    
    function registerasProvider () public {
        // if statement to check if ti exists
        if (providers[msg.sender].registered == true){

            revert("You are already registered to providers");

            // change revert function to whatever necessary if it doesnt work
        }else {
            providers[msg.sender].registered = true;
            providers[msg.sender].add = msg.sender;
        }



    }

    modifier onlyProvider(){ //modifier provider
        require(providers[msg.sender].registered == true) ;
        _;
    }

    // Modifier subascriber
    modifier onlySubscriber(){
        require(subscribers[msg.sender].registered == true) ;
        _;
    }
    
    function createSubscription(bytes32 name, uint cost, uint period, string memory description) onlyProvider public {
        //  if statement to check that proposal by this mname does not exist
        if (proposals[name].name_taken == true){
            
            revert("A subscription plan with this name already exists, use another name");
        }
        if(proposals[name].name!=0x0000000000000000000000000000000000000000000000000000000000000000){
            revert("not a valid address");
        }
        if ((period != MONTH && period != YEAR_IN_SECONDS) ){
         
            revert("Must be monthly or yearly");
        }
        uint key_num = 0; // index 0 proposal 1
        if (providers[msg.sender].numproposal >= 1){ // if greater than 1 proposal

            key_num = providers[msg.sender].numproposal; // index of latest proposal
        }
        providers[msg.sender].numproposal = providers[msg.sender].numproposal + 1; // proposal count begins at 1
        proposals[name] = Proposal(name, cost, period, true, true, description, key_num, msg.sender); // registers proposal
        proposals[name].active = true; // turns on activity 
    }

    //warn subscribers they are about to purchase subscription(proposal)
    function pay(bytes32 prop_h) public payable onlySubscriber{
        if(block.timestamp < info_by_prop[msg.sender][prop_h].next_payday){
            revert("Payment up to date.");
            
        }else{ 
            address payable payable_creator=payable(proposals[prop_h].creator);
            payable_creator.transfer(proposals[prop_h].cost);
            info_by_prop[msg.sender][prop_h].next_payday= info_by_prop[msg.sender][prop_h].next_payday+ proposals[prop_h].period;
        }
    }
    
    function collect(address newholder, uint256 amount) public payable onlyProvider{
       if(msg.sender.balance<1){
            revert("Your balance is not large enough to transfer.");
       }else{
        address payable newowner = payable(newholder);
        (newowner).transfer(amount);
       }
    }

    function sub_to_plan(bytes32 prop_h) public payable onlySubscriber{
        if(info_by_prop[msg.sender][prop_h].in_use == true){
            revert("you are already subscribed.");
        }
        info_by_prop[msg.sender][prop_h]=subPlan(true, block.timestamp,block.timestamp);
        info_by_prop[msg.sender][prop_h].next_payday = block.timestamp;
        info_by_prop[msg.sender][prop_h].in_use = true;
        pay(prop_h);
        sub_ids[proposals[prop_h].creator][proposals[prop_h].key].push(subscribers[msg.sender].addy);
        //dependent of view subs functon
        //^^^Increment both keys and provider counts when supporting multiple proposals
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
            return (proposals[searchName].name,proposals[searchName].cost,proposals[searchName].period, proposals[searchName].description) ;
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

    function accessSubscscription(bytes32 prop_h) public payable onlySubscriber returns(bool){
        if(info_by_prop[msg.sender][prop_h].in_use == false){
            return false;
        }
        if (block.timestamp < info_by_prop[msg.sender][prop_h].next_payday){
            return true;
        }
        if(block.timestamp >= info_by_prop[msg.sender][prop_h].next_payday){
            while(block.timestamp > info_by_prop[msg.sender][prop_h].next_payday){
                pay(prop_h);
            }
            return true;
        }
        else{
            return false;
        }
        
    }

}