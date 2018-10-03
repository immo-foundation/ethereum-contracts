pragma solidity ^0.4.24;

import "../../contracts/common/BaseContract.sol";

contract StubV1BaseContract is BaseContract {
	
	uint public versionCode;
	
	function performStateUpgrade() internal {
	
		if(admin == address(0))
			admin = msg.sender;
		
		versionCode = 1;
	}
	
	function version() public view returns (string) {
		return "1.0.0";
	}
}