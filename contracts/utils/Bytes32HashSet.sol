pragma solidity ^0.4.24;

library Bytes32HashSet {

	uint constant POSITION_NONE = 0;
	
	struct Data { 
	
		mapping(bytes32 => uint) positions;
		bytes32[] elements;
	}
	
	function add(Data storage self, bytes32 value) internal {
		
		if(self.positions[value] != POSITION_NONE)
			return;
		
		uint position = self.elements.length + 1;		
		assert(position > 0);
		
		self.positions[value] = position;
		self.elements.push(value);
	}
	
	function remove(Data storage self, bytes32 value) internal {
	
		uint position = self.positions[value];
		
		if(self.positions[value] == POSITION_NONE)
			return;
				
		assert(self.elements.length > 0);
				
		// If the element being removed is not the last one
		if(position < self.elements.length) {
		
			bytes32 lastElement = self.elements[self.elements.length - 1];
			
			self.positions[lastElement] = position;
			self.elements[position - 1] = lastElement;
		}
		
		self.positions[value] = POSITION_NONE;
		self.elements.length--;
	}
	
	function contains(Data storage self, bytes32 value) internal view returns (bool) {
		return self.positions[value] != 0;
	}
}