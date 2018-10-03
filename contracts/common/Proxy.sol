pragma solidity ^0.4.24;

contract Proxy {

    address implementation;

    constructor(address _target) public {

        implementation = _target;
        implementation.delegatecall(bytes4(keccak256("upgradeState()")));
    }

    function() public payable {

        address impl = implementation;

        assembly {
            // Copy the data sent to the memory address starting 0x40
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize)

            // Proxy the call to the contract address with the provided gas and data
            let result := delegatecall(gas, impl, ptr, calldatasize, 0, 0)

            // Copy the data returned by the proxied call to memory
            let size := returndatasize
            returndatacopy(ptr, 0, size)

            // Check what the result is, return and revert accordingly
            switch result
            case 0 { revert(ptr, size) }
            case 1 { return(ptr, size) }
        }
    }
}
